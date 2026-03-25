from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, Header, Query, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import io
import base64
import json
import hashlib
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import jwt
import qrcode

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
JWT_ALGORITHM = "HS256"

# Object Storage config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "sunehri-crumbs"
storage_key = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ Object Storage ============
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ============ Auth Helpers ============
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(email: str) -> str:
    return jwt.encode({"email": email, "exp": datetime.now(timezone.utc).timestamp() + 86400}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"email": payload["email"]}, {"_id": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ Models ============
class LoginRequest(BaseModel):
    email: str
    password: str

class MenuItemCreate(BaseModel):
    name: str
    category: str
    price: float
    description: str = ""
    image_url: str = ""
    is_signature: bool = False

class OrderCreate(BaseModel):
    items: list
    total_price: float
    table_number: Optional[int] = None

class BookingCreate(BaseModel):
    name: str
    phone: str
    date: str
    time: str
    guests: int

class ReviewCreate(BaseModel):
    name: str
    rating: int
    comment: str

class ContactCreate(BaseModel):
    name: str
    email: str
    message: str

class TableSetup(BaseModel):
    count: int

# ============ Auth Routes ============
@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["email"])
    return {"token": token, "email": user["email"], "role": user["role"]}

@api_router.get("/auth/me")
async def get_me(admin=Depends(get_current_admin)):
    return {"email": admin["email"], "role": admin["role"]}

# ============ Menu Routes ============
@api_router.get("/menu")
async def get_menu(category: str = None, search: str = None, signature: bool = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if signature:
        query["is_signature"] = True
    items = await db.menu.find(query, {"_id": 0}).to_list(500)
    return items

@api_router.get("/menu/{item_id}")
async def get_menu_item(item_id: str):
    item = await db.menu.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@api_router.post("/menu")
async def create_menu_item(item: MenuItemCreate, admin=Depends(get_current_admin)):
    doc = item.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.menu.insert_one(doc)
    created = await db.menu.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, item: MenuItemCreate, admin=Depends(get_current_admin)):
    update_data = item.model_dump()
    result = await db.menu.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db.menu.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, admin=Depends(get_current_admin)):
    result = await db.menu.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted"}

# ============ Upload Routes ============
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    result = put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

# ============ Order Routes ============
@api_router.post("/orders")
async def create_order(order: OrderCreate):
    doc = order.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.orders.insert_one(doc)
    created = await db.orders.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/orders")
async def get_orders(status: str = None, admin=Depends(get_current_admin)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), admin=Depends(get_current_admin)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return updated

# ============ Table Routes ============
@api_router.post("/tables/setup")
async def setup_tables(setup: TableSetup, admin=Depends(get_current_admin)):
    await db.tables.delete_many({})
    tables = []
    base_url = os.environ.get("FRONTEND_URL", "")
    for i in range(1, setup.count + 1):
        qr_url = f"{base_url}/menu?table={i}"
        # Generate QR code as base64
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#D4AF37", back_color="#1A1A1A")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        table_doc = {
            "id": str(uuid.uuid4()),
            "table_number": i,
            "qr_code_url": qr_url,
            "qr_code_base64": qr_base64,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        tables.append(table_doc)
    if tables:
        await db.tables.insert_many(tables)
    result = await db.tables.find({}, {"_id": 0}).sort("table_number", 1).to_list(500)
    return result

@api_router.get("/tables")
async def get_tables(admin=Depends(get_current_admin)):
    tables = await db.tables.find({}, {"_id": 0}).sort("table_number", 1).to_list(500)
    return tables

@api_router.get("/tables/count")
async def get_table_count():
    count = await db.tables.count_documents({})
    return {"count": count}

# ============ Booking Routes ============
@api_router.post("/bookings")
async def create_booking(booking: BookingCreate):
    doc = booking.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.bookings.insert_one(doc)
    created = await db.bookings.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/bookings")
async def get_bookings(admin=Depends(get_current_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings

@api_router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, admin=Depends(get_current_admin)):
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Deleted"}

# ============ Review Routes ============
@api_router.post("/reviews")
async def create_review(review: ReviewCreate):
    doc = review.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["approved"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(doc)
    created = await db.reviews.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/reviews")
async def get_reviews(approved_only: bool = True):
    query = {"approved": True} if approved_only else {}
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reviews

@api_router.get("/reviews/all")
async def get_all_reviews(admin=Depends(get_current_admin)):
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reviews

@api_router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"approved": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    updated = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    return updated

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Deleted"}

# ============ Contact Routes ============
@api_router.post("/contacts")
async def create_contact(contact: ContactCreate):
    doc = contact.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    created = await db.contacts.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/contacts")
async def get_contacts(admin=Depends(get_current_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return contacts

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, admin=Depends(get_current_admin)):
    result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Deleted"}

# ============ Gallery Routes ============
@api_router.get("/gallery")
async def get_gallery():
    images = await db.gallery.find({"is_deleted": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return images

@api_router.post("/gallery")
async def add_gallery_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or "image/jpeg"
    result = put_object(path, data, content_type)
    doc = {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "url": f"/api/files/{result['path']}",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(doc)
    created = await db.gallery.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, admin=Depends(get_current_admin)):
    result = await db.gallery.update_one({"id": image_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Deleted"}

# ============ Dashboard Stats ============
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(admin=Depends(get_current_admin)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    total_menu = await db.menu.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_reviews = await db.reviews.count_documents({})
    pending_reviews = await db.reviews.count_documents({"approved": False})
    total_contacts = await db.contacts.count_documents({})
    total_tables = await db.tables.count_documents({})
    
    # Calculate revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_price"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_menu": total_menu,
        "total_bookings": total_bookings,
        "total_reviews": total_reviews,
        "pending_reviews": pending_reviews,
        "total_contacts": total_contacts,
        "total_tables": total_tables,
        "revenue": revenue
    }

# ============ Seed Data ============
@app.on_event("startup")
async def startup():
    # Init storage
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed: {e}")
    
    # Seed admin user
    admin = await db.users.find_one({"email": "admin@bakery.com"})
    if not admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@bakery.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded")
    
    # Seed menu items
    menu_count = await db.menu.count_documents({})
    if menu_count == 0:
        seed_items = [
            {"id": str(uuid.uuid4()), "name": "Sourdough Loaf", "category": "Breads", "price": 8.50, "description": "Artisan sourdough with a crispy crust and soft, tangy interior. Fermented for 24 hours.", "image_url": "https://images.unsplash.com/photo-1628809643520-7c20491d5324?w=600", "is_signature": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Brioche Royale", "category": "Breads", "price": 7.00, "description": "Rich, buttery brioche with a golden crust. Perfect for morning toast.", "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ciabatta", "category": "Breads", "price": 6.50, "description": "Italian bread with an airy crumb and chewy texture.", "image_url": "https://images.unsplash.com/photo-1600398142498-f1a289dbd77e?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Butter Croissant", "category": "Pastries", "price": 5.50, "description": "Flaky, golden croissant made with premium French butter. 72-layer lamination.", "image_url": "https://images.pexels.com/photos/7440422/pexels-photo-7440422.jpeg?w=600", "is_signature": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Pain au Chocolat", "category": "Pastries", "price": 6.00, "description": "French chocolate-filled pastry with delicate, buttery layers.", "image_url": "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Almond Danish", "category": "Pastries", "price": 5.00, "description": "Sweet Danish pastry topped with sliced almonds and cream filling.", "image_url": "https://images.unsplash.com/photo-1620807398086-4e163e90fe83?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Chocolate Glaze Donut", "category": "Donuts", "price": 4.50, "description": "Premium donut with rich dark chocolate glaze and gold dust.", "image_url": "https://images.pexels.com/photos/7440352/pexels-photo-7440352.jpeg?w=600", "is_signature": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Maple Pecan Donut", "category": "Donuts", "price": 5.00, "description": "Soft donut with maple glaze and toasted pecans.", "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Dark Chocolate Torte", "category": "Cakes", "price": 12.00, "description": "Decadent dark chocolate torte with ganache and gold leaf.", "image_url": "https://images.pexels.com/photos/3740193/pexels-photo-3740193.jpeg?w=600", "is_signature": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Tiramisu Cake", "category": "Cakes", "price": 11.00, "description": "Classic Italian tiramisu layered cake with espresso and mascarpone.", "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Red Velvet Slice", "category": "Cakes", "price": 9.50, "description": "Moist red velvet cake with cream cheese frosting.", "image_url": "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Artisan Espresso", "category": "Beverages", "price": 4.00, "description": "Double shot espresso from single-origin Ethiopian beans.", "image_url": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600", "is_signature": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Golden Latte", "category": "Beverages", "price": 5.50, "description": "Turmeric-infused latte with oat milk and honey.", "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Iced Matcha", "category": "Beverages", "price": 6.00, "description": "Ceremonial-grade matcha with oat milk over ice.", "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Hot Chocolate Supreme", "category": "Beverages", "price": 5.00, "description": "Rich Belgian hot chocolate with whipped cream and cocoa.", "image_url": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600", "is_signature": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.menu.insert_many(seed_items)
        logger.info(f"Seeded {len(seed_items)} menu items")
    
    # Seed reviews
    review_count = await db.reviews.count_documents({})
    if review_count == 0:
        seed_reviews = [
            {"id": str(uuid.uuid4()), "name": "Priya Sharma", "rating": 5, "comment": "The best croissants I've ever had! Perfectly flaky and buttery. The ambiance is absolutely stunning.", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Rahul Verma", "rating": 5, "comment": "Dark chocolate torte is divine. Every bite feels like luxury. Will definitely come back!", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ananya Patel", "rating": 4, "comment": "Amazing sourdough bread! The QR ordering system makes it so convenient to order from our table.", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.reviews.insert_many(seed_reviews)
        logger.info("Seeded reviews")

    # Seed gallery with default images
    gallery_count = await db.gallery.count_documents({})
    if gallery_count == 0:
        seed_gallery = [
            {"id": str(uuid.uuid4()), "url": "https://images.pexels.com/photos/2174069/pexels-photo-2174069.jpeg?w=800", "original_filename": "cafe-interior.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800", "original_filename": "bakery-display.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800", "original_filename": "pastries.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", "original_filename": "fresh-bread.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "original_filename": "coffee-art.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?w=800", "original_filename": "cake-display.jpg", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.gallery.insert_many(seed_gallery)
        logger.info("Seeded gallery")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

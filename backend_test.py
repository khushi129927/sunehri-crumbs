import requests
import sys
import json
from datetime import datetime

class BakeryAPITester:
    def __init__(self, base_url="https://table-order-system-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@bakery.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test auth/me endpoint"""
        if not self.token:
            print("❌ No token available for auth/me test")
            return False
        return self.run_test("Get Current Admin", "GET", "auth/me", 200)[0]

    def test_menu_endpoints(self):
        """Test menu-related endpoints"""
        print("\n📋 Testing Menu Endpoints...")
        
        # Get all menu items
        success, menu_data = self.run_test("Get All Menu Items", "GET", "menu", 200)
        if not success:
            return False
        
        print(f"   Found {len(menu_data)} menu items")
        
        # Test category filtering
        self.run_test("Filter by Breads", "GET", "menu?category=Breads", 200)
        self.run_test("Filter by Pastries", "GET", "menu?category=Pastries", 200)
        
        # Test search
        self.run_test("Search Menu", "GET", "menu?search=croissant", 200)
        
        # Test signature items
        self.run_test("Get Signature Items", "GET", "menu?signature=true", 200)
        
        # Test individual item (if menu has items)
        if menu_data and len(menu_data) > 0:
            item_id = menu_data[0]['id']
            self.run_test("Get Single Menu Item", "GET", f"menu/{item_id}", 200)
        
        return True

    def test_menu_crud(self):
        """Test menu CRUD operations (admin required)"""
        if not self.token:
            print("❌ No admin token for menu CRUD tests")
            return False
            
        print("\n🍞 Testing Menu CRUD Operations...")
        
        # Create new menu item
        new_item = {
            "name": "Test Croissant",
            "category": "Pastries",
            "price": 5.99,
            "description": "Test croissant for API testing",
            "image_url": "https://example.com/test.jpg",
            "is_signature": False
        }
        
        success, created_item = self.run_test("Create Menu Item", "POST", "menu", 201, data=new_item)
        if not success:
            return False
            
        item_id = created_item.get('id')
        if not item_id:
            print("❌ No ID returned from created item")
            return False
            
        # Update menu item
        updated_item = {**new_item, "name": "Updated Test Croissant", "price": 6.99}
        self.run_test("Update Menu Item", "PUT", f"menu/{item_id}", 200, data=updated_item)
        
        # Delete menu item
        self.run_test("Delete Menu Item", "DELETE", f"menu/{item_id}", 200)
        
        return True

    def test_order_endpoints(self):
        """Test order-related endpoints"""
        print("\n🛒 Testing Order Endpoints...")
        
        # Create test order
        test_order = {
            "items": [
                {"id": "test-id", "name": "Test Item", "price": 5.99, "quantity": 2}
            ],
            "total_price": 11.98,
            "table_number": 5
        }
        
        success, order_data = self.run_test("Create Order", "POST", "orders", 201, data=test_order)
        if not success:
            return False
            
        order_id = order_data.get('id')
        print(f"   Created order ID: {order_id}")
        
        # Get orders (admin required)
        if self.token:
            self.run_test("Get All Orders", "GET", "orders", 200)
            
            # Update order status
            if order_id:
                self.run_test("Update Order Status", "PUT", f"orders/{order_id}/status?status=preparing", 200)
        
        return True

    def test_booking_endpoints(self):
        """Test booking-related endpoints"""
        print("\n📅 Testing Booking Endpoints...")
        
        # Create test booking
        test_booking = {
            "name": "Test Customer",
            "phone": "+91 9876543210",
            "date": "2024-12-25",
            "time": "19:00",
            "guests": 4
        }
        
        success, booking_data = self.run_test("Create Booking", "POST", "bookings", 201, data=test_booking)
        if not success:
            return False
            
        # Get bookings (admin required)
        if self.token:
            self.run_test("Get All Bookings", "GET", "bookings", 200)
            
            # Delete booking
            booking_id = booking_data.get('id')
            if booking_id:
                self.run_test("Delete Booking", "DELETE", f"bookings/{booking_id}", 200)
        
        return True

    def test_review_endpoints(self):
        """Test review-related endpoints"""
        print("\n⭐ Testing Review Endpoints...")
        
        # Create test review
        test_review = {
            "name": "Test Reviewer",
            "rating": 5,
            "comment": "Amazing test experience! The API works perfectly."
        }
        
        success, review_data = self.run_test("Create Review", "POST", "reviews", 201, data=test_review)
        if not success:
            return False
            
        # Get approved reviews (public)
        self.run_test("Get Approved Reviews", "GET", "reviews?approved_only=true", 200)
        
        # Admin operations
        if self.token:
            self.run_test("Get All Reviews", "GET", "reviews/all", 200)
            
            # Approve and delete review
            review_id = review_data.get('id')
            if review_id:
                self.run_test("Approve Review", "PUT", f"reviews/{review_id}/approve", 200)
                self.run_test("Delete Review", "DELETE", f"reviews/{review_id}", 200)
        
        return True

    def test_contact_endpoints(self):
        """Test contact-related endpoints"""
        print("\n📧 Testing Contact Endpoints...")
        
        # Create test contact
        test_contact = {
            "name": "Test Contact",
            "email": "test@example.com",
            "message": "This is a test message for API testing."
        }
        
        success, contact_data = self.run_test("Create Contact", "POST", "contacts", 201, data=test_contact)
        if not success:
            return False
            
        # Admin operations
        if self.token:
            self.run_test("Get All Contacts", "GET", "contacts", 200)
            
            # Delete contact
            contact_id = contact_data.get('id')
            if contact_id:
                self.run_test("Delete Contact", "DELETE", f"contacts/{contact_id}", 200)
        
        return True

    def test_gallery_endpoints(self):
        """Test gallery-related endpoints"""
        print("\n🖼️ Testing Gallery Endpoints...")
        
        # Get gallery (public)
        self.run_test("Get Gallery", "GET", "gallery", 200)
        
        return True

    def test_table_endpoints(self):
        """Test table-related endpoints"""
        print("\n🪑 Testing Table Endpoints...")
        
        # Get table count (public)
        self.run_test("Get Table Count", "GET", "tables/count", 200)
        
        # Admin operations
        if self.token:
            self.run_test("Get All Tables", "GET", "tables", 200)
            
            # Setup tables
            self.run_test("Setup Tables", "POST", "tables/setup", 200, data={"count": 5})
        
        return True

    def test_dashboard_stats(self):
        """Test dashboard stats (admin required)"""
        if not self.token:
            print("❌ No admin token for dashboard stats test")
            return False
            
        print("\n📊 Testing Dashboard Stats...")
        return self.run_test("Get Dashboard Stats", "GET", "dashboard/stats", 200)[0]

def main():
    print("🧪 Starting Sunehri Crumbs Bakery API Tests")
    print("=" * 50)
    
    tester = BakeryAPITester()
    
    # Test authentication first
    if not tester.test_admin_login():
        print("❌ Admin login failed, continuing with public endpoints only")
    else:
        tester.test_auth_me()
    
    # Test all endpoints
    tester.test_menu_endpoints()
    tester.test_menu_crud()
    tester.test_order_endpoints()
    tester.test_booking_endpoints()
    tester.test_review_endpoints()
    tester.test_contact_endpoints()
    tester.test_gallery_endpoints()
    tester.test_table_endpoints()
    tester.test_dashboard_stats()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests ({len(tester.failed_tests)}):")
        for failure in tester.failed_tests:
            print(f"   • {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n✨ Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())
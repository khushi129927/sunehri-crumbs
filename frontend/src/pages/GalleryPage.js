import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/gallery`)
      .then(r => setImages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="gallery-page" className="pt-20 min-h-screen bg-cream">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Visual Journey</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-coffee">Our Gallery</h1>
        <p className="text-charcoal/50 mt-4 max-w-lg mx-auto">A glimpse into the world of Sunehri Crumbs — where art meets baking.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] skeleton rounded-2xl" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-charcoal/40">No gallery images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="img-zoom aspect-[4/3] rounded-2xl overflow-hidden shadow-soft group relative"
                data-testid={`gallery-image-${i}`}
              >
                <img
                  src={img.url || `${process.env.REACT_APP_BACKEND_URL}${img.url}`}
                  alt={img.original_filename || 'Gallery'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

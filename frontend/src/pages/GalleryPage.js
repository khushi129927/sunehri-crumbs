import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

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
    <div data-testid="gallery-page" className="pt-20 min-h-screen">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Visual Journey</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gold">Our Gallery</h1>
        <p className="text-ivory/50 mt-4 max-w-lg mx-auto">A glimpse into the world of Sunehri Crumbs — where art meets baking.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] skeleton rounded-sm" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ivory/40">No gallery images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="img-zoom aspect-[4/3] rounded-sm overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 group relative"
                data-testid={`gallery-image-${i}`}
              >
                <img
                  src={img.url || `${process.env.REACT_APP_BACKEND_URL}${img.url}`}
                  alt={img.original_filename || 'Gallery'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useRef } from "react";
import { motion } from "framer-motion";
import Image from 'next/image';

export default function ArtworkGallerySection() {
  const targetRef = useRef(null);

  const artworks = [
    { src: '/images/arts/art1.jpg' },
    { src: '/images/arts/art2.jpg' },
    { src: '/images/arts/art3.jpeg' },
    { src: '/images/arts/art4.jpg' },
    { src: '/images/arts/art5.jpg' },
    { src: '/images/arts/art6.jpg' },
    { src: '/images/arts/art7.jpg' },
    { src: '/images/arts/art8.jpg' },
    { src: '/images/arts/art9.jpg' },
  ];

  return (
    <section ref={targetRef} className="bg-[#FDFCF8]">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-kc-text text-center mb-10 bg-no-repeat bg-center bg-cover px-4 min-h-[240px] -translate-y-12 flex items-center justify-center"
          style={{ backgroundImage: "url('/images/artsec.png')" }}
        >
          আমাদের কিছু শিল্পকর্ম
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          {artworks.map((art, i) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              key={i}
              className="aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-200 border-4 border-kc-text shadow-lg"
            >
              <Image
                src={art.src}
                alt={`Artwork ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                className="object-cover hover:scale-110 transition-transform duration-300"
                unoptimized
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

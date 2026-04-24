import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Import images from assets
import img1 from '../assets/WhatsApp Image 2026-04-23 at 19.12.50.jpeg';
import img2 from '../assets/WhatsApp Image 2026-04-23 at 19.12.51 (1).jpeg';
import img3 from '../assets/WhatsApp Image 2026-04-23 at 19.12.51.jpeg';
import img4 from '../assets/WhatsApp Image 2026-04-23 at 19.12.52.jpeg';
import img5 from '../assets/WhatsApp Image 2026-04-23 at 19.13.14 (1).jpeg';
import img6 from '../assets/WhatsApp Image 2026-04-23 at 19.13.14 (2).jpeg';
import img7 from '../assets/WhatsApp Image 2026-04-23 at 19.13.14 (3).jpeg';
import img8 from '../assets/WhatsApp Image 2026-04-23 at 19.13.14.jpeg';
import img9 from '../assets/WhatsApp Image 2026-04-23 at 19.13.15.jpeg';
import img10 from '../assets/WhatsApp Image 2026-04-23 at 19.13.34 (1).jpeg';
import img11 from '../assets/WhatsApp Image 2026-04-23 at 19.13.34 (2).jpeg';
import img12 from '../assets/WhatsApp Image 2026-04-23 at 19.13.34.jpeg';
import img13 from '../assets/WhatsApp Image 2026-04-23 at 19.13.35 (1).jpeg';
import img14 from '../assets/WhatsApp Image 2026-04-23 at 19.13.35.jpeg';
import g1 from '../assets/galleryimage1.jpeg';
import g2 from '../assets/galleryimage2.jpeg';
import g3 from '../assets/galleryimage3.jpeg';

const Gallery = () => {
    const [selectedImg, setSelectedImg] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const images = [
        { src: img1 }, { src: img2 }, { src: img3 }, { src: img4 },
        { src: img5 }, { src: img6 }, { src: img7 }, { src: img8 },
        { src: img9 }, { src: img10 }, { src: img11 }, { src: img12 },
        { src: img13 }, { src: img14 }, { src: g1 }, { src: g2 }, { src: g3 },
    ];

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImg(images[index].src);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImg(null);
        document.body.style.overflow = 'auto';
    };

    const showNext = (e) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        setSelectedImg(images[nextIndex].src);
    };

    const showPrev = (e) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        setSelectedImg(images[prevIndex].src);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-green-700 sm:text-5xl"
                    >
                        Our Gallery
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        A look inside RKB Mart
                    </motion.p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((image, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => openLightbox(index)}
                            className="group relative h-80 overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        >
                            <img
                                src={image.src}
                                alt={`Gallery image ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                    View Full Image
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Slider Modal */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-[110]"
                        >
                            <FaTimes size={32} />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={showPrev}
                            className="absolute left-4 sm:left-10 text-white/50 hover:text-white transition-colors p-4 z-[110] bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <FaChevronLeft size={24} />
                        </button>

                        <button
                            onClick={showNext}
                            className="absolute right-4 sm:right-10 text-white/50 hover:text-white transition-colors p-4 z-[110] bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <FaChevronRight size={24} />
                        </button>

                        {/* Image Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                        >
                            <motion.img
                                key={selectedImg}
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                src={selectedImg}
                                alt="Enlarged gallery item"
                                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl selection:bg-transparent"
                            />

                            {/* Counter */}
                            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;

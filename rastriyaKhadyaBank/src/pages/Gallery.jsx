import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { galleryPhotos } from '../assets/imageManifests';

const GRID_SIZES =
    '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw';

const Gallery = () => {
    const { t } = useTranslation();
    const Motion = motion;
    const photos = galleryPhotos;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        document.body.style.overflow = lightboxOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [lightboxOpen]);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const showNext = (e) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % photos.length;
        setCurrentIndex(nextIndex);
    };

    const showPrev = (e) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        setCurrentIndex(prevIndex);
    };

    const current = photos[currentIndex];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <Motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-green-700 sm:text-5xl"
                    >
                        {t('pages.gallery.title')}
                    </Motion.h1>
                    <Motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        {t('pages.gallery.subtitle')}
                    </Motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {photos.map((photo, index) => (
                        <Motion.div
                            key={`gallery-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => openLightbox(index)}
                            className="group relative h-80 overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        >
                            <img
                                src={photo.gridSrc}
                                srcSet={photo.gridSrcSet}
                                sizes={GRID_SIZES}
                                alt={t('pages.gallery.imageAlt', { count: index + 1 })}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                    {t('pages.gallery.viewFull')}
                                </span>
                            </div>
                        </Motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {lightboxOpen && current ? (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
                    >
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-[110]"
                        >
                            <FaTimes size={32} />
                        </button>

                        <button
                            type="button"
                            onClick={showPrev}
                            className="absolute left-4 sm:left-10 text-white/50 hover:text-white transition-colors p-4 z-[110] bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <FaChevronLeft size={24} />
                        </button>

                        <button
                            type="button"
                            onClick={showNext}
                            className="absolute right-4 sm:right-10 text-white/50 hover:text-white transition-colors p-4 z-[110] bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <FaChevronRight size={24} />
                        </button>

                        <Motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                        >
                            <Motion.img
                                key={current.lightboxSrc}
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                src={current.lightboxSrc}
                                srcSet={current.lightboxSrcSet}
                                sizes="(max-width: 1024px) 95vw, 90vw"
                                alt={t('pages.gallery.imageAlt', { count: currentIndex + 1 })}
                                decoding="async"
                                fetchPriority="high"
                                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl selection:bg-transparent"
                            />

                            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                                {currentIndex + 1} / {photos.length}
                            </div>
                        </Motion.div>
                    </Motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;

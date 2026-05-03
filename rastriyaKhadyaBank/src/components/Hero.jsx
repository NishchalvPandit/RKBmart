import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { heroSlides } from "../assets/imageManifests";

const Hero = () => {
  const slides = heroSlides.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return undefined;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () =>
    slides.length &&
    setIndex((prev) => (prev + 1) % slides.length);

  const prevSlide = () =>
    slides.length &&
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const goToSlide = (slideIndex) => setIndex(slideIndex);

  const current = slides[index];

  return (
    <div>
      <div className="relative w-full h-64 sm:h-96 md:h-[600px] overflow-hidden md:rounded-xl shadow-lg bg-neutral-900/5">
        {current ? (
          <img
            key={current.src}
            src={current.src}
            srcSet={current.srcSet}
            sizes="100vw"
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 pointer-events-none"
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ) : null}

        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none">
          <button
            type="button"
            onClick={prevSlide}
            className="pointer-events-auto bg-white/80 hover:bg-white text-green-600 p-3 rounded-full transition duration-200 z-10"
            aria-label="Previous slide"
          >
            <FaChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="pointer-events-auto bg-white/80 hover:bg-white text-green-600 p-3 rounded-full transition duration-200 z-10"
            aria-label="Next slide"
          >
            <FaChevronRight size={24} />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              onClick={() => goToSlide(slideIndex)}
              className={`w-3 h-3 rounded-full transition duration-300 ${slideIndex === index
                ? "bg-green-600 w-8"
                : "bg-white/60 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

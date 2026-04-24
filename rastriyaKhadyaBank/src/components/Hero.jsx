import { useState, useEffect } from "react";
import slider1 from "../assets/slider1.jpg";
import slider2 from "../assets/slider2.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Hero = () => {
  const images = [slider1, slider2];
  const [index, setIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (slideIndex) => {
    setIndex(slideIndex);
  };

  return (
    <div>
      <div
        className="w-full h-96 md:h-[600px] bg-center bg-cover transition-all duration-700 relative overflow-hidden md:rounded-lg"
        style={{ backgroundImage: `url(${images[index]})` }}
      >
        {/* Overlay */}
        <div className="h-full w-full bg-black/5 flex items-center justify-between px-4 md:px-8">
          {/* Left button */}
          <button
            onClick={prevSlide}
            className="bg-white/80 hover:bg-white text-green-600 p-3 rounded-full transition duration-200 z-10"
            aria-label="Previous slide"
          >
            <FaChevronLeft size={24} />
          </button>

          {/* Right button */}
          <button
            onClick={nextSlide}
            className="bg-white/80 hover:bg-white text-green-600 p-3 rounded-full transition duration-200 z-10"
            aria-label="Next slide"
          >
            <FaChevronRight size={24} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, slideIndex) => (
            <button
              key={slideIndex}
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

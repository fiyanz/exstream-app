import React from 'react'
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import imag from "../assets/Extrime/Cewek/Cewe1.jpeg";
import imag1 from "../assets/Extrime/Cewek/Cewe3.jpeg";
import imag2 from "../assets/Extrime/Cewek/Cewe.jpeg";
import imag3 from "../assets/Extrime/Cewek/Cewe2.jpeg";
import men from "../assets/Extrime/Cowok/One3.jpeg";
import men1 from "../assets/Extrime/Cowok/One1.jpeg";
import men2 from "../assets/Extrime/Cowok/One.jpeg";
import men3 from "../assets/Extrime/Cowok/One2.jpeg";
import men4 from "../assets/Extrime/Cowok/One4.jpeg";


const PilihanWarnaCom = () => {
    const products = [
        {
            id: 1,
            name: 'Hijau Sage',
            image: imag,
        },
        {
            id: 2,
            name: 'Ungu Violet',
            image: imag1,
        },
        {
            id: 3,
            name: 'Dusty Pink',
            image: imag2,
        },
        {
            id: 4,
            name: 'Pink Muda',
            image: imag3,
        },
        {
            id: 5,
            name: 'Beige / Khaki',
            image: men,
        },
        {
            id: 7,
            name: 'Navy Blue',
            image: men1,
        },
        {
            id: 8,
            name: 'black',
            image: men2,
        },
        {
            id: 9,
            name: 'Army Green',
            image: men3,
        },
        {
            id: 10,
            name: 'Red',
            image: men4,
        },
    ];

    // State to manage the active slide index
    const [currentSlide, setCurrentSlide] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Determine items per view based on screen width
    const itemsPerView = windowWidth >= 768 ? 3 : 1; // 3 on md+ screens, 1 on others
    const totalPages = products.length - itemsPerView + 1;
    // const totalPages1 = Men.length - itemsPerView + 1;

    // Effect to handle window resize for dynamic slide count
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            // Reset slide to prevent empty space when resizing from desktop to mobile
            setCurrentSlide(0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-slide functionality
    useEffect(() => { 
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % totalPages);
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, [totalPages]);

    // Handler for next slide button
    const nextSlide = () => {
        setCurrentSlide((prevSlide) => Math.min(prevSlide + 1, totalPages - 1));
    };

    // Handler for previous slide button
    const prevSlide = () => {
        setCurrentSlide((prevSlide) => Math.max(prevSlide - 1, 0));
    };

    // Handler for pagination dot clicks
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Calculate the transform value for the carousel
    const carouselTransform = `translateX(-${(currentSlide * 100) / itemsPerView}%)`;

    return (
        <div className='h-[100vh]'>
            <h2 className='text-center text-5xl font-bold pil'>
                Kami Juga Mengediakan
                <br />
                Beberapa PIlihan warna untuk Anda
            </h2>
            <div className="flex justify-center items-center min-h-screenp-2 sm:p-4 font-sans">
                <div className="w-full max-w-6xl">
                    {/* Header container */}
                    <div className="flex justify-center mb-8 sm:mb-12">
                        <p className="p-pil bg-black text-white font-semibold rounded-full shadow-lg text-sm sm:text-xl">
                            Tersedia 10 Pilihan Warna Recommended
                        </p>
                    </div>

                    {/* Swiper container */}
                    <div className="relative flex items-center">
                        {/* Previous button - positioned responsively */}
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className={`absolute left-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 -translate-x-1/2 sm:-translate-x-1/2 md:left-4 md:translate-x-0 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                                }`}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Carousel wrapper with overflow hidden */}
                        <div className="w-full overflow-hidden rounded-xl">
                            <div
                                className="flex transition-transform duration-500 ease-in-out pil-3"
                                style={{ transform: carouselTransform }}
                            >
                                {products.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-full md:w-1/3 p-2 sm:p-4">
                                        <div className="flex flex-col items-center p-4 sm:p-6 space-y-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className=" h-auto object-cover rounded-md img-pil"
                                                onError={(e) => {
                                                    e.target.onerror = null; // prevents infinite loop
                                                    e.target.src = "https://placehold.co/400x500/000/fff?text=Image+Error";
                                                }}
                                            />
                                            <span className="text-gray-800 font-medium text-base sm:text-lg">
                                                {product.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next button - positioned responsively */}
                        <button
                            onClick={nextSlide}
                            disabled={currentSlide === totalPages - 1}
                            className={`absolute right-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 translate-x-1/2 sm:translate-x-1/2 md:right-4 md:translate-x-0 ${currentSlide === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                                }`}
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Pagination dots */}
                    <div className="flex justify-center mt-6 sm:mt-8 space-x-2 but-pil gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentSlide ? 'bg-indigo-500' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Part 2 */}
            {/* <div className="flex justify-center items-center min-h-screenp-2 sm:p-4 font-sans">
                <div className="w-full max-w-6xl">
                    
                    <div className="flex justify-center mb-8 sm:mb-12">
                        <p className="p-pil bg-amber-500 text-white font-semibold rounded-full shadow-lg text-sm sm:text-xl">
                            Tersedia 4 Pilihan Warna Untuk Laki Laki
                        </p>
                    </div>

                 
                    <div className="relative flex items-center">
                        
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className={`absolute left-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 -translate-x-1/2 sm:-translate-x-1/2 md:left-4 md:translate-x-0 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                                }`}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        
                        <div className="w-full overflow-hidden rounded-xl">
                            <div
                                className="flex transition-transform duration-500 ease-in-out gap-4"
                                style={{ transform: carouselTransform }}
                            >
                                {products.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-full md:w-1/3 p-2 sm:p-4">
                                        <div className="flex flex-col items-center p-4 sm:p-6 space-y-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className=" h-auto object-cover rounded-md img-pil"
                                                onError={(e) => {
                                                    e.target.onerror = null; // prevents infinite loop
                                                    e.target.src = "https://placehold.co/400x500/000/fff?text=Image+Error";
                                                }}
                                            />
                                            <span className="text-gray-800 font-medium text-base sm:text-lg">
                                                {product.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                   
                        <button
                            onClick={nextSlide}
                            disabled={currentSlide === totalPages - 1}
                            className={`absolute right-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 translate-x-1/2 sm:translate-x-1/2 md:right-4 md:translate-x-0 ${currentSlide === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                                }`}
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>


                    <div className="flex justify-center mt-6 sm:mt-8 space-x-2 but-pil gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentSlide ? 'bg-indigo-500' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default PilihanWarnaCom

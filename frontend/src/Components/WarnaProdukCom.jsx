import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import imag from "../assets/Extrime/Cewek/Violet/Cewe.jpeg";
import imag1 from "../assets/Extrime/Cewek/Violet/Cewe1.jpeg";
import imag2 from "../assets/Extrime/Cewek/Violet/Cewe2.jpeg";
import imag3 from "../assets/Extrime/Cewek/Violet/Cewe3.jpeg";
import imag4 from "../assets/Extrime/Cewek/Violet/Cewe4.jpeg";


const PilihanWarnaCo = () => {
    const products = [
        {
            id: 1,
            name: 'Ungu Violet',
            image: imag,
        },
        {
            id: 2,
            name: 'Ungu Violet',
            image: imag1,
        },
        {
            id: 3,
            name: 'Ungu Violet',
            image: imag2,
        },
        {
            id: 4,
            name: 'Ungu Violet',
            image: imag3,
        },
        {
            id: 5,
            name: 'Ungu Violet',
            image: imag4,
        },
        // {
        //     id: 7,
        //     name: 'Navy Blue',
        //     image: men1,
        // },
        // {
        //     id: 8,
        //     name: 'black',
        //     image: men2,
        // },
        // {
        //     id: 9,
        //     name: 'Army Green',
        //     image: men3,
        // },
        // {
        //     id: 10,
        //     name: 'Red',
        //     image: men4,
        // },
    ];

    // State untuk mengelola index slide aktif
    const [currentSlide, setCurrentSlide] = useState(0);

    // Items per view selalu 1, sesuai permintaan
    const itemsPerView = 1;

    // Total halaman adalah jumlah produk karena setiap slide berisi 1 produk
    const totalPages = products.length;

    // Fungsi untuk menggeser slide secara otomatis
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % totalPages);
        }, 10000); // Geser slide setiap 3 detik

        return () => clearInterval(interval);
    }, [totalPages]); // Pastikan efek berjalan ulang saat totalPages berubah

    // Handler untuk tombol next
    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % totalPages);
    };

    // Handler untuk tombol previous
    const prevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + totalPages) % totalPages);
    };

    // Handler untuk klik dot pagination
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Hitung nilai transform untuk carousel
    const carouselTransform = `translateX(-${currentSlide * 100}%)`;

    return (
        <div 
            data-aos="fade-down"
            data-aos-delay="100"
            data-aos-duration="1900"
            className=" p-2 sm:p-4 w-full">
            <div className="w-[200px] div-war" >

                {/* Swiper container */}
                <div className="relative flex items-center">
                    {/* Tombol Previous */}
                    <button
                        onClick={prevSlide}
                        className={`absolute left-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 -translate-x-1/2 md:left-4 md:translate-x-0 hover:bg-gray-200`}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Carousel wrapper dengan overflow hidden */}
                    <div className="w-full overflow-hidden rounded-xl">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: carouselTransform }}
                        >
                            {products.map((product) => (
                                <div key={product.id} className="flex-shrink-0 w-full p-2 sm:p-4">
                                    <div className="flex flex-col items-center p-4 sm:p-6 space-y-4">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-[160px] h-[160px] object-cover rounded-md shadow-lg img-war"
                                            onError={(e) => {
                                                e.target.onerror = null;
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

                    {/* Tombol Next */}
                    <button
                        onClick={nextSlide}
                        className={`absolute right-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 transition-colors duration-200 translate-x-1/2 md:right-4 md:translate-x-0 hover:bg-gray-200`}
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
                            className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentSlide ? 'bg-indigo-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PilihanWarnaCo;
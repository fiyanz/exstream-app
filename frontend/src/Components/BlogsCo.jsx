import React from 'react'
import { ChevronDown, MessageCircleMore } from 'lucide-react';

const BlogsCo = () => {
  return (
    <div className=" flex items-center justify-center font-sans di-blo">
      <div className="text-center max-w-2xl w-full space-y-6 sm:space-y-8 md:space-y-10">

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight h1-blo">
          Sudah Siap Tampil Beda Di Tahun Ini?
        </h1>

        {/* Subtitle/Description */}
        <p className="text-base sm:text-lg text-gray-600 px-4 h1-blo">
          Manfaatkan harga spesial launching khusus hari ini saja. Besok harga kembali normal!
        </p>

        {/* Price Section */}
        <div className="flex flex-col items-center justify-center space-y-2 ">
          {/* Old Price (Strikethrough) */}
          <p className="text-xl sm:text-2xl text-red-500 line-through font-medium h1-blo">
            Rp299.000
          </p>
          {/* New Price */}
          <p className="text-4xl sm:text-5xl md:text-6xl text-green-600 font-bold leading-none h1-blo">
            Rp 149,000
          </p>
        </div>

        {/* Chevron Icon */}
        <div className="flex justify-center mt-4 mb-8 h1-blo">
          <ChevronDown className="text-red-500 animate-bounce" size={50} />
        </div>

        {/* Call-to-Action Button */}
        <button className="flex gap-1 but-te items-center justify-center mx-auto space-x-2 py-3 px-8 rounded-full text-lg sm:text-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500">
          <MessageCircleMore size={24} className="sm:inline-block" />
          <span>Order Sekarang</span>
        </button>   

      </div>
    </div>
  );
}

export default BlogsCo

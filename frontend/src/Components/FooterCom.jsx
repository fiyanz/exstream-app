import React from 'react'

const FooterCom = () => {
  return (
    <div className=" text-white py-12 px-4 sm:px-6 md:px-8 font-sans dif-fo">
      <div className="flex flex-col justify-center items-center gap-5 text-center space-y-6 dif-1">

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Jas Hujan Extrime
        </h1>

        {/* Description Section */}
        <div className="space-y-4 flex flex-col gap-3">
          <p className="text-sm sm:text-base md:text-lg font-medium text-gray-300">
            Peluncuran Eksklusif hanya di Website ini!
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed">
            Jas Hujan Extrime tidak akan kamu temukan di marketplace 
            <br />
            manapun karena kami produksi sangat terbatas 
            <br />
            agar lebih eksklusif.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-300">
            Pesan sekarang sebelum kehabisan stok edisi spesial ini!
          </p>
        </div>

        {/* Separator Line */}
        <hr className="border-t border-gray-700 w-full mx-auto" />

        {/* Copyright */}
        <p className="text-xs sm:text-sm text-gray-500 pt-4">
          © 2025. Jaket Voxzy. All Rights Reserved.
        </p>

      </div>
    </div>
  )
}

export default FooterCom

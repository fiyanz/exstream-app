import React from 'react';
import Foto from '../../assets/image/two.png'
import { Check } from "lucide-react";
import './Kod.css'
import des from '../../assets/ukuran.jpeg'
import des1 from '../../assets/deskripsi.jpeg'

const Koded = () => {
  return (
    <div className="flex items-center justify-center lg:min-h-screen p-4">
      <div className=" flex flex-col lg:flex-row justify-center items-center gap-15">
        {/* Bagian Gambar */}
        <div className="p-4 kod-2">
          <div className="bg-[#facc15] flex items-center justify-center p-4 kod-3">
            
          </div>
          <img 
              src={Foto}
              alt="Wanita bahagia" 
              className="img-kod"
        />
        </div>

        {/* Bagian Teks dan Daftar */}
        <div className="flex flex-col items-start gap-5 kod-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Tiga Langkah Mudah dengan 
            <br />
            Jas Hujan Extrime
          </h2>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-start  gap-1">
              <span className="text-3xl font-bold text-[#8b5cf6] mr-4">01</span>
              <p className="text-gray-600 text-lg">
                Pilih Jas Hujan Extrime Series favoritmu
              </p>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-3xl font-bold text-[#8b5cf6] mr-4">02</span>
              <p className="text-gray-600 text-lg">
                Gunakan saat hujan, tetap kering dan 
                <br />
                nyaman di perjalanan
              </p>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-3xl font-bold text-[#8b5cf6] mr-4">03</span>
              <p className="text-gray-600 text-lg">
                Nikmati perlindungan maksimal dengan desain 
                <br />
                keren & kualitas original
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-8 justify-center items-center'>
          <img src={des} alt="" className='img-ko1'/>
          <img src={des1} alt="" className='img-ko1' />
        </div>
      </div>
    </div>
  );
};

export default Koded;
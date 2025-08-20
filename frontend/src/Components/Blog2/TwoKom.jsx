import React from 'react';
// Anda bisa mengimpor gambar secara lokal atau menggunakan URL
import productImage from '../../assets/deskripsi.png';
import { Check } from "lucide-react";
import './two.css'

const ProductSection = () => {
  const features = [
    'ORIGINAL JAS HUJAN EXTRIME',
    'JAS HUJAN DENGAN DESAIN JAKET KEKINIAN',
    'KUALITAS FULL SEALING PRESS',
    'BAHAN PREMIUM PVC KARET DIJAMIN LENTUR DAN KUAT',
    'GARANSI 100% ORIGINAL',
  ];

  return (
    <section className="so">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-13">

        {/* Kolom Kiri: Poin-poin Fitur */}
        <div className="so-1">
          <h2 className="text-3xl font-bold mb-6 md:text-left">
            EXTRIME
          </h2>
          <h3 className="text-xl font-semibold mb-6 md:text-left">
            RAJANYA JAS HUJAN
          </h3>
          <ul className="so-ul">
            {features.map((feature, index) => (
              <li key={index} className=" ">
                {/* Ikon centang SVG sederhana */}
                
                <span className="flex items-center text-sm lg:text-lg font-medium"> <Check /> {feature}</span>
              </li>
            ))}
          </ul>
          <div className="par-so">
            <h4 className="text-2xl font-bold mb-2">PENTING !</h4>
            <p className="text-sm lg:text-lg leading-relaxed">
              JAS HUJAN INI SUDAH DILAPISI FULL SEALING PRESS, DIJAMIN TIDAK REMBES,
              <br />
              JANGAN TERGIUR DENGAN JAS HUJAN YANG LEBIH MURAH, PASTIKAN JAS 
              <br />
              HUJAN ANDA SUDAH <span className="font-bold text-red-600">SEALING PRESS</span>.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Gambar Produk */}
        <div className="bg-[#facc15] w-[470px] h-[390px] rounded-2xl di-so">
          <img
            src={productImage}
            alt="Jas Hujan EXTRIME"
            className="w-[450px] h-[490px] img-1on"
          />
        </div>

      </div>

      {/* Bagian Catatan Penting */}

    </section>
  );
};

export default ProductSection;
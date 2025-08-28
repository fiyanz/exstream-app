import { useState, useEffect } from 'react';
import "./Wakt.css"

function WaktuL() {
  const normalPrice = 299000;
  const discountedPrice = 135000;

  const [time, setTime] = useState(86400); // 30 menit = 1800 detik

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    // Kontainer utama yang responsif:
    // flexbox untuk menengahkan konten
    // min-h-screen untuk mengisi tinggi layar
    // p-4 untuk padding yang aman di semua layar
    <div className="flex items-center justify-center p-4 wak">
      <div className="p-8 text-center">
        {/*
          Kontainer utama:
          - w-full: Ambil lebar penuh di mobile
          - max-w-sm: Batasi lebar di desktop agar tidak terlalu lebar
        */}
        <div className="p-8 text-center flex flex-col gap-2 wak-1">
          {/* Judul dan subjudul */}
          {/* text-2xl untuk mobile, md:text-3xl untuk desktop */}
          <h1 className="text-2xl lg:text-5xl font-bold text-gray-800 mb-2">Buruan Ambil Promonya</h1>
          <p className="text-lg lg:text-2xl text-gray-500 mb-6">Jangan sampai kelewatan <br /> khusus Hari Ini!</p>
          
          {/* Informasi harga */}
          <div className="mb-8 flex flex-col gap-2 wak-2">
            <p className="text-lg lg:text-3xl text-white line-through bg-gradient-to-r from-purple-500 to-indigo-600  rounded-full p-wak">
              Harga Normal: Rp. {normalPrice.toLocaleString('id-ID')}
            </p>
            <div className="wak-3a">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white 
              rounded-full text-sm lg:text-3xl font-semibold wak-3">Diskon 55%</span>
            </div>
            {/* Ukuran teks dinamis: text-3xl di mobile, md:text-4xl di desktop */}
            {/* <p className="text-3xl lg:text-4xl font-extrabold text-gray-500">
              Menjadi: Rp. {discountedPrice.toLocaleString('id-ID')}
            </p> */}
          </div>
  
          {/* Panah (opsional, bisa diganti ikon) */}
          <div className="flex justify-center my-6 gap-5">
            <svg className="w-12 h-25 text-gray-400 -rotate-25 svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 12m0 0l-7-12m7 7V3" />
            </svg>
            <svg className="w-12 h-25 text-gray-400 svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 12m0 0l-7-12m7 7V3" />
            </svg>
            <svg className="w-12 h-25 text-gray-400 rotate-25 svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 12m0 0l-7-12m7 7V3" />
            </svg>
          </div>
  
          {/* Harga Akhir dan Timer */}
          <div className="flex flex-col items-center">
            <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-2xl lg:text-3xl font-semibold wak-4">
              Rp. {discountedPrice.toLocaleString('id-ID')}
            </button>
            <div className="text-xl lg:text-2xl font-mono text-gray-700">
              Waktu Tersisa: <span className="text-red-600 font-bold">{formatTime(time)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaktuL;
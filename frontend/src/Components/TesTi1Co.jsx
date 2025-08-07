import React from 'react';
import { FaStar } from "react-icons/fa";
import bac from '../assets/Logo/download.png'
import cewek from '../assets/Logo/profile.png'
import cowok from '../assets/Logo/profile1.png'
import App from './TestiCo';

// Star icon for rating, using an inline SVG to avoid external dependencies
// const StarIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="w-4 h-4 text-yellow-400"
//   >
//     <path
//       fillRule="evenodd"
//       d="M10.788 3.212a.75.75 0 011.424 0l4.277 8.165c.189.362.3.77.3 1.258V19.5c0 .354-.286.64-.64.64h-1.12c-.354 0-.64-.286-.64-.64v-3.03l-4.102 3.665a.75.75 0 01-1.026-.814L10.788 3.212z"
//       clipRule="evenodd"
//     />
//   </svg>
// );

const Testimonial = () => {
  // Array of testimonial data
  // const testimonials = [
  //   {
  //     avatar: cewek,
  //     name: 'henyhandayanii',
  //     rating: 5,
  //     text: 'Bagus banget bahannya tebel , tokonya amanah yang di kirim sesuai dengan yg di pesan jangan ragu beli di toko ini, semoga amanah terus ya 😁',
  //   },
  //   {
  //     avatar: cowok,
  //     name: 'hikmamirzaukhail',
  //     rating: 5,
  //     text: 'Sangat bagus sesuai pesanan bahan taslan sama seperti axio tapi tanpa puring tapi tetap nyaman kalo dilipat bisa kecil tidak memakan tempat',
  //   },
  //   {
  //     avatar: cewek,
  //     name: 'hartinah2410',
  //     rating: 5,
  //     text: 'Bahanny tebal, bagus, harga oke...barang sesuai dateng ny sama yg di order...pokonya is the best lah...',
  //   },
  // ];

  return (
    <div className="text-white tes-1">
      {/* <img src={bac} alt="" className='w-full h-150'/> */}
      <div className="container mx-auto max-w-6xl tes-0">

        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 tracking-tight h2-te text-center tr-1">
          Sudah Dipercaya 1000+ Pembeli 
        </h2>

        {/* Testimonials Grid */}
        <div className="">
          <App/>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;

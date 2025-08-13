import React from 'react';
import cewek from '../../assets/Logo/profile.png'
import cowok from '../../assets/Logo/profile1.png'
import './Tes.css'

// Star icon for rating, using an inline SVG to avoid external dependencies
const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 text-yellow-400"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.212a.75.75 0 011.424 0l4.277 8.165c.189.362.3.77.3 1.258V19.5c0 .354-.286.64-.64.64h-1.12c-.354 0-.64-.286-.64-.64v-3.03l-4.102 3.665a.75.75 0 01-1.026-.814L10.788 3.212z"
      clipRule="evenodd"
    />
  </svg>
);

const JasHujanTesti = () => {
  // Array of testimonial data
  const testimonials = [
    {
      avatar: cewek,
      name: 'henyhandayanii',
      rating: 5,
      text: 'Bagus banget bahannya tebel , tokonya amanah yang di kirim sesuai dengan yg di pesan jangan ragu beli di toko ini, semoga amanah terus ya 😁',
      Delay: "200"
    },
    {
      avatar: cowok,
      name: 'hikmamirzaukhail',
      rating: 5,
      text: 'Sangat bagus sesuai pesanan bahan taslan sama seperti axio tapi tanpa puring tapi tetap nyaman kalo dilipat bisa kecil tidak memakan tempat',
      Delay: "300"
    },
    {
      avatar: cewek,
      name: 'hartinah2410',
      rating: 5,
      text: 'Bahanny tebal, bagus, harga oke...barang sesuai dateng ny sama yg di order...pokonya is the best lah...',
      Delay: "400"
    },
  ];

  return (
    <div className="text-black tes-1">
      {/* <img src={bac} alt="" className='w-full h-150'/> */}
      <div className=" text-center tes-0">

        {/* Section Title */}
        <h2 
          data-aos="fade-down"
          data-aos-delay="100"
          data-aos-duration="1500"
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 tracking-tight h2-te">
          Sudah Dipercaya 1000+ Pemesanan
        </h2>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3 li-2">
          {testimonials.map((testimonial, index) => (
            <div
              data-aos="fade-down"
              data-aos-delay={testimonials.Delay}
              data-aos-duration="1200"
              key={index}
              className="bg-white text-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-start text-left gr-te"
            >
              {/* User Info and Rating */}
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full mr-4"
                  // Fallback for avatar image
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/40x40/e2e8f0/0f172a?text=U';
                  }}
                />
                <div className='spa-te flex flex-col text-start'>
                  <p className="font-semibold text-base md:text-lg">
                    {testimonial.name}
                  </p>
                  <div className="flex">
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                  </div>
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-sm md:text-base leading-relaxed p-te">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JasHujanTesti;
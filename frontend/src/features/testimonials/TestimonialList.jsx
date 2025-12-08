import { useEffect } from 'react';
import femaleAvatar from '../../assets/Logo/profile.png';
import maleAvatar from '../../assets/Logo/profile1.png';
import bgImage from '../../assets/image/Wagu.jpg';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TestimonialList = () => {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const testimonials = [
    {
      avatar: femaleAvatar,
      name: 'henyhandayanii',
      rating: 5,
      text: 'Bagus banget bahannya tebel, tokonya amanah yang di kirim sesuai dengan yg di pesan jangan ragu beli di toko ini, semoga amanah terus ya 😁',
      delay: "200"
    },
    {
      avatar: maleAvatar,
      name: 'hikmamirzaukhail',
      rating: 5,
      text: 'Sangat bagus sesuai pesanan bahan taslan sama seperti axio tapi tanpa puring tapi tetap nyaman kalo dilipat bisa kecil tidak memakan tempat',
      delay: "300"
    },
    {
      avatar: femaleAvatar,
      name: 'hartinah2410',
      rating: 5,
      text: 'Bahanny tebal, bagus, harga oke...barang sesuai dateng ny sama yg di order...pokonya is the best lah...',
      delay: "400"
    },
  ];

  return (
    <div 
        className="w-full py-16 lg:py-24 bg-cover bg-center bg-no-repeat bg-fixed relative"
        style={{ backgroundImage: `url(${bgImage})` }}
    >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]"></div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 
                  data-aos="fade-down"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
                >
                  Sudah Dipercaya <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">1000+</span> Pemesanan
                </h2>
                <p className="mt-4 text-gray-600 text-lg">Apa kata mereka tentang kualitas Jas Hujan Extrime?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={testimonial.delay}
                  data-aos-duration="1000"
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-start gap-4"
                >
                  <div className="flex items-center gap-4 w-full border-b border-gray-100 pb-4">
                    <img
                      src={testimonial.avatar}
                      alt={`${testimonial.name} Avatar`}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/40x40/e2e8f0/0f172a?text=U';
                      }}
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </p>
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
        </div>
    </div>
  );
};

export default TestimonialList;

import { useState, useEffect } from 'react';
import Profi from '../assets/Logo/profile.png'
import Prof1 from '../assets/Logo/profile1.png'

// Sample testimonial data to populate the swiper
const testimonials = [
  {
    name: 'henyhandayanii',
    rating: 5,
    review: 'Bagus banget bahannya tebel, tokonya amanah yang di kirim sesuai dengan yg di pesan jangan ragu beli di toko ini, semoga amanah terus ya 😊',
    photo: Profi
  },
  {
    name: 'hikmamirzaukhail',
    rating: 5,
    review: 'Sangat bagus sesuai pesanan bahan taslan sama seperti axio tapi tanpa puring tapi tetap nyaman kalo dilipat bisa kecil tidak memakan tempat',
    photo: Prof1
  },
  {
    name: 'hartinah2410',
    rating: 5,
    review: 'Bahanny tebal, bagus, harga oke...barang sesuai dateng ny sama yg di order...pokonya is the best lah...',
    photo: Profi
  },
  {
    name: 'johndoe123',
    rating: 4,
    review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel quam euismod, luctus enim sed, convallis nunc. ',
    photo: Prof1
  },
  {
    name: 'janedoe456',
    rating: 5,
    review: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    photo: Profi
  }
];

// Helper function to create star rating icons
const StarRating = ({ rating }) => {
  return (
    <div className="flex text-yellow-400">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.376 2.454a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.542 1.118l-3.376-2.454a1 1 0 00-1.176 0l-3.376 2.454c-.787.57-1.842-.197-1.542-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.096 9.387c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z"
          />
        </svg>
      ))}
    </div>
  );
};

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Function to determine how many slides to show based on window width
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      setSlidesToShow(3); // Desktop
    } else if (window.innerWidth >= 768) {
      setSlidesToShow(2); // Tablet
    } else {
      setSlidesToShow(1); // Mobile
    }
  };

  // Set up the resize listener and initial value
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use useEffect to handle the automatic sliding
  useEffect(() => {
    const totalSlides = Math.ceil(testimonials.length / slidesToShow);
    const interval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % (testimonials.length - slidesToShow + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [slidesToShow]); // Restart interval when slidesToShow changes

  return (
    <div className="">
      <div className=" overflow-hidden relative tu-0">
        {/* The swiper container. The width of each card is set dynamically. */}
        <div
          className="flex transition-transform duration-700 ease-in-out gap-1"
          style={{ transform: `translateX(-${(currentSlide * 100) / slidesToShow}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 p-4 text-black"
              // Set the width of each card dynamically based on the number of slides to show
              style={{ width: `${100 / slidesToShow}%` }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col items-start tu-1 ">
                <div className="flex items-center mb-4 gap-2 tu-2">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-yellow-400"
                  />
                  <div>
                    <div className="text-xl font-semibold">{testimonial.name}</div>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
                <p className="text-black text-base items-start tu-3">{testimonial.review}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

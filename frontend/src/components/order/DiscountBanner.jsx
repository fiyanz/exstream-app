import { useState, useEffect } from "react";
import { Timer, Tag } from "lucide-react";

const DiscountBanner = ({ discount = 55, originalPrice = 300000, discountedPrice = 135000 }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden mb-12">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-20 -mb-20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
             <Tag className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">Diskon {discount}%</h2>
            <div className="flex items-center gap-3 text-indigo-100">
              <span className="text-lg line-through opacity-75">Rp {originalPrice.toLocaleString()}</span>
              <span className="text-2xl font-bold text-white">Rp {discountedPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
          <Timer className="w-6 h-6 text-yellow-300" />
           <div className="flex items-center text-2xl font-mono font-bold tracking-widest">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="mx-1">:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="mx-1">:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;

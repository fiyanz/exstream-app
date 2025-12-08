import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';

const PromoTimer = () => {
    const normalPrice = 299000;
    const discountedPrice = 135000;
    const [time, setTime] = useState(86400);

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
        <div className="flex items-center justify-center p-4 py-4 mt-4">
            <div className="p-8 text-center">
                <style>
                    {`
                    @keyframes zoom-pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    .animate-zoom-pulse {
                        animation: zoom-pulse 2s ease-in-out infinite;
                    }
                    `}
                </style>
                <div className="p-8 text-center flex flex-col gap-2">
                    <h1 className="text-2xl lg:text-5xl font-bold text-gray-800 mb-2">Buruan Ambil Promonya</h1>
                    <p className="text-lg lg:text-2xl text-gray-500 mb-6">Jangan sampai kelewatan <br /> khusus Hari Ini!</p>
                    
                    <div className="mb-8 flex flex-col gap-2">
                        <p className="text-lg lg:text-3xl text-white line-through bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full py-4 px-8 inline-block shadow-md">
                            Harga Normal: Rp. {normalPrice.toLocaleString('id-ID')}
                        </p>
                        <div className="my-5">
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm lg:text-3xl font-semibold py-3 px-8 shadow-md">
                                Diskon 55%
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center my-6 gap-5">
                       <ArrowDown className="w-12 h-12 text-gray-400 -rotate-12 animate-bounce" />
                       <ArrowDown className="w-12 h-12 text-gray-400 animate-bounce delay-100" />
                       <ArrowDown className="w-12 h-12 text-gray-400 rotate-12 animate-bounce delay-200" />
                    </div>

                    <div className="flex flex-col items-center">
                        <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-2xl lg:text-3xl font-semibold py-3 px-8 mb-4 animate-zoom-pulse shadow-lg hover:shadow-xl transition-shadow">
                            Rp. {discountedPrice.toLocaleString('id-ID')}
                        </button>
                        <div className="text-xl lg:text-2xl font-mono text-gray-700 mt-2 bg-gray-100 px-4 py-2 rounded-lg inline-block">
                            Waktu Tersisa: <span className="text-red-600 font-bold">{formatTime(time)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PromoTimer;

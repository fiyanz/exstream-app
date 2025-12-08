import { useEffect } from 'react';

const TaglineSection = () => {
    return (
        <div className='w-full py-16 md:py-24 bg-white'>
            <header className="container mx-auto px-4">
                <h2 
                    data-aos="fade-down"
                    data-aos-offset="100" // Adjusted offset for better trigger
                    data-aos-duration="1000"
                    className='text-center text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-relaxed max-w-4xl mx-auto'>
                        "Dirancang untuk Tangguh, Anti Rembes, dan Tetap Keren 
                        dalam Gaya Kekinian. Nyaman Dipakai Kapan Saja."
                </h2>
            </header>
        </div>
    )
}

export default TaglineSection;

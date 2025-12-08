
import promoImage1 from '../../assets/Blogs/Image.png';
import promoImage2 from '../../assets/image/juha.png';
import promoImage3 from '../../assets/Blogs/image1.png';
import bgImage from '../../assets/image/Wagu.jpg';

const PromoSection = () => {
    return (
        <div 
            className="relative w-full py-16 lg:py-24 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
            <div className='relative container mx-auto px-4 z-10'>
                <div className='flex flex-col items-center gap-12 lg:gap-20'>
                    {/* Text */}
                    <div className='text-center max-w-4xl'>
                        <h2 className='text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight drop-shadow-sm'>
                            Mau Jas Hujan Keren dan<br className="hidden md:block"/>
                            Tahan Lama? <span className="text-emerald-700">Extrime</span><br className="hidden md:block"/>
                            Pasti Jawabannya!
                        </h2>
                    </div>

                    {/* Image Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full place-items-center'>
                        <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                             <img src={promoImage2} alt="Promo Jas Hujan" className='w-[350px] h-[350px] object-cover transition-transform duration-500 group-hover:scale-110' />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 lg:-mt-16">
                             <img src={promoImage1} alt="Promo Jas Hujan Detail" className='w-[350px] h-[350px] object-cover transition-transform duration-500 group-hover:scale-110' />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                         <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                             <img src={promoImage3} alt="Promo Jas Hujan Action" className='w-[350px] h-[350px] object-cover transition-transform duration-500 group-hover:scale-110' />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromoSection;

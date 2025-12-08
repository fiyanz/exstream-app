
import headImage from '../../assets/head.jpeg';
import bgImage from '../../assets/image/Wagu.jpg'; // Import background image

const Navbar = () => {
    return (
        <div 
            className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <nav className='relative container mx-auto px-4 py-8 lg:py-16 text-black'>
                <div className='flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16'>
                    {/* Text Section */}
                    <div className='flex flex-col gap-4 text-center z-10'>
                        <span className='text-lg md:text-xl font-semibold uppercase tracking-wider text-gray-800'>
                            #Jas Hujan Extrime
                        </span>
                        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-sm'>
                            Jas Hujan Extrime, Super <br className="hidden md:block"/> 
                            Awet, Full Sealing Press, <br className="hidden md:block"/> 
                            100% Original
                        </h1>
                    </div>
                    
                    {/* Hero Image */}
                    <div className="relative group">
                         <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src={headImage}
                            alt="Hero Jas Hujan"
                            className='relative max-w-full w-[280px] md:w-[350px] lg:w-[450px] rounded-lg shadow-2xl transform transition duration-500 hover:scale-[1.02]'
                        />
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;

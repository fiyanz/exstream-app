import React from 'react';
import foto from '../assets/image/Selection.jpg';
import logo from '../assets/Logo/logo.png';
import ima from '../assets/image/Hero.png';

const NavbarCom = () => {
    return (
        <div className="relative">
            {/* Background image */}
            <img
                src={foto}
                alt="Background"
                className='absolute inset-0 w-full h-full object-cover img-nav1'
            />

            {/* Overlay (optional, for better text readability) */}

            <nav className='relative text-white container mx-auto px-4 py-8 md:py-16'>
                {/* Logo */}
                <img
                    src={logo}
                    alt="Logo"
                    className='w-[160px] mx-auto md:mx-0 logo-nav'
                />

                {/* Content Section */}
                <div className='flex flex-col md:flex-row justify-center items-center md:ml-4 one-nav  animate__animated animate__fadeInLeft animate__delay-1s'>
                    {/* Text and Button */}
                    <div className='flex flex-col gap-4 text-center  one-nav1'>
                        <span className='text-xl md:text-2xl font-semibold'>
                            #Jas Hujan Extrime
                        </span>
                        <span className='text-3xl md:text-5xl font-bold leading-tight'>
                            Jas Hujan Extrime - Gaya Kekinian, Anti Rembes, Tetap Keren
                        </span>
                        <a href="#" className='mt-4'>
                            <button className='bg-white text-black font-semibold rounded-lg text-lg hover:bg-gray-200 transition-colors but-nav'>
                                Beli Sekarang
                            </button>
                        </a>
                    </div>
                    {/* Hero Image */}
                    <img
                        src={ima}
                        alt="Hero"
                        className='w-full max-w-[400px] md:max-w-[650px] mt-8 md:mt-0 img-nav4'
                    />
                </div>
            </nav>
        </div>
    );
}

export default NavbarCom;
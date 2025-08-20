import React from 'react';
// import foto from '../../assets/Logo/larisko.png';
import logo from '../../assets/Logo/logo.png';
import ima from '../../assets/head.jpeg';
import { Link } from 'react-scroll';
import './Nav.css'

const NavbarCom = () => {

    return (
        <div className="relative nav">
            {/* Background image */}
            {/* <div className='absolute flex flex-col lg:flex-row justify-between items-center nav-1'>
                <div/>
                <div/>
            </div> */}
            {/* Overlay (optional, for better text readability) */}

            <nav className='relative text-black container mx-auto px-4 py-8 md:py-16  nav-0'>
                {/* Logo */}
                {/* <img
                    src={logo}
                    alt="Logo"
                    className='w-[160px] mx-auto md:mx-0 logo-nav text-black'
                /> */}

                {/* Content Section */}
                <div className='flex flex-col lg:flex-row justify-center lg:items-center gap-6 on-nav'>
                    {/* Text and Button */}
                    <div className='flex flex-col gap-4 text-center nav-text'>
                        <span className='text-xl md:text-xl font-semibold'>
                            #Jas Hujan Extrime
                        </span>
                        <span className='text-3xl md:text-5xl font-bold leading-tight'>
                            Jas Hujan Extrime, Super <br /> Awet, Full Sealing Press, <br /> 100% Original
                        </span>
                        {/* <Link activeClass='active' to="TransaksiOne" smooth={true} duration={500}  className='mt-4'>
                            <button  className='bg-black text-white font-semibold rounded-lg text-lg hover:bg-gray-200 transition-colors but-nav'>
                                Beli Sekarang
                            </button>
                        </Link> */}
                <div>
                </div>
                    </div>
                    {/* Hero Image */}
                    <img
                        src={ima}
                        alt="Hero"
                        className='max-w-full lg:max-w-[500px] mt-8 md:mt-0 ima'
                    />
                </div>
            </nav>
        </div>
    );
}

export default NavbarCom;
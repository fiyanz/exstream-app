import React from 'react'
import foto from '../assets/image/Selection.jpg'
import logo from '../assets/image/two.png'
import ima from '../assets/image/Hero.png'

const CobaCom = () => {
    return (
        <div className='Two relative'>
            <div className=''>
                <img
                    src={foto}
                    alt="Background"
                    className='absolute inset-0 w-full h-full img-nav1'
                />
                <nav className='text-white relative p-4 sm:p-8'>
                    <div className='flex flex-col items-center gap-6 text-center md:flex-row md:justify-center md:gap-10 towo'>
                        <div 
                            data-aos="fade-right"
                            data-aos-delay="100"
                            data-aos-duration="1900"
                            className='flex flex-col gap-4 sm:gap-6 items-center md:items-end md:text-right'>
                            <span className='text-lg sm:text-2xl'>
                                Koleksi Baru
                            </span>
                            <span className='text-3xl sm:text-5xl font-bold flex flex-col'>
                                Hujan Datang
                                <br />
                                Style Tetap Jalan
                            </span>
                            <a href="#" className='mt-2'>
                                <button className='but-nav bg-white text-black rounded-lg text-sm px-6 py-2 sm:text-lg sm:px-8 sm:py-3'>
                                    Beli Sekarang
                                </button>
                            </a>
                        </div>
                        <img 
                            data-aos="fade-left"
                            data-aos-delay="100"
                            data-aos-duration="1900"
                            src={logo} 
                            alt="Model" 
                            className='w-full max-w-[250px] sm:max-w-[410px] mt-4 md:mt-0' />
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default CobaCom;
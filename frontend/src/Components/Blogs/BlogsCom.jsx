import React from 'react'
// import logo from '../../assets/Logo/logo.png';
import ima from '../../assets/Blogs/Image.png';
import { Link } from 'react-scroll';
import ima1 from '../../assets/image/juha.png'
import ima2 from '../../assets/Blogs/image1.png'
// import ima3 from '../../assets/image/two.png'
import './blog.css';

const BlogsCom = () => {
    return (
        <div className="relative blog">
            {/* Overlay (optional, for better text readability) */}

            <nav className='relative text-black container mx-auto px-4 py-8 md:py-16 blog-0'>

                {/* Content Section */}
                <div className='flex flex-col justify-center items-center gap-10 on-blog'>
                    {/* Text and Button */}
                    <div className='flex flex-col gap-4 text-center blog-text'>
                        <span className='text-2xl md:text-3xl lg:text-6xl font-bold'>
                            Mau Jas Hujan Keren dan
                            <br />
                            Tahan Lama? Extrime 
                            <br />
                            Pasti Jawabannya!
                        </span>
                        {/* <span className='text-lg lg:text-xl leading-tight'>
                            Bahan pvc karet 0,25 tebel 
                            <br />
                            Semua jahitan di lapisi full sealing press
                            <br />
                            elastik anti rembes dan tidak mudah sobek
                        </span> */}
                        {/* <span className='text-lg md:text-lg font-bold leading-tight'>
                            Bahan pvc karet 0,25 tebel 
                            <br />
                            elastik anti rembes dan tidak mudah sobek
                        </span> */}
                        {/* <Link activeClass='active' to='Transaksi' spy={true} smooth={true} className='mt-4'>
                            <button className='bg-white text-black font-semibold rounded-lg text-lg hover:bg-gray-200 transition-colors but-blog'>
                                Beli Sekarang
                            </button>
                         </Link> */}
                    </div>
                    {/* Hero Image */}
                    <div className='flex flex-col xl:flex-row'>
                        <img src={ima1} alt="" className='h-[400px] w-[400px] ina' />
                        <img src={ima} alt="" className='h-[400px] w-[400px] ina' />
                        <img src={ima2} alt="" className='h-[400px] w-[400px] ina' />
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default BlogsCom

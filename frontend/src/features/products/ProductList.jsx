import { useEffect, useState } from 'react';
import { Pilihan } from '../../data/products';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ProductList = () => {
    useEffect(() => {
        AOS.init({ once: true });
    }, []);

    return (
        <div className='w-full py-16 lg:py-24 bg-white text-gray-900'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-20'>
                    
                    {/* Product Grid Section */}
                    <div className='w-full lg:w-3/5 flex flex-col items-center lg:items-start gap-10'>
                         <div className="w-full text-center lg:text-left">
                            <span className='inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg text-sm font-semibold tracking-wide uppercase'>
                                Tersedia 8 Pilihan Warna
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 w-full">
                            {Pilihan.map((pilihan, index) => (
                                <div
                                    key={index}
                                    className="group flex flex-col items-center bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 50}
                                    data-aos-duration="800"
                                >
                                    <div className="w-full aspect-[3/4] overflow-hidden rounded-lg shadow-sm mb-4">
                                         <img 
                                            src={pilihan.image} 
                                            alt={pilihan.name} 
                                            className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110" 
                                        />
                                    </div>
                                    <h3 className="text-sm md:text-base font-bold text-gray-800 text-center">
                                        {pilihan.name}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Content Section */}
                    <div className='w-full lg:w-2/5 flex flex-col gap-6 text-center lg:text-left' data-aos="fade-left" data-aos-duration="1000">
                        <h2 className='text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900'>
                            Pesan <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Banyak?</span> <br className="hidden lg:block" />
                            Kami Siap!
                        </h2>
                        <p className='text-lg md:text-xl text-gray-600 leading-relaxed font-medium'>
                            Sebagai produsen tangan pertama, kami melayani 
                            <span className="font-bold text-gray-800"> pembelian grosir </span> 
                            untuk event, perusahaan, atau instansi dengan 
                            <span className="font-bold text-emerald-600"> harga khusus.</span>
                        </p>
                        <div className="pt-4">
                             <a href="#transaksi" className="inline-flex justify-center items-center px-8 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                 Hubungi Kami
                             </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductList;

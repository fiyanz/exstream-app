import React from 'react'
import './pili.css'
import { Pilihan } from '../../Data/DataExtrime'
import { Link } from 'react-scroll'

const PilihanUtamaCom = () => {
    return (
        <div className='pil text-black'>
            <section className='flex flex-col lg:flex-row justify-center items-center pil-a1'>
                <div className='flex flex-col gap-2 justify-center items-center pil-a'>
                    <div>
                        <button className='text-white bu-pil text-center'>
                            Tersedia 8 Pilihan Warna Jas Hujan
                        </button>
                    </div>
                    <div
                        className="flex flex-wrap gap-10 pil-a2">
                        {Pilihan.map((pilihan, index) => (
                            <div
                                key={index}
                                className="rounded-lg"
                                data-aos="fade-down"
                                data-aos-delay={pilihan.Delay}
                                data-aos-duration="1900"
                            >
                                <img src={pilihan.image} alt={pilihan.title} className=" w-[200px] h-[230px] rounded-lg pil-img" />
                                <p className="text-lg lg:text-xl font-semibold text-center relative text-black">
                                    {pilihan.name}
                                </p>
                                {/* <p className="text-black font-bold text-center relative">{pilihan.description}</p> */}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex flex-col text-start gap-4 pil-b'>
                    <span className='text-7xl font-bold'>
                        Pesan
                        <br />
                        Banyak?
                        <br />
                        Kami Siap!
                    </span>
                    <span className='text-xl'>
                        Sebagai produsen tangan
                        <br />
                        pertama, kami melayani 
                        <br />
                        grosir untuk event, perusahaan, atau instansi 
                        <br />
                        harga khusus.
                    </span>
                    {/* <Link activeClass='active' to='TransaksiOne' spy={true} smooth={true} className='mt-4'>
                        <button className='font-semibold rounded-lg text-lg hover:bg-gray-200 transition-colors but-pil'>
                            Beli Sekarang
                        </button>
                    </Link> */}
                </div>
            </section>
        </div>
    )
}

export default PilihanUtamaCom

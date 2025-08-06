import React from 'react'
import PilihanWarnaCo from './WarnaProdukCom'
import PinkMudaCo from './PinkMudaCo'
import CowokWarnaCo from './CowokWarnaCo'
import HijauSaguCo from './HijauSaguCo'
import DustyPinkCo from './DustyPinkCo'
import { Link } from 'react-scroll'

const WarnaComci = () => {
    return (
        <div className='war'>
            <h2 className='text-center text-2xl md:text-5xl mb-4 md:mb-8 mt-12 font-bold war-1'>
                Kami Juga Mengediakan
                <br />
                Beberapa Pilihan warna untuk Anda
            </h2>
            <div className="flex justify-center mb-8 sm:mb-12">
                <p className="p-pil bg-black text-white font-semibold rounded-full shadow-lg text-sm sm:text-xl">
                    Tersedia 10 Pilihan Warna Recommended
                </p>
            </div>
            <div className='flex justify-between items-center gap-1 war-2'>
                <div className='flex gap-0.5 war-3'>
                    <PilihanWarnaCo />
                    <HijauSaguCo />
                    <DustyPinkCo />
                    <PinkMudaCo />
                    <CowokWarnaCo />
                </div>
                <div className='flex flex-col gap-5 ri-war'>
                    <h1 className='text-6xl font-bold'>
                        Pesan 
                        <br />
                        Banyak? 
                        <br />
                        Kami Siap!
                    </h1>
                    <p>
                        Sebagai produsen tangan pertama, 
                        <br />
                        kami melayani grosir untuk event, 
                        <br />
                        perusahaan, atau instansi — harga 
                        <br />
                        khusus.
                    </p>
                    <Link activeClass='active' to='navbar' spy={true} smooth={true}>
                        <button className='but-war font-bold shadow-md'>
                            Pesan Sekarang
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default WarnaComci

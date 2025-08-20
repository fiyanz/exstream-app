import React from 'react';
import uk from '../../assets/ukuran.png'
import { Check } from "lucide-react";
import './ukura.css'

const SizingGuide = () => {
    const sizes = [
        {
            size: 'L',
            measurements: {
                'Lebar Badan': '62 CM',
                'Panjang Badan': '78 CM',
                'Panjang Celana': '98 CM',
                'Lingkar Paha': '68 CM',
                'Lingkar Pinggang': '112 CM ',
            },
        },
        {
            size: 'XL',
            measurements: {
                'Lebar Badan': '65 CM',
                'Panjang Badan': '78 CM',
                'Panjang Celana': '100 CM',
                'Lingkar Paha': '70 CM',
                'Lingkar Pinggang': '112 CM ',
            },
        },
        {
            size: 'XXL',
            measurements: {
                'Lebar Badan': '67 CM',
                'Panjang Badan': '80 CM',
                'Panjang Celana': '100 CM',
                'Lingkar Paha': '70 CM',
                'Lingkar Pinggang': '112 CM ',
            },
        },
    ];

    return (
        <section className="si">
            <div className='flex flex-col lg:flex-row gap-30 justify-center items-center si-0'>
                <div className="flex flex-col lg:gap-8 si-1">
                    {sizes.map((sizeData) => (
                        <div key={sizeData.size} className="si-2">
                            <h3 className="text-2xl font-bold mb-4">UKURAN {sizeData.size} :</h3>
                            <ul className="">
                                {Object.entries(sizeData.measurements).map(([key, value]) => (
                                    <li key={key} className="flex justify-between items-center text-lg si-">
                                        <span className="flex items-center gap-2 font-medium"> <Check /> {key}</span>
                                        <span className=" text-right">:{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className='bg-[#facc15] w-[470px] h-[390px] rounded-2xl si-di'>
                    <img src={uk} alt="" className='w-[450px] h-[490px] si-img'/>
                </div>
            </div>
        </section>
    );
};

export default SizingGuide;
import React from 'react'
// import ImaHed from '../assets/Extrime/Header/Foto.jpeg'
import { features } from '../../Data/DataExtrime'
import imag from '../../assets/image/Screenshot 2025-08-03 130757.png'
import './Hea.css'

const HeaderCom = () => {

    return (
        <div className='he'>
            <header>
                <h2 
                    data-aos="fade-down"
                    data-aos-offset="200"
                    data-aos-delay="100"
                    data-aos-duration="1200"
                    className='text-center text-xl lg:text-4xl font-bold he-0'>
                        Dirancang untuk Tangguh, Anti Rembes, dan Tetap Keren 
                        <br />
                        dalam Gaya Kekinian Nyaman Dipakai Kapan Saja
                </h2>
                <div>
                    {/* <div
                        className="flex flex-wrap justify-center items-center gap-7 ">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="rounded-lg"
                                data-aos="fade-down"
                                data-aos-delay={features.Delay}
                                data-aos-duration="1900"
                            >
                                <img src={feature.image} alt={feature.title} className=" w-[400px] h-[430px] rounded-lg img-he" />
                                <div className='div-he relative rounded-lg'/>
                                <p className="text-2xl font-bold text-center p-he relative text-white">
                                {feature.title.split("||").map((line, i) => (
                                    <React.Fragment key={i}>
                                    {line}
                                    <br />
                                    </React.Fragment>
                                ))}
                                </p>
                                <p className="text-white font-bold text-center p-he1 relative">{feature.description}</p>
                            </div>
                        ))}
                    </div> */}
                </div>
            </header>
        </div>
    )
}

export default HeaderCom

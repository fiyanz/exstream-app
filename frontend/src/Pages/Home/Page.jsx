import React from 'react'
import NavbarCom from '../../Components/NavbarCom'
import HeaderCom from '../../Components/HeaderCom'
import CobaCom from '../../Components/CobaCom'
import Testimonial from '../../Components/TestimonialCom'
import FooterCom from '../../Components/FooterCom'
import WarnaComci from '../../Components/WarnaComci'
import App from '../../Components/Contoh'
// import App from '../../Components/TestiCo'

const HomeOn = () => {
    return (
        <>
            <NavbarCom />
            <HeaderCom />
            <CobaCom />
            <WarnaComci />
            <Testimonial />
            <App />
            <FooterCom />
            {/* Add other components or content here as needed */}
        </>
    )
}

export default HomeOn

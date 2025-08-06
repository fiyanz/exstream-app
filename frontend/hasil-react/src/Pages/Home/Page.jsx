import React from 'react'
import NavbarCom from '../../Components/NavbarCom'
import HeaderCom from '../../Components/HeaderCom'
import CobaCom from '../../Components/CobaCom'
import PilihanWarnaCom from '../../Components/PilihanWarnaCom'
// import Transaction from '../../Components/Transaction'
import Testimonial from '../../Components/TestimonialCom'
import BlogsCo from '../../Components/BlogsCo'
import FooterCom from '../../Components/FooterCom'
import PilihanWarnaCo from '../../Components/WarnaProdukCom'
import WarnaComci from '../../Components/WarnaComci'
import App from '../../Components/Contoh'

const HomeOn = () => {
    return (
        <>
            <NavbarCom />
            <HeaderCom />
            <CobaCom />
            <WarnaComci />
            <Testimonial />
            <App />
            <BlogsCo />
            <FooterCom />
            {/* Add other components or content here as needed */}
        </>
    )
}

export default HomeOn

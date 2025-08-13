import React from 'react'
import NavbarCom from '../../Components/Navbar/NavbarCom'
import HeaderCom from '../../Components/Header/HeaderCom'
import BlogsCom from '../../Components/Blogs/BlogsCom'
import OrderForm from '../../Components/Transaksi/TestiCo'
import PilihanUtamaCom from '../../Components/WarnaCom2/PilihanUtamaCom'
import JasHujanTesti from '../../Components/Testimonial/TestimonialCom'
import FooterOneJo from '../../Components/Footer/FooterCom'
import App from '../../Components/Transaksi/mainTransaksi'

const LandingOne = () => {
    return (
        <>
            <NavbarCom />
            <HeaderCom />
            <BlogsCom />
            <PilihanUtamaCom />
            <JasHujanTesti />
            {/* <OrderForm /> */}
            <App/>
            <FooterOneJo />
        </>
    )
}

export default LandingOne

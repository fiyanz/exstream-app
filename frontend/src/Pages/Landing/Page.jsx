import React from 'react'
import NavbarCom from '../../Components/Navbar/NavbarCom'
import HeaderCom from '../../Components/Header/HeaderCom'
import BlogsCom from '../../Components/Blogs/BlogsCom'
// import OrderForm from '../../Components/Transaksi/TestiCo'
import PilihanUtamaCom from '../../Components/WarnaCom2/PilihanUtamaCom'
import JasHujanTesti from '../../Components/Testimonial/TestimonialCom'
import FooterOneJo from '../../Components/Footer/FooterCom'
import App from '../../Components/Transaksi/mainTransaksi'
import Koded from '../../Components/Blogs/KodeBaru'
import WaktuL from '../../Components/Waktu/WaktuCom'
import SizingGuide from '../../Components/ukuran/Ukurancom'
import ProductSection from '../../Components/Blog2/TwoKom'

const LandingOne = () => {
    return (
        <>
            <NavbarCom />
            <Koded />
            {/* <SizingGuide />
            <ProductSection /> */}
            <HeaderCom />
            <BlogsCom />
            <PilihanUtamaCom />
            <JasHujanTesti />
            <WaktuL />
            <App/>
            <FooterOneJo />
        </>
    )
}

export default LandingOne

import NavbarCom from '../../Components/Navbar/NavbarCom'
import HeaderCom from '../../Components/Header/HeaderCom'
import BlogsCom from '../../Components/Blogs/BlogsCom'
import PilihanUtamaCom from '../../Components/WarnaCom2/PilihanUtamaCom'
import JasHujanTesti from '../../Components/Testimonial/TestimonialCom'
import FooterOneJo from '../../Components/Footer/FooterCom'
import App from '../../Components/Transaksi/mainTransaksi'
import Koded from '../../Components/Blogs/KodeBaru'
import WaktuL from '../../Components/Waktu/WaktuCom'

const LandingOne = () => {
    return (
        <>
            <NavbarCom />
            <Koded />
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

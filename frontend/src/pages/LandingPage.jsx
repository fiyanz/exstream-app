import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/layout/Navbar';
import ProductSpecs from '../features/products/ProductSpecs';
import TaglineSection from '../features/landing/TaglineSection';
import PromoSection from '../features/landing/PromoSection';
import ProductList from '../features/products/ProductList';
import TestimonialList from '../features/testimonials/TestimonialList';
import PromoTimer from '../features/landing/PromoTimer';
import TransactionPage from '../features/transactions/TransactionPage';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    useEffect(() => {
        AOS.init({ 
            duration: 1000,
            once: false,
        });
    }, []);

    return (
        <>
            <Navbar />
            <ProductSpecs />
            <TaglineSection />
            <PromoSection />
            <ProductList />
            <TestimonialList />
            <PromoTimer />
            <TransactionPage />
            <Footer />
        </>
    )
}

export default LandingPage;

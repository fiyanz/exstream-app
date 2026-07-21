import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TransactionPage from '../features/transactions/TransactionPage';

// Hero & feature images
import heroImg from '../assets/head.jpeg';
import featureImg1 from '../assets/Extrime/Header/feature1.png';
import featureImg2 from '../assets/Extrime/Header/feature2.png';
import featureImg3 from '../assets/Extrime/Header/feature3.png';

// Color product images
import imgBlack from '../assets/Extrime/Cowok/One.jpeg';
import imgNavy from '../assets/Extrime/Cowok/One1.jpeg';
import imgArmy from '../assets/Extrime/Cowok/One2.jpeg';
import imgCream from '../assets/Extrime/Cowok/One3.jpeg';
import imgRed from '../assets/Extrime/Cowok/One4.jpeg';
import imgDusty from '../assets/Extrime/Cewek/DustyPink/Cewe.jpeg';
import imgSage from '../assets/Extrime/Cewek/HijauSage/Cewe.jpeg';
import imgPink from '../assets/Extrime/Cewek/PInkMuda/Cewe.jpeg';
import imgViolet from '../assets/Extrime/Cewek/Violet/Cewe.jpeg';

const COLOR_GALLERY = [
    { name: 'Black', img: imgBlack },
    { name: 'Navy Blue', img: imgNavy },
    { name: 'Army Green', img: imgArmy },
    { name: 'Cream', img: imgCream },
    { name: 'Red', img: imgRed },
    { name: 'Dusty Pink', img: imgDusty },
    { name: 'Hijau Sage', img: imgSage },
    { name: 'Pink Muda', img: imgPink },
    { name: 'Ungu Violet', img: imgViolet },
];

const LandingPage = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <main className="max-w-[800px] mx-auto px-6 pb-20 w-full flex-grow">

                {/* ── Hero Section ── */}
                <section className="py-20 flex flex-col items-center text-center border-b-2 border-surface-variant">
                    <h1 className="text-[32px] md:text-[48px] font-bold text-primary mb-8 leading-tight tracking-tight">
                        Jas Hujan Extrime: Super Awet &amp; 100% Original
                    </h1>
                    <img
                        alt="Sekelompok orang memakai jas hujan Extrime"
                        className="w-full max-w-2xl rounded-xl shadow-md mb-8"
                        src={heroImg}
                    />
                    <p className="text-[20px] leading-relaxed text-on-surface-variant max-w-xl">
                        Pelindung setia di kala hujan. Dirancang untuk ketangguhan, anti rembes, dan tetap nyaman dipakai kapan saja.
                    </p>
                </section>

                {/* ── Features Section ── */}
                <section className="py-20 border-b-2 border-surface-variant">
                    <h2 className="text-[32px] font-bold text-primary text-center mb-20">
                        Kenapa Wajib Pilih Jas Hujan Extrime?
                    </h2>
                    <div className="space-y-20">
                        {/* Feature 1 */}
                        <div
                            className="bg-surface-gray rounded-xl p-8 border-2 border-surface-variant flex flex-col md:flex-row gap-8 items-center"
                            data-aos="fade-up"
                        >
                            <img alt="Desain Jaket Kekinian" className="w-full md:w-1/2 rounded-lg object-cover" src={featureImg1} />
                            <div className="w-full md:w-1/2">
                                <h3 className="text-[24px] font-semibold text-primary mb-4">Desain Jaket Kekinian &amp; Tangguh</h3>
                                <p className="text-[18px] leading-relaxed text-on-surface-variant">
                                    Dilengkapi tali hoodie, resleting premium, dan kancing jepret anti air. Memastikan Anda tetap kering dan gaya.
                                </p>
                            </div>
                        </div>
                        {/* Feature 2 */}
                        <div
                            className="bg-surface-gray rounded-xl p-8 border-2 border-surface-variant flex flex-col md:flex-row-reverse gap-8 items-center"
                            data-aos="fade-up"
                        >
                            <img alt="Kualitas Full Sealing Press" className="w-full md:w-1/2 rounded-lg object-cover" src={featureImg2} />
                            <div className="w-full md:w-1/2">
                                <h3 className="text-[24px] font-semibold text-primary mb-4">Kualitas Full Sealing Press</h3>
                                <p className="text-[18px] leading-relaxed text-on-surface-variant">
                                    Semua jahitan dilapisi full sealing press. Dijamin tidak rembes, memberikan perlindungan maksimal dari air hujan.
                                </p>
                            </div>
                        </div>
                        {/* Feature 3 */}
                        <div
                            className="bg-surface-gray rounded-xl p-8 border-2 border-surface-variant flex flex-col md:flex-row gap-8 items-center"
                            data-aos="fade-up"
                        >
                            <img alt="Bahan Premium PVC Karet" className="w-full md:w-1/2 rounded-lg object-cover" src={featureImg3} />
                            <div className="w-full md:w-1/2">
                                <h3 className="text-[24px] font-semibold text-primary mb-4">Bahan Premium PVC Karet</h3>
                                <p className="text-[18px] leading-relaxed text-on-surface-variant">
                                    Terbuat dari bahan PVC karet 0.25 tebal yang elastis. Anti rembes, lentur, kuat, dan tidak mudah sobek.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Color Gallery Section ── */}
                <section className="py-20 border-b-2 border-surface-variant">
                    <h2 className="text-[32px] font-bold text-primary text-center mb-8">
                        Tersedia 9 Pilihan Warna Menarik
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {COLOR_GALLERY.map((c, i) => (
                            <div
                                key={c.name}
                                className="bg-white border-2 border-surface-variant rounded-lg p-4 text-center shadow-sm"
                                data-aos="fade-up"
                                data-aos-delay={i * 60}
                            >
                                <img
                                    alt={`Jas hujan warna ${c.name}`}
                                    className="w-full aspect-[3/4] rounded mb-3 object-cover"
                                    src={c.img}
                                />
                                <p className="text-[18px] font-semibold text-on-surface">{c.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Size Chart Section ── */}
                <section className="py-20 border-b-2 border-surface-variant">
                    <h2 className="text-[32px] font-bold text-primary text-center mb-8">
                        Daftar Ukuran
                    </h2>
                    <div className="bg-white border-2 border-surface-variant rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-high border-b-2 border-surface-variant">
                                    <th className="p-4 text-[18px] font-semibold text-primary">Detail</th>
                                    <th className="p-4 text-[18px] font-semibold text-primary">L</th>
                                    <th className="p-4 text-[18px] font-semibold text-primary">XL</th>
                                    <th className="p-4 text-[18px] font-semibold text-primary">XXL</th>
                                </tr>
                            </thead>
                            <tbody className="text-[18px]">
                                <tr className="border-b border-surface-variant">
                                    <td className="p-4 font-semibold">Lebar Badan</td>
                                    <td className="p-4">62 CM</td><td className="p-4">65 CM</td><td className="p-4">67 CM</td>
                                </tr>
                                <tr className="border-b border-surface-variant">
                                    <td className="p-4 font-semibold">Panjang Badan</td>
                                    <td className="p-4">78 CM</td><td className="p-4">78 CM</td><td className="p-4">80 CM</td>
                                </tr>
                                <tr className="border-b border-surface-variant">
                                    <td className="p-4 font-semibold">Panjang Celana</td>
                                    <td className="p-4">98 CM</td><td className="p-4">100 CM</td><td className="p-4">100 CM</td>
                                </tr>
                                <tr className="border-b border-surface-variant">
                                    <td className="p-4 font-semibold">Lingkar Paha</td>
                                    <td className="p-4">68 CM</td><td className="p-4">70 CM</td><td className="p-4">70 CM</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold">Lingkar Pinggang</td>
                                    <td className="p-4">112 CM MAX</td><td className="p-4">112 CM MAX</td><td className="p-4">112 CM MAX</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Checkout Form ── */}
                <TransactionPage />
            </main>

            {/* ── Footer ── */}
            <footer className="bg-on-surface w-full mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 w-full max-w-[800px] mx-auto">
                    <div className="text-[32px] font-bold text-on-primary mb-4 md:mb-0">
                        Jas Hujan Extrime
                    </div>
                    <div className="flex gap-6 mb-4 md:mb-0">
                        <a className="text-[18px] text-surface-variant hover:text-white transition-colors cursor-pointer" href="#transaksi">Hubungi Kami</a>
                        <a className="text-[18px] text-surface-variant hover:text-white transition-colors cursor-pointer" href="#">Tentang Produk</a>
                        <a className="text-[18px] text-surface-variant hover:text-white transition-colors cursor-pointer" href="#">Panduan Ukuran</a>
                    </div>
                    <div className="text-[18px] text-on-primary text-center md:text-right">
                        © 2026 Jas Hujan Extrime. Pelindung Setia di Kala Hujan.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;


import footerBg from '../../assets/image/Wagu.jpg';

const Footer = () => {
  return (
    <div 
        className="text-white py-12 px-4 sm:px-6 md:px-8 font-sans bg-cover bg-center bg-no-repeat min-h-[50vh] lg:h-[57vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${footerBg})` }}
    >
      <div className="flex flex-col justify-center items-center gap-5 text-center space-y-6 w-full max-w-4xl mx-auto">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black drop-shadow-md">
          Jas Hujan Extrime
        </h1>

        {/* Description Section */}
        <div className="space-y-4 flex flex-col gap-3">
          <p className="text-sm sm:text-base md:text-lg font-medium text-black">
            Peluncuran Eksklusif hanya di Website ini!
          </p>
          <p className="text-sm sm:text-base md:text-lg text-black leading-relaxed">
            Jas Hujan Extrime tidak akan kamu temukan di marketplace 
            <br />
            manapun karena kami produksi sangat terbatas 
            <br />
            agar lebih eksklusif.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-black">
            Pesan sekarang sebelum kehabisan stok edisi spesial ini!
          </p>
        </div>

        {/* Separator Line */}
        <hr className="border-t border-gray-700 w-full max-w-lg mx-auto" />

        {/* Copyright */}
        <p className="text-xs sm:text-sm text-black pt-4">
          © {new Date().getFullYear()}. Jas Hujan Extrime. All Rights Reserved.
        </p>

      </div>
    </div>
  );
};

export default Footer;

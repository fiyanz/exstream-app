
import sizeChartImage from '../../assets/ukuran.jpeg';
import descriptionImage from '../../assets/deskripsi.jpeg';

const ProductSpecs = () => {
  return (
    <div className="w-full py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-24">
          
          {/* Size Chart Section */}
          <div className='flex flex-col gap-6 items-center w-full lg:w-1/2'>
            <div className="text-center space-y-2">
                 <h2 className='text-2xl lg:text-4xl font-bold text-gray-800'>Daftar Ukuran</h2>
                 <p className="text-gray-500">Panduan lengkap ukuran jas hujan</p>
            </div>
            <div className="relative group w-full max-w-lg rounded-2xl overflow-hidden shadow-lg bg-white p-2">
                <img 
                    src={sizeChartImage} 
                    alt="Size Chart Jas Hujan" 
                    className='w-full h-auto rounded-xl transform transition duration-500 group-hover:scale-[1.01]'
                />
            </div>
          </div>

          {/* Features Section */}
          <div className='flex flex-col gap-6 items-center w-full lg:w-1/2'>
            <div className="text-center space-y-2">
                <h2 className='text-2xl lg:text-4xl font-bold text-gray-800'>
                  Keunggulan Produk
                </h2>
                <p className="text-gray-500">Kenapa harus memilih Extrime?</p>
            </div>
            <div className="relative group w-full max-w-lg rounded-2xl overflow-hidden shadow-lg bg-white p-2">
                <img 
                    src={descriptionImage} 
                    alt="Product Features" 
                    className='w-full h-auto rounded-xl transform transition duration-500 group-hover:scale-[1.01]' 
                />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductSpecs;

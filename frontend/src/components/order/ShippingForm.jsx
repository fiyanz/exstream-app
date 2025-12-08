import { User, Phone, MapPin } from "lucide-react";
import TextInput from "../common/form/TextInput";
import SelectInput from "../common/form/SelectInput";

const ShippingForm = ({
  formData,
  errors,
  onChange,
  locations,
  isLoadingLocations,
}) => {
  const { provinces, cities, subdistricts, villages } = locations;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4 mb-6">
        <MapPin className="text-indigo-500" /> Detail Pengiriman
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TextInput
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          placeholder="Nama Lengkap Penerima"
          icon={User}
          label="Nama Lengkap"
          required
          error={errors.fullName}
        />
        <TextInput
          name="telephone"
          value={formData.telephone}
          onChange={onChange}
          placeholder="08xxxxxxxx"
          type="tel"
          icon={Phone}
          label="Nomor Telepon"
          required
          error={errors.telephone}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SelectInput
          name="province"
          value={formData.province}
          options={provinces}
          onChange={onChange}
          placeholder={isLoadingLocations ? "Memuat..." : "Pilih Provinsi"}
          label="Provinsi"
          required
          error={errors.province}
        />
        <SelectInput
          name="city"
          value={formData.city}
          options={cities}
          onChange={onChange}
          placeholder={isLoadingLocations ? "Memuat..." : "Pilih Kota/Kab"}
          disabled={!formData.province}
          label="Kota/Kabupaten"
          required
          error={errors.city}
        />
        <SelectInput
          name="subDistrict"
          value={formData.subDistrict}
          options={subdistricts}
          onChange={onChange}
          placeholder={isLoadingLocations ? "Memuat..." : "Pilih Kecamatan"}
          disabled={!formData.city}
          label="Kecamatan"
          required
          error={errors.subDistrict}
        />
        <SelectInput
          name="village"
          value={formData.village}
          options={villages}
          onChange={onChange}
          placeholder={isLoadingLocations ? "Memuat..." : "Pilih Desa/Kelurahan"}
          disabled={!formData.subDistrict}
          label="Desa/Kelurahan"
          required
          error={errors.village}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Alamat Lengkap <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            name="completeAddress"
            value={formData.completeAddress}
            onChange={onChange}
            rows="3"
            className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium bg-white ${
              errors.completeAddress
                ? "border-red-400 focus:ring-red-200 bg-red-50"
                : "border-gray-200 focus:ring-indigo-100"
            } focus:border-indigo-500 focus:ring-4 outline-none transition resize-none shadow-sm`}
            placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan..."
          ></textarea>
          {errors.completeAddress && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
               <span>&bull;</span> {errors.completeAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;

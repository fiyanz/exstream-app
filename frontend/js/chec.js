// Province to city mapping for "Kota/Kabupaten"
    const citiesByProvince = {
      jawa_barat: [
        'Bandung',
        'Bekasi',
        'Depok',
        'Bogor',
        'Cimahi',
        'Sukabumi',
      ],
      jawa_tengah: [
        'Semarang',
        'Surakarta',
        'Magelang',
        'Pekalongan',
        'Tegal',
      ],
      jawa_timur: [
        'Surabaya',
        'Malang',
        'Kediri',
        'Blitar',
        'Madiun',
      ],
      bali: [
        'Denpasar',
        'Singaraja',
        'Tabanan',
        'Klungkung',
      ],
      sumatera_utara: [
        'Medan',
        'Binjai',
        'Tebing Tinggi',
        'Pematangsiantar',
      ],
    };

    const provinceSelect = document.getElementById("province");
    const citySelect = document.getElementById("city");
    const shippingRadios = document.getElementsByName("shipping");
    const ongkirEl = document.getElementById("ongkir");
    const totalPriceEl = document.getElementById("total-price");

    const subtotal = 2198000; // Rp 1.299.000 + Rp 899.000 = Rp 2.198.000 + ongkir 15.000

    // Populate cities based on selected province
    provinceSelect.addEventListener("change", () => {
      const selectedProvince = provinceSelect.value;
      citySelect.innerHTML = '<option value="" disabled selected>Pilih Kota</option>';
      if (selectedProvince && citiesByProvince[selectedProvince]) {
        citiesByProvince[selectedProvince].forEach(city => {
          const opt = document.createElement("option");
          opt.value = city.toLowerCase().replace(/\s/g, "_");
          opt.textContent = city;
          citySelect.appendChild(opt);
        });
        citySelect.disabled = false;
      } else {
        citySelect.disabled = true;
      }
    });

    // Update shipping cost and total price when shipping method changes
    function updateShippingCost() {
      let ongkirValue = 0;
      shippingRadios.forEach(radio => {
        if (radio.checked) {
          ongkirValue = parseInt(radio.value, 10);
        }
      });
      ongkirEl.textContent = ongkirValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
      const total = subtotal + ongkirValue;
      totalPriceEl.textContent = total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    }
    shippingRadios.forEach(radio => {
      radio.addEventListener("change", updateShippingCost);
    });

    // Initialize city select as disabled until province chosen
    citySelect.disabled = true;

    // Initialize total based on default shipping
    updateShippingCost();
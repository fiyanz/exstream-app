document.addEventListener('DOMContentLoaded', function() {
    const orderNowButton = document.getElementById('order-now-button');
    const checkoutSection = document.getElementById('form-pemesanan');

    if (orderNowButton && checkoutSection) {
        orderNowButton.addEventListener('click', function(e) {
            e.preventDefault();
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const varianSelect = document.getElementById('varian');
    const jumlahInput = document.getElementById('jumlah');
    const selectedColor = document.getElementById('selected-color');
    const selectedQuantity = document.getElementById('selected-quantity');
    const shippingMethods = document.getElementsByName('shipping-method');
    const shippingCostEl = document.getElementById('shipping-cost');
    const totalPriceEl = document.getElementById('total-price');
    const subtotalEl = document.getElementById('subtotal');
    
    const productPrice = 299000;
    const shippingOptions = {
        regular: 19000,
        express: 29000,
        'same-day': 39000
    };

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function updateTotal() {
        const quantity = parseInt(jumlahInput.value) || 1;
        const subtotal = productPrice * quantity;
        
        const selectedShippingMethod = document.querySelector('input[name="shipping-method"]:checked').value;
        const shippingCost = shippingOptions[selectedShippingMethod];
        
        const total = subtotal + shippingCost;

        subtotalEl.textContent = formatRupiah(subtotal);
        shippingCostEl.textContent = formatRupiah(shippingCost);
        totalPriceEl.textContent = formatRupiah(total);
        
        if (selectedColor) {
            selectedColor.textContent = varianSelect.options[varianSelect.selectedIndex].text;
        }
        if (selectedQuantity) {
            selectedQuantity.textContent = quantity;
        }
    }

    if (varianSelect) varianSelect.addEventListener('change', updateTotal);
    if (jumlahInput) jumlahInput.addEventListener('input', updateTotal);
    if (shippingMethods) shippingMethods.forEach(method => method.addEventListener('change', updateTotal));

    // Image Sliders
    document.querySelectorAll('.color-card-container').forEach(card => {
        const slider = card.querySelector('.image-slider');
        const prevBtn = card.querySelector('.prev-btn');
        const nextBtn = card.querySelector('.next-btn');
        const images = slider.querySelectorAll('img');
        const imageCount = images.length;
        let currentIndex = 0;

        function updateSlider() {
            if (slider) {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentIndex = (currentIndex - 1 + imageCount) % imageCount;
                updateSlider();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentIndex = (currentIndex + 1) % imageCount;
                updateSlider();
            });
        }
    });

    // Payment options
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update aria-checked attribute for styling
            paymentOptions.forEach(opt => {
                opt.setAttribute('aria-checked', 'false');
            });
            option.setAttribute('aria-checked', 'true');
        });
    });

    // Initial calculation
    if (totalPriceEl) {
        updateTotal();
    }
});

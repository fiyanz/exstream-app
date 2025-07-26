(function() {
      // Images data - URLs and alt texts in sync with thumbnails
      const images = [
        {
          src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3f148e04-b652-4d8c-96eb-ce90fbdf3fc8.png",
          alt: "Woman modeling a trendy brown coat posing with a light brown wide brim hat",
          thumb: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b7e54dc7-f6ca-4696-9486-4c63c874016b.png",
          thumbAlt: "Thumbnail image: Woman modeling a trendy brown coat with hat, first pose"
        },
        {
          src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/23d08358-0c4e-4d6e-ad8f-c2afcc54789c.png",
          alt: "Woman modeling a trendy brown coat posing with a light brown wide brim hat, second image",
          thumb: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2c3e4771-ec4e-4f05-83b1-ee69797b8158.png",
          thumbAlt: "Thumbnail image: Woman modeling a trendy brown coat with hat, second pose"
        },
        {
          src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2eb0c5df-34f4-4d95-b8f8-78dad4d23629.png",
          alt: "Woman modeling a trendy brown coat posing with a light brown wide brim hat, third image",
          thumb: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/21eb4eb4-c572-44b0-ab06-b7ab2ee973f2.png",
          thumbAlt: "Thumbnail image: Woman modeling a trendy brown coat with hat, third pose"
        },
        {
          src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9b0a44a2-2310-4a03-bfe4-8de4d11d0531.png",
          alt: "Woman modeling a trendy brown coat posing with a light brown wide brim hat, fourth image",
          thumb: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7caabcb3-970c-4cc4-bf36-b3804a565761.png",
          thumbAlt: "Thumbnail image: Woman modeling a trendy brown coat with hat, fourth pose"
        }
      ];

      let currentIndex = 0;

      const mainImage = document.getElementById('mainImage');
      const thumbnails = document.querySelectorAll('.thumbnail');
      const prevBtn = document.getElementById('prevImageBtn');
      const nextBtn = document.getElementById('nextImageBtn');

      function updateMainImage(index) {
        currentIndex = index;
        mainImage.src = images[index].src;
        mainImage.alt = images[index].alt;

        thumbnails.forEach((thumb, i) => {
          if(i === index) {
            thumb.classList.add('active');
            thumb.setAttribute('aria-selected', 'true');
            thumb.setAttribute('tabindex', '0');
            thumb.focus();
          } else {
            thumb.classList.remove('active');
            thumb.setAttribute('aria-selected', 'false');
            thumb.setAttribute('tabindex', '-1');
          }
        });
      }

      prevBtn.addEventListener('click', () => {
        let newIndex = currentIndex - 1;
        if(newIndex < 0) newIndex = images.length - 1;
        updateMainImage(newIndex);
      });
      nextBtn.addEventListener('click', () => {
        let newIndex = currentIndex + 1;
        if(newIndex >= images.length) newIndex = 0;
        updateMainImage(newIndex);
      });

      thumbnails.forEach((thumb, i) => {
        thumb.addEventListener('click', () => {
          updateMainImage(i);
        });
        thumb.addEventListener('keydown', (e) => {
          if(e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            updateMainImage(i);
          }
          // Arrow navigation with keyboard inside thumbnails area
          if(e.key === 'ArrowLeft') {
            e.preventDefault();
            let prev = i - 1;
            if(prev < 0) prev = images.length - 1;
            thumbnails[prev].focus();
          }
          if(e.key === 'ArrowRight') {
            e.preventDefault();
            let next = i + 1;
            if(next >= images.length) next = 0;
            thumbnails[next].focus();
          }
        });
      });

      // Color selection logic
      const colorDots = document.querySelectorAll('.color-dot');
      colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
          colorDots.forEach(d => {
            d.classList.remove('selected');
            d.setAttribute('aria-checked', 'false');
            d.tabIndex = 0;
          });
          dot.classList.add('selected');
          dot.setAttribute('aria-checked', 'true');
          dot.tabIndex = 0;
        });
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dot.click();
          }
          // Keyboard navigation inside color options
          if(e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            let index = Array.from(colorDots).indexOf(dot);
            let prev = index - 1;
            if(prev < 0) prev = colorDots.length - 1;
            colorDots[prev].focus();
          }
          if(e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            let index = Array.from(colorDots).indexOf(dot);
            let next = index + 1;
            if(next >= colorDots.length) next = 0;
            colorDots[next].focus();
          }
        });
      });

      // Size selection logic
      const sizeButtons = document.querySelectorAll('.size-btn');
      sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          sizeButtons.forEach(s => {
            s.classList.remove('selected');
            s.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');
        });
      });

      // Clear button - resets color and size selections & quantity
      const clearBtn = document.querySelector('.clear-btn');
      const stockLabel = document.querySelector('.stock-label');
      clearBtn.addEventListener('click', () => {
        // Reset color
        colorDots.forEach(d => {
          d.classList.remove('selected');
          d.setAttribute('aria-checked', 'false');
          d.tabIndex = -1;
        });
        // Set brown as default
        const brownDot = [...colorDots].find(d => d.dataset.color.toLowerCase() === 'brown');
        if(brownDot) {
          brownDot.classList.add('selected');
          brownDot.setAttribute('aria-checked', 'true');
          brownDot.tabIndex = 0;
          brownDot.focus();
        }

        // Reset size
        sizeButtons.forEach(s => {
          s.classList.remove('selected');
          s.setAttribute('aria-checked', 'false');
        });
        // Set XXL default
        const defaultSize = [...sizeButtons].find(s => s.dataset.size === 'XXL');
        if(defaultSize) {
          defaultSize.classList.add('selected');
          defaultSize.setAttribute('aria-checked', 'true');
          defaultSize.focus();
        }

        // Reset quantity
        qtyInput.value = 1;

        // Reset stock label (assumed In Stock)
        stockLabel.textContent = 'In Stock';
      });

      // Quantity controls
      const qtyInput = document.getElementById('qty-input');
      const btnDecrease = document.getElementById('qty-decrease');
      const btnIncrease = document.getElementById('qty-increase');

      btnDecrease.addEventListener('click', () => {
        let value = parseInt(qtyInput.value, 10);
        if (isNaN(value)) value = 1;
        if(value > 1) {
          qtyInput.value = value - 1;
        }
      });
      btnIncrease.addEventListener('click', () => {
        let value = parseInt(qtyInput.value, 10);
        if (isNaN(value)) value = 1;
        if(value < 99) {
          qtyInput.value = value + 1;
        }
      });

      qtyInput.addEventListener('input', () => {
        let value = parseInt(qtyInput.value, 10);
        if (isNaN(value) || value < 1) {
          qtyInput.value = 1;
        } else if (value > 99) {
          qtyInput.value = 99;
        }
      });

      // Wishlist heart button toggling
      const wishlistBtn = document.getElementById('wishlistBtn');
      wishlistBtn.addEventListener('click', () => {
        const pressed = wishlistBtn.getAttribute('aria-pressed') === 'true';
        wishlistBtn.setAttribute('aria-pressed', String(!pressed));
        // For user feedback, toggle fill color:
        if(!pressed) {
          wishlistBtn.style.color = '#91453d'; // darker tone red-ish
        } else {
          wishlistBtn.style.color = '#c48f35'; // original gold-ish
        }
      });

      // Initialization
      updateMainImage(0);

    })();
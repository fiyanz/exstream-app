// Script to toggle theme (example extend for dark/light mode)
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('change', () => {
      if(themeToggle.checked) {
        document.body.style.backgroundColor = "#e0e0e0";
        document.body.style.color = "#111";
      } else {
        document.body.style.backgroundColor = "#000";
        document.body.style.color = "#fff";
      }
      themeToggle.setAttribute('aria-checked', themeToggle.checked.toString());
    });
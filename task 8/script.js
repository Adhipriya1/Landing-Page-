// Smooth scroll effect for navbar links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    if (this.hash !== "") {
      e.preventDefault();
      document.querySelector(this.hash).scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Simple click animation on social icons
document.querySelectorAll("footer i").forEach(icon => {
  icon.addEventListener("click", () => {
    icon.style.transform = "scale(1.2)";
    setTimeout(() => {
      icon.style.transform = "scale(1)";
    }, 200);
  });
});


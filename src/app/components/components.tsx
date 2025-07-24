// DOM Initialization

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById("mobile-menu-button") as HTMLElement | null;
const mobileMenu = document.getElementById("mobile-menu") as HTMLElement | null;

mobileMenuButton?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
  mobileMenuButton.classList.toggle("open");
});

// assumed defined elsewhere



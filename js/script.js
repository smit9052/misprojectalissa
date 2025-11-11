/* Mobile Menu Toggle Logic */
function toggleMobileMenu() {
    // Get the required elements
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-overlay');
    const hamburger = document.querySelector('.hamburger');

    // Toggle the 'active' class on all three elements
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-overlay');
    const hamburger = document.querySelector('.hamburger');

    // Remove the 'active' class from all three elements (used when clicking the overlay)
    menu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
}

/* Back to Top Button Logic */
// Listen for scroll events on the window
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  const backToTopButton = document.getElementById("backToTop");
  
  // Check if button exists before trying to modify it
  if (backToTopButton) {
      // Show the button if the user scrolls more than 20px
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
  }
}

function scrollToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

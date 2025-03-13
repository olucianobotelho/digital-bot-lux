/**
 * Animations Module
 * Handles all animation-related functionality for the website
 */

// Animate elements with a staggered delay
const animateElements = () => {
    const elements = document.querySelectorAll('.service-card, .case-card, .portfolio-card, .pricing-card');
    
    elements.forEach((element, index) => {
        // Add a slight delay for each element
        setTimeout(() => {
            element.classList.add('animated');
        }, index * 150);
    });
};

// Add floating animation to WhatsApp button
const initFloatingButton = () => {
    const whatsappButton = document.querySelector('.floating-whatsapp');
    if (whatsappButton) {
        setInterval(() => {
            whatsappButton.classList.toggle('float');
        }, 1500);
    }
};

// Add parallax effect to background
const initParallaxEffect = () => {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        document.body.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    });
};

// Export all animation functions
export { animateElements, initFloatingButton, initParallaxEffect };
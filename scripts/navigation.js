document.addEventListener('DOMContentLoaded', function() {
    // Handle all anchor links with smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Skip if it's an empty hash or it's a service-details-btn (handled by dialog system)
            if (targetId === '#' || this.classList.contains('service-details-btn')) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Smooth scroll to the target element
                window.scrollTo({
                    top: targetElement.offsetTop - 50, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add sound effects to buttons (arcade style)
const initButtonSounds = () => {
    const buttons = document.querySelectorAll('.cta-btn, .whatsapp-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('hover');
        });
        
        button.addEventListener('click', () => {
            playSound('click');
        });
    });
};

// Simple sound function (can be expanded with actual sound files)
const playSound = (type) => {
    // This is a placeholder for actual sound implementation
    console.log(`Playing ${type} sound`);
    
    // Uncomment and use these lines when you have actual sound files
    /*
    const sound = new Audio();
    sound.src = type === 'hover' ? 'sounds/hover.mp3' : 'sounds/click.mp3';
    sound.play();
    */
};

// Export all navigation functions
export { initButtonSounds, playSound };
// This is your main script (the one that handles the loading screen).
import { initLoadingScreen } from './loader.js';
import { initializeApp } from './script.js'; // This is correct
import { initMobileModel } from './mobile-init.js'; // NEW: Explicitly import the mobile model function

// This function will be called when the loading screen is ready to hide.
function showMainContent() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    // This is a much better way to handle the logic.
    loadingScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    // Remove the loading screen from the DOM after the animation is complete.
    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();

        // Initialize the main app logic after the fade out.
        initializeApp();

        // Check for mobile and initialize the mobile model and gyro control.
        if (window.innerWidth <= 900) {
            initMobileModel();
        }
    });
}

// Start the loading screen animation immediately.
initLoadingScreen('./media/logo/logo.png', () => {
    showMainContent();
});
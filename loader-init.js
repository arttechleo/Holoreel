// This is your main script (the one that handles the loading screen).
import { initLoadingScreen } from './loader.js';
import { initializeApp } from './script.js'; 
import { initMobileModel } from './mobile-model.js'; // Corrected import

// This function will be called when the point cloud animation is ready to hide.
function showMainContent() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    loadingScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();

        // Initialize the main app logic after the fade out.
        initializeApp();

        // Conditionally initialize the mobile model and gyro control.
        if (window.innerWidth <= 900) {
            initMobileModel();
        }
    });
}

// Start the loading screen animation immediately
// The second argument is a callback that will fire when the animation is 100% complete
initLoadingScreen('./media/logo/logo.png', () => {
    showMainContent();
});
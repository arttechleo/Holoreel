// This is your main script (the one that handles the loading screen).
import { initLoadingScreen } from './loader.js';

function showMainContent() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    loadingScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();

        // Dynamically import and initialize the correct app version
        if (window.innerWidth <= 900) {
            import('./mobile-model.js')
                .then(module => {
                    module.initMobileModel();
                })
                .catch(error => {
                    console.error('Failed to load mobile-model.js:', error);
                });
        } else {
            import('./script.js')
                .then(module => {
                    module.initializeApp();
                })
                .catch(error => {
                    console.error('Failed to load script.js:', error);
                });
        }
    });
}

// Start the loading screen animation immediately
initLoadingScreen('./media/logo/logo.png', () => {
    showMainContent();
});
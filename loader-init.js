// This is your main script (the one that handles the loading screen).
import { initLoadingScreen } from './loader.js';
import { initializeApp } from './script.js'; // NEW: Import the new function

// This function will be called when the point cloud animation is ready to hide.
function showMainContent() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    // This is a much better way to handle the logic.
    loadingScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    // Remove the loading screen from the DOM after the animation is complete
    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();
        // NEW: Now, initialize the main app logic after the fade out
        initializeApp(); 
    });
}

// Start the loading screen animation immediately
// The second argument is a callback that will fire when the animation is 100% complete
initLoadingScreen('./media/logo/logo.png', () => {
    showMainContent();
});
import { initLoadingScreen } from './loader.js';

// This function will be called when the point cloud animation is ready to hide.
function showMainContent() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    loadingScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    // Remove the loading screen from the DOM after the animation is complete
    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();
    });
}

// 1. Start the loading screen animation immediately
// IMPORTANT: Replace with the correct path to your logo image file.
initLoadingScreen('./media/logo/logo.png', () => {
    // 2. This callback waits for window.onload, which ensures all assets are ready
    window.onload = () => {
        // 3. Once everything is loaded, start the fade-out process
        showMainContent();
    };
});

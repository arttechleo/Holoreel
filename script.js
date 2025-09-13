document.addEventListener('DOMContentLoaded', () => {
    // --- CACHE DOM ELEMENTS ---
    const scrollIndicator = document.querySelector('.scroll-indicator'); // NEW
    const featuresWrapper = document.querySelector('.features-wrapper');
    const textStrip = document.querySelector('.text-strip');
    const textItems = document.querySelectorAll('.text-item');
    const mediaStrip = document.querySelector('.media-strip');
    const mediaItems = document.querySelectorAll('.media-item');
    
    let currentActiveIndex = -1;

    // --- MAIN SCROLL HANDLER ---
    function handleScrollAnimation() {
        // NEW: Fade out scroll indicator arrow
        if (scrollIndicator) {
            // This fades the arrow out over the first 250px of scrolling
            scrollIndicator.style.opacity = Math.max(0, 1 - (window.scrollY / 250));
        }

        if (window.innerWidth <= 900 || !featuresWrapper) return;

        const wrapperRect = featuresWrapper.getBoundingClientRect();
        const wrapperTop = wrapperRect.top + window.scrollY;
        const wrapperHeight = featuresWrapper.offsetHeight;
        
        const progress = (window.scrollY - wrapperTop) / (wrapperHeight - window.innerHeight);

        const totalSteps = textItems.length;
        let newIndex = Math.floor(progress * totalSteps);
        
        newIndex = Math.max(0, Math.min(newIndex, totalSteps - 1));

        if (newIndex !== currentActiveIndex) {
            currentActiveIndex = newIndex;
            updateVisuals(currentActiveIndex);
        }
    }

    // --- VISUAL UPDATE FUNCTION ---
    function updateVisuals(index) {
        if (!textItems.length || !mediaItems.length) return;
        
        const textItemHeight = textItems[0].offsetHeight;
        const mediaItemHeight = mediaItems[0].offsetHeight;

        textStrip.style.transform = `translateY(${-index * textItemHeight}px)`;
        mediaStrip.style.transform = `translateY(${-index * mediaItemHeight}px)`;

        textItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    // --- MOBILE SETUP ---
    function setupMobileView() {
        if (window.innerWidth > 900) return;
        const mobileContainer = document.querySelector('.mobile-scroller');
        if (!mobileContainer || mobileContainer.children.length > 0) return;

        textItems.forEach((textItem, index) => {
            const mediaItem = mediaItems[index];
            const slide = document.createElement('div');
            slide.className = 'mobile-slide';
            slide.innerHTML = `
                <div class="mobile-media">${mediaItem.innerHTML}</div>
                <div class="mobile-text">${textItem.innerHTML}</div>
            `;
            mobileContainer.appendChild(slide);
        });
    }

    // --- INITIALIZE ---
    window.addEventListener('scroll', handleScrollAnimation);
    window.addEventListener('resize', () => {
        handleScrollAnimation();
        setupMobileView();
    });

    setupMobileView();
    handleScrollAnimation();
});
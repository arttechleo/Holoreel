import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// NEW: All your main website logic is now in a single, exportable function.
export function initializeApp() {
    // --- CACHE DOM ELEMENTS ---
    const promoVideo = document.getElementById('promo-video');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const featuresWrapper = document.querySelector('.features-wrapper');
    const textStrip = document.querySelector('.text-strip');
    const textItems = document.querySelectorAll('.text-item');
    const mediaStrip = document.querySelector('.media-strip');
    const mediaItems = document.querySelectorAll('.media-item');
    
    // --- FINALIZED: THREE.JS 3D MODEL SETUP ---
    function initThreeJS() {
        if (window.innerWidth <= 900) return; // Only run on desktop

        const canvas = document.getElementById('quest-canvas');
        if (!canvas) {
            console.error("Canvas element 'quest-canvas' not found.");
            return;
        }

        // 1. Scene Setup
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true // Transparent background
        });
        renderer.setPixelRatio(window.devicePixelRatio);

        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 3;

        // 2. Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // 3. Model Loading
        let headsetModel;
        const loader = new GLTFLoader();
        
        loader.load('./media/3D/Quest3.glb', (gltf) => {
            headsetModel = gltf.scene;
            const box = new THREE.Box3().setFromObject(headsetModel);
            const center = box.getCenter(new THREE.Vector3());
            headsetModel.position.sub(center);
            headsetModel.scale.set(5, 5, 5); 
            scene.add(headsetModel);
        }, undefined, (error) => {
            console.error('An error happened while loading the model:', error);
        });

        // 4. Mouse Tracking for Rotation
        let mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // 5. A dedicated function to handle resizing
        function onResize() {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height, false); 
            }
        }

        // 6. Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            if (headsetModel) {
                headsetModel.rotation.y += (mouse.x * 1.2 - headsetModel.rotation.y) * 0.05;
                headsetModel.rotation.x += (-mouse.y * 1.2 - headsetModel.rotation.x) * 0.05;
            }
            renderer.render(scene, camera);
        }
        
        // ✨ FIX: Initialize the size once before the loop
        onResize(); 
        // ✨ FIX: Start the animation loop
        animate(); 

        window.addEventListener('resize', onResize);
    }
    
    // --- EXISTING SCROLL & MOBILE LOGIC ---
    let currentActiveIndex = -1;

    function handleScrollAnimation() {
        const scrollY = window.scrollY;

        if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(0, 1 - (scrollY / 250));
        }

        if (promoVideo) {
            if (scrollY > window.innerHeight * 0.9) {
                promoVideo.muted = true;
            } else {
                promoVideo.muted = false;
            }
        }

        if (window.innerWidth <= 900 || !featuresWrapper) return;

        const wrapperRect = featuresWrapper.getBoundingClientRect();
        const wrapperTop = wrapperRect.top + scrollY;
        const wrapperHeight = featuresWrapper.offsetHeight;
        
        const progress = (scrollY - wrapperTop) / (wrapperHeight - window.innerHeight);

        const totalSteps = textItems.length;
        let newIndex = Math.floor(progress * totalSteps);
        
        newIndex = Math.max(0, Math.min(newIndex, totalSteps - 1));

        if (newIndex !== currentActiveIndex) {
            currentActiveIndex = newIndex;
            updateVisuals(currentActiveIndex);
        }
    }

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
    initThreeJS();
}
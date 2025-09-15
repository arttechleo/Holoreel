import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    const container = document.querySelector('.info-media');
    const permissionButton = document.getElementById('gyro-permission-btn');

    if (!canvas || !container || !permissionButton) {
        console.error('Required HTML elements not found for the mobile model.');
        return;
    }

    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Model Loading ---
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

    // --- Gyroscope Control Setup ---
    const onDeviceOrientation = (event) => {
        if (headsetModel) {
            const alphaRad = THREE.MathUtils.degToRad(event.alpha);
            const betaRad = THREE.MathUtils.degToRad(event.beta);

            headsetModel.rotation.order = 'YXZ';
            headsetModel.rotation.y = alphaRad;
            headsetModel.rotation.x = betaRad;
        }
    };

    // --- PERMISSION LOGIC ---

    // This function runs when the user clicks the permission button.
    function requestDeviceOrientation() {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    permissionButton.style.display = 'none';
                    window.addEventListener('deviceorientation', onDeviceOrientation, true);
                } else {
                    permissionButton.innerText = 'Access Denied';
                }
            })
            .catch(console.error);
    }

    // Check if we need to ask for permission (on iOS 13+).
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        
        // ✨ --- START: NEW JAVASCRIPT STYLING --- ✨
        // Apply styles directly to the button to position it below the headset.
        permissionButton.style.position = 'absolute';
        permissionButton.style.zIndex = '10'; // Ensures it's on top of the canvas
        permissionButton.style.top = '75%'; // Positions it 75% down from the top
        permissionButton.style.left = '50%'; // Moves its left edge to the center
        permissionButton.style.transform = 'translate(-50%, -50%)'; // Perfectly centers it
        // ✨ --- END: NEW JAVASCRIPT STYLING --- ✨

        // Show the button.
        permissionButton.style.display = 'block';
        
        // Wait for the user to click it.
        permissionButton.addEventListener('click', requestDeviceOrientation, { once: true });
    } else {
        // On Android and other devices, start the gyroscope automatically.
        window.addEventListener('deviceorientation', onDeviceOrientation, true);
        permissionButton.style.display = 'none';
    }


    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // --- Event Listeners and Initial Setup ---
    function onResize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        }
    }
    window.addEventListener('resize', onResize);

    onResize();
    animate();
}
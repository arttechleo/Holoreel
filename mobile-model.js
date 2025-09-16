import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export async function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    // ✨ FIX: The parent is now the new container div for reliable positioning
    const container = document.querySelector('.model-viewer-container');
    
    if (!canvas || !container) {
        console.error('Required HTML elements not found for the mobile model.');
        return;
    }

    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(ambientLight, directionalLight);

    // --- Model Loading ---
    const loader = new GLTFLoader();
    let headsetModel;

    try {
        const gltf = await loader.loadAsync('./media/3D/Quest3.glb');
        headsetModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(headsetModel);
        const center = box.getCenter(new THREE.Vector3());

        headsetModel.position.sub(center);
        headsetModel.scale.set(5, 5, 5);
        scene.add(headsetModel);

    } catch (error) {
        console.error('An error happened while loading the model:', error);
        return;
    }

    // --- Gyroscope Control Logic ---
    const onDeviceOrientation = (event) => {
        if (!headsetModel || !event.alpha) return;

        const alphaRad = THREE.MathUtils.degToRad(event.alpha);
        const betaRad = THREE.MathUtils.degToRad(event.beta);

        headsetModel.rotation.order = 'YXZ'; // Yaw, Pitch, Roll
        headsetModel.rotation.y = alphaRad;
        headsetModel.rotation.x = betaRad;
    };
    
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    // --- Permission and Event Management ---
    const setupGyroscope = (button) => {
        window.addEventListener('deviceorientation', onDeviceOrientation);
        if (button) {
            button.remove(); // Remove button after permission is granted
        }
    };
    
    // ✨ FIX: This is the correct way to handle iOS gyro permissions.
    // It checks if a permission request is needed and creates the button dynamically.
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Create the button dynamically and append it to the container
        const permissionButton = document.createElement('button');
        permissionButton.id = 'gyro-permission-btn';
        permissionButton.innerText = 'Activate Motion';
        container.appendChild(permissionButton); // Add button to our stable container

        // Apply styles directly via CSS for better management
        // (Ensure the #gyro-permission-btn rule is in your stylesheet)

        permissionButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        setupGyroscope(permissionButton);
                    } else {
                        permissionButton.innerText = 'Motion Access Denied';
                        permissionButton.disabled = true;
                    }
                })
                .catch(console.error);
        }, { once: true });
    } else {
        // For Android and other devices that don't need explicit permission
        setupGyroscope(null);
    }
    
    // --- Responsive Renderer ---
    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
    onResize(); // Set initial size
    animate(); // Start the animation loop immediately
}
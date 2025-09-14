import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    if (!canvas) {
        console.error('Canvas element "quest-canvas-mobile" not found for the mobile model.');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    // Update renderer size based on canvas dimensions
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

    // --- Gyroscope Logic for Mobile Rotation ---
    let gyroData = { beta: 0, gamma: 0 };
    const DEG2RAD = Math.PI / 180;

    function handleGyroscope(event) {
        // gamma: Left-to-right tilt in degrees
        // beta: Front-to-back tilt in degrees
        gyroData.gamma = event.gamma;
        gyroData.beta = event.beta;
    }

    // Check for iOS 13+ device orientation permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionButton = document.createElement('button');
        permissionButton.textContent = 'Allow Motion Access';
        Object.assign(permissionButton.style, {
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '999',
            padding: '12px 24px',
            fontSize: '1em',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer'
        });
        canvas.parentElement.appendChild(permissionButton);

        permissionButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleGyroscope);
                        permissionButton.remove();
                    }
                })
                .catch(console.error);
        });
    } else {
        // Non-iOS 13+ devices can just add the listener
        window.addEventListener('deviceorientation', handleGyroscope);
    }

    // --- NEW ANIMATION LOGIC ---
    // These variables control the feel of the movement
    const DAMPING_FACTOR = 0.005; // Adjust this to control how much the model moves
    const MAX_ROTATION_RADIANS = 0.2; // Maximum rotation in either direction (in radians)

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        if (headsetModel) {
            // Calculate the target rotation based on gyro data and damping
            const targetRotationY = gyroData.gamma * DEG2RAD * DAMPING_FACTOR;
            const targetRotationX = gyroData.beta * DEG2RAD * DAMPING_FACTOR;

            // Clamp the rotation values to prevent excessive movement
            const clampedY = Math.max(Math.min(targetRotationY, MAX_ROTATION_RADIANS), -MAX_ROTATION_RADIANS);
            const clampedX = Math.max(Math.min(targetRotationX, MAX_ROTATION_RADIANS), -MAX_ROTATION_RADIANS);

            // Smoothly move the model towards the clamped rotation
            headsetModel.rotation.y += (clampedY - headsetModel.rotation.y) * 0.1;
            headsetModel.rotation.x += (clampedX - headsetModel.rotation.x) * 0.1;
        }

        renderer.render(scene, camera);
    }
    
    // Initial size setup and animation start
    onResize();
    animate();
}
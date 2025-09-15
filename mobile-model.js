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

    // It's good practice to check for the permission button even if we won't use it,
    // to ensure the HTML structure is as expected.
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

    // --- Gyroscope Control Setup (New Feature) ---
    const onDeviceOrientation = (event) => {
        if (headsetModel) {
            const alphaRad = THREE.MathUtils.degToRad(event.alpha);
            const betaRad = THREE.MathUtils.degToRad(event.beta);

            headsetModel.rotation.order = 'YXZ';
            headsetModel.rotation.y = alphaRad;
            headsetModel.rotation.x = betaRad;
        }
    };

    // Check if the DeviceOrientationEvent.requestPermission API is available (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Automatically request permission without a button click.
        // This will trigger the native iOS permission prompt.
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    // Permission granted, start listening for device orientation changes.
                    window.addEventListener('deviceorientation', onDeviceOrientation, true);
                    // Hide the button since it is no longer needed.
                    permissionButton.style.display = 'none';
                } else {
                    console.log('Motion permission denied.');
                    // You could optionally show a message to the user here.
                    permissionButton.style.display = 'none';
                }
            })
            .catch(console.error);
    } else {
        // For Android and other devices, permission is not required.
        // The event listener can be added directly.
        window.addEventListener('deviceorientation', onDeviceOrientation, true);
        // Ensure the button is hidden on these devices as well.
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
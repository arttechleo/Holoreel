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

    // --- Scene, Camera, and Renderer Setup (rest of your code is fine here) ---
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

    // --- Lighting (no changes needed) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Model Loading (no changes needed) ---
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

    // --- Gyroscope Control Setup (updated) ---
    const isIOS13 = typeof DeviceOrientationEvent.requestPermission === 'function';
    let isMotionGranted = false;

    const onDeviceOrientation = (event) => {
        if (headsetModel) {
            const alphaRad = THREE.MathUtils.degToRad(event.alpha);
            const betaRad = THREE.MathUtils.degToRad(event.beta);

            headsetModel.rotation.order = 'YXZ';
            headsetModel.rotation.y = alphaRad;
            headsetModel.rotation.x = betaRad;
        }
    };

    if (isIOS13) {
        permissionButton.style.display = 'block'; // Show the button for iOS users
        permissionButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        isMotionGranted = true;
                        window.addEventListener('deviceorientation', onDeviceOrientation, true);
                        permissionButton.style.display = 'none'; // Hide the button after permission is granted
                    } else {
                        console.log('Motion permission denied.');
                    }
                })
                .catch(console.error);
        });
    } else {
        // For non-iOS devices, permission is not required
        isMotionGranted = true;
        window.addEventListener('deviceorientation', onDeviceOrientation, true);
    }

    // --- Animation Loop (no changes needed) ---
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // --- Event Listeners and Initial Setup (no changes needed) ---
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
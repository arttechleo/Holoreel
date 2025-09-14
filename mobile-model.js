import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DeviceOrientationControls } from 'three/addons/controls/DeviceOrientationControls.js';

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
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

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

    // --- Gyroscope Control Setup ---
    // Use the official Three.js DeviceOrientationControls for reliable gyroscope tracking
    const controls = new DeviceOrientationControls(camera);

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
                        controls.connect(); // Connect controls only after permission is granted
                        permissionButton.remove();
                    }
                })
                .catch(console.error);
        });
    } else {
        // Non-iOS 13+ devices can just connect the controls directly
        controls.connect();
    }

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Update the controls. This handles the gyroscope-based camera rotation.
        controls.update();

        // Render the scene
        renderer.render(scene, camera);
    }

    // Initial size setup and animation start
    onResize();
    animate();
}
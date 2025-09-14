import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    const container = document.querySelector('.info-media'); // Select the container for the button

    if (!canvas || !container) {
        console.error('Canvas or container element not found for the mobile model.');
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
    const isIOS13 = typeof DeviceOrientationEvent.requestPermission === 'function';
    let isMotionGranted = false;

    // Create a user-facing button to prompt for motion access
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'Enable Motion View';
    Object.assign(permissionButton.style, {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '10',
        padding: '12px 24px',
        fontSize: '1em',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        display: 'none' // Initially hidden
    });
    container.appendChild(permissionButton);

    const onDeviceOrientation = (event) => {
        if (headsetModel) {
            // Use alpha and beta for rotation
            const alphaRad = THREE.MathUtils.degToRad(event.alpha);
            const betaRad = THREE.MathUtils.degToRad(event.beta);

            // Apply rotation directly to the model
            headsetModel.rotation.order = 'YXZ'; // Important for correct rotation
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
                        permissionButton.remove();
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

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        // We no longer need controls.update() as we handle rotation manually
        // if (isMotionGranted) {
        //     // The event listener handles the rotation, so nothing to do here
        // }

        // Render the scene
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

    onResize(); // Set initial size
    animate(); // Start the animation loop
}
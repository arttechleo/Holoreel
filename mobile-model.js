import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export async function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    const container = document.querySelector('.info-media');
    
    if (!canvas || !container) {
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

    // ⭐️ FIX: Move the animate function to the top-level scope
    // so it's defined before setupGyroscope calls it.
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    // --- Gyroscope Control Logic ---
    const onDeviceOrientation = (event) => {
        if (!headsetModel) return;

        const alphaRad = THREE.MathUtils.degToRad(event.alpha);
        const betaRad = THREE.MathUtils.degToRad(event.beta);

        headsetModel.rotation.order = 'YXZ';
        headsetModel.rotation.y = alphaRad;
        headsetModel.rotation.x = betaRad;
    };

    // --- Permission and Event Management ---
    const setupGyroscope = (button) => {
        window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
        if (button) {
            button.remove();
        }
        animate(); // This now works because `animate` is already defined
    };

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionButton = document.createElement('button');
        permissionButton.id = 'gyro-permission-btn';
        permissionButton.innerText = 'Allow Motion Access';

        Object.assign(permissionButton.style, {
            position: 'absolute',
            zIndex: '10',
            top: '65%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        });
        
        container.appendChild(permissionButton);

        permissionButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        setupGyroscope(permissionButton);
                    } else {
                        permissionButton.innerText = 'Access Denied';
                    }
                })
                .catch(console.error);
        }, { once: true });

    } else {
        setupGyroscope(null);
    }

    // --- Event Listeners ---
    const onResize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        }
    };

    window.addEventListener('resize', onResize);
    onResize();
}
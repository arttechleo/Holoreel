import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export function initMobileModel() {
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
    
    // Create the full-screen modal prompt
    function createPermissionModal() {
        const modal = document.createElement('div');
        modal.id = 'gyro-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });

        const text = document.createElement('p');
        text.textContent = 'For the full interactive experience, please allow motion access.';
        Object.assign(text.style, {
            fontSize: '1.2em',
            textAlign: 'center',
            maxWidth: '80%',
            marginBottom: '20px'
        });

        const button = document.createElement('button');
        button.textContent = 'Allow Motion Access';
        Object.assign(button.style, {
            padding: '12px 24px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid white',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            transition: 'background 0.3s ease'
        });
        button.addEventListener('mouseover', () => { button.style.background = 'rgba(255, 255, 255, 0.3)'; });
        button.addEventListener('mouseout', () => { button.style.background = 'rgba(255, 255, 255, 0.1)'; });

        modal.appendChild(text);
        modal.appendChild(button);
        document.body.appendChild(modal);

        return { modal, button };
    }

    // --- Main Initialization Logic ---
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const { modal, button } = createPermissionModal();

        button.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', onDeviceOrientation, true);
                        modal.remove(); // Remove the modal after permission is granted
                    } else {
                        console.log('Motion permission denied.');
                        modal.remove(); // Also remove the modal if permission is denied
                    }
                })
                .catch(console.error);
        });
    } else {
        // For Android and other devices, permission is not required.
        window.addEventListener('deviceorientation', onDeviceOrientation, true);
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
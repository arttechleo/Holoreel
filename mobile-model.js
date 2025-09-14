import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

<<<<<<< HEAD
export function initMobileModel() {
    // Change this line to target the new canvas ID
    const canvas = document.getElementById('quest-canvas-mobile'); 
    if (!canvas) {
        console.error('Canvas element "quest-canvas-mobile" not found for the mobile model.');
=======
/**
 * Initializes and controls the 3D Quest model using the device's gyroscope.
 * This function is designed to be called specifically on mobile devices.
 */
export function initMobileModel() {
    const canvas = document.getElementById('quest-canvas');
    if (!canvas) {
        console.error('Canvas element not found for the mobile model.');
>>>>>>> main
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

<<<<<<< HEAD
=======
    // Update renderer size based on canvas dimensions
>>>>>>> main
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

<<<<<<< HEAD
=======
    // --- Lighting ---
>>>>>>> main
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

<<<<<<< HEAD
=======
    // --- Model Loading ---
>>>>>>> main
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

<<<<<<< HEAD
=======
    // --- Gyroscope Logic for Mobile Rotation ---
>>>>>>> main
    let gyroData = { beta: 0, gamma: 0 };
    const DEG2RAD = Math.PI / 180;

    function handleGyroscope(event) {
<<<<<<< HEAD
=======
        // gamma: Left-to-right tilt in degrees
        // beta: Front-to-back tilt in degrees
>>>>>>> main
        gyroData.gamma = event.gamma;
        gyroData.beta = event.beta;
    }

<<<<<<< HEAD
=======
    // Check for iOS 13+ device orientation permission
>>>>>>> main
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionButton = document.createElement('button');
        permissionButton.textContent = 'Allow Motion Access';
        Object.assign(permissionButton.style, {
<<<<<<< HEAD
            position: 'absolute', // Changed to absolute to position within info-media or body
=======
            position: 'fixed',
>>>>>>> main
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
<<<<<<< HEAD
        // Append to the parent of the canvas, or a specific container
        canvas.parentElement.appendChild(permissionButton);
=======
        document.body.appendChild(permissionButton);
>>>>>>> main

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
<<<<<<< HEAD
        window.addEventListener('deviceorientation', handleGyroscope);
    }

=======
        // Non-iOS 13+ devices can just add the listener
        window.addEventListener('deviceorientation', handleGyroscope);
    }

    // --- Animation Loop ---
>>>>>>> main
    function animate() {
        requestAnimationFrame(animate);

        if (headsetModel) {
<<<<<<< HEAD
=======
            // Smoothly interpolate the model's rotation
>>>>>>> main
            const targetRotationY = gyroData.gamma * DEG2RAD;
            const targetRotationX = gyroData.beta * DEG2RAD;
            
            headsetModel.rotation.y += (targetRotationY - headsetModel.rotation.y) * 0.1;
            headsetModel.rotation.x += (targetRotationX - headsetModel.rotation.x) * 0.1;
        }

        renderer.render(scene, camera);
    }
    
<<<<<<< HEAD
=======
    // Initial size setup and animation start
>>>>>>> main
    onResize();
    animate();
}
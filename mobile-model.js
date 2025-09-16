import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initMobileModel() {
    const canvas = document.getElementById('quest-canvas-mobile');
    const container = document.querySelector('.model-viewer-container');
    
    if (!canvas || !container) {
        console.error('Mobile model elements not found.');
        return;
    }

    // This CSS property ensures the canvas occupies the single grid cell.
    canvas.style.gridArea = '1 / 1';
    canvas.style.position = 'relative'; // Use relative to stay within the grid
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio is 1 since container is 1/1
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    // --- Lighting & Model ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directionalLight = new THREE.DirectionLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    let headsetModel;
    try {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('./media/3D/Quest3.glb');
        headsetModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(headsetModel);
        const center = box.getCenter(new THREE.Vector3());
        headsetModel.position.sub(center);
        headsetModel.scale.set(5, 5, 5);
        scene.add(headsetModel);
    } catch (error) {
        console.error('Error loading model:', error);
        return;
    }

    // --- Gyroscope Logic ---
    const onDeviceOrientation = (event) => {
        if (!headsetModel || !event.alpha) return;
        const alphaRad = THREE.MathUtils.degToRad(event.alpha);
        const betaRad = THREE.MathUtils.degToRad(event.beta);
        headsetModel.rotation.order = 'YXZ';
        headsetModel.rotation.y = alphaRad;
        headsetModel.rotation.x = betaRad;
    };
    
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    // --- Permission Button ---
    const setupGyroscope = (button) => {
        window.addEventListener('deviceorientation', onDeviceOrientation);
        if (button) button.remove();
    };
    
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionButton = document.createElement('button');
        permissionButton.id = 'gyro-permission-btn';
        permissionButton.innerText = 'Activate Motion';
        
        // CSS for the button created in JS
        Object.assign(permissionButton.style, {
            gridArea: '1 / 1',
            alignSelf: 'end',
            marginBottom: '15%',
            zIndex: '10',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
        });
        
        container.appendChild(permissionButton);

        permissionButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission().then(state => {
                if (state === 'granted') {
                    setupGyroscope(permissionButton);
                } else {
                    permissionButton.innerText = 'Access Denied';
                    permissionButton.disabled = true;
                }
            }).catch(console.error);
        }, { once: true });
    } else {
        setupGyroscope(null);
    }
    
    // --- Responsive Renderer ---
    const onResize = () => {
        const size = container.clientWidth;
        if (size > 0) {
            camera.aspect = 1;
            camera.updateProjectionMatrix();
            renderer.setSize(size, size);
        }
    };

    window.addEventListener('resize', onResize);
    onResize();
    animate();
}
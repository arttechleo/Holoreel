import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initMobileModel() {
    const canvas = document.getElementById('quest-canvas');
    if (!canvas) {
        console.error('Canvas element not found for the mobile model.');
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

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

    let gyroData = { beta: 0, gamma: 0 };
    const DEG2RAD = Math.PI / 180;

    function handleGyroscope(event) {
        gyroData.gamma = event.gamma;
        gyroData.beta = event.beta;
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionButton = document.createElement('button');
        permissionButton.textContent = 'Allow Motion Access';
        Object.assign(permissionButton.style, {
            position: 'fixed',
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
        document.body.appendChild(permissionButton);

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
        window.addEventListener('deviceorientation', handleGyroscope);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (headsetModel) {
            const targetRotationY = gyroData.gamma * DEG2RAD;
            const targetRotationX = gyroData.beta * DEG2RAD;
            
            headsetModel.rotation.y += (targetRotationY - headsetModel.rotation.y) * 0.1;
            headsetModel.rotation.x += (targetRotationX - headsetModel.rotation.x) * 0.1;
        }

        renderer.render(scene, camera);
    }
    
    onResize();
    animate();
}
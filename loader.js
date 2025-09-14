import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Initializes and controls the entire loading screen animation.
 * @param {string} logoPath - The path to the logo image.
 * @param {function} onAnimationComplete - Callback to fire when the animation is finished.
 */
export function initLoadingScreen(logoPath, onAnimationComplete) {
    const container = document.getElementById('loading-screen');
    if (!container) return;

    // --- 1. Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    let points;
    const loader = new THREE.TextureLoader();
    let animationId;
    let startTime = null;

    // --- 2. Image Processing and Point Cloud Generation ---
    loader.load(logoPath, (texture) => {
        const image = texture.image;
        const imageWidth = image.width;
        const imageHeight = image.height;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        tempCtx.drawImage(image, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight).data;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const startPositions = [];
        const randomValues = [];

        for (let y = 0; y < imageHeight; y++) {
            for (let x = 0; x < imageWidth; x++) {
                const index = (y * imageWidth + x) * 4;
                const alpha = imageData[index + 3];

                if (alpha > 50) {
                    positions.push((x - imageWidth / 2) * 0.05, -(y - imageHeight / 2) * 0.05, 0);
                    const r = 10;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    startPositions.push(
                        r * Math.sin(phi) * Math.cos(theta),
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi)
                    );
                    randomValues.push(Math.random(), Math.random(), Math.random());
                }
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aStartPosition', new THREE.Float32BufferAttribute(startPositions, 3));
        geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randomValues, 3));

        // --- 3. Custom Shader Material ---
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uProgress: { value: 0 },
                uPointSize: { value: 1.5 * window.devicePixelRatio },
            },
            vertexShader: `
                attribute vec3 aStartPosition;
                attribute vec3 aRandom;
                uniform float uProgress;
                uniform float uPointSize;
                void main() {
                    vec3 finalPosition = mix(aStartPosition, position, uProgress);
                    finalPosition.x += sin(uProgress * aRandom.x * 20.0) * (1.0 - uProgress) * 0.1;
                    finalPosition.y += cos(uProgress * aRandom.y * 20.0) * (1.0 - uProgress) * 0.1;
                    vec4 modelPosition = modelMatrix * vec4(finalPosition, 1.0);
                    gl_Position = projectionMatrix * viewMatrix * modelPosition;
                    gl_PointSize = uPointSize;
                }
            `,
            fragmentShader: `
                void main() {
                    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);
        
        // This is the CRUCIAL change.
        // We now start the animation loop ONLY after the points object has been created.
        requestAnimationFrame(animateProgress);
    });

    // --- 4. Animation and Cleanup ---
    function animateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1.0, elapsed / 1200); // 1200ms duration

        // Make sure points is defined before trying to access its uniforms.
        if (points) {
            points.material.uniforms.uProgress.value = progress;
        }

        renderer.render(scene, camera);

        if (progress < 1.0) {
            animationId = requestAnimationFrame(animateProgress);
        } else {
            onAnimationComplete();
        }
    }
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
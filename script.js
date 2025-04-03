import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/loaders/FBXLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);  // Adjusted camera position
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

// FBX Loader
const loader = new FBXLoader();

loader.load('./assets/environment.fbx', function (object) {
    object.scale.set(0.1, 0.1, 0.1);
    scene.add(object);
});

// Load 8 Interactable Models
const interactableObjects = [];
const modelPaths = [
    'object1.fbx', 'object2.fbx', 'object3.fbx', 'object4.fbx',
    'object5.fbx', 'object6.fbx', 'object7.fbx', 'object8.fbx'
];

modelPaths.forEach((model, index) => {
    loader.load(`./assets/${model}`, function (object) {
        object.position.set(index - 4, 0, 0); // Spread out objects
        object.scale.set(0.1, 0.1, 0.1);
        object.userData.interactable = true;
        scene.add(object);
        interactableObjects.push(object);
    });
});

// Raycaster for Interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log("Clicked on:", clickedObject);

        // Example Interaction: Rotate on Click
        clickedObject.rotation.y += Math.PI / 4;
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

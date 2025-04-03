import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js"; // Import the RGBELoader
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js"; // Import OrbitControls

// Scene setup
const scene = new THREE.Scene();

// Set up the orthographic camera with Blender's settings
const aspect = window.innerWidth / window.innerHeight;
const orthoSize = 10; // Adjust if needed

const camera = new THREE.OrthographicCamera(
  (-orthoSize * aspect) / 2, // left
  (orthoSize * aspect) / 2,  // right
  orthoSize / 2,             // top
  -orthoSize / 2,            // bottom
  0.1,                       // near (clip start)
  100                        // far (clip end)
);

// Adjust camera position to center the scene
camera.position.set(0, 11, 50);
camera.lookAt(0, 0, 0); // Ensures the camera is looking at the center

// Apply Blender's shift settings
camera.updateProjectionMatrix();

// Ensure correct aspect ratio on resize
window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (-orthoSize * aspect) / 2;
  camera.right = (orthoSize * aspect) / 2;
  camera.top = orthoSize / 2;
  camera.bottom = -orthoSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.physicallyCorrectLights = true; // Physically-based lighting (like Cycles)
document.body.appendChild(renderer.domElement);

const loader = new FBXLoader();
const models = [];

function loadModel(i) {
  loader.load(
    `./assets/${i}.fbx`,
    (fbx) => {
      fbx.scale.set(0.015, 0.015, 0.015); // Smaller model size
      fbx.rotation.set(0, -0.5, 0); // Small rotation for alignment
      fbx.position.set(0.8, -3, 0); // Small rotation for alignment

      // Ensure materials are matte (no shininess) and apply softening and alpha transparency
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            if (Array.isArray(child.material)) {
              // If multiple materials, loop through each
              child.material.forEach((mat) => {
                mat.metalness = 0;
                mat.roughness = 1;
                mat.emissiveIntensity = 0; // Set emission to 0
                mat.shading = THREE.SmoothShading; // Smooth shading
              });
            } else {
              // Single material
              child.material.metalness = 0;
              child.material.roughness = 1;
              child.material.specular = new THREE.Color(0x000000); // Set specular to 0
              child.material.emissiveIntensity = 0; // Set emission to 0
              child.material.shading = THREE.SmoothShading; // Smooth shading
            }
          }
        }
      });

      scene.add(fbx);
      models.push(fbx);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (error) => console.error(error)
  );
}

// Load all models (adjust the range as needed)
for (let i = 1; i <= 13; i++) {
  loadModel(i);
}

// Lighting Setup (Mimicking Cycles)
const ambientLight = new THREE.AmbientLight(0xffffff, 5); // Subtle ambient light
scene.add(ambientLight);

// Key Light (Main directional light like Cycles' Sun Lamp)
const keyLight = new THREE.DirectionalLight(0xffffff, 8);

keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.005; // Fixes shadow acne
scene.add(keyLight);

// Fill Light (Softer, cooler light to reduce shadows)
const fillLight = new THREE.DirectionalLight(0x87CEFA100 ); // Soft blue light
fillLight.position.set(-100, 100, 100);
scene.add(fillLight);


// Set up OrbitControls to rotate camera on the Y-axis only
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Disable zoom
controls.enablePan = false;  // Disable pan
controls.maxPolarAngle = Math.PI / 2.32; // Limit vertical rotation to horizontal plane
controls.minPolarAngle = Math.PI / 2.32; // Limit vertical rotation to horizontal plane

// Limit horizontal rotation (azimuth angle) by setting maximum and minimum values
controls.maxAzimuthAngle = Math.PI / 5;  // Limit maximum rotation to 45 degrees
controls.minAzimuthAngle = -Math.PI / 8; // Limit minimum rotation to -45 degrees

// Add smoothing for the rotation
controls.enableDamping = true;   // Enable damping (smooths out movement)
controls.dampingFactor = 0.1;   // How much to smooth the movement (between 0 and 1)
controls.rotateSpeed = 0.2;      // How fast the orbiting should be (lower is slower)

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls for damping to work
  renderer.render(scene, camera);
}

animate();


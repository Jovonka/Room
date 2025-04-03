import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { TextureLoader } from "https://cdn.skypack.dev/three@0.129.0/src/loaders/TextureLoader.js"; 

// Scene setup
const scene = new THREE.Scene();

// Set up the orthographic camera
const aspect = window.innerWidth / window.innerHeight;
const orthoSize = 10; 

const camera = new THREE.OrthographicCamera(
  (-orthoSize * aspect) / 2,  
  (orthoSize * aspect) / 2,  
  orthoSize / 2,              
  -orthoSize / 2,             
  0.1,                       
  100                        
);

camera.position.set(0, 11, 50);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

// Handle window resize
window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (-orthoSize * aspect) / 2;
  camera.right = (orthoSize * aspect) / 2;
  camera.top = orthoSize / 2;
  camera.bottom = -orthoSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Renderer setup
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// Loading assets
const loader = new FBXLoader();
const textureLoader = new TextureLoader();
const models = [];
// Array of video file paths
const videoFiles = [
  './videos/video1.mp4',
  './videos/video2.mp4',
  './videos/video3.mp4'
  // Add more video paths here
];

// Randomly select a video file on each refresh
const selectedVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];
// Create a video element and set the selected video source
const video = document.createElement('video');
video.src = selectedVideo;
video.loop = true;
video.muted = true; // Mute video to prevent sound issues
video.play();

// Create the video texture from the video element
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

// Load all models
function loadModel(i) {
  loader.load(
    `./assets/${i}.fbx`,
    (fbx) => {
      fbx.scale.set(0.013, 0.013, 0.013);
      fbx.rotation.set(0, -0.5, 0);
      fbx.position.set(0.8, -3, 0);

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.side = THREE.DoubleSide; // Enable double-sided rendering

          // Use MeshStandardMaterial for better quality
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          }

          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.metalness = 0;
              mat.roughness = 1;
              mat.emissiveIntensity = 0;
              mat.side = THREE.DoubleSide;
              // Enable subsurface scattering
              mat.subsurface = 10; // Subsurface scattering intensity
              mat.subsurfaceColor = new THREE.Color( 0xffffff ); // Subsurface color (for skin or wax-like materials)
            });
          } else {
            child.material.metalness = 0;
            child.material.roughness = 1;
            child.material.specular = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
            // Enable subsurface scattering
            child.material.subsurface = 10; // Subsurface scattering intensity
            child.material.subsurfaceColor = new THREE.Color(0xFFAAAA); // Subsurface color
          }
 // Enable UV mapping for better texture handling
 if (i === 13 || i === 14) {
  // Apply video texture only to 13.fbx and 14.fbx
  child.material.map = videoTexture;

  // Ensure correct UV mapping
  child.material.map.encoding = THREE.sRGBEncoding;
  child.material.map.wrapS = THREE.RepeatWrapping;
  child.material.map.wrapT = THREE.RepeatWrapping;
  child.material.map.repeat.set(1, 1); // Adjust repetition of the texture if needed
} 


          // Add Ambient Occlusion to all models
          child.material.aoMap = child.geometry.uvs; // Apply ambient occlusion map

          // Load textures for better quality
          const texture = textureLoader.load(`./textures/${i}.png`, (tex) => {
            tex.minFilter = THREE.LinearMipMapLinearFilter; // Enable mipmaps
            tex.magFilter = THREE.LinearFilter; // Better texture quality
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Increase sharpness
          });

          // Assign texture to all models
          child.material.map = texture;

          // Special case for 7.fbx (Image Mesh)
          if (i === 7) {
            const texture = textureLoader.load('./textures/ME.png', (tex) => {
              tex.minFilter = THREE.LinearMipMapLinearFilter; // Enable mipmaps
              tex.magFilter = THREE.LinearFilter; // Better texture quality
              tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Increase sharpness
            });

            child.material = new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              roughness: 10,
              metalness: 0.4,
            });

            // Adjust position if needed
            fbx.position.set(0.5, -3, 0.4); 
            fbx.scale.set(0.013, 0.013, 0.013); // Slightly increase scale for visibility
          }

          // Special case for model 11: Apply dark blue desaturated color
          if (i === 11) {
            child.material.color.set(0x2C3E50); // Dark Blue (Desaturated color)
            child.material.emissive.set(0x1A2530); // Slightly darker emissive color to enhance the desaturated look
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

// Load models from 1 to 13
for (let i = 1; i <= 13; i++) {
  loadModel(i);
}

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff1, 6);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfffff10, 7);
keyLight.position.set(1, 1, -3.9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 4096;
keyLight.shadow.mapSize.height = 4096;
keyLight.shadow.bias = -0.005;
scene.add(keyLight);



// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.32;
controls.minPolarAngle = Math.PI / 2.32;
controls.maxAzimuthAngle = Math.PI / 5;
controls.minAzimuthAngle = -Math.PI / 8;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.2;


// Handle mouse inactivity
let mouseTimer;
const mouseInactivityDelay = 3000; // 1 second for inactivity

document.addEventListener("mousemove", () => {
  controls.autoRotate = false;  // Stop auto-rotation when the mouse moves
  clearTimeout(mouseTimer);  // Clear any existing timer
  mouseTimer = setTimeout(() => {
    controls.autoRotate = true;  // Start auto-rotation after inactivity
  }, mouseInactivityDelay);  // Wait for 1 second of inactivity
});
// Variable to toggle auto-rotation direction
let rotateDirection = 1;

// Enable auto-rotation
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1; // Set the initial speed

// Timer for auto-rotation direction change (every 3 seconds)
let lastDirectionChangeTime = 0;
const directionChangeInterval = 9000; // Time interval to change direction in ms

// Animation loop
function animate(timestamp) {
  requestAnimationFrame(animate);

  // Rotate the keyLight around the origin (0, 0, 0)
  const angle = timestamp * 0.0001; // Control the speed of rotation
  keyLight.position.x = Math.sin(angle) * 1;
  
  keyLight.position.y = 5; // Keep keyLight height constant
  
  // Alternate the rotation direction every `directionChangeInterval` milliseconds
  if (timestamp - lastDirectionChangeTime >= directionChangeInterval) {
    rotateDirection = -rotateDirection; // Flip the direction
    controls.autoRotateSpeed = rotateDirection * 0.1;
    lastDirectionChangeTime = timestamp; // Reset the timer
  }
  // Update video texture
  videoTexture.needsUpdate = true;


  controls.update();
  renderer.render(scene, camera);
}

animate();

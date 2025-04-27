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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// Loading assets
const loader = new FBXLoader();
const textureLoader = new TextureLoader();
const models = [];

// PNG frame setup for animation
const numFrames = 35; // Number of PNG frames in your animation
const frameTextures = [];
let currentFrame = 0;
let textureUpdateTime = 0;
const frameDuration = 300; // Time per frame in ms (adjust for animation speed)



for (let i = 0; i < numFrames; i++) {
  const texture = textureLoader.load(`./textures/ME-${i + 1}.png`); // No padding required
  frameTextures.push(texture);
}



// Gradient Shader Material (if needed for other objects)
const gradientMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
  varying vec2 vUv;
  uniform float time;
  void main() {
    float gradient = 0.5 + 0.5 * sin(time + vUv.y * 1.0);
    vec3 color1 = vec3(0.8, 0.8, 0.7);
    vec3 color2 = vec3(1.0, 1.0, 1.0);
    vec3 mixedColor = mix(color1, color2, gradient);
    gl_FragColor = vec4(mixedColor, 4.0);
  }
`,
});
let model7Meshes = [];
// Loading the model
function loadModel(i) {
  loader.load(
    `./assets/${i}.fbx`,
    (fbx) => {
      fbx.scale.set(0.014, 0.014, 0.014);
      fbx.rotation.set(0, -0.7, 0);
      fbx.position.set(0.8, -3, 0);

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.side = THREE.DoubleSide; 

          // Apply gradient material to 13.fbx and 14.fbx
          if (i === 13 || i === 14) {
            child.material = gradientMaterial;
          }

         // Special case for model 7: frame-by-frame animation
// Special case for model 7: frame-by-frame animation
if (i === 7) {
  const material = new THREE.MeshStandardMaterial({
    map: frameTextures[0], // Initially set the first frame
    transparent: true,
    color: new THREE.Color(0.5, 0.5, 0.6), // Darken the texture by reducing the color intensity (0.5 makes it darker)
    });
  fbx.scale.set(0.023, 0.015, 0.019);
  fbx.position.set(1, -3.1, 1.2);
  model7Meshes.push(child);  // Track mesh for later updates
  child.material = material;  // Apply the material to the model
}



          // Special case for model 11: Dark blue desaturated color
          if (i === 11) {
            child.material.color.set(0x2C3E50);
            child.material.emissive.set(0x1A2530);
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

// Load models 1 to 14
for (let i = 1; i <= 14; i++) {
  loadModel(i);
}

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff1,7);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfffff10,5);
keyLight.position.set(1, 2, -1);
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
controls.maxAzimuthAngle = Math.PI / 7;
controls.minAzimuthAngle = -Math.PI / 5;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.2;

// Handle mouse inactivity
let mouseTimer;
const mouseInactivityDelay = 3000; 

document.addEventListener("mousemove", () => {
  controls.autoRotate = false;
  clearTimeout(mouseTimer);
  mouseTimer = setTimeout(() => {
    controls.autoRotate = true;
  }, mouseInactivityDelay);
});

// Auto-rotation toggle
let rotateDirection = 1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;

let lastDirectionChangeTime = 0;
const directionChangeInterval = 9000;

// Inside the animation loop, add this code to make model 7 face the camera
function animate(timestamp) {
  requestAnimationFrame(animate);

  // Rotate the keyLight smoothly
  const angle = timestamp * 0.0001; // Adjust speed of rotation here
  keyLight.position.x = Math.sin(angle) * -4;  // 10 is the radius of rotation on the X-axis
  keyLight.position.y = 10;  // Keep light at a fixed height

  if (timestamp - lastDirectionChangeTime >= directionChangeInterval) {
    rotateDirection = -rotateDirection;
    controls.autoRotateSpeed = rotateDirection * 0.09;
    lastDirectionChangeTime = timestamp;
  }

  // Update texture for frame-by-frame animation (only for model 7)
  if (timestamp - textureUpdateTime >= frameDuration) {
    currentFrame = (currentFrame + 1) % numFrames; // Loop through frames
    model7Meshes.forEach((mesh) => {
      mesh.material.map = frameTextures[currentFrame]; // Update texture to the next frame
      mesh.material.needsUpdate = true;  // Make sure the material is updated
    });
    textureUpdateTime = timestamp;
  }

  // Update gradient animation
  gradientMaterial.uniforms.time.value = timestamp * 0.002;

  // Make model 7 always face the camera
  model7Meshes.forEach((mesh) => {
    mesh.lookAt(camera.position);  // This will make the mesh face the camera
  });

  controls.update();
  renderer.render(scene, camera);
}


animate();


import './style.css';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';
import vertexShader from './shaders/vertex.glsl';
import { Text } from 'troika-three-text';
import textVertex from './shaders/textVertex.glsl';
import gsap from 'gsap/all';

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);

const blobs = [
  {
    name: 'Color Fusion',
    background: '#9D73F7',
    config: { "uPositionFrequency": 1, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.5, "uSmallWavePositionStrength": 0.7, "roughness": 1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cosmic-fusion" },
  },
  {
    name: 'Purple Mirror',
    background: '#5300B1',
    config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "purple-rain" },
  },
  {
    name: 'Alien Goo',
    background: '#45ACD8',
    config: { "uPositionFrequency": 1.022, "uPositionStrength": 0.99, "uSmallWavePositionFrequency": 0.378, "uSmallWavePositionStrength": 0.341, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "lucky-day" },
  },
  {
    name: 'Neon Dreams',
    background: '#FF3CAC',
    config: { "uPositionFrequency": 0.8, "uPositionStrength": 0.4, "uSmallWavePositionFrequency": 0.6, "uSmallWavePositionStrength": 0.5, "roughness": 0.1, "metalness": 0.9, "envMapIntensity": 1.5, "clearcoat": 0.5, "clearcoatRoughness": 0.2, "transmission": 0, "flatShading": false, "wireframe": false, "map": "passion" },
  },
  {
    name: 'Ocean Breeze',
    background: '#0093E9',
    config: { "uPositionFrequency": 1.2, "uPositionStrength": 0.35, "uSmallWavePositionFrequency": 0.7, "uSmallWavePositionStrength": 0.4, "roughness": 0.4, "metalness": 0.6, "envMapIntensity": 1.2, "clearcoat": 0.8, "clearcoatRoughness": 0.1, "transmission": 0.2, "flatShading": false, "wireframe": false, "map": "sirens" },
  },
  {
    name: 'Sunset Vibes',
    background: '#FF8C42',
    config: { "uPositionFrequency": 0.9, "uPositionStrength": 0.45, "uSmallWavePositionFrequency": 0.8, "uSmallWavePositionStrength": 0.6, "roughness": 0.3, "metalness": 0.7, "envMapIntensity": 1.8, "clearcoat": 0.6, "clearcoatRoughness": 0.15, "transmission": 0.1, "flatShading": false, "wireframe": false, "map": "synthwave" },
  },
  {
    name: 'Electric Forest',
    background: '#00F260',
    config: { "uPositionFrequency": 1.1, "uPositionStrength": 0.5, "uSmallWavePositionFrequency": 0.9, "uSmallWavePositionStrength": 0.8, "roughness": 0.2, "metalness": 0.8, "envMapIntensity": 1.6, "clearcoat": 0.7, "clearcoatRoughness": 0.1, "transmission": 0.15, "flatShading": false, "wireframe": false, "map": "electric-forest" },
  },
  {
    name: 'Cosmic Wave',
    background: '#8E2DE2',
    config: { "uPositionFrequency": 0.7, "uPositionStrength": 0.6, "uSmallWavePositionFrequency": 1.0, "uSmallWavePositionStrength": 0.9, "roughness": 0.15, "metalness": 0.85, "envMapIntensity": 1.7, "clearcoat": 0.9, "clearcoatRoughness": 0.05, "transmission": 0.25, "flatShading": false, "wireframe": false, "map": "cosmic-wave" }
  }
]

let isAnimating = false;
let currentIndex = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#333');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas')
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const uniforms = {
  uTime: { value: 0 },
  uPositionFrequency: { value: blobs[currentIndex].config.uPositionFrequency },
  uPositionStrength: { value: blobs[currentIndex].config.uPositionStrength },
  uTimeFrequency: { value: .3 },
  uSmallWavePositionFrequency: { value: blobs[currentIndex].config.uSmallWavePositionFrequency },
  uSmallWavePositionStrength: { value: blobs[currentIndex].config.uSmallWavePositionStrength },
  uSmallWaveTimeFrequency: { value: .3 },
};

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader,
  map: textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`),
  metalness: blobs[currentIndex].config.metalness,
  roughness: blobs[currentIndex].config.roughness,
  envMapIntensity: blobs[currentIndex].config.envMapIntensity,
  clearcoat: blobs[currentIndex].config.clearcoat,
  clearcoatRoughness: blobs[currentIndex].config.clearcoatRoughness,
  transmission: blobs[currentIndex].config.transmission,
  flatShading: blobs[currentIndex].config.flatShading,
  wireframe: blobs[currentIndex].config.wireframe,
  uniforms,
});

const mergedGeometry = mergeVertices(new THREE.IcosahedronGeometry(1, 70));
mergedGeometry.computeTangents();

const sphere = new THREE.Mesh(mergedGeometry, material);
scene.add(sphere);

camera.position.z = 3;

rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const textMaterial = new THREE.ShaderMaterial({
  fragmentShader: `void main() { gl_FragColor = vec4(1.0); }`,
  vertexShader: textVertex,
  side: THREE.DoubleSide,
  uniforms: {
    progress: { value: 0.0 },
    direction: { value: 1 },
  }
});

const texts = blobs.map((blob, index) => {
  const myText = new Text();
  myText.text = blob.name;
  myText.font = `./aften_screen.woff`;
  myText.anchorX = 'center';
  myText.anchorY = 'middle';
  myText.material = textMaterial;
  myText.position.set(0, 0, 2);
  if (index !== 0) myText.scale.set(0, 0, 0);
  myText.letterSpacing = -0.08;
  myText.fontSize = window.innerWidth / 3500; // Made font size much bigger
  myText.glyphGeometryDetail = 32; // Increased detail for larger text
  myText.sync();
  scene.add(myText);
  return myText;
})

window.addEventListener('wheel', (e) => {
  if (isAnimating) return;
  isAnimating = true;
  let direction = Math.sign(e.deltaY);
  let next = (currentIndex + direction + blobs.length) % blobs.length;

  texts[next].scale.set(1, 1, 1);
  texts[next].position.x = direction * 3.5;

  gsap.to(textMaterial.uniforms.progress, {
    value: .5,
    duration: 1,
    ease: 'linear',
    onComplete: () => {
      currentIndex = next;
      isAnimating = false;
      textMaterial.uniforms.progress.value = 0;
    }
  })

  gsap.to(texts[currentIndex].position, {
    x: -direction * 3,
    duration: 1,
    ease: 'power2.inOut',
  })

  gsap.to(sphere.rotation, {
    y: sphere.rotation.y + Math.PI * 4 * -direction,
    duration: 1,
    ease: 'power2.inOut',
  })

  gsap.to(texts[next].position, {
    x: 0,
    duration: 1,
    ease: 'power2.inOut',
  })

  const bg = new THREE.Color(blobs[next].background);
  gsap.to(scene.background, {
    r: bg.r,
    g: bg.g,
    b: bg.b,
    duration: 1,
    ease: 'linear',
  })

  updateBlob(blobs[next].config);
})

function updateBlob(config) {
  if (config.uPositionFrequency !== undefined) uniforms.uPositionFrequency.value = config.uPositionFrequency;
  if (config.uPositionStrength !== undefined) uniforms.uPositionStrength.value = config.uPositionStrength;
  if (config.uSmallWavePositionFrequency !== undefined) uniforms.uSmallWavePositionFrequency.value = config.uSmallWavePositionFrequency;
  if (config.uSmallWavePositionStrength !== undefined) uniforms.uSmallWavePositionStrength.value = config.uSmallWavePositionStrength;
  if (config.roughness !== undefined) material.roughness = config.roughness;
  if (config.metalness !== undefined) material.metalness = config.metalness;
  if (config.envMapIntensity !== undefined) material.envMapIntensity = config.envMapIntensity;
  if (config.clearcoat !== undefined) material.clearcoat = config.clearcoat;
  if (config.clearcoatRoughness !== undefined) material.clearcoatRoughness = config.clearcoatRoughness;
  if (config.transmission !== undefined) material.transmission = config.transmission;
}

loadingManager.onLoad = () => {
  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  const bg = new THREE.Color(blobs[currentIndex].background);
  gsap.to(scene.background, { r: bg.r, g: bg.g, b: bg.b, duration: 1, ease: 'linear' });
  animate();
};
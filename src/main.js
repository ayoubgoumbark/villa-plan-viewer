import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#scene');
const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const fallback = document.querySelector('#scene-fallback');

function showError(message) {
  loading.remove();
  canvas.hidden = true;
  fallback.hidden = false;
  error.textContent = message;
  error.hidden = false;
}

function startViewer() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    console.error('Could not create a WebGL renderer:', err);
    showError('Interactive 3D is unavailable in this browser. Showing a rendered preview instead.');
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f3f2ee');
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300);
  camera.up.set(0, 0, 1);
  camera.position.set(37, -42, 65);

  scene.add(new THREE.HemisphereLight('#fffaf1', '#929588', 2.3));
  const sun = new THREE.DirectionalLight('#fff4dd', 3.4);
  sun.position.set(-24, -31, 55);
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#cad9d5', 1.2);
  fill.position.set(38, 17, 29);
  scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI / 2.03;
  controls.minDistance = 16;
  controls.maxDistance = 102;
  controls.target.set(13, 7, 0.7);
  controls.saveState();
  const originalPosition = camera.position.clone();

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(31, 96),
    new THREE.MeshStandardMaterial({ color: '#deddd6', roughness: 0.95 }),
  );
  ground.position.set(13, 7, -0.42);
  scene.add(ground);
  const floorGrid = new THREE.GridHelper(64, 32, '#c5c5ba', '#dcdbd3');
  floorGrid.rotation.x = Math.PI / 2;
  floorGrid.position.set(13, 7, -0.3);
  floorGrid.material.transparent = true;
  floorGrid.material.opacity = 0.25;
  scene.add(floorGrid);

  const modelTimeout = setTimeout(() => {
    showError('The 3D model is taking too long to load. Showing a rendered preview instead.');
  }, 20000);

  new GLTFLoader().load(
    '/villa.glb',
    ({ scene: modelScene }) => {
      clearTimeout(modelTimeout);
      canvas.hidden = false;
      fallback.hidden = true;
      error.hidden = true;
      scene.add(modelScene);
      const box = new THREE.Box3().setFromObject(modelScene);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        controls.target.set(center.x, center.y, center.z + 0.6);
        controls.update();
        controls.saveState();
      }
      loading.classList.add('done');
      setTimeout(() => loading.remove(), 500);
    },
    undefined,
    (err) => {
      clearTimeout(modelTimeout);
      console.error('Could not load /villa.glb:', err);
      showError('The 3D model could not be loaded. Showing a rendered preview instead.');
    },
  );

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  const buttons = [...document.querySelectorAll('.views button')];
  const setActive = (button) => buttons.forEach((item) => item.classList.toggle('chosen', item === button));
  document.querySelector('#axon').onclick = (event) => {
    controls.reset();
    camera.up.set(0, 0, 1);
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'AXONOMETRIC VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#plan').onclick = (event) => {
    const target = controls.target.clone();
    camera.up.set(0, 1, 0);
    camera.position.set(target.x, target.y - 0.1, target.z + 68);
    camera.lookAt(target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'PLAN VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#reset').onclick = () => {
    camera.up.set(0, 0, 1);
    controls.reset();
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'AXONOMETRIC VIEW';
    setActive(document.querySelector('#axon'));
  };
  document.querySelector('#plus').onclick = () => camera.position.lerp(controls.target, 0.14);
  document.querySelector('#minus').onclick = () => camera.position.lerp(controls.target, -0.17);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

try {
  startViewer();
} catch (err) {
  console.error('Could not start the villa viewer:', err);
  showError('The interactive viewer could not start. Showing a rendered preview instead.');
}

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
  // Blender exports glTF with Y as the vertical axis. Use the saved Blender
  // camera, converted from Blender (x, y, z) to glTF (x, z, -y).
  const orthoScale = 37;
  const camera = new THREE.OrthographicCamera(-orthoScale / 2, orthoScale / 2, orthoScale / 2, -orthoScale / 2, 0.1, 300);
  camera.up.set(0, 1, 0);
  camera.position.set(37, 67, 41);

  scene.add(new THREE.HemisphereLight('#fffaf1', '#929588', 2.3));
  const sun = new THREE.DirectionalLight('#fff4dd', 3.4);
  sun.position.set(-24, 55, 31);
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#cad9d5', 1.2);
  fill.position.set(38, 29, -17);
  scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2.03;
  controls.minZoom = 0.5;
  controls.maxZoom = 4;
  controls.target.set(13, 0, -8);
  camera.lookAt(controls.target);
  controls.update();
  controls.saveState();
  const originalPosition = camera.position.clone();

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(31, 96),
    new THREE.MeshStandardMaterial({ color: '#deddd6', roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(13, -0.42, -7);
  scene.add(ground);
  const floorGrid = new THREE.GridHelper(64, 32, '#c5c5ba', '#dcdbd3');
  floorGrid.position.set(13, -0.3, -7);
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
      controls.update();
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
    camera.left = -orthoScale * width / height / 2;
    camera.right = orthoScale * width / height / 2;
    camera.top = orthoScale / 2;
    camera.bottom = -orthoScale / 2;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  const buttons = [...document.querySelectorAll('.views button')];
  const setActive = (button) => buttons.forEach((item) => item.classList.toggle('chosen', item === button));
  document.querySelector('#axon').onclick = (event) => {
    controls.reset();
    camera.up.set(0, 1, 0);
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'AXONOMETRIC VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#plan').onclick = (event) => {
    const target = controls.target.clone();
    camera.up.set(0, 1, 0);
    camera.position.set(target.x, target.y + 68, target.z + 0.1);
    camera.lookAt(target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'PLAN VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#reset').onclick = () => {
    camera.up.set(0, 1, 0);
    controls.reset();
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    document.querySelector('#view-caption').textContent = 'AXONOMETRIC VIEW';
    setActive(document.querySelector('#axon'));
  };
  document.querySelector('#plus').onclick = () => {
    camera.zoom = Math.min(controls.maxZoom, camera.zoom * 1.2);
    camera.updateProjectionMatrix();
    controls.update();
  };
  document.querySelector('#minus').onclick = () => {
    camera.zoom = Math.max(controls.minZoom, camera.zoom / 1.2);
    camera.updateProjectionMatrix();
    controls.update();
  };

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

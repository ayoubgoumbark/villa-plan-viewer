import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#scene');
const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const fallback = document.querySelector('#scene-fallback');
const labelLayer = document.querySelector('#room-labels');
const roomList = document.querySelector('#room-list');
const selectedRoomText = document.querySelector('#room-selected');
const navHint = document.querySelector('#nav-hint');

const roomDefinitions = [
  { name: 'Salon', floor: 'Floor | Salon' },
  { name: 'Spa', floor: 'Floor | Spa', compact: true },
  { name: 'Salle de sport', floor: 'Floor | Gym' },
  { name: 'Chambre 01', floor: 'Floor | Bedroom north' },
  { name: 'Salle cinéma', floor: 'Floor | Cinema' },
  { name: 'Escalier', floor: 'Floor | Stair hall', compact: true },
  { name: 'Hall', anchor: [13, 0.15, -8.6] },
  { name: 'Salle de bain 01', floor: 'Floor | Bathroom A', compact: true },
  { name: 'Salle de bain 02', floor: 'Floor | Bathroom B', compact: true },
  { name: 'Chambre 02', floor: 'Floor | Bedroom central' },
  { name: 'Salle à manger', floor: 'Floor | Dining' },
  { name: 'Cuisine', floor: 'Floor | Kitchen' },
  { name: 'Garage', floor: 'Floor | Garage' },
];

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
  const blenderFrameWidth = 37;
  const blenderAspect = 1700 / 1500;
  const camera = new THREE.OrthographicCamera(-blenderFrameWidth / 2, blenderFrameWidth / 2, blenderFrameWidth / 2, -blenderFrameWidth / 2, 0.1, 300);
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
  const initialTarget = new THREE.Vector3(12.92, 0, -7.67);
  controls.target.copy(initialTarget);
  camera.lookAt(controls.target);
  controls.update();
  controls.saveState();
  const originalPosition = camera.position.clone();
  let rooms = [];
  let selectedRoom = null;
  let highlightedMaterial = null;
  let cameraTween = null;
  let labelsVisible = true;
  let navigationMode = 'orbit';
  controls.addEventListener('start', () => { cameraTween = null; });

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
      createRoomNavigation(modelScene);
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
    const aspect = width / height;
    const frameWidth = blenderFrameWidth * Math.max(1, aspect / blenderAspect);
    const frameHeight = frameWidth / aspect;
    camera.left = -frameWidth / 2;
    camera.right = frameWidth / 2;
    camera.top = frameHeight / 2;
    camera.bottom = -frameHeight / 2;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  function createRoomNavigation(modelScene) {
    roomList.replaceChildren();
    labelLayer.replaceChildren();

    rooms = roomDefinitions.flatMap((definition, index) => {
      const floor = definition.floor ? modelScene.getObjectByName(definition.floor) : null;
      if (definition.floor && !floor) {
        console.warn(`Room floor missing from the model: ${definition.floor}`);
        return [];
      }
      const anchor = floor
        ? new THREE.Box3().setFromObject(floor).getCenter(new THREE.Vector3())
        : new THREE.Vector3(...definition.anchor);
      anchor.y = Math.max(anchor.y, 0.15);

      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'room-label';
      label.textContent = definition.name;
      label.setAttribute('aria-label', `Focus on ${definition.name}`);
      label.hidden = true;
      labelLayer.append(label);

      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'room-row';
      row.setAttribute('aria-pressed', 'false');
      const number = document.createElement('span');
      number.className = 'room-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const name = document.createElement('span');
      name.className = 'room-name';
      name.textContent = definition.name;
      const arrow = document.createElement('span');
      arrow.className = 'room-arrow';
      arrow.textContent = '↗';
      row.append(number, name, arrow);
      roomList.append(row);

      const room = { ...definition, floor, anchor, label, row, index };
      label.addEventListener('click', () => focusRoom(room));
      row.addEventListener('click', () => focusRoom(room));
      return [room];
    });
  }

  function clearSelection() {
    if (highlightedMaterial) {
      highlightedMaterial.floor.material = highlightedMaterial.original;
      highlightedMaterial.clones.forEach((material) => material.dispose());
      highlightedMaterial = null;
    }
    selectedRoom = null;
    selectedRoomText.textContent = 'CHOOSE A ROOM TO EXPLORE';
    for (const room of rooms) {
      room.label.classList.remove('active');
      room.row.classList.remove('active');
      room.row.setAttribute('aria-pressed', 'false');
    }
  }

  function focusRoom(room) {
    clearSelection();
    selectedRoom = room;
    selectedRoomText.textContent = `ROOM ${String(room.index + 1).padStart(2, '0')} / ${room.name.toUpperCase()}`;
    room.label.classList.add('active');
    room.row.classList.add('active');
    room.row.setAttribute('aria-pressed', 'true');

    if (room.floor?.material) {
      const original = room.floor.material;
      const originals = Array.isArray(original) ? original : [original];
      const clones = originals.map((material) => {
        const clone = material.clone();
        if (clone.emissive) {
          clone.emissive.set('#69307f');
          clone.emissiveIntensity = 0.35;
        }
        return clone;
      });
      room.floor.material = Array.isArray(original) ? clones : clones[0];
      highlightedMaterial = { floor: room.floor, original, clones };
    }

    const toTarget = room.anchor.clone();
    toTarget.y = 0.35;
    const offset = toTarget.clone().sub(controls.target);
    cameraTween = {
      started: performance.now(),
      fromTarget: controls.target.clone(),
      toTarget,
      fromPosition: camera.position.clone(),
      toPosition: camera.position.clone().add(offset),
      fromZoom: camera.zoom,
      toZoom: Math.max(camera.zoom, 1.5),
    };
  }

  function updateLabels() {
    if (!labelsVisible || !rooms.length) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const candidates = rooms.map((room) => {
      const point = room.anchor.clone().project(camera);
      return { room, point, x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2 };
    }).sort((a, b) => Number(b.room === selectedRoom) - Number(a.room === selectedRoom));
    const placed = [];
    for (const candidate of candidates) {
      const { room, point, x, y } = candidate;
      const labelWidth = room.label.offsetWidth || 100;
      const labelHeight = room.label.offsetHeight || 24;
      const outside = point.z < -1 || point.z > 1 || x < labelWidth / 2 + 8 || x > width - labelWidth / 2 - 8 || y < 72 || y > height - 50;
      const tooSmall = room.compact && camera.zoom < 1.35 && room !== selectedRoom;
      const overlaps = placed.some((other) => Math.abs(x - other.x) < (labelWidth + other.width) / 2 + 7 && Math.abs(y - other.y) < (labelHeight + other.height) / 2 + 7);
      room.label.hidden = outside || tooSmall || overlaps;
      if (!room.label.hidden) {
        room.label.style.left = `${x}px`;
        room.label.style.top = `${y}px`;
        placed.push({ x, y, width: labelWidth, height: labelHeight });
      }
    }
  }

  function setNavigationMode(mode) {
    navigationMode = mode;
    controls.mouseButtons.LEFT = mode === 'orbit' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = mode === 'orbit' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
    controls.touches.ONE = mode === 'orbit' ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    for (const [id, active] of [['orbit-mode', mode === 'orbit'], ['pan-mode', mode === 'pan']]) {
      const button = document.querySelector(`#${id}`);
      button.classList.toggle('chosen', active);
      button.setAttribute('aria-pressed', String(active));
    }
    navHint.textContent = mode === 'orbit'
      ? 'DRAG TO ORBIT · RIGHT-DRAG TO MOVE · SCROLL OR PINCH TO ZOOM'
      : 'DRAG TO MOVE · RIGHT-DRAG TO ORBIT · SCROLL OR PINCH TO ZOOM';
  }

  document.querySelector('#orbit-mode').onclick = () => setNavigationMode('orbit');
  document.querySelector('#pan-mode').onclick = () => setNavigationMode('pan');
  document.querySelector('#labels-toggle').onclick = (event) => {
    labelsVisible = !labelsVisible;
    labelLayer.hidden = !labelsVisible;
    event.currentTarget.classList.toggle('chosen', labelsVisible);
    event.currentTarget.setAttribute('aria-pressed', String(labelsVisible));
  };
  setNavigationMode(navigationMode);

  const buttons = [...document.querySelectorAll('.views button')];
  const setActive = (button) => buttons.forEach((item) => item.classList.toggle('chosen', item === button));
  document.querySelector('#axon').onclick = (event) => {
    cameraTween = null;
    camera.up.set(0, 1, 0);
    camera.position.copy(originalPosition).add(controls.target.clone().sub(initialTarget));
    camera.lookAt(controls.target);
    controls.update();
    setNavigationMode('orbit');
    document.querySelector('#view-caption').textContent = 'AXONOMETRIC VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#plan').onclick = (event) => {
    cameraTween = null;
    const target = controls.target.clone();
    camera.up.set(0, 1, 0);
    camera.position.set(target.x, target.y + 68, target.z + 0.1);
    camera.lookAt(target);
    controls.update();
    setNavigationMode('pan');
    document.querySelector('#view-caption').textContent = 'PLAN VIEW';
    setActive(event.currentTarget);
  };
  document.querySelector('#reset').onclick = () => {
    cameraTween = null;
    clearSelection();
    camera.up.set(0, 1, 0);
    controls.reset();
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    setNavigationMode('orbit');
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
    if (cameraTween) {
      const progress = Math.min(1, (performance.now() - cameraTween.started) / 650);
      const eased = 1 - (1 - progress) ** 3;
      controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
      camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, eased);
      camera.zoom = THREE.MathUtils.lerp(cameraTween.fromZoom, cameraTween.toZoom, eased);
      camera.updateProjectionMatrix();
      if (progress === 1) cameraTween = null;
    }
    controls.update();
    updateLabels();
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

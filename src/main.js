import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initLanguage, t } from './i18n.js';

const canvas = document.querySelector('#scene');
const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const fallback = document.querySelector('#scene-fallback');
const labelLayer = document.querySelector('#room-labels');
const roomList = document.querySelector('#room-list');
const selectedRoomText = document.querySelector('#room-selected');
const navHint = document.querySelector('#nav-hint');
const walkHud = document.querySelector('#walk-hud');
const walkButton = document.querySelector('#walk-mode');
initLanguage();

const roomDefinitions = [
  { name: 'Salon', floor: 'Floor | Salon' },
  { name: 'Spa', floor: 'Floor | Spa', compact: true },
  { name: 'Salle de sport', floor: 'Floor | Gym' },
  { name: 'Chambre 01', floor: 'Floor | Bedroom north' },
  { name: 'Salle cinéma', floor: 'Floor | Cinema' },
  { name: 'Escalier', floor: 'Floor | Stair hall', compact: true },
  { name: 'Hall', anchor: [11, 0.15, -9] },
  { name: 'Salle de bain 01', floor: 'Floor | Bathroom A', compact: true },
  { name: 'Salle de bain 02', floor: 'Floor | Bathroom B', compact: true },
  { name: 'Chambre 02', floor: 'Floor | Bedroom central' },
  { name: 'Salle à manger', floor: 'Floor | Dining' },
  { name: 'Cuisine', floor: 'Floor | Kitchen' },
  { name: 'Garage', floor: 'Floor | Garage' },
];

let currentErrorKey = null;
function showError(key) {
  currentErrorKey = key;
  loading.remove();
  canvas.hidden = true;
  fallback.hidden = false;
  error.textContent = t(key);
  error.hidden = false;
}
window.addEventListener('villa-language-change', () => {
  if (currentErrorKey) error.textContent = t(currentErrorKey);
});

function startViewer() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    console.error('Could not create a WebGL renderer:', err);
    showError('webglError');
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
  const walkCamera = new THREE.PerspectiveCamera(66, 1, 0.08, 180);
  let activeCamera = camera;
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
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  renderer.domElement.style.touchAction = 'pan-y';
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
  let walking = false;
  let walkYaw = 0;
  let walkPitch = 0;
  let collisionMeshes = [];
  const modelNodesBySourceName = new Map();
  const heldKeys = new Set();
  const heldTouch = new Set();
  const walkClock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const eyeHeight = 1.65;
  const walkDirection = new THREE.Vector3();
  let touchLook = null;
  let savedBodyOverflow = '';
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
    showError('timeoutError');
  }, 20000);

  new GLTFLoader().load(
    '/villa.glb',
    ({ scene: modelScene }) => {
      clearTimeout(modelTimeout);
      canvas.hidden = false;
      fallback.hidden = true;
      error.hidden = true;
      scene.add(modelScene);
      modelScene.traverse((object) => {
        const sourceName = object.userData.name || object.name;
        if (sourceName) modelNodesBySourceName.set(sourceName, object);
        if (object.isMesh && !sourceName.startsWith('Floor |') && sourceName !== 'Continuous villa foundation') collisionMeshes.push(object);
      });
      createRoomNavigation(modelScene);
      controls.update();
      loading.classList.add('done');
      setTimeout(() => loading.remove(), 500);
    },
    undefined,
    (err) => {
      clearTimeout(modelTimeout);
      console.error('Could not load /villa.glb:', err);
      showError('modelError');
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
    walkCamera.aspect = aspect;
    walkCamera.fov = aspect < 0.8 ? 60 : 66;
    walkCamera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  function createRoomNavigation(modelScene) {
    roomList.replaceChildren();
    labelLayer.replaceChildren();

    rooms = roomDefinitions.flatMap((definition, index) => {
      const floor = definition.floor ? modelNodesBySourceName.get(definition.floor) : null;
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
      label.textContent = t('rooms')[index];
      label.setAttribute('aria-label', `${t('focusRoom')} ${t('rooms')[index]}`);
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
      name.textContent = t('rooms')[index];
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
    syncDynamicLanguage();
  }

  function updateViewCaption() {
    document.querySelector('#view-caption').textContent = t(walking ? 'viewWalk' : document.querySelector('#plan').classList.contains('chosen') ? 'viewPlan' : 'viewAxon');
  }

  function syncDynamicLanguage() {
    for (const room of rooms) {
      const name = t('rooms')[room.index];
      room.label.textContent = name;
      room.label.setAttribute('aria-label', `${t('focusRoom')} ${name}`);
      room.row.querySelector('.room-name').textContent = name;
    }
    selectedRoomText.textContent = selectedRoom
      ? `${t('roomWord')} ${String(selectedRoom.index + 1).padStart(2, '0')} / ${t('rooms')[selectedRoom.index]}`
      : t('chooseRoom');
    updateViewCaption();
  }
  window.addEventListener('villa-language-change', syncDynamicLanguage);
  syncDynamicLanguage();

  function clearSelection() {
    if (highlightedMaterial) {
      highlightedMaterial.floor.material = highlightedMaterial.original;
      highlightedMaterial.clones.forEach((material) => material.dispose());
      highlightedMaterial = null;
    }
    selectedRoom = null;
    selectedRoomText.textContent = t('chooseRoom');
    for (const room of rooms) {
      room.label.classList.remove('active');
      room.row.classList.remove('active');
      room.row.setAttribute('aria-pressed', 'false');
    }
  }

  function focusRoom(room) {
    clearSelection();
    selectedRoom = room;
    selectedRoomText.textContent = `${t('roomWord')} ${String(room.index + 1).padStart(2, '0')} / ${t('rooms')[room.index]}`;
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

    if (walking) {
      placeWalker(room.anchor);
      return;
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
    if (walking || !labelsVisible || !rooms.length) return;
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

  walkButton.onclick = () => walking ? exitWalk() : enterWalk();
  document.querySelector('#walk-exit').onclick = exitWalk;
  document.querySelector('#labels-toggle').onclick = (event) => {
    labelsVisible = !labelsVisible;
    labelLayer.hidden = walking || !labelsVisible;
    event.currentTarget.classList.toggle('chosen', labelsVisible);
    event.currentTarget.setAttribute('aria-pressed', String(labelsVisible));
  };

  function placeWalker(anchor) {
    walkCamera.position.set(anchor.x, eyeHeight, anchor.z);
    walkCamera.rotation.set(walkPitch, walkYaw, 0, 'YXZ');
  }

  function enterWalk() {
    if (!rooms.length) return;
    cameraTween = null;
    walking = true;
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    stage.classList.add('is-walking');
    activeCamera = walkCamera;
    controls.enabled = false;
    renderer.domElement.style.touchAction = 'none';
    walkYaw = -Math.PI / 2;
    walkPitch = -0.18;
    placeWalker(rooms[6].anchor);
    walkHud.hidden = false;
    labelLayer.hidden = true;
    navHint.hidden = true;
    walkButton.classList.add('chosen');
    walkButton.setAttribute('aria-pressed', 'true');
    updateViewCaption();
    walkClock.getDelta();
  }

  function exitWalk() {
    if (!walking) return;
    walking = false;
    stage.classList.remove('is-walking');
    document.body.style.overflow = savedBodyOverflow;
    activeCamera = camera;
    controls.enabled = true;
    renderer.domElement.style.touchAction = 'pan-y';
    heldKeys.clear();
    heldTouch.clear();
    touchLook = null;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    walkHud.hidden = true;
    labelLayer.hidden = walking || !labelsVisible;
    navHint.hidden = false;
    walkButton.classList.remove('chosen');
    walkButton.setAttribute('aria-pressed', 'false');
    updateViewCaption();
  }

  function lookBy(dx, dy) {
    walkYaw -= dx * 0.0028;
    walkPitch = THREE.MathUtils.clamp(walkPitch - dy * 0.0028, -Math.PI * 0.45, Math.PI * 0.45);
    walkCamera.rotation.set(walkPitch, walkYaw, 0, 'YXZ');
  }

  canvas.addEventListener('click', () => {
    if (!walking || !matchMedia('(pointer: fine)').matches || document.pointerLockElement === canvas) return;
    const lockRequest = canvas.requestPointerLock?.();
    lockRequest?.catch?.(() => { /* Drag-to-look remains available. */ });
  });
  document.addEventListener('mousemove', (event) => {
    if (walking && document.pointerLockElement === canvas) lookBy(event.movementX, event.movementY);
  });
  document.addEventListener('pointerlockchange', () => {
    if (walking && document.pointerLockElement !== canvas) exitWalk();
  });
  canvas.addEventListener('pointerdown', (event) => {
    if (walking && document.pointerLockElement !== canvas) {
      touchLook = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!walking || touchLook?.id !== event.pointerId) return;
    lookBy(event.clientX - touchLook.x, event.clientY - touchLook.y);
    touchLook.x = event.clientX;
    touchLook.y = event.clientY;
  });
  canvas.addEventListener('pointerup', (event) => { if (touchLook?.id === event.pointerId) touchLook = null; });
  canvas.addEventListener('pointercancel', (event) => { if (touchLook?.id === event.pointerId) touchLook = null; });
  document.addEventListener('keydown', (event) => {
    if (!walking) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
      heldKeys.add(event.code);
      event.preventDefault();
    }
    if (event.code === 'Escape') exitWalk();
  });
  document.addEventListener('keyup', (event) => heldKeys.delete(event.code));
  window.addEventListener('blur', () => { heldKeys.clear(); heldTouch.clear(); });
  document.querySelectorAll('[data-walk]').forEach((button) => {
    const direction = button.dataset.walk;
    button.addEventListener('pointerdown', (event) => {
      if (!walking) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      heldTouch.add(direction);
    });
    const release = () => heldTouch.delete(direction);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  function updateWalk(delta) {
    const forward = Number(heldKeys.has('KeyW') || heldKeys.has('ArrowUp') || heldTouch.has('forward')) - Number(heldKeys.has('KeyS') || heldKeys.has('ArrowDown') || heldTouch.has('backward'));
    const side = Number(heldKeys.has('KeyD') || heldKeys.has('ArrowRight') || heldTouch.has('right')) - Number(heldKeys.has('KeyA') || heldKeys.has('ArrowLeft') || heldTouch.has('left'));
    if (!forward && !side) return;
    const speed = (heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight') ? 5.2 : 2.8) * Math.min(delta, 0.15) / Math.hypot(forward, side);
    walkDirection.set(Math.sin(walkYaw) * -forward + Math.cos(walkYaw) * side, 0, Math.cos(walkYaw) * -forward - Math.sin(walkYaw) * side).multiplyScalar(speed);
    for (const axis of ['x', 'z']) {
      const distance = walkDirection[axis];
      if (!distance) continue;
      const direction = new THREE.Vector3(axis === 'x' ? Math.sign(distance) : 0, 0, axis === 'z' ? Math.sign(distance) : 0);
      let blocked = false;
      for (const height of [0.65, 1.55]) {
        raycaster.set(new THREE.Vector3(walkCamera.position.x, height, walkCamera.position.z), direction);
        raycaster.far = Math.abs(distance) + 0.27;
        if (raycaster.intersectObjects(collisionMeshes, false).length) { blocked = true; break; }
      }
      if (!blocked) walkCamera.position[axis] += distance;
    }
  }

  const buttons = [...document.querySelectorAll('.views button')];
  const setActive = (button) => buttons.forEach((item) => item.classList.toggle('chosen', item === button));
  document.querySelector('#axon').onclick = (event) => {
    if (walking) exitWalk();
    cameraTween = null;
    controls.enableRotate = true;
    camera.up.set(0, 1, 0);
    camera.position.copy(originalPosition).add(controls.target.clone().sub(initialTarget));
    camera.lookAt(controls.target);
    controls.update();
    setActive(event.currentTarget);
    updateViewCaption();
  };
  document.querySelector('#plan').onclick = (event) => {
    if (walking) exitWalk();
    cameraTween = null;
    controls.enableRotate = false;
    const target = controls.target.clone();
    camera.up.set(0, 1, 0);
    camera.position.set(target.x, target.y + 68, target.z + 0.1);
    camera.lookAt(target);
    controls.update();
    setActive(event.currentTarget);
    updateViewCaption();
  };
  document.querySelector('#reset').onclick = () => {
    if (walking) exitWalk();
    cameraTween = null;
    clearSelection();
    controls.enableRotate = true;
    camera.up.set(0, 1, 0);
    controls.reset();
    camera.position.copy(originalPosition);
    camera.lookAt(controls.target);
    controls.update();
    setActive(document.querySelector('#axon'));
    updateViewCaption();
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
    const delta = walkClock.getDelta();
    if (walking) updateWalk(delta);
    if (cameraTween) {
      const progress = Math.min(1, (performance.now() - cameraTween.started) / 650);
      const eased = 1 - (1 - progress) ** 3;
      controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
      camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, eased);
      camera.zoom = THREE.MathUtils.lerp(cameraTween.fromZoom, cameraTween.toZoom, eased);
      camera.updateProjectionMatrix();
      if (progress === 1) cameraTween = null;
    }
    if (!walking) controls.update();
    updateLabels();
    renderer.render(scene, activeCamera);
  }
  animate();
}

try {
  startViewer();
} catch (err) {
  console.error('Could not start the villa viewer:', err);
  showError('startupError');
}

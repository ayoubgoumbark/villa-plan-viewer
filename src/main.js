import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas=document.querySelector('#scene'),stage=document.querySelector('#stage'),loading=document.querySelector('#loading');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;
const scene=new THREE.Scene();scene.background=new THREE.Color('#f3f2ee');
const camera=new THREE.PerspectiveCamera(34,1,.1,300);camera.up.set(0,0,1);camera.position.set(37,-42,65);
scene.add(new THREE.HemisphereLight('#fffaf1','#929588',2.3));
const sun=new THREE.DirectionalLight('#fff4dd',3.4);sun.position.set(-24,-31,55);scene.add(sun);
const fill=new THREE.DirectionalLight('#cad9d5',1.2);fill.position.set(38,17,29);scene.add(fill);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI/2.03;controls.minDistance=16;controls.maxDistance=102;controls.target.set(13,7,.7);controls.saveState();
const originalPosition=camera.position.clone();
const ground=new THREE.Mesh(new THREE.CircleGeometry(31,96),new THREE.MeshStandardMaterial({color:'#deddd6',roughness:.95}));ground.position.set(13,7,-.42);scene.add(ground);
const floorGrid=new THREE.GridHelper(64,32,'#c5c5ba','#dcdbd3');floorGrid.rotation.x=Math.PI/2;floorGrid.position.set(13,7,-.3);for(const m of floorGrid.material){m.transparent=true;m.opacity=.25;}scene.add(floorGrid);
new GLTFLoader().load('/villa.glb',({scene:modelScene})=>{scene.add(modelScene);const box=new THREE.Box3().setFromObject(modelScene);if(!box.isEmpty()){const c=box.getCenter(new THREE.Vector3());controls.target.set(c.x,c.y,c.z+.6);controls.update();controls.saveState();}loading.classList.add('done');setTimeout(()=>loading.remove(),500);},undefined,err=>{console.error(err);loading.remove();document.querySelector('#error').hidden=false;});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
const buttons=[...document.querySelectorAll('.views button')];function active(button){buttons.forEach(b=>b.classList.toggle('chosen',b===button));}
document.querySelector('#axon').onclick=e=>{controls.reset();camera.up.set(0,0,1);camera.position.copy(originalPosition);camera.lookAt(controls.target);controls.update();document.querySelector('#view-caption').textContent='AXONOMETRIC VIEW';active(e.currentTarget);};
document.querySelector('#plan').onclick=e=>{const t=controls.target.clone();camera.up.set(0,1,0);camera.position.set(t.x,t.y-.1,t.z+68);camera.lookAt(t);controls.update();document.querySelector('#view-caption').textContent='PLAN VIEW';active(e.currentTarget);};
document.querySelector('#reset').onclick=()=>{camera.up.set(0,0,1);controls.reset();camera.position.copy(originalPosition);camera.lookAt(controls.target);controls.update();document.querySelector('#view-caption').textContent='AXONOMETRIC VIEW';active(document.querySelector('#axon'));};
document.querySelector('#plus').onclick=()=>{camera.position.lerp(controls.target,.14);};document.querySelector('#minus').onclick=()=>{camera.position.lerp(controls.target,-.17);};
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();

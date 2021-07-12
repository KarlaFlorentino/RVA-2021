import * as THREE from  '../build/three.module.js';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        InfoBox,
        onWindowResize} from "../libs/util/util.js";

var stats = new Stats();          // To show FPS information
var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, -10, 5)); // Init camera in this position

var ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)");
scene.add(ambientLight);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Set angles of rotation
var angle = [-1.57, 0, 0]; // In degreesToRadians

//Cilindro aberto
var cylinder = createCylinder();
scene.add(cylinder);

//Circulos
var circle1 = createCircle();
cylinder.add(circle1);

var circle2 = createCircle();
cylinder.add(circle2);

//----------------------------------------------------------------------------
//-- Use TextureLoader to load texture files
var textureLoader = new THREE.TextureLoader();
var wood  = textureLoader.load('../assets/textures/wood.png');
var woodtop  = textureLoader.load('../assets/textures/woodtop.png');

// Apply texture to the 'map' property of the respective materials' objects
cylinder.material.map = wood;
circle1.material.map = woodtop;
circle2.material.map = woodtop;

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();

function createCylinder(){
  var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4.0, 25, true, 0, 0);
  var cylinderMaterial = new THREE.MeshLambertMaterial();
  var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
  return cylinder;
}

function createCircle(){
  var circleGeometry = new THREE.CircleGeometry(1, 25);
  var circleMaterial = new THREE.MeshLambertMaterial();
  var circle = new THREE.Mesh( circleGeometry, circleMaterial );
  return circle;
}

function rotateCylinder()
{
  // More info:
  // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
  cylinder.matrixAutoUpdate = false;
  circle1.matrixAutoUpdate = false;
  circle2.matrixAutoUpdate = false;

  var mat4 = new THREE.Matrix4();

  // resetting matrices
  cylinder.matrix.identity();
  circle1.matrix.identity();
  circle2.matrix.identity();

  cylinder.matrix.multiply(mat4.makeRotationX(angle[0])); 

  circle1.matrix.multiply(mat4.makeRotationX(angle[0])); 
  circle1.matrix.multiply(mat4.makeTranslation(0.0, 0.0, 2.0)); 

  circle2.matrix.multiply(mat4.makeRotationX(-angle[0])); 
  circle2.matrix.multiply(mat4.makeTranslation(0.0, 0.0, 2.0)); 
}

function render()
{
  stats.update(); // Update FPS
  trackballControls.update(); // Enable mouse movements
  rotateCylinder();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}
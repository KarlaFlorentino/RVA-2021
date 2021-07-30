//-- Imports -------------------------------------------------------------------------------------
import * as THREE from '../build/three.module.js';
import { VRButton } from '../build/jsm/webxr/VRButton.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import { onWindowResize, 
		getMaxSize,
        degreesToRadians } from "../libs/util/util.js";

//-- Setting renderer ---------------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.xr.enabled = true;
	renderer.xr.setReferenceSpaceType( 'local' );

//-- Append renderer and create VR button -------------------------------------------------------
document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );
window.addEventListener( 'resize', onWindowResize );

//-- Setting scene and camera -------------------------------------------------------------------
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set(-3.14, 0.90, 3.14);
camera.layers.enable( 1 );

//-- Creating equirectangular Panomara ----------------------------------------------------------

const geometry = new THREE.SphereGeometry( 1000, 60, 60 );
	geometry.scale( - 1, 1, 1 ); // invert the geometry on the x-axis (faces will point inward)
const loader = new THREE.TextureLoader();
const texture = loader.load( 'textures/download.jpg' );
const material = new THREE.MeshBasicMaterial( { map: texture } )
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );


// create the ground plane
var planeGeometry = new THREE.PlaneGeometry(30, 30);
planeGeometry.translate(0.0, 0.0, -2); 
planeGeometry.rotateX(degreesToRadians(-90));
var planeMaterial = new THREE.MeshBasicMaterial({
    map: loader.load("textures/plano.jpeg"), 
   	repeat:100,
    //color: "rgba(150, 150, 150)",
    side: THREE.DoubleSide,
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// add the plane to the scene
scene.add(plane);


//Esfera
var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({
	map: loader.load("textures/esfera.jpg"),
});
var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.set(-100, 100, 100);
scene.add(sphere);


//loadGLTFFile('objects/ovni/','scene.gltf', false);
loadGLTFFile('objects/ovni/','scene.gltf');

const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 0,0,0);
scene.add( light );

//-- Start main loop
renderer.setAnimationLoop( render );


function loadGLTFFile(modelPath, modelName)
{
  var loader = new GLTFLoader( );
  loader.load( modelPath + modelName, function ( gltf ) {
    var obj = gltf.scene;
    obj.traverse( function( node )
    {
      if( node.material ) node.material.side = THREE.DoubleSide;
    });

	obj = normalizeAndRescale(obj, 2);
    scene.add ( obj );
	obj.translateY(5);
	obj.translateX(-15);
	obj.translateZ(-3);

    }, onProgress, onError);
}

function onError() { };

function onProgress ( xhr, model ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
    }
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function render() {
	renderer.render( scene, camera );
}
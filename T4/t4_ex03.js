//-- Imports -------------------------------------------------------------------------------------
import * as THREE from '../build/three.module.js';
import { VRButton } from '../build/jsm/webxr/VRButton.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js'
import {onWindowResize,
	degreesToRadians,
	getMaxSize} from "../libs/util/util.js";


//-----------------------------------------------------------------------------------------------
//-- MAIN SCRIPT --------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

//--  General globals ---------------------------------------------------------------------------
let raycaster = new THREE.Raycaster();	// Raycaster to enable selection and dragging
let group = new THREE.Group(); 			
let group2 = new THREE.Group();
const intersected = [];					// will be used to help controlling the intersected objects
window.addEventListener( 'resize', onWindowResize );

//-- Renderer and html settings ------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;

//-- Setting scene and camera --------------------------------------------------------------------
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 30 );

//-- Create VR button and settings ---------------------------------------------------------------
document.body.appendChild( VRButton.createButton( renderer ) );

// controllers
let controller1 = renderer.xr.getController( 0 );
controller1.addEventListener( 'selectstart', onSelectStart );
controller1.addEventListener( 'selectend', onSelectEnd );
scene.add( controller1 );

// VR Camera Rectile
var ringGeo = new THREE.RingGeometry( .015, .030, 32 );
var ringMat = new THREE.MeshBasicMaterial( {
	color:"rgb(255,255,0)", 
	opacity: 0.9, 
	transparent: true } );
var rectile = new THREE.Mesh( ringGeo, ringMat );
 	rectile.position.set(0, 0, -1);
controller1.add( rectile );

//-- Creating Scene and calling the main loop ----------------------------------------------------
createScene();
animate();


//------------------------------------------------------------------------------------------------
//-- FUNCTIONS -----------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

function onSelectStart( event ) {
	const controller = event.target;
	const intersections = getIntersections( controller );



	if ( intersections.length > 0 ) {
		const intersection = intersections[ 0 ];
		const object = intersection.object;

		object.material.emissive.b = 1;
		controller.attach( object );
		controller.userData.selected = object;
		
		
	}
}

function onSelectEnd( event ) {
	const controller = event.target;
	if ( controller.userData.selected !== undefined ) {
		const object = controller.userData.selected;
		object.material.emissive.b = 0;
		group.attach( object );
		controller.userData.selected = undefined;
	}
}

function getIntersections( controller ) {

	const tempMatrix = new THREE.Matrix4();	
	tempMatrix.identity().extractRotation( controller.matrixWorld );
	raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
	raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
	return raycaster.intersectObjects( group.children );
}

function intersectObjects( controller ) {
	// Do not highlight when already selected
	if ( controller.userData.selected !== undefined ) return;

	const intersections = getIntersections( controller );

	if ( intersections.length > 0 ) {
		const intersection = intersections[ 0 ];
		const object = intersection.object;
		object.material.emissive.r = 1;
		intersected.push( object );
	} 
}

function cleanIntersected() {
	while ( intersected.length ) {
		const object = intersected.pop();
		object.material.emissive.r = 0;
	}
}

function animate() {
	renderer.setAnimationLoop( render );
}

function render() {
	cleanIntersected();
	intersectObjects( controller1 );
	renderer.render( scene, camera );
}

//-- Auxiliary Scene Creation function
function createScene()
{
	const light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 6, 0 );
	light.castShadow = true;
	light.shadow.mapSize.set( 4096, 4096 );
	scene.add( light );

	scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

	const floorGeometry = new THREE.PlaneGeometry( 10, 10 );
	const floorMaterial = new THREE.MeshStandardMaterial( {
		color: 0xeeeeee,
		roughness: 1.0,
		metalness: 0.0
	} );
	const floor = new THREE.Mesh( floorGeometry, floorMaterial );
	floor.rotation.x = degreesToRadians(-90);
	floor.receiveShadow = true;
	scene.add( floor );

	var loader = new GLTFLoader( );
	var modelPath;
	var modelName = 'scene.gltf';

	modelPath = 'objects/venus-de-milo-louvre-scan/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 2);		
        obj.position.set(-0.4, 0.5,-2.5);		
	scene.add ( obj );
    }, null, null);

	var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 0.05, 50);
	var cylinderMaterial = new THREE.MeshLambertMaterial({color: '#532C14'});
	var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);		
		cylinder.position.set(0, 0.5, -3);
	scene.add(cylinder);



	var cylinder2Geometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 50);
	var cylinder2Material = new THREE.MeshLambertMaterial({color: '#ff0000'});
	var cylinder2 = new THREE.Mesh(cylinder2Geometry, cylinder2Material);		
		cylinder2.position.set(-1, 0.5, -2.5);
	scene.add(cylinder2);


	var sphere1Geometry = new THREE.SphereGeometry(0.1,50,50);
	var sphere1Material = new THREE.MeshLambertMaterial({color: '#0000ff'});
	var sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material);		
		sphere1.position.set(-1, 2, -2.5);
	scene.add(sphere1);



	var cylinder3Geometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 50);
	var cylinder3Material = new THREE.MeshLambertMaterial({color: '#ff0000'});
	var cylinder3 = new THREE.Mesh(cylinder3Geometry, cylinder3Material);		
		cylinder3.position.set(0.5, 0.5, -1.7);
		cylinder3.rotateX(degreesToRadians(90));
		cylinder3.rotateZ(degreesToRadians(90));
		
	scene.add(cylinder3);

	var sphere2Geometry = new THREE.SphereGeometry(0.07,50,50);
	var sphere2Material = new THREE.MeshLambertMaterial({color: '#0000ff'});
	var sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);		
		sphere2.position.set(0.5, 0.5, -1.7);
		sphere2.rotateX(degreesToRadians(90));
		sphere2.rotateZ(degreesToRadians(90));
	
	scene.add(sphere2);		

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

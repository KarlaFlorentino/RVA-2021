//-- Imports -------------------------------------------------------------------------------------
import * as THREE from '../build/three.module.js';
import { VRButton } from '../build/jsm/webxr/VRButton.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js'
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import {onWindowResize,
		degreesToRadians,
		createGroundPlane,
		getMaxSize} from "../libs/util/util.js";

//-----------------------------------------------------------------------------------------------
//-- MAIN SCRIPT --------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

//--  General globals ---------------------------------------------------------------------------
let intersections;
var mixer = new Array();
var clock = new THREE.Clock();
var raycaster = new THREE.Raycaster();
window.addEventListener( 'resize', onWindowResize );

//-- Renderer settings ---------------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.xr.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

//-- Setting scene and camera -------------------------------------------------------------------
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 1000 );

//-- 'Camera Holder' to help moving the camera
const cameraHolder = new THREE.Object3D();
	cameraHolder.position.set(6, 1.7, -10);
	cameraHolder.add (camera);
scene.add( cameraHolder );

//-- Create VR button and settings ---------------------------------------------------------------
document.body.appendChild( VRButton.createButton( renderer ) );

// controllers
var controller1 = renderer.xr.getController( 0 );
	controller1.addEventListener( 'selectstart', onSelectStart );
	controller1.addEventListener( 'selectend', onSelectEnd );
cameraHolder.add( controller1 );

//-- VR Camera Rectile ---------------------------------------------------------------------------
const bufflines = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( -0.15, 0, 0 ), new THREE.Vector3( 0.15, 0, 0 ),
															  new THREE.Vector3( 0, -0.15, 0 ), new THREE.Vector3( 0, 0.15, 0 ) ] );
const matNotIntersected = new THREE.MeshBasicMaterial( {color: "rgb(255,255,255)"} );
const matIntersected    = new THREE.MeshBasicMaterial( {color: "rgb(255,100,25)"} );
const rectile = new THREE.LineSegments( bufflines, matNotIntersected );
	rectile.position.set(0, 0, -2.5);
	rectile.visible = false;
controller1.add( rectile );

//-- Creating Scene and calling the main loop ----------------------------------------------------
createScene();
animate();

//------------------------------------------------------------------------------------------------
//-- FUNCTIONS -----------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Teleport functions --------------------------------------------------------------------------
function getIntersections( controller ) 
{
	let tempMatrix = new THREE.Matrix4();
	tempMatrix.identity().extractRotation( controller.matrixWorld );

	raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
	raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );

	return raycaster.intersectObjects( scene.children );
}

function onSelectStart( ) {
	rectile.visible = true;
}

function checkIntersection( controller ) 
{
	if ( rectile.visible ) 
	{
		const intersections = getIntersections( controller );
		if ( intersections.length > 0 )
			rectile.material = matIntersected;		
		else
			rectile.material = matNotIntersected;		
	}
}

function onSelectEnd( event ) {
	const controller = event.target;
	intersections = getIntersections( controller );
	if ( intersections.length > 0 ) {
		const intersection = intersections[ 0 ];
		// Effectivelly move the camera to the desired position
		cameraHolder.position.set(intersection.point.x, 1.60, intersection.point.z);
	}
	rectile.visible = false;
}

//-- Main loop -----------------------------------------------------------------------------------
function animate() {
	renderer.setAnimationLoop( render );
}

function render() {
	checkIntersection( controller1 );	
	var delta = clock.getDelta(); 
	for(var i = 0; i<mixer.length; i++) mixer[i].update( delta );
	renderer.render( scene, camera );
}

//------------------------------------------------------------------------------------------------
//-- Scene and auxiliary functions ---------------------------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Create Scene --------------------------------------------------------------------------------
function createScene()
{
	// Light stuff 
	const light = new THREE.PointLight(0xaaaaaa);
		light.position.set(15,30,20);
		//light.castShadow = true;
		//light.distance = 0;
		//light.shadow.mapSize.width = 1024;
		//light.shadow.mapSize.height = 1024;	
	scene.add(light);


	const light2 = new THREE.PointLight(0xaaaaaa);
		light2.position.set(-15,30,-20);
	scene.add(light2);


	var ambientLight = new THREE.AmbientLight(0x121212);
		scene.add(ambientLight);			

	// Create Ground Plane
	var groundPlane = createGroundPlane(30.0, 20.0, 100, 100, "rgb(200,200,150)");
		groundPlane.rotateX(degreesToRadians(-90));
		groundPlane.position.set(0,0,-10);
        groundPlane.material.visible = false;
		//groundPlane.material.map = floor;		
		//groundPlane.material.map.wrapS = THREE.RepeatWrapping;
		//groundPlane.material.map.wrapT = THREE.RepeatWrapping;
		//groundPlane.material.map.repeat.set(8,8);		
	scene.add(groundPlane);
    
	salas();

	var loader = new GLTFLoader( );
	var modelPath;
	var modelName = 'scene.gltf';


	/*modelPath = 'objects/de_sterrennacht__nit_estelada__the_starry_night/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 7);
        obj.position.set(7,4.5,-20);
	scene.add ( obj );
    }, null, null)*/

    modelPath = 'objects/picture_frame/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 6);
		obj.rotateY(degreesToRadians(90));		
        obj.position.set(2,4.5,-17);
	scene.add ( obj );
    }, null, null);

    /*modelPath = 'objects/blue_ceiling/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 6);
		obj.rotateY(degreesToRadians(-90));		
        obj.position.set(10,7.5,-10);
	scene.add ( obj );
    }, null, null);

	modelPath = 'objects/les_nymphes_de_parthenope_-_musee_du_louvre/';
	var modelName = 'scene.gltf';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 6);
        obj.position.set(-7,3.5,-20);	
		obj.rotateX(degreesToRadians(-90));
	scene.add ( obj );
    }, null, null);

	modelPath = 'objects/the_raft_of_the_medusa_-_photogrammetry/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 6);
		obj.rotateY(degreesToRadians(-90));
        obj.rotateZ(degreesToRadians(180));		
        obj.position.set(-14.8,2.5,-10);
	scene.add ( obj );
    }, null, null);

	modelPath = 'objects/monalisa/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 4);
		obj.rotateY(degreesToRadians(180));	
        obj.position.set(-8,2.3,-2);
	scene.add ( obj );
    }, null, null);

	modelPath = 'objects/venus-de-milo-louvre-scan/';
	loader.load( modelPath + modelName, function ( gltf ) {
	var obj = gltf.scene;
		obj = normalizeAndRescale(obj, 4);
		obj.rotateY(degreesToRadians(180));
        obj.rotateY(degreesToRadians(-90));		
        obj.position.set(-8, 1.05,-9.3);		
	scene.add ( obj );
    }, null, null);

	var cylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 30);
	var cylinderMaterial = new THREE.MeshLambertMaterial({color: '#532C14'});
	var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);		
		cylinder.position.set(-9, 0.5, -10);
	scene.add(cylinder);*/
	

}

function salas(){
    var modelPath = 'objects/sala/';
    var modelName = '85506669-7254-4e59-9e75-a39f46a90c4e';
    var manager = new THREE.LoadingManager( );
    var mtlLoader = new MTLLoader( manager );
    mtlLoader.setPath( modelPath );
    mtlLoader.load( modelName + '.mtl', function ( materials ) {
        materials.preload();
  
        var objLoader = new OBJLoader( manager );
        objLoader.setMaterials(materials);
        objLoader.setPath(modelPath);
        objLoader.load( modelName + ".obj", function ( obj ) {
           
        // Set 'castShadow' property for each children of the group
        //obj.traverse( function (child)
        //{
        //    child.castShadow = true;
        //});
  
        obj.traverse( function( node )
        {
            if( node.material ) node.material.side = THREE.DoubleSide;
        });
  
        var obj = normalizeAndRescale(obj, 30);
  
        scene.add ( obj );

        }, null, null);
    });
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

import * as THREE from  '../build/three.module.js';
import {ARjs}    from  '../libs/AR/ar.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {getMaxSize} from "../libs/util/util.js";

var renderer	= new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize( 640, 480 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.body.appendChild( renderer.domElement );

// init scene and camera
var scene	= new THREE.Scene();
var camera = new THREE.Camera();
scene.add(camera);

// array of functions for the rendering loop
var onRenderFcts= [];


//----------------------------------------------------------------------------
// Handle arToolkitSource
// More info: https://ar-js-org.github.io/AR.js-Docs/marker-based/
//var arToolkitSource = new THREEx.ArToolkitSource({
var arToolkitSource = new ARjs.Source({	
	// to read from the webcam
	sourceType : 'webcam',

	// to read from an image
	//sourceType : 'image',
	//sourceUrl : '../assets/AR/kanjiScene.jpg',

	// to read from a video
	// sourceType : 'video',
	// sourceUrl : '../assets/AR/kanjiScene.mp4'
})

arToolkitSource.init(function onReady(){
	setTimeout(() => {
		onResize()
	}, 2000);
})

// handle resize
window.addEventListener('resize', function(){
	onResize()
})

function onResize(){
	arToolkitSource.onResizeElement()
	arToolkitSource.copyElementSizeTo(renderer.domElement)
	if( arToolkitContext.arController !== null ){
		arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
	}
}

//----------------------------------------------------------------------------
// initialize arToolkitContext
//
// create atToolkitContext
//var arToolkitContext = new THREEx.ArToolkitContext({
var arToolkitContext = new ARjs.Context({
	cameraParametersUrl: '../libs/AR/data/camera_para.dat',
	detectionMode: 'mono',
})

// initialize it
arToolkitContext.init(function onCompleted(){
	// copy projection matrix to camera
	camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
})

// update artoolkit on every frame
onRenderFcts.push(function(){
	if( arToolkitSource.ready === false )	return
	arToolkitContext.update( arToolkitSource.domElement )
	// update scene.visible if the marker is seen
	scene.visible = camera.visible
})

//----------------------------------------------------------------------------
// Create a ArMarkerControls
//
// init controls for camera
//var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {

var markerNames = ["hiro", "kanji"];

var markerArray = [];

for (let i = 0; i < markerNames.length; i++)
{
	let marker = new THREE.Group();
	scene.add(marker);
	markerArray.push(marker);

	var markerControls = new ARjs.MarkerControls(arToolkitContext, marker, {
	type : 'pattern',
	patternUrl : '../libs/AR/data/patt.' + markerNames[i],
	//changeMatrixMode: 'cameraTransformMatrix' // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
	})

	//let markerControls = new THREEx.ArMarkerControls(arToolkitContext, marker, {
	//type: 'pattern', patternUrl: "data/" + markerNames[i] + ".patt",
	//});

	let markerGroup = new THREE.Group();
	marker.add(markerGroup);
}

//----------------------------------------------------------------------------
// Adding object to the scene
var sceneGroup = new THREE.Group();
loadGLTFFile('../assets/objects/', 'TocoToucan', true, 2.0);

let floorGeometry = new THREE.PlaneGeometry( 20,20 );
let floorMaterial = new THREE.ShadowMaterial();
floorMaterial.opacity = 0.3;
let floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true;
sceneGroup.add( floorMesh );

var sceneGroup2 = new THREE.Group();

var lightColor = "rgb(255,255,255)";
var lightPosition = new THREE.Vector3(0,10,0);
var pointLight = new THREE.PointLight(lightColor);
setPointLight(lightPosition);

//----------------------------------------------------------------------------
// Render the whole thing on the page

// render the scene
onRenderFcts.push(function(){
	renderer.render( scene, camera );
})

// Set Point Light
// More info here: https://threejs.org/docs/#api/en/lights/PointLight
function setPointLight(position)
{
  pointLight.position.copy(position);
  //pointLight.name = "Point Light"
  pointLight.castShadow = true;
  pointLight.visible = true;
  pointLight.penumbra = 0.5;
  //scene.add( pointLight );
  //lightArray.push( pointLight );

  sceneGroup2.add( pointLight);
  markerArray[1].children[0].add( sceneGroup2 );
  sceneGroup2.visible = false;
  scene.add(sceneGroup2);
}

function loadGLTFFile(modelPath, modelName, visibility, desiredScale)
{
  var loader = new GLTFLoader( );
  loader.load( modelPath + modelName + '.gltf', function ( gltf ) {
    var obj = gltf.scene;
    obj.name = modelName;
    obj.visible = visibility;
    obj.traverse( function ( child ) {
      if ( child ) {
          child.castShadow = true;
      }
    });
    obj.traverse( function( node )
    {
      if( node.material ) node.material.side = THREE.DoubleSide;
    });

    var obj = normalizeAndRescale(obj, desiredScale);
    var obj = fixPosition(obj);

    //scene.add ( obj );
    //objectArray.push( obj );


	sceneGroup.add( obj );
	markerArray[0].children[0].add( sceneGroup );
	sceneGroup.visible = false;
	scene.add(sceneGroup);

    }, onProgress, onError);
}

function onError() { };

function onProgress ( xhr, model ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      //infoBox.changeMessage("Loading... " + Math.round( percentComplete, 2 ) + '% processed' );
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

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

// run the rendering loop
requestAnimationFrame(function animate(nowMsec)
{
	var lastTimeMsec= null;	
	// keep looping
	requestAnimationFrame( animate );
	// measure time
	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec


	if ( markerArray[0].visible )
		{
			//markerArray[0].children[0].add( sceneGroup );
			sceneGroup.visible = true;
			
			let p = markerArray[0].children[0].getWorldPosition();
			let q = markerArray[0].children[0].getWorldQuaternion();
			let s = markerArray[0].children[0].getWorldScale();
			let lerpAmount = 0.5;
			
			
			sceneGroup.position.lerp(p, lerpAmount);
			sceneGroup.quaternion.slerp(q, lerpAmount);
			sceneGroup.scale.lerp(s, lerpAmount);

		}else{
			sceneGroup.visible = false;
		}

		if ( markerArray[1].visible )
		{
			sceneGroup2.visible = true;
			
			let p = markerArray[1].children[0].getWorldPosition();
			let q = markerArray[1].children[0].getWorldQuaternion();
			let s = markerArray[1].children[0].getWorldScale();
			let lerpAmount = 0.5;
			
			
			sceneGroup2.position.lerp(p, lerpAmount);
			sceneGroup2.quaternion.slerp(q, lerpAmount);
			sceneGroup2.scale.lerp(s, lerpAmount);

		}else{
			sceneGroup2.visible = false;
		}


	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})
})

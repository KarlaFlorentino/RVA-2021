import * as THREE from  '../build/three.module.js';
import {ARjs}    from  '../libs/AR/ar.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {getMaxSize,
    initDefaultSpotlight} from "../libs/util/util.js";

var renderer	= new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize( 640, 480 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.body.appendChild( renderer.domElement );

// init scene and camera
var scene	= new THREE.Scene();
var camera = new THREE.Camera();
scene.add(camera);

var clock = new THREE.Clock();

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

var markerNames = ["a", "b", "c", "d", "f"];

var markerArray = [];

for (let i = 0; i < markerNames.length; i++)
{
	let marker = new THREE.Group();
	scene.add(marker);
	markerArray.push(marker);

    var url;

    if(markerNames[i] != "hiro" && markerNames[i] != "kanji"){
        url =  '../libs/AR/data/multi-abcdef/patt.' ;
    }else{
        url = '../libs/AR/data/patt.';
    }

    var markerControls = new ARjs.MarkerControls(arToolkitContext, marker, {
        type : 'pattern',
        patternUrl : url + markerNames[i],
    })
    let markerGroup = new THREE.Group();
    marker.add(markerGroup);
}

//----------------------------------------------------------------------------
// Adding object to the scene
var light = initDefaultSpotlight(scene, new THREE.Vector3(25, 30, 20)); 


//----------------------------------------------------------------------------
var man = null;
var playAction = true;
var time = 0;
var mixer = new Array();

// Load animated files
var sceneA = new THREE.Group();
loadGLTFFile('../assets/objects/windmill/','scene.gltf', true, sceneA, 0);

// Load animated files
var sceneB = new THREE.Group();
loadGLTFFile('../assets/objects/walkingMan/','scene.gltf', true, sceneB, 1);

var sceneC = new THREE.Group();
loadGLTFFile('../assets/objects/chair/','scene.gltf', true, sceneC, 2);

var sceneD = new THREE.Group();
loadGLTFFile('../assets/objects/orca/','scene.gltf', true, sceneD, 3);

var sceneF = new THREE.Group();
loadGLTFFile('../assets/objects/wooden_goose/','scene.gltf', true, sceneF, 4);


//----------------------------------------------------------------------------
// Render the whole thing on the page

// render the scene
onRenderFcts.push(function(){
	renderer.render( scene, camera );
})


function loadGLTFFile(modelPath, modelName, centerObject, sceneGroup, marker)
{
  var loader = new GLTFLoader( );
  loader.load( modelPath + modelName, function ( gltf ) {
    var obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child ) {
          child.castShadow = true;
      }
    });
    obj.traverse( function( node )
    {
      if( node.material ) node.material.side = THREE.DoubleSide;
    });

    // Only fix the position of the centered object
    // The man around will have a different geometric transformation
    if(centerObject)
    {
        obj = normalizeAndRescale(obj, 2);
        obj = fixPosition(obj);
    }
    
    //scene.add ( obj );
    sceneGroup.add( obj );
    markerArray[marker].children[0].add( sceneGroup );
    sceneGroup.visible = false;
    scene.add(sceneGroup);



    if(gltf.animations != 0){
        // Create animationMixer and push it in the array of mixers
        var mixerLocal = new THREE.AnimationMixer(obj);
        mixerLocal.clipAction( gltf.animations[0] ).play();
        mixer.push(mixerLocal);
    }
    
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


    var delta = clock.getDelta();
    // Animation control
    if (playAction)
    {
        for(var i = 0; i<mixer.length; i++)
        mixer[i].update( delta );
        //rotateMan(delta);
    }


    let lerpAmount = 0.5;

	if(markerArray[0].visible && markerArray[1].visible && markerArray[2].visible &&
       markerArray[3].visible && markerArray[4].visible){
        sceneA.visible = true;
  
        let p = markerArray[0].children[0].getWorldPosition();
        let q = markerArray[0].children[0].getWorldQuaternion();
        let s = markerArray[0].children[0].getWorldScale();
      
        sceneA.position.lerp(p, lerpAmount);
        sceneA.quaternion.slerp(q, lerpAmount);
        sceneA.scale.lerp(s, lerpAmount);
    }else{
        sceneA.visible = false;
    }

    if(markerArray[1].visible && markerArray[2].visible &&
       markerArray[3].visible && markerArray[4].visible){
        sceneB.visible = true;

        let p = markerArray[1].children[0].getWorldPosition();
        let q = markerArray[1].children[0].getWorldQuaternion();
        let s = markerArray[1].children[0].getWorldScale();

        sceneB.position.lerp(p, lerpAmount);
        sceneB.quaternion.slerp(q, lerpAmount);
        sceneB.scale.lerp(s, lerpAmount);
    }else{
        sceneB.visible = false;
    }
    
    if(markerArray[2].visible && markerArray[3].visible && markerArray[4].visible){
        sceneC.visible = true;
        
        let p = markerArray[2].children[0].getWorldPosition();
        let q = markerArray[2].children[0].getWorldQuaternion();
        let s = markerArray[2].children[0].getWorldScale();

        sceneC.position.lerp(p, lerpAmount);
        sceneC.quaternion.slerp(q, lerpAmount);
        sceneC.scale.lerp(s, lerpAmount);
    }else{
        sceneC.visible = false;
    }
    
    if(markerArray[3].visible && markerArray[4].visible){
        sceneD.visible = true;
        
        let p = markerArray[3].children[0].getWorldPosition();
        let q = markerArray[3].children[0].getWorldQuaternion();
        let s = markerArray[3].children[0].getWorldScale();
        let lerpAmount = 0.5;
        
        sceneD.position.lerp(p, lerpAmount);
        sceneD.quaternion.slerp(q, lerpAmount);
        sceneD.scale.lerp(s, lerpAmount);
    }else{
        sceneD.visible = false;
    }
    
    if(markerArray[4].visible){
        sceneF.visible = true;
        
        let p = markerArray[4].children[0].getWorldPosition();
        let q = markerArray[4].children[0].getWorldQuaternion();
        let s = markerArray[4].children[0].getWorldScale();
        
        sceneF.position.lerp(p, lerpAmount);
        sceneF.quaternion.slerp(q, lerpAmount);
        sceneF.scale.lerp(s, lerpAmount);
    }else{
        sceneF.visible = false;
    }

	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})
})

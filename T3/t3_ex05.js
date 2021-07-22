import * as THREE from  '../build/three.module.js';
import {ARjs}    from  '../libs/AR/ar.js';
import {initDefaultSpotlight} from "../libs/util/util.js";

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
var deltaTime = 0, totalTime = 0;

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
//var light = initDefaultSpotlight(scene, new THREE.Vector3(0,4,0));
var lightColor = "rgb(255,255,255)";
var lightPosition = new THREE.Vector3(0,0,0);
var pointLight = new THREE.PointLight(lightColor);
setPointLight(lightPosition);

let loader = new THREE.TextureLoader();
	
var sphere = new THREE.Mesh(
	new THREE.SphereGeometry(0.25, 32, 32),
	new THREE.MeshLambertMaterial({ 
		map: loader.load("textures/esfera.jpg")
	})
);

scene.add(sphere);

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
  pointLight.castShadow = true;
  pointLight.visible = true;
  pointLight.penumbra = 0.5;

  scene.add(pointLight);
}

// create a function p() that passes through the points (0,p0), (1,p1), (2,p2) 
//  and evaluate that function at time t.
function parabolaEvaluate(p0, p1, p2, t)
{
	return ( 0.5*(p0 - 2*p1 + p2) )*t*t + ( -0.5*(3*p0 - 4*p1 + p2) )*t + ( p0 );
	//return ( 0.5*(p0 - 2*p1 + p2) )*t*t + ( -0.5*(3*p0 - 4*p1 + p2) )*t + ( p0 );
}

function parabolicPath( pointStart, pointEnd, time )
{
	let pointMiddle = new THREE.Vector3().addVectors( pointStart, pointEnd ).multiplyScalar(0.5).add( new THREE.Vector3(0,0,0) );
	return new THREE.Vector3(
		parabolaEvaluate( pointStart.x, pointMiddle.x, pointEnd.x, time ),
		parabolaEvaluate( pointStart.y, pointMiddle.y, pointEnd.y, time ),
		parabolaEvaluate( pointStart.z, pointMiddle.z, pointEnd.z, time )
	);	
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

	deltaTime = clock.getDelta();
	totalTime += deltaTime;

	if ( markerArray[0].visible && markerArray[1].visible )
	{	sphere.visible = true;
		sphere.rotation.z += 0.1

		let p, aux;

		aux = Math.floor(markerArray[0].getWorldPosition().x); 

		if(aux < 0){ //hiro mão direita
			
			p = parabolicPath( markerArray[0].getWorldPosition(), markerArray[1].getWorldPosition(), (totalTime/0.5) % 3 - 1 );
			
			if(Math.floor(markerArray[0].getWorldPosition().x) <= Math.floor( p.x) && Math.floor( p.x) <= Math.floor(markerArray[1].getWorldPosition().x)){	
				sphere.position.copy( p );
			}
				
			p = parabolicPath( markerArray[1].getWorldPosition(), markerArray[0].getWorldPosition(), (totalTime/0.5) % 4 - 1 );
					
			if(Math.floor(markerArray[1].getWorldPosition().x) >= Math.floor( p.x) && Math.floor( p.x) >= Math.floor(markerArray[0].getWorldPosition().x)){	
				sphere.position.copy( p );
			}
		}else{
			p = parabolicPath( markerArray[1].getWorldPosition(), markerArray[0].getWorldPosition(), (totalTime/0.5) % 4 - 1 );
					
			if(Math.floor(markerArray[1].getWorldPosition().x) <= Math.floor( p.x) && Math.floor( p.x) <= Math.floor(markerArray[0].getWorldPosition().x)){	
				sphere.position.copy( p );
			}

			p = parabolicPath( markerArray[0].getWorldPosition(), markerArray[1].getWorldPosition(), (totalTime/0.5) % 3 - 1 );
			
			if(Math.floor(markerArray[0].getWorldPosition().x) >= Math.floor( p.x) && Math.floor( p.x) >= Math.floor(markerArray[1].getWorldPosition().x)){	
				sphere.position.copy( p );
			}
		}
	}

	else if ( markerArray[0].visible)
	{
		let p = markerArray[0].getWorldPosition();
		sphere.visible = true;
		sphere.position.copy( p );
	}

	else if ( markerArray[1].visible )
	{
		let p = markerArray[1].getWorldPosition();
		sphere.visible = true;
		sphere.position.copy( p );
	}

	else{
		sphere.visible = false;
	}

	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})
})

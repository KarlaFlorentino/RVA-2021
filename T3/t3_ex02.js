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

var markerNames = ["a", "b", "c", "d", "f", "g", "hiro", "kanji"];

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

var colorArray   = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0000ff, 0xcc00ff];

//A
var meshA = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[0], transparent:true, opacity:0.5}) 
);

var sceneA = new THREE.Group();
meshA.position.y = 1.25/2;
sceneA.add(meshA);
markerArray[0].children[0].add( sceneA);
sceneA.visible = false;
scene.add(sceneA);

//B
var meshB = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[1], transparent:true, opacity:0.5}) 
);

var sceneB = new THREE.Group();
meshB.position.y = 1.25/2;
sceneB.add(meshB);
markerArray[1].children[0].add( sceneB);
sceneB.visible = false;
scene.add(sceneB);

//C
var meshC = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[2], transparent:true, opacity:0.5}) 
);

var sceneC = new THREE.Group();
meshC.position.y = 1.25/2;
sceneC.add(meshC);
markerArray[2].children[0].add( sceneC);
sceneC.visible = false;
scene.add(sceneC);

//D
var meshD = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[3], transparent:true, opacity:0.5}) 
);

var sceneD = new THREE.Group();
meshD.position.y = 1.25/2;
sceneD.add(meshD);
markerArray[3].children[0].add( sceneD);
sceneD.visible = false;
scene.add(sceneD);

//F
var meshF = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[4], transparent:true, opacity:0.5}) 
);

var sceneF = new THREE.Group();
meshF.position.y = 1.25/2;
sceneF.add(meshF);
markerArray[4].children[0].add( sceneF);
sceneF.visible = false;
scene.add(sceneF);

//G
var meshG = new THREE.Mesh( 
    new THREE.BoxGeometry(1.25,1.25,1.25), 
    new THREE.MeshPhongMaterial({color:colorArray[5], transparent:true, opacity:0.5}) 
);

var sceneG = new THREE.Group();
meshG.position.y = 1.25/2;
sceneG.add(meshG);
markerArray[5].children[0].add( sceneG);
sceneG.visible = false;
scene.add(sceneG);


//Todos
//G
var mesh = new THREE.Mesh( 
    new THREE.BoxGeometry(4,1.25,4), 
    new THREE.MeshPhongMaterial({color:colorArray[5], transparent:true, opacity:0.5}) 
);

var sceneAll = new THREE.Group();
mesh.position.y = 1.25/2;
sceneAll.add(mesh);
//markerArray[5].children[0].add( sceneAll);
sceneAll.visible = false;
scene.add(sceneAll);

//----------------------------------------------------------------------------
// Render the whole thing on the page

// render the scene
onRenderFcts.push(function(){
	renderer.render( scene, camera );
})


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

    let lerpAmount = 0.5;

	if ( markerArray[6].visible )
		{
            if(markerArray[0].visible){
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

            if(markerArray[1].visible){
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
            
            if(markerArray[2].visible){
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
            
            if(markerArray[3].visible){
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

            if(markerArray[5].visible){
                sceneG.visible = true;
                
                let p = markerArray[5].children[0].getWorldPosition();
                let q = markerArray[5].children[0].getWorldQuaternion();
                let s = markerArray[5].children[0].getWorldScale();
                
                sceneG.position.lerp(p, lerpAmount);
                sceneG.quaternion.slerp(q, lerpAmount);
                sceneG.scale.lerp(s, lerpAmount);
            }else{
                sceneG.visible = false;
            }

        }else{
            sceneA.visible = false;
            sceneB.visible = false;
            sceneC.visible = false;
            sceneD.visible = false;
            sceneF.visible = false;
            sceneG.visible = false;

        }

        if ( markerArray[7].visible ){

            for(var i = 0; i < markerArray.length - 2; i++){
                if(markerArray[i].visible){
                    sceneAll.visible = true;

                    let p = markerArray[i].children[0].getWorldPosition();
                    let q = markerArray[i].children[0].getWorldQuaternion();
                    let s = markerArray[i].children[0].getWorldScale();
                    
                    sceneAll.position.lerp(p, lerpAmount);
                    sceneAll.quaternion.slerp(q, lerpAmount);
                    sceneAll.scale.lerp(s, lerpAmount);

                    break;
                }
            }

        }else{
            sceneAll.visible = false;
        }


	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})
})

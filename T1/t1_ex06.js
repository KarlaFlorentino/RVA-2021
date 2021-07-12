import * as THREE from  '../build/three.module.js';
import Stats from       '../build/jsm/libs/stats.module.js';
import {GUI} from       '../build/jsm/libs/dat.gui.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import {initRenderer, 
        InfoBox,
        SecondaryBox,
        createGroundPlane,
        onWindowResize, 
        degreesToRadians, 
        createLightSphere} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var stats = new Stats();          // To show FPS information

var renderer = initRenderer();    // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 42)");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(0.0, 1.62, 5.0);
  camera.up.set( 0, 1, 0 );
var objColor = "rgb(255,255,255)";

var angle = 1;
var speed = 0.05;
var animationOn = true; // control if animation is on or of

// To use the keyboard
var keyboard = new KeyboardState();

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// create plane
var planeGeometry = new THREE.PlaneGeometry(3,3,3,3);
var planeMaterial = new THREE.MeshLambertMaterial({color:"rgb(255,255,0)", side:THREE.DoubleSide});
planeGeometry.rotateX(degreesToRadians(-90));
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
scene.add(plane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 1.5 );
  axesHelper.visible = false;
scene.add( axesHelper );

// Show text information onscreen
showInformation();

var infoBox = new SecondaryBox("");

// Teapot
var geometry = new TeapotGeometry(0.5);
var material = new THREE.MeshPhongMaterial({color:objColor, shininess:"200"});
  material.side = THREE.DoubleSide;
var obj = new THREE.Mesh(geometry, material);
  obj.castShadow = true;
  obj.position.set(0.0, 0.5, 0.0);
  obj.rotateY(180);
scene.add(obj);

//Barras verticais
var cylinderGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.5, 25);
var cylinderMaterial = new THREE.MeshLambertMaterial();
    
var c1 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
c1.position.set(1.47, 0.751, 1.47);
scene.add(c1);

var c2 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
c2.position.set(1.47, 0.751, -1.47);
scene.add(c2);

var c3 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
c3.position.set(-1.47, 0.751, -1.47);
scene.add(c3);

var c4 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
c4.position.set(-1.47, 0.751, 1.47);
scene.add(c4);

//Barras horizontais
var cylinderGeometry2 = new THREE.CylinderGeometry(0.01, 0.01, 2.95, 25);

//Barra azul
var c5 = new THREE.Mesh( cylinderGeometry2, cylinderMaterial );
c5.rotateX(degreesToRadians(-90));
c5.position.set(-1.47, 1.5, 0.0);
scene.add(c5);

//barra vermelho
var c6 = new THREE.Mesh( cylinderGeometry2, cylinderMaterial );
c6.rotateX(degreesToRadians(-90));
c6.position.set(1.47, 1.5, 0.0);
scene.add(c6);

//barra verde
var c7 = new THREE.Mesh( cylinderGeometry2, cylinderMaterial );
c7.rotateZ(degreesToRadians(-90));
c7.position.set(0.0, 1.5, 1.47);
scene.add(c7);

//Luzes

var ambientColor = "rgb(50,50,50)";
// More info here: https://threejs.org/docs/#api/en/lights/AmbientLight
var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

//---------------------------------------------------------
//Light Verde
var lightPosition = new THREE.Vector3(0.0, 1.5, 1.47);
var lightColor = "rgb(0,255,0)";
var lightSphere = createLightSphere(scene, 0.05, 10, 10, lightPosition);
lightSphere.material.color.set("rgb(0,255,0)");
var spotLight1 = new THREE.SpotLight(lightColor);
setSpotLight1(lightPosition);

//---------------------------------------------------------
//Light Vermelho
var lightPosition2 = new THREE.Vector3(1.47, 1.5, 0.0);
var lightColor2 = "rgb(255,0,0)";
var lightSphere2 = createLightSphere(scene, 0.05, 10, 10, lightPosition2);
lightSphere2.material.color.set("rgb(255,0,0)");
var spotLight2 = new THREE.SpotLight(lightColor2);
setSpotLight2(lightPosition2);

//---------------------------------------------------------
//Light Azul
var lightPosition3 = new THREE.Vector3(-1.47, 1.5, 0.0);
var lightColor3 = "rgb(0,0,255)";
var lightSphere3 = createLightSphere(scene, 0.05, 10, 10, lightPosition3);
lightSphere3.material.color.set("rgb(0,0,255)");
var spotLight3 = new THREE.SpotLight(lightColor3);
setSpotLight3(lightPosition3);

buildInterface();
render();

function rotate()
{
  // More info:
  // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
  obj.matrixAutoUpdate = false;

  // Set angle's animation speed
  if(animationOn)
  {
    angle+=speed;
    
    var mat4 = new THREE.Matrix4();
    obj.matrix.identity();

    obj.matrix.multiply(mat4.makeRotationY(angle));
    obj.matrix.multiply(mat4.makeTranslation(0.0, 0.50, 0.0));
  }
}


// Set Spotlight
// More info here: https://threejs.org/docs/#api/en/lights/SpotLight
function setSpotLight1(position)
{
  spotLight1.position.copy(position);
  spotLight1.shadow.mapSize.width = 512;
  spotLight1.shadow.mapSize.height = 512;
  spotLight1.angle = degreesToRadians(40);    
  spotLight1.castShadow = true;
  spotLight1.decay = 2;
  spotLight1.penumbra = 0.5;

  scene.add(spotLight1);
}

function setSpotLight2(position)
{
  spotLight2.position.copy(position);
  spotLight2.shadow.mapSize.width = 512;
  spotLight2.shadow.mapSize.height = 512;
  spotLight2.angle = degreesToRadians(40);    
  spotLight2.castShadow = true;
  spotLight2.decay = 2;
  spotLight2.penumbra = 0.5;

  scene.add(spotLight2);
}


function setSpotLight3(position)
{
  spotLight3.position.copy(position);
  spotLight3.shadow.mapSize.width = 512;
  spotLight3.shadow.mapSize.height = 512;
  spotLight3.angle = degreesToRadians(40);    
  spotLight3.castShadow = true;
  spotLight3.decay = 2;
  spotLight3.penumbra = 0.5;

  scene.add(spotLight3);
}

function updateLightPosition2()
{
  spotLight2.position.copy(lightPosition2);
  lightSphere2.position.copy(lightPosition2);
  infoBox.changeMessage("Light Position: " + lightPosition2.x.toFixed(2) + ", " +
                          lightPosition2.y.toFixed(2) + ", " + lightPosition2.z.toFixed(2));
}

function updateLightPosition()
{
  spotLight1.position.copy(lightPosition);
  lightSphere.position.copy(lightPosition);
  infoBox.changeMessage("Light Position: " + lightPosition.x.toFixed(2) + ", " +
                          lightPosition.y.toFixed(2) + ", " + lightPosition.z.toFixed(2));
}


function updateLightPosition3()
{
  spotLight3.position.copy(lightPosition3);
  lightSphere3.position.copy(lightPosition3);
  infoBox.changeMessage("Light Position: " + lightPosition3.x.toFixed(2) + ", " +
                          lightPosition3.y.toFixed(2) + ", " + lightPosition3.z.toFixed(2));
}


function buildInterface()
{
  //------------------------------------------------------------
  // Interface
  var controls = new function ()
  {
    this.ambientLight = true;
    this.spotLight1 = true;
    this.spotLight2 = true;
    this.spotLight3 = true;

    this.onChangeAnimation = function(){
        animationOn = !animationOn;
      };

    this.speed = 0.05;

    this.onEnableAmbientLight = function(){
      ambientLight.visible = this.ambientLight;
    };

    this.onEnableGreenLight = function(){
      spotLight1.visible = this.spotLight1;
    };

    this.onEnableRedLight = function(){
      spotLight2.visible = this.spotLight2;
    };

    this.onEnableBlueLight = function(){
      spotLight3.visible = this.spotLight3;
    };
  };

  var gui = new GUI();
  gui.add(controls, 'onChangeAnimation',true).name("Animation On/Off");
  gui.add(controls, 'ambientLight', true)
    .name("Ambient Light")
    .onChange(function(e) { controls.onEnableAmbientLight() });

  gui.add(controls, 'spotLight2', true)
    .name("Red Light")
    .onChange(function(e) { controls.onEnableRedLight() });
    
  gui.add(controls, 'spotLight1', true)
    .name("Green Light")
    .onChange(function(e) { controls.onEnableGreenLight() });

  gui.add(controls, 'spotLight3', true)
    .name("Blue Light")
    .onChange(function(e) { controls.onEnableBlueLight() });
}

function keyboardUpdate()
{
  keyboard.update();
  if ( keyboard.pressed("Q") )
  {
    if(lightPosition2.z + 0.05 <= 1.47){
        lightPosition2.z += 0.05;
        updateLightPosition2();
    }
    
  }
  if ( keyboard.pressed("E") )
  {
    if(lightPosition2.z - 0.05 >= -1.5){
        lightPosition2.z -= 0.05;
        updateLightPosition2();
    }
  }

  if ( keyboard.pressed("A") )
  {
    if(lightPosition.x - 0.05 >= -1.5){
        lightPosition.x -= 0.05;
        updateLightPosition();
    }
  }
  if ( keyboard.pressed("D") )
  {
    if(lightPosition.x + 0.05 <= 1.47){
        lightPosition.x += 0.05;
        updateLightPosition();
    }
  }

  if ( keyboard.pressed("Z") )
  {
    if(lightPosition3.z + 0.05 <= 1.5){
        lightPosition3.z += 0.05;
        updateLightPosition3();
    }
    
  }
  if ( keyboard.pressed("C") )
  {
    if(lightPosition3.z - 0.05 >= -1.47){
        lightPosition3.z -= 0.05;
        updateLightPosition3();
    }
  }
  
}

function showInformation()
{
  // Use this to show information onscreen
  var controls = new InfoBox();
    controls.add("Use the QE keys to move the light Red");
    controls.add("Use the AD keys to move the light Green");
    controls.add("Use the ZC keys to move the light Blue");
    controls.show();
}

function render()
{
  stats.update();
  trackballControls.update();
  rotate();
  keyboardUpdate();
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}

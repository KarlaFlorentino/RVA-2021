import * as THREE from  '../build/three.module.js';
import Stats from       '../build/jsm/libs/stats.module.js';
import {GUI} from       '../build/jsm/libs/dat.gui.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initDefaultSpotlight,
        onWindowResize, 
        degreesToRadians} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var stats = new Stats();          // To show FPS information
var light = initDefaultSpotlight(scene, new THREE.Vector3(25, 30, 20)); // Use default light
var renderer = initRenderer();    // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 42)");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(-0.3, 0.4, 0.6);
  camera.up.set( 0, 1, 0 );

var ambientColor = "rgb(50,50,50)";
var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

var angle = 1;
var speed = 0.05;
var animationOn = true; // control if animation is on or of

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// create plane
var planeGeometry = new THREE.PlaneGeometry(1,1,1,1);
var planeMaterial = new THREE.MeshLambertMaterial({color:"rgb(238,232,170)", side:THREE.DoubleSide});
planeGeometry.rotateX(degreesToRadians(-90));
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
scene.add(plane);

//Base
var baseGeometry = new THREE.BoxGeometry(0.06, 0.01, 0.06);
var baseMaterial = new THREE.MeshLambertMaterial({color:"rgb(128,128,128)"});
var base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.set(0.0, 0.01, 0.0);
scene.add(base);

//Torre
var torreGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 25);
var torreMaterial = new THREE.MeshLambertMaterial({color:"rgb(192,192,192)"}); 
var torre = new THREE.Mesh( torreGeometry, torreMaterial);
base.add(torre);

//Motor
var motor1Geometry = new THREE.BoxGeometry(0.06, 0.02, 0.02);
var motor1Material = new THREE.MeshPhongMaterial({color:"rgb(0,0,255)"});
var motor1 = new THREE.Mesh(motor1Geometry, motor1Material);
torre.add(motor1);

const curve = new THREE.EllipseCurve(
	0,  0,            // ax, aY
	0.01, 0.02,           // xRadius, yRadius
	0,  2 * Math.PI,  // aStartAngle, aEndAngle
	false,            // aClockwise
	0                 // aRotation
);

const points = curve.getPoints( 50 );
const motor2Geometry = new THREE.LatheGeometry( points );
const motor2Material = new THREE.MeshBasicMaterial({color:"rgb(0,0,205)"});
const motor2 = new THREE.Mesh( motor2Geometry, motor2Material );
motor1.add( motor2 );

//Pas
var pasGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.08, 25);
var pasMaterial = new THREE.MeshLambertMaterial({color:"rgb(220,220,220)"}); 

var pa1 = new THREE.Mesh( pasGeometry, pasMaterial);
motor2.add(pa1);

var pa2 = new THREE.Mesh( pasGeometry, pasMaterial);
motor2.add(pa2);

var pa3 = new THREE.Mesh( pasGeometry, pasMaterial);
motor2.add(pa3);


var pas2Geometry = new THREE.CylinderGeometry(0.03, 0.008, 0.005, 25, 1, false, 0, Math.PI);
var pas2Material = new THREE.MeshLambertMaterial({color:"rgb(220,220,220)", side:THREE.DoubleSide});

var pa1_2 = new THREE.Mesh( pas2Geometry, pas2Material);
pa1.add(pa1_2);

var pa2_2 = new THREE.Mesh( pas2Geometry, pas2Material);
pa2.add(pa2_2);

var pa3_2 = new THREE.Mesh( pas2Geometry, pas2Material);
pa3.add(pa3_2);


buildInterface();
render();

function rotate()
{
  torre.matrixAutoUpdate = false;
  
  motor1.matrixAutoUpdate = false;
  
  motor2.matrixAutoUpdate = false;
  
  pa1.matrixAutoUpdate = false;
  pa1_2.matrixAutoUpdate = false;
  
  pa2.matrixAutoUpdate = false;
  pa2_2.matrixAutoUpdate = false;
   
  pa3.matrixAutoUpdate = false;
  pa3_2.matrixAutoUpdate = false;
  
  if(animationOn)
  {
    angle+=speed;
    
    var mat4 = new THREE.Matrix4();
    
    torre.matrix.identity();

    motor1.matrix.identity();

    motor2.matrix.identity();

    pa1.matrix.identity();
    pa1_2.matrix.identity();
    
    pa2.matrix.identity();
    pa2_2.matrix.identity();

    pa3.matrix.identity();
    pa3_2.matrix.identity();
    
    torre.matrix.multiply(mat4.makeTranslation(0.0, 0.095, 0.0));

    motor1.matrix.multiply(mat4.makeTranslation(0.0, 0.095, 0.0));
  
    motor2.matrix.multiply(mat4.makeRotationX(angle));
    motor2.matrix.multiply(mat4.makeRotationZ(degreesToRadians(-90)));
    motor2.matrix.multiply(mat4.makeRotationX(degreesToRadians(180)));
    motor2.matrix.multiply(mat4.makeTranslation(0.0, 0.03, 0.0));
    
    pa1.matrix.multiply(mat4.makeRotationY(degreesToRadians(60)));
    pa1.matrix.multiply(mat4.makeRotationZ(degreesToRadians(90)));
    pa1.matrix.multiply(mat4.makeTranslation(0.01, 0.04, 0.0));

    pa2.matrix.multiply(mat4.makeRotationY(degreesToRadians(-60)));
    pa2.matrix.multiply(mat4.makeRotationZ(degreesToRadians(90)));
    pa2.matrix.multiply(mat4.makeTranslation(0.01, 0.04, 0.0));

    pa3.matrix.multiply(mat4.makeRotationZ(degreesToRadians(-90)));
    pa3.matrix.multiply(mat4.makeTranslation(-0.01, 0.04, 0.0));

    pa1_2.matrix.multiply(mat4.makeRotationY(degreesToRadians(-180)));
    pa1_2.matrix.multiply(mat4.makeRotationX(degreesToRadians(90)));
    pa1_2.matrix.multiply(mat4.makeTranslation(0.0, 0.0, -0.01));

    pa2_2.matrix.multiply(mat4.makeRotationY(degreesToRadians(-180)));
    pa2_2.matrix.multiply(mat4.makeRotationX(degreesToRadians(90)));
    pa2_2.matrix.multiply(mat4.makeTranslation(0.0, 0.0, -0.01));

    pa3_2.matrix.multiply(mat4.makeRotationX(degreesToRadians(90)));
    pa3_2.matrix.multiply(mat4.makeTranslation(0.0, 0.0, -0.01));
  }
}


function buildInterface()
{
  //------------------------------------------------------------
  // Interface
  var controls = new function ()
  {
    this.ambientLight = true;

    this.onChangeAnimation = function(){
        animationOn = !animationOn;
      };
    this.speed = 0.05;

    this.changeSpeed = function(){
      speed = this.speed;
    };

    this.onEnableAmbientLight = function(){
      ambientLight.visible = this.ambientLight;
    };
  };

  var gui = new GUI();
  gui.add(controls, 'onChangeAnimation',true).name("Animation On/Off");
  gui.add(controls, 'speed', 0.05, 0.5)
    .onChange(function(e) { controls.changeSpeed() })
    .name("Change Speed");
}

function render()
{
  stats.update();
  trackballControls.update();
  rotate();
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}
//-- Imports -------------------------------------------------------------------------------------
import * as THREE from '../build/three.module.js';
import { VRButton } from '../build/jsm/webxr/VRButton.js';
import { ImprovedNoise } from '../build/jsm/math/ImprovedNoise.js';
import {onWindowResize,
		degreesToRadians} from "../libs/util/util.js";

import Stats from '../build/jsm/libs/stats.module.js';
import { Sky } from './assets/objects/Sky/Sky.js';


//-----------------------------------------------------------------------------------------------
//-- MAIN SCRIPT --------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

//--  General globals ---------------------------------------------------------------------------
window.addEventListener( 'resize', onWindowResize );

//-- Renderer settings ---------------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.xr.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
	renderer.shadowMap.enabled = true;

//-- Setting scene and camera -------------------------------------------------------------------
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 1000 );
let moveCamera; // Move when a button is pressed 

//-- 'Camera Holder' to help moving the camera
const cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.position.set(0,5,20);
scene.add( cameraHolder );
//-- Create VR button and settings ---------------------------------------------------------------
document.body.appendChild( VRButton.createButton( renderer ) );

// controllers
var controller1 = renderer.xr.getController( 0 );
	controller1.addEventListener( 'selectstart', onSelectStart );
	controller1.addEventListener( 'selectend', onSelectEnd );
camera.add( controller1 );

let container = document.getElementById( 'container' );
container.appendChild( renderer.domElement );

let sky, sun, water;
let mesh;
let group = new THREE.Group(); 	

const effectController = {
    turbidity: 10,
    rayleigh: 1,
    mieCoefficient: 0.01,
    mieDirectionalG: 0.999,
    elevation: 60,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
};

const stats = Stats();
document.body.appendChild(stats.dom);

//-- Creating Scene and calling the main loop ----------------------------------------------------
createScene();
animate();

//------------------------------------------------------------------------------------------------
//-- FUNCTIONS -----------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

function move()
{
	if(moveCamera)
	{
		// Get Camera Rotation
		let quaternion = new THREE.Quaternion();
		quaternion = camera.quaternion;

		// Get direction to translate from quaternion
		var moveTo = new THREE.Vector3(0, 0, -0.1);
		moveTo.applyQuaternion(quaternion);

		// Move the camera Holder to the computed direction
		cameraHolder.translateX(moveTo.x);
		cameraHolder.translateY(moveTo.y);
		cameraHolder.translateZ(moveTo.z);	
	}
}

function onSelectStart( ) 
{
	moveCamera = true;
}

function onSelectEnd( ) 
{
	moveCamera = false;
}

function sunrise_to_sunset(){

    //Amanhecer
    if(effectController.elevation < 10){
        effectController.turbidity = 2;
        effectController.rayleigh = 1;
        effectController.mieCoefficient = 0.005;
        effectController.mieDirectionalG = 0.950;
    }

    //Ao longo do dia
    else if(effectController.elevation > 10 && effectController.elevation < 177){
        effectController.turbidity = 10;
        effectController.rayleigh = 3;
        effectController.mieCoefficient = 0.05;
        effectController.mieDirectionalG = 0.999;
    }
       
    //Por do sol
    else if(effectController.elevation > 177){
        effectController.turbidity = 20;
        effectController.rayleigh = 3;
        effectController.mieCoefficient = 0.005;
        effectController.mieDirectionalG = 0.950;
    }
    
    if(effectController.elevation < 180){
        effectController.elevation += 0.03;
    }else{
        effectController.elevation = 0.7;
    }    
        
    const phi = THREE.MathUtils.degToRad( 180 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    guiChanged();
}

//-- Main loop -----------------------------------------------------------------------------------
function animate() {
	renderer.setAnimationLoop( render );
}

function render() {
    stats.update();

    //sunrise_to_sunset();
    
    move();
	renderer.render( scene, camera );
}

//------------------------------------------------------------------------------------------------
//-- Scene and auxiliary functions ---------------------------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Create Scene --------------------------------------------------------------------------------
function createScene(){
    // Load all textures 
     var textureLoader = new THREE.TextureLoader();
     var floor 	= textureLoader.load('../assets/textures/sand.jpg');		

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    planeGeometry.translate(0.0, 0.0, 1); // To avoid conflict with the axeshelper
    var planeMaterial = new THREE.MeshBasicMaterial({
        map: floor,
        side: THREE.DoubleSide,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(degreesToRadians(-90));
    // add the plane to the scene
    scene.add(plane);

	initSky();
    
    for (var i = 0; i < 50; i++) {
        var random_x = Math.random() * (1000 - -1000) + -1000; // valor retornado será maior ou igual a min, e menor que max.
        var random_z = Math.random() * (1000 - -1000) + -1000;
        var random_scale = Math.random() * (10 - 100) + 100;

        var object = cloud();

        object.position.x = random_x;
		object.position.y = 500;
		object.position.z = random_z + 0.5;
		object.scale.set(random_scale * 5, random_scale, random_scale);
        
        group.add(object);
    }

    scene.add(group);

}

function cloud(){
    // Texture
    const size = 128;
    const data = new Uint8Array( size * size * size );

    let i = 0;
    const scale = 0.05;
    const perlin = new ImprovedNoise();
    const vector = new THREE.Vector3();

    for ( let z = 0; z < size; z ++ ) {
        for ( let y = 0; y < size; y ++ ) {
            for ( let x = 0; x < size; x ++ ) {
                const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
                data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
                i ++;

            }
        }
    }

    const texture = new THREE.DataTexture3D( data, size, size, size );
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;

    // Material

    const vertexShader = /* glsl */`
        in vec3 position;
        uniform mat4 modelMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 cameraPos;
        out vec3 vOrigin;
        out vec3 vDirection;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
            vDirection = position - vOrigin;
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = /* glsl */`
        precision highp float;
        precision highp sampler3D;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        in vec3 vOrigin;
        in vec3 vDirection;
        out vec4 color;
        uniform vec3 base;
        uniform sampler3D map;
        uniform float threshold;
        uniform float range;
        uniform float opacity;
        uniform float steps;
        uniform float frame;
        uint wang_hash(uint seed)
        {
                seed = (seed ^ 61u) ^ (seed >> 16u);
                seed *= 9u;
                seed = seed ^ (seed >> 4u);
                seed *= 0x27d4eb2du;
                seed = seed ^ (seed >> 15u);
                return seed;
        }
        float randomFloat(inout uint seed)
        {
                return float(wang_hash(seed)) / 4294967296.;
        }
        vec2 hitBox( vec3 orig, vec3 dir ) {
            const vec3 box_min = vec3( - 0.5 );
            const vec3 box_max = vec3( 0.5 );
            vec3 inv_dir = 1.0 / dir;
            vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
            vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
            vec3 tmin = min( tmin_tmp, tmax_tmp );
            vec3 tmax = max( tmin_tmp, tmax_tmp );
            float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
            float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
            return vec2( t0, t1 );
        }
        float sample1( vec3 p ) {
            return texture( map, p ).r;
        }
        float shading( vec3 coord ) {
            float step = 0.01;
            return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
        }
        void main(){
            vec3 rayDir = normalize( vDirection );
            vec2 bounds = hitBox( vOrigin, rayDir );
            if ( bounds.x > bounds.y ) discard;
            bounds.x = max( bounds.x, 0.0 );
            vec3 p = vOrigin + bounds.x * rayDir;
            vec3 inc = 1.0 / abs( rayDir );
            float delta = min( inc.x, min( inc.y, inc.z ) );
            delta /= steps;
            // Jitter
            // Nice little seed from
            // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
            uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
            vec3 size = vec3( textureSize( map, 0 ) );
            float randNum = randomFloat( seed ) * 2.0 - 1.0;
            p += rayDir * randNum * ( 1.0 / size );
            //
            vec4 ac = vec4( base, 0.0 );
            for ( float t = bounds.x; t < bounds.y; t += delta ) {
                float d = sample1( p + 0.5 );
                d = smoothstep( threshold - range, threshold + range, d ) * opacity;
                float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
                ac.rgb += ( 1.0 - ac.a ) * d * col;
                ac.a += ( 1.0 - ac.a ) * d;
                if ( ac.a >= 0.95 ) break;
                p += rayDir * delta;
            }
            color = ac;
            if ( color.a == 0.0 ) discard;
        }
    `;

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.RawShaderMaterial( {
        glslVersion: THREE.GLSL3,
        uniforms: {
            base: { value: new THREE.Color( 0x798aa0 ) },
            map: { value: texture },
            cameraPos: { value: new THREE.Vector3() },
            threshold: { value: 0.25 },
            opacity: { value: 0.25 },
            range: { value: 0.1 },
            steps: { value: 100 },
            frame: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide, //THREE.BackSide 
        transparent: true
    } );

    mesh = new THREE.Mesh( geometry, material );
    return mesh;
}

function guiChanged(){

    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );
    //water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render( scene, camera );

}

function initSky(){

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    sun = new THREE.Vector3();

    /// GUI

    /*const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };*/

    /*const gui = new GUI();

    gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'elevation', 0, 180, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );
    
    */
    guiChanged();

}

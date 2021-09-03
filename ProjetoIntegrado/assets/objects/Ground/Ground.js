//=========================================================================================================
//  SHADER ISLAND II
//=========================================================================================================
//  Aleksander Yacovenco
//  Mestrado em Computação Gráfica UFJF
//  Realidade Virtual e Aumentada 2021/2
//  Prof. Rodrigo Luis
//---------------------------------------------------------------------------------------------------------
//  Feito com base no exemplo disponível em:
//  https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Shader-Heightmap-Textures.html
//=========================================================================================================

// MODULES
import * as THREE   from "../../../../build/three.module.js";

// SHADERS (AS MODULES)
import vshader from "./shaders/vertex.glsl.js";
import fshader from "./shaders/fragment.glsl.js";

class Ground extends THREE.Mesh
{
	constructor(b, h, u, v, s)
	{
		// TEXTURES
		var loader = new THREE.TextureLoader();
		var tex = [];
		var bumpTexture = loader.load("./assets/objects/Ground/images/heightmap.png");
		var normalTexture = loader.load("./assets/objects/Ground/images/normalmap.png");
		for (var i = 0; i < 5; i++)
		{
			tex.push(loader.load("./assets/objects/Ground/images/tex" + i.toString() + ".jpg"));
			tex[i].wrapS = tex[i].wrapT = THREE.RepeatWrapping;
		}

		// GLSL UNIFORMS
		var lightDir = new THREE.Vector3(1, 15, -1);
		var customUniforms =
		{
			bumpTexture:    { type: "t", value: bumpTexture          },
			normalTexture:  { type: "t", value: normalTexture        },
			bumpScale:      { type: "f", value: h                    },
			mapScale:       { type: "f", value: s                    },
			tex1:           { type: "t", value: tex[0]               },
			tex2:           { type: "t", value: tex[1]               },
			tex3:           { type: "t", value: tex[2]               },
			tex4:           { type: "t", value: tex[3]               },
			tex5:           { type: "t", value: tex[4]               },
			lightDirection: {            value: lightDir.normalize() }
		};

		// SHADER MATERIAL
		var customMaterial = new THREE.ShaderMaterial(
		{
			uniforms: customUniforms,
			vertexShader: vshader,
			fragmentShader: fshader,
		});

		// SHADER ISLAND
		var planeGeo = new THREE.PlaneGeometry(b, b, u, v);
		super(planeGeo, customMaterial);
		this.rotation.x = -Math.PI / 2;
		this.position.y = 100 - h / 2; // em função da altura da ilha
	}
};

Ground.prototype.isGround = true;
export { Ground };

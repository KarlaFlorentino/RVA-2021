<<<<<<< HEAD
AFRAME.registerComponent('trees', {
  init: function () {
    
    // Solution for Getting Entities.
    var sceneEl = document.querySelector('a-scene');  // Or this.el since we're in a component.
    console.log(sceneEl);
    

    
    for (var i = 0; i < 60; i++) {
      var random_x = Math.random() * (50 - -50) + -50; // valor retornado será maior ou igual a min, e menor que max.
      var random_z = Math.random() * (50 - -50) + -50;
      var random_scale = Math.random() * (6 - 2) + 0.75;

      //Tronco 
      var cylinder = document.createElement('a-cylinder');
      cylinder.setAttribute('position', {x: random_x, y: random_scale, z: random_z+0.5});
      cylinder.setAttribute('geometry',{
        primitive: 'cylinder', 
        height: 2,
        radius: 0.07
      });

      cylinder.setAttribute('color', "#8A6922" );
      cylinder.setAttribute('shadow', "cast", "true");
      cylinder.setAttribute('scale', {x: random_scale, y: random_scale, z: random_scale});
      sceneEl.appendChild(cylinder);



      //Copa
      var cone = document.createElement('a-cone');
      cone.setAttribute('position', {x: random_x, y: 2*random_scale, z: random_z+0.5});
      cone.setAttribute('geometry', {
        radiusBottom: 0.5,
        radiusTop: 0,
        height: 1.5
      });

      cone.setAttribute('color', "#118E20" );
      cone.setAttribute('shadow', "cast", "false");
      cone.setAttribute('scale', {x: random_scale, y: random_scale, z: random_scale});
      sceneEl.appendChild(cone);

    }
  }
=======
AFRAME.registerComponent('trees', {
  init: function () {
    
    // Solution for Getting Entities.
    var sceneEl = document.querySelector('a-scene');  // Or this.el since we're in a component.
    console.log(sceneEl);
    

    
    for (var i = 0; i < 60; i++) {
      var random_x = Math.random() * (50 - -50) + -50; // valor retornado será maior ou igual a min, e menor que max.
      var random_z = Math.random() * (50 - -50) + -50;
      var random_scale = Math.random() * (6 - 2) + 0.75;

      //Tronco 
      var cylinder = document.createElement('a-cylinder');
      cylinder.setAttribute('position', {x: random_x, y: random_scale, z: random_z+0.5});
      cylinder.setAttribute('geometry',{
        primitive: 'cylinder', 
        height: 2,
        radius: 0.07
      });

      cylinder.setAttribute('color', "#8A6922" );
      cylinder.setAttribute('shadow', "cast", "true");
      cylinder.setAttribute('scale', {x: random_scale, y: random_scale, z: random_scale});
      sceneEl.appendChild(cylinder);



      //Copa
      var cone = document.createElement('a-cone');
      cone.setAttribute('position', {x: random_x, y: 2*random_scale, z: random_z+0.5});
      cone.setAttribute('geometry', {
        radiusBottom: 0.5,
        radiusTop: 0,
        height: 1.5
      });

      cone.setAttribute('color', "#118E20" );
      cone.setAttribute('shadow', "cast", "false");
      cone.setAttribute('scale', {x: random_scale, y: random_scale, z: random_scale});
      sceneEl.appendChild(cone);

    }
  }
>>>>>>> 6f32084b10c3da6f938005037a9f4b033358fab0
});
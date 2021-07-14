//https://stackoverflow.com/questions/53155581/cloning-entities-in-a-frame

//https://aframe.io/docs/1.2.0/introduction/javascript-events-dom-apis.html

AFRAME.registerComponent('cloneTree', {
  init: function () {
    // Solution for Handling Events.
    var sceneEl = document.querySelector('a-scene'); 
    var boxEl = sceneEl.querySelector('#tree1')

    

    /*boxEl.addEventListener('foo', function () {  
      boxEl.setAttribute('color', 'blue');  
    });
    boxEl.emit('foo');*/
  }
});
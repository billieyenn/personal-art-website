/* eslint-disable */

<template>
  <div>
    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-disable */
import P5 from 'p5'

let sketch = (config) => {
  return function (p) {

    // a shader variable
    let theShader;

    p.preload = () => {
      // load the shader
      // somehow the shader files like to be in the public directory 
      theShader = p.loadShader('/ShaderOne/shader.vert', '/ShaderOne/shader.frag');
    }

    p.setup = () => {
      // shaders require WEBGL mode to work
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.noStroke();
    }

    p.draw = () => {
      // shader() sets the active shader with our shader
      p.shader(theShader);

      // rect gives us some geometry on the screen
      p.rect(0,0,p.width,p.height);
      
      // print out the framerate
      //  print(frameRate());
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

  }
}

export default {
  data() {
    return {
      sketch: sketch,
      config: {
        key1: {
          type: 'number',
          value: 1
        }
      }
    }
  }
}
</script>

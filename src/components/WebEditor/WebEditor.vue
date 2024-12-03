<!--
A simple markdown editor.
-->
<template>
  <div>
    <Editor :modelValue="userCode" />
    <Canvas :sketchFunction="sketchFunction" />
  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import Editor from './Editor.vue';
import Canvas from './Canvas.vue';

export default {
  components: { 
        Editor, 
        Canvas
    },
  data() {
    return {
      userCode: `
function sketch(p) {
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(220);
  };

  p.draw = function() {
    p.fill(0);
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
}`,
    };
  },
  computed: {
    sketchFunction() {
      try {
        // Create a dynamic function from the user code
        const userFunction = new Function('p', this.userCode);
        return userFunction;
      } catch (error) {
        console.error('Error in user code:', error);
        return (p) => {};
      }
    },
  },
};
</script>

<template>
  <div class="web-editor-wrapper"> <!-- This wrapper overrides bootstrap and the annoying resizing jumps -->
    <div class="container">
      <Editor :modelValue="userCode" @update:modelValue="updateCode" />
      <Canvas :key="canvasKey" :sketchFunction="sketchFunction" />
    </div>
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
      userCode: `function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  fill(0);
  ellipse(mouseX, mouseY, 50, 50);
}`,
  canvasKey: 0
    };
  },
  computed: {
    sketchFunction() {
      return (p) => {
        try {
          // Evaluate the entire code as one block instead of extracting functions
          const sketch = new Function('p', `
            with(p) {
              ${this.userCode}
              return {
                setup,
                draw
              };
            }
          `)(p);
          
          p.setup = sketch.setup;
          p.draw = sketch.draw;
        } catch (error) {
          console.error('Error in user code:', error);
          p.setup = () => p.createCanvas(400, 400);
          p.draw = () => {};
        }
      };
    }
  },
  methods: {
    updateCode(newCode) {
      this.userCode = newCode;
      this.canvasKey++;
    },
  }
};
</script>

<style scoped>
.web-editor-wrapper {
  /* Reset any Bootstrap container styles */
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.web-editor-wrapper .container {
  /* Override Bootstrap's container class */
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.web-editor-wrapper .container {
  display: flex;
  height: 100vh; /* Full viewport height */
  margin: 0 !important;
  padding: 0 !important;
}
</style>
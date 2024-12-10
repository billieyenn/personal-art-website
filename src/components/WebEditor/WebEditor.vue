
<template>
  <div class="container">
    <Editor :modelValue="userCode" @update:modelValue="updateCode" />
    <Canvas :key="canvasKey" :sketchFunction="sketchFunction" />
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
.container {
  display: flex;
  flex-direction: row;
  height: 100vh; /* Full viewport height */
  margin: 0 !important;
  padding: 0 !important;
}

.container :deep(> *) {
  flex: 1;       /* Each child takes equal space */
  height: 100%;  /* Full height of container */
}

/* Target ace editor specifically */
.container :deep(.ace_editor) {
  width: 100% !important;
  height: 100% !important;
}
</style>
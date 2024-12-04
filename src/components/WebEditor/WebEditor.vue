
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
function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  fill(0);
  ellipse(mouseX, mouseY, 50, 50);
}`
    };
  },
  computed: {
    sketchFunction() {
      return (p) => {
        // Create a new scope for p5 instance
        try {
          const sketch = new Function('p', `
            return {
              setup() { 
                with(p) { 
                  ${this.extractFunction('setup', this.userCode)}
                }
              },
              draw() { 
                with(p) { 
                  ${this.extractFunction('draw', this.userCode)}
                }
              }
            }
          `)(p);
          
          p.setup = sketch.setup;
          p.draw = sketch.draw;
        } catch (error) {
          console.error('Error in user code:', error);
          // Provide empty default sketch on error
          p.setup = () => p.createCanvas(400, 400);
          p.draw = () => {};
        }
      };
    }
  },
  methods: {
    extractFunction(name, code) {
      const regex = new RegExp(`function\\s+${name}\\s*\\(\\)\\s*{([^}]*)}`, 'ms');
      const match = code.match(regex);
      return match ? match[1].trim() : '';
    }
  }
};
</script>
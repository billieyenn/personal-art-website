
<template>
  <div class="web-editor-wrapper"> <!-- This wrapper overrides bootstrap and the annoying resizing jumps -->
    <div class="container">
      <div class="editor-section">
        <div class="toolbar">
          <button class="toolbar-button" @click="resetToDefault">Reset to Default</button>
        </div>
        <Editor :modelValue="userCode" @update:modelValue="updateCode" />
      </div>
      <Canvas :key="canvasKey" :sketchFunction="sketchFunction" />
    </div>
  </div>
</template>

<script>

/* eslint-enable */
/* eslint-disable */
import Editor from './Editor.vue';
import Canvas from './Canvas.vue';

const STORAGE_KEY = 'p5js-editor-code';

const DEFAULT_CODE = `function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  fill(0);
  ellipse(mouseX, mouseY, 50, 50);
}`;

export default {
  components: { 
        Editor, 
        Canvas
    },
  data() {
    return {
      userCode: this.getInitialCode(),
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
    getInitialCode() {
      // Try to get code from localStorage first
      const savedCode = localStorage.getItem(STORAGE_KEY);
      if (savedCode) {
        return savedCode;
      }
      
      // Default code if nothing is saved
      return DEFAULT_CODE
    },
    updateCode(newCode) {
      this.userCode = newCode;
      this.canvasKey++;
      this.saveToCache(this.userCode);
    },
    saveToCache(code) {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    resetToDefault() {
      if (confirm('Are you sure you want to reset to the default code? This will delete your current code.')) {
        this.userCode = DEFAULT_CODE;
        this.canvasKey++;
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
  // Save code before user leaves the page
  beforeUnmount() {
    this.saveToCache(this.userCode);
  }
}
</script>

<style scoped>
.editor-section {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toolbar {
  background: #2F3129;
  padding: 8px;
  border-bottom: 1px solid #444;
}

.toolbar-button {
  background: #444;
  color: #fff;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
}

.toolbar-button:hover {
  background: #555;
}

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
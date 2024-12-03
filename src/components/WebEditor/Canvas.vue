
<template>
  <div ref="canvasContainer"></div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import p5 from 'p5'

export default {
  name: 'P5Canvas',
  props: {
    sketchFunction: {
      type: Function,
      required: true
    }
  },
  mounted () {
    this.p5Instance = new p5(this.sketchFunction, this.$refs.canvasContainer);
  },
  watch: {
    sketchFunction (newSketchFunction) {
      // Destroy the existing instance before creating a new one
      this.p5Instance.remove();
      this.p5Instance = new p5(newSketchFunction, this.$refs.canvasContainer);
    },
  },
  beforeUnmount () {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  },
};
</script>
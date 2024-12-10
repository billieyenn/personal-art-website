<template>
  <div class="container">
    <div ref="canvasContainer"></div>
  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import p5 from 'p5';

export default {
  name: 'P5Canvas',
  props: {
    sketchFunction: {
      type: Function,
      required: true,
    },
  },
  mounted() {
    console.log('Mounting P5Canvas...');
    this.p5Instance = new p5(this.sketchFunction, this.$refs.canvasContainer);
  },
  watch: {
    sketchFunction(newSketchFunction) {
      console.log('Updating sketch...');
      if (this.p5Instance) this.p5Instance.remove();
      this.p5Instance = new p5(newSketchFunction, this.$refs.canvasContainer);
    },
  },
  beforeUnmount() {
    console.log('Removing P5Canvas...');
    if (this.p5Instance) this.p5Instance.remove();
  },
};
</script>

<style scoped>
.container {
  border: 1px solid red;
}
</style>
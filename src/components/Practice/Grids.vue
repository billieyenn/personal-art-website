/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <button @click="refresh">Redraw</button>
    <div >
      <div id="canvas"></div>
    </div>

  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */

let sketch = (config) => {
  return function (p) {
    p.setup = function () {
      p.createCanvas(710, 400);
    }
    p.draw = function () {
      p.background(250)
      p.normalMaterial()

    }
  }
}
/* eslint-disable */

import P5 from 'p5'
export default {
  props: {
    msg: String
  },
  data () {
    return {
      config: {}
    }
  },
  async mounted () {


    this.p5canvas = new P5(sketch(this.config), 'canvas')

  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },

  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

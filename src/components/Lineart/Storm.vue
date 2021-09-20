<template>
  <div>
    <button @click="refresh">Redraw</button>
    <div >
      <div id="canvas" :key="componentKey"></div>
    </div>

  </div>
</template>

<script>
import P5 from 'p5'
import { curry } from '../../sketch'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      componentKey: 0,
      p5canvas: null,
      // storm
      config: {
        decay: 1.2,
        complexity: 500,
        symmetricity: false,
        rotation_directions: 2,
        background_shape_match_exactness: 0.001,
        bg_shape_complexity: 2,
        cycle_ratio: 0.3
      }
    }
  },
  mounted () {
    this.p5canvas = new P5(curry(this.config), 'canvas')
  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

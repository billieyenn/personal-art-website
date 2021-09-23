<template>
  <div>
    <button @click="refresh">Redraw</button>
    <div >
      <div id="canvas"></div>
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
      p5canvas: null,
      // slightly asymmetrical medium complex soft background
      config: {
        decay: 0.7,
        complexity: 100,
        symmetricity: false,
        rotation_directions: 1,
        background_shape_match_exactness: 0.05,
        bg_shape_complexity: 3,
        cycle_ratio: 1
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

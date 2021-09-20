<template>
  <div>
    <div >
      <div id="canvas"></div>
    </div>

  </div>
</template>

<script>
import P5 from 'p5'
import { curry } from '../../lineartexplainer'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      p5canvas: null,
      // interesting pure shapes
      config: {
        decay: 0.7,
        complexity: 7,
        symmetricity: false,
        rotation_directions: 2,
        cycle_ratio: 1
      }
    }
  },
  mounted () {
    this.p5canvas = new P5(curry(this.config), 'canvas')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

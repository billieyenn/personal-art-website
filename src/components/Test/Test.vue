/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <button @click="refresh">Redraw</button>
    <div >
      <div id="canvas" :key="componentKey"></div>
    </div>

  </div>
</template>

<script>
/* eslint-disable */

import P5 from 'p5'
// import { curry } from '../../sketch'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      componentKey: 0,
      p5canvas: null,
      // slightly asymmetrical high complex soft background
      config: {
        decay: 0.9,
        complexity: 100,
        symmetricity: false,
        rotation_directions: 1,
        background_shape_match_exactness: 0.05,
        bg_shape_complexity: 3,
        cycle_ratio: 1
      }
    }
  },
  async mounted () {
    const baseURI = 'https://raw.githubusercontent.com/billieyenn/perdurable/main/sketch.js'

    let sketch = await this.getSketch(baseURI, this.config)
    console.log(sketch)

    this.p5canvas = new P5(sketch, 'canvas')

  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
    async getSketch(url, config) {
      let result = await this.$http.get(url)
      const curry = new Function(result.data)()(config) // eslint-disable-line no-new-func
      console.log(curry)
      return curry
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

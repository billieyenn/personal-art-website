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
import { Grid } from '../../utils.js'

let sketch = (config) => {
  return function (p) {

    const displayRect = (x, y, scale, offsetX, offsetY) => {
      p.stroke(0)
      p.strokeWeight(1)
      p.push()
      p.translate(offsetX, offsetY)
      p.rect(scale * x, scale * y, scale, scale)
      p.pop()
    }

    const displayRectF = (scale, offsetX, offsetY) => {
      return (x, y, val) => {
        displayRect(x, y, scale, offsetX, offsetY)
              }
    }

    const nestedGridF = (scale, offsetX, offsetY) => {
      return (x, y, val) => {
        if (val instanceof Grid) {
          val.forEach(nestedGridF(scale / 3, x * scale, y * scale))
        } else {
          displayRect(x, y, scale, offsetX, offsetY)
        }
      }
    }

    p.setup = function () {
      p.ellipseMode(p.CORNER)
      p.createCanvas(710, 710);
      p.background(250)
      let scale = 300

      let cols = p.floor(p.width / scale)
      let rows = p.floor(p.height / scale)
      let g = new Grid(rows, cols)
      g.setVal(1, 1, new Grid(rows + 1, cols))
      g.forEach(nestedGridF(scale, 0, 0))
      // g.forEach(displayRectF(scale, 0, 0))
      // g.getVal(1, 0).forEach(
      //   displayRectF(scale/cols, 0, 0)
      //   )
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

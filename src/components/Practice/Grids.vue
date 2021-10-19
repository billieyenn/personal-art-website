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

    const displayRect = (x, y, width, height, offsetX, offsetY) => {
      p.stroke(0, 150)
      p.strokeWeight(1)
      p.push()
      p.translate(offsetX, offsetY)
      p.rect(width * x, height * y, width, height)
      p.pop()
    }

    const displayRectF = (width, height, offsetX, offsetY) => {
      return (x, y, val) => {
        displayRect(x, y, width, height, offsetX, offsetY)
              }
    }

    const nestedGridF = (width, height, offsetX, offsetY) => {
      return (x, y, val) => {
        if (val instanceof Grid) {
          val.forEach(nestedGridF(width / val.cols, height / val.rows, (offsetX || 0) + x * width, (offsetY || 0) + y * height))
        } else {
          displayRect(x, y, width, height, offsetX || 0, offsetY || 0)
        }
      }
    }

    p.setup = function () {
      p.createCanvas(4608 / 4, 8192 / 4);
      p.background(250)
      let cols = p.floor(p.random(1, 3))//p.floor(p.width / width)
      let rows = p.floor(p.random(1, 4))//p.floor(p.height / height)
      let width = p.width / cols//300 // of cell in grid
      let height = p.height / rows//700 // of cell in grid



      let g = new Grid(rows, cols)
      g.forEach((x, y) => {
        if (p.random(1) < 0.75) {
          let newGrid = new Grid(p.floor(p.random(1, 5)), p.floor(p.random(1, 3)))
          g.setVal(x, y, newGrid)
          newGrid.forEach((a, b) => {
            if (p.random(1) < 0.75){
              newGrid?.setVal(a, b, new Grid(p.floor(p.random(1, 5)), p.floor(p.random(1, 3)))) 
            }
          })
        }
      })

      g.forEach(nestedGridF(width, height, 0, 0))
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

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
import {colors as colors} from '../../colors.js'
import {flowField as FlowField} from '../../utils.js'


let sketch = (config) => {
  return function (p) {
    let scale = 5
    const increment = 0.01 // kind of 'zoom'
    let flowField
    let flowField2
    let flowField3
    let flowField4
    let rows
    let cols
    let offsetY = 0
    let rotationAngle = 137.5
    let colorAlpha = 255 / 2
    let dotSize = 2


    const displayDot = (p, x, y, val, scale, color, colorAlpha) => {
      p.noStroke()
      color.setAlpha(colorAlpha)
      p.fill(color)
      let size = val * scale * 2
      p.push()
      p.translate(x * scale - p.width/2, y * scale - p.height/2)
      p.ellipse(0,0,size,size)
      p.pop()
    }


    p.setup = function () {
      p.createCanvas(500, 500);
      p.background(p.color(colors.springWood))
      rows = p.floor(p.width / scale)
      cols = p.floor(p.height / scale)
      p.angleMode(p.DEGREES)
      p.blendMode(p.MULTIPLY)

      // pivot around center of screen 
      p.push()
      p.translate(p.width/2, p.height/2)
      //YELLOW

      FlowField(p, rows, cols, increment).forEach((row, y) => {
        row.forEach((val, x) => {
          displayDot(p, x, y, val, scale, p.color('#FFFF00'), colorAlpha)
        })
      })
      

      p.rotate(15)
      //CYAN

      FlowField(p, rows, cols, increment).forEach((row, y) => {
        row.forEach((val, x) => {
          displayDot(p, x, y, val, scale, p.color('#00FFFF'), colorAlpha)
        })
      })
      


      p.rotate(30)
      //MAGENTA

      FlowField(p, rows, cols, increment).forEach((row, y) => {
        row.forEach((val, x) => {
          displayDot(p, x, y, val, scale, p.color('#FF00FF'), colorAlpha)
        })
      })
 
      p.rotate(30)
      //BLACK

      FlowField(p, rows, cols, increment).forEach((row, y) => {
        row.forEach((val, x) => {
          displayDot(p, x, y, val, scale, p.color('#000000'), colorAlpha)
        })
      })




      p.pop()


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
    /*
    const baseURI = 'https://raw.githubusercontent.com/billieyenn/test-art/main/sketch.js'
    let sketch = await this.getSketch(baseURI, this.config)
    console.log(sketch)
    */

    this.p5canvas = new P5(sketch(), 'canvas')

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

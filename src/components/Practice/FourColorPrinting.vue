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
import {FlowField as FlowFieldClass} from '../../utils.js'


let sketch = (config) => {
  return function (p) {

    const displayDot = (p, x, y, val, scale, r, radius, color, colorAlpha) => {
        let size = val * scale * 2
        p.noStroke()
        color.setAlpha(colorAlpha)
        p.fill(color)
        p.push()
        p.rotate(r)
        p.translate(-radius, -radius)
        p.translate(x * scale, y * scale)
        p.ellipse(0, 0, size, size)
        p.pop()
    }

    const displayF = (scale, r, radius, color, colorAlpha) => {
      return (x, y, val) => {
        displayDot(p, x, y, val, scale, r, radius, color, colorAlpha)  
      }
    }

    // seems to work
    const isInCircle = (x_c, y_c, r) => {
      return (x_p, y_p) => {
        return p.sqrt( (x_p * scale - x_c) * (x_p * scale - x_c) + (y_p * scale - y_c) * (y_p * scale - y_c) ) < r
      }
    }


    const CYMKCircle = (p, diameter, scale) => {

      rows = p.floor(diameter / scale)
      cols = p.floor(diameter / scale)
      p.angleMode(p.DEGREES)
      p.blendMode(p.MULTIPLY)

      p.push()
//      p.translate(x, y) // pivot around center of shape 

      // YELLOW
      new FlowFieldClass(p, rows, cols, increment).display(
        displayF(scale, 0, diameter/2, p.color('#FFFF00'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )

      // CYAN
      new FlowFieldClass(p, rows, cols, increment).display(
        displayF(scale, 15, diameter/2, p.color('#00FFFF'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )

      // MAGENTA
      new FlowFieldClass(p, rows, cols, increment).display(
        displayF(scale, 45, diameter/2, p.color('#FF00FF'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )

      // BLACK
      
      new FlowFieldClass(p, rows, cols, increment).display(
        displayF(scale, 75, diameter/2, p.color('#000000'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )


      p.pop()
    }

    let scale = 10
    const increment = 0.01 // kind of 'zoom'
    let rows
    let cols
    let rotationAngle = 137.5
    let colorAlpha = 255 / 2

    p.setup = function () {
      p.createCanvas(1000, 1000);
      p.background(p.color(colors.springWood))

      const size = 500
      p.translate(250, 250)
      CYMKCircle(p, size, scale)

      p.translate(500, 0)
      CYMKCircle(p, size, scale)

      p.translate(-500, 500)
      CYMKCircle(p, size, scale)

      p.translate(500, 0)
      CYMKCircle(p, size, scale)

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

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
import {FlowField } from '../../utils.js'
import {Grid as Grid} from '../../utils.js'


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

    // there may be an issue somewhere, but the whole thing works if x_c == y_c == r
    const isInCircle = (x_c, y_c, r) => {
      return (x_p, y_p) => {
        return p.sqrt( (x_p * scale - x_c) * (x_p * scale - x_c) + (y_p * scale - y_c) * (y_p * scale - y_c) ) < r
      }
    }

    const isInRect = (x, y, w, h) => {
      return (x_p, y_p) => {
        return x_p > x
            && x_p < x + w
            && y_p > y
            && y_p < y + h
      }
    }

    const CYMKCircle = (p, diameter, scale, increment, colorAlpha) => {

      let rows = p.floor(diameter / scale)
      let cols = p.floor(diameter / scale)
      p.angleMode(p.DEGREES)
      p.blendMode(p.MULTIPLY)

      p.push()

      // YELLOW
      new FlowField(p, rows, cols, increment).display(
        displayF(scale, 0, diameter/2, p.color('#FFFF00'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )

        )

      // CYAN
      new FlowField(p, rows, cols, increment).display(
        displayF(scale, 15, diameter/2, p.color('#00FFFF'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )

      // MAGENTA
      new FlowField(p, rows, cols, increment).display(
        displayF(scale, 45, diameter/2, p.color('#FF00FF'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        )

      // BLACK
      new FlowField(p, rows, cols, increment).display(
        displayF(scale, 75, diameter/2, p.color('#000000'), colorAlpha), 
        isInCircle(diameter / 2 , diameter / 2 , diameter / 2 )
        //isInRect(0, 0, diameter, diameter)
        )


      p.pop()
    }

    let scale = 5
    const inc = 0.02 // kind of 'zoom'
    //let rotationAngle = 137.5
    let cAlpha = 255 / 2

    p.setup = function () {
      p.createCanvas(1000, 1000);
      p.background(p.color(colors.springWood))

      let gCols = 10
      let gRows = 10
      const size = p.min(p.width, p.height) / p.min(gRows, gCols)
      let g = new Grid(gCols, gRows)
      g.forEach((x, y, val) => {
        p.push()
        p.translate(p.width / gCols * (1/2 + x), p.height / gRows * (1/2 + y))
        CYMKCircle(p, size, scale, inc, cAlpha)
  
        p.pop()
      })

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

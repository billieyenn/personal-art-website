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

let sketch = (config) => {
  return function (p) {

    class Circle {
      constructor (x, y, diameter) {
        this.d = diameter
        this.x = x
        this.y = y
      }

      display () {
        p.push()
        p.translate(this.x, this.y)
        p.stroke(0)
        p.noFill()
        p.ellipse(0, 0, this.d)
        p.pop()
      }
    }

    const windowSize = 710

    p.setup = function () {
      p.createCanvas(windowSize, windowSize);
      p.background(p.color(colors.pearlBush))
      let c = new Circle(300, 300, 50)
      c.display()
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
    }
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

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
import { noiseEverywhere } from '../../utils.js'

let sketch = (config) => {
  return function (p) {
    let paused = false


    p.setup = function () {
      p.createCanvas(350, 350);
      p.background(p.color(colors.pearlBush))
    }





    p.draw = function () {
      if (!paused) {
        const color = p.color(colors.pearlBush)
        color.setAlpha(35)
        p.noStroke()
        p.fill(color)
        p.rectMode(p.CORNER)
        p.rect(0, 0, p.width, p.height)

      }
      noiseEverywhere(p, 3)
    }

    p.keyPressed = function () {
      if (p.keyCode === 32) {
        paused = !paused
      }
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

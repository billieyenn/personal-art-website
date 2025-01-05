/* eslint-enable */
/* eslint-disable */
<template>
  <div>
  <h1>Wind</h1>
    <button @click="refresh">Redraw</button>
    <div >
      <div id="canvas"></div>
    </div>

  </div>
</template>

<script>
/* eslint-disable */

import {colors, randomColor} from '../../colors.js'
import { Grid } from '../../utils.js'

let rows
let cols
const randomBGColor = randomColor(colors)
const scale = 50
let flowField

let sketch = (config) => {
    return function (p) {
        p.setup = function () {
            p.createCanvas(1000, 1000);
            p.background(randomBGColor)
            rows = p.floor(p.width / scale)
            cols = p.floor(p.height / scale)

            // the flow field keeps track of local gravity
            flowField = new Grid(rows, cols)
            flowField.forEach((x, y, val) => {
                flowField.setVal(x, y, p.createVector(0, 0))
            })
        }

        p.draw = function () {
            p.background(randomBGColor)
            
            // show flowfield outline
            p.stroke(0)
            p.noFill()
            p.rectMode(p.CENTER)
            flowField.forEach((x, y, val) => {
                const x_ff = (x + 0.5) * scale // the 0.5 offset centers the dot
                const y_ff = (y + 0.5) * scale
                p.strokeWeight(0.5)
                p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
                p.line(x_ff, y_ff, x_ff + val.x*scale, y_ff + val.y*scale)
                p.strokeWeight(2)
                p.point(x_ff + val.x*scale, y_ff + val.y*scale)
            })
        }
    }
}

import P5 from 'p5'
export default {
    props: {
        msg: String
    },
    data () {
        return {
            config: {
            speed: 10
            }
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

<style>

</style>

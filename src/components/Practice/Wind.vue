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
let airPressureFlowField
let windFlowField

let sketch = (config) => {
    return function (p) {
        p.setup = function () {
            p.createCanvas(1000, 1000);
            p.background(randomBGColor)
            rows = p.floor(p.width / scale)
            cols = p.floor(p.height / scale)

            // the flow field keeps track of local pressure
            airPressureFlowField = new Grid(rows, cols)
            airPressureFlowField.forEach((x, y, val) => {
                // create a vector of random magnitude
                let r = p.noise(x, y) // generate a random value between 0 and 1
                let v = p.createVector(r, 0)

                // fill airPressureFlowField with vector
                airPressureFlowField.setVal(x, y, v)
            })

            // the flow field keeps track of wind direction
            windFlowField = new Grid(rows, cols)
            windFlowField.forEach((x, y, val) => {
                // todo: initialise wind in direction of lowest pressure
                let r = p.noise(x, y) / 2 // generate a random value between 0 and 0.5
                let v = p.createVector(r, 0)
                let angle = p.noise(x, y) * p.TWO_PI  // generate a random value between 0 and 2 PI
                p.angleMode(p.RADIANS)
                v.rotate(angle)

                // fill windFlowField with vector
                windFlowField.setVal(x, y, v)
            })
        }

        p.draw = function () {
            p.background(randomBGColor)
            
            // Display the airPressureFlowField encoding pressure for debugging
            airPressureFlowField.forEach((x, y, val) => {
                // draw the grid
                p.strokeWeight(0.5)
                p.noFill()
                p.stroke(0)
                p.rectMode(p.CENTER)
                p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)

                // draw local 'pressure'
                p.strokeWeight(0.5)
                p.stroke(0)
                p.fill(0)
                p.circle((x+0.5)*scale, (y+0.5)*scale, val.x /* .x of vector encodes pressure */* scale) 
            })

            // Display the windFlowField encoding wind for debugging
            windFlowField.forEach((x, y, val) => {
                // draw local 'wind'
                p.stroke(255)
                p.line((x+0.5)*scale, (y+0.5)*scale, (x+0.5)*scale + val.x * scale, (y+0.5)*scale + val.y * scale) 
            })
            
            // Compute average directional air pressure at each location
            windFlowField.forEach((x, y, val) => {
                // get each neighbouring air pressure
                // 1 2 3
                // 4 5 6
                // 7 8 9
                const p1 = airPressureFlowField.getVal(x - 1,   y - 1) ?? p.createVector(0, 0)
                const p2 = airPressureFlowField.getVal(x,       y - 1) ?? p.createVector(0, 0)
                const p3 = airPressureFlowField.getVal(x + 1,   y - 1) ?? p.createVector(0, 0)
                const p4 = airPressureFlowField.getVal(x - 1,   y) ?? p.createVector(0, 0)
                const p5 = airPressureFlowField.getVal(x,       y) ?? p.createVector(0, 0)
                const p6 = airPressureFlowField.getVal(x + 1,   y) ?? p.createVector(0, 0)
                const p7 = airPressureFlowField.getVal(x - 1,   y + 1) ?? p.createVector(0, 0)
                const p8 = airPressureFlowField.getVal(x,       y + 1) ?? p.createVector(0, 0)
                const p9 = airPressureFlowField.getVal(x + 1,   y + 1) ?? p.createVector(0, 0)

                // compute the gradient in a rudimentary way
                p.angleMode(p.RADIANS)
                let sumPressure = p.createVector(0, 0)
                sumPressure.add(p1.copy().rotate(p.PI + p.QUARTER_PI))
                sumPressure.add(p2.copy().rotate(p.PI + p.HALF_PI))
                sumPressure.add(p3.copy().rotate(-p.QUARTER_PI))
                sumPressure.add(p4.copy().rotate(p.PI))
                // sumPressure.add(p5.copy().rotate(-p.QUARTER_PI)) // todo> pressure at self affects differently, consider this carefully
                sumPressure.add(p6.copy().rotate(0))
                sumPressure.add(p7.copy().rotate(p.HALF_PI + p.QUARTER_PI))
                sumPressure.add(p8.copy().rotate(p.HALF_PI))
                sumPressure.add(p9.copy().rotate(p.QUARTER_PI))

                sumPressure.rotate(p.PI) /* wind of course blows towards low pressure*/

                // wind magnitude is differential between local average and this
                sumPressure.setMag(p.abs( p5.mag() - sumPressure.mag() )) 
                // todo: consider how wind should not blow out of low pressure area.
                // after all, if there is no air, how can there be wind?

                // Apply force to wind
                windFlowField.setVal(x, y, sumPressure)
            })

            // Wind affects air pressure
            windFlowField.forEach((x, y, val) => {
                // todo
            })

            // todo: consider edges. now wind 'falls' out
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

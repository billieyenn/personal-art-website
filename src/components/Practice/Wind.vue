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
            airPressureFlowField.forEach((x, y, val) => {
                // draw local 'wind'
                p.stroke(255)
                p.line((x+0.5)*scale, (y+0.5)*scale, (x+0.5)*scale, (y+0.5)*scale + val.y * scale / 2)
            })
            
            // Calculate effects of air pressure on wind
            airPressureFlowField.forEach((x, y, val) => {
                const cluster = [airPressureFlowField.getVal(x - 1,   y - 1),
                    airPressureFlowField.getVal(x,       y - 1),
                    airPressureFlowField.getVal(x + 1,   y - 1),
                    airPressureFlowField.getVal(x - 1,   y),
                    airPressureFlowField.getVal(x,       y),
                    airPressureFlowField.getVal(x + 1,   y),
                    airPressureFlowField.getVal(x - 1,   y + 1),
                    airPressureFlowField.getVal(x,       y + 1),
                    airPressureFlowField.getVal(x + 1,   y + 1)
                ]

                // filter out non-values
                const nonNullCluster = cluster
                    .filter(value => value !== undefined)
                    
                // reduce to get sum
                const clusterSum = nonNullCluster
                    .reduce((acc, value) => acc + value.x, 0)

                // take average
                const clusterAverage = clusterSum / nonNullCluster.length

                // vector.y encodes change to take place
                const newVal = airPressureFlowField.getVal(x, y)
                newVal.y = clusterAverage
            })

            // apply wind
            airPressureFlowField.forEach((x, y, val) => {
                const newVal = val.copy()
                if (val.x > val.y) {
                    // if cell is stronger than average, the wind blows away
                    newVal.x -= 0.001
                } else {
                    // if the cell is weaker than average, wind blows inwards
                    newVal.x += 0.001
                }
                airPressureFlowField.setVal(x, y, newVal)
                // todo: do this with inertia, so that equilibrium is never reached

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

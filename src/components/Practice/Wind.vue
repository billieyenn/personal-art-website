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
import { Grid, Canvas } from '../../utils.js'
import { applyConvolution, clampStrategy, kernel, clamp } from '../../convolution.js'
import { createParticleClass } from '../../particle.js'

let rows
let cols
const randomBGColor = randomColor(colors)
const scale = 10
let airPressureFlowField

let sketch = (config) => {
    return function (p) {
        const Particle = createParticleClass(p)
        const particles = []
        const particlesCount = 100

        p.setup = function () {

            p.createCanvas(500, 500);
            p.background(randomBGColor)
            rows = p.floor(p.width / scale)
            cols = p.floor(p.height / scale)

            // the flow field keeps track of local pressure
            airPressureFlowField = new Grid(rows, cols)
            airPressureFlowField.forEach((x, y, val) => {
                // create a vector of random magnitude
                let r = p.noise(x/8, y/8) // generate a random value between 0 and 1 
                let v = {x: r, y: 0, z: 0} //x: pressure, y: nextPressure, z: "air pressure inertia"

                // fill airPressureFlowField with vector
                airPressureFlowField.setVal(x, y, v)
            })

            
            let canvas = new Canvas([p.createVector(0, 0),
                p.createVector(0, p.height),
                p.createVector(p.width, p.height),
                p.createVector(p.width, 0),
            ])

            for (let i = 0; i < particlesCount; i++) {
                const newPart = new Particle(null, p.random(0.5, 5), canvas)
                particles.push(newPart)
            }
        }

        p.draw = function () {
            p.background(randomBGColor)
            
            // Display the airPressureFlowField encoding pressure for debugging
            airPressureFlowField.forEach((x, y, val) => {
                // draw the grid
                p.fill(val.x * 255, 255 - val.x * 255, 0)
                p.noStroke(0)
                p.rectMode(p.CENTER)
                p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
            })
            
            // Calculate effects of air pressure on wind
            airPressureFlowField.forEach((x, y, val) => {
                const clusterSum = applyConvolution(airPressureFlowField, x, y, kernel, clampStrategy)

                // take average
                const kernelSize = kernel.reduce((total, row) => total + row.length, 0);
                const clusterAverage = clusterSum / kernelSize

                // vector.y encodes new wind pressure to be updated after convolving whole field
                const newVal = airPressureFlowField.getVal(x, y)
                newVal.y = clusterAverage
            })

            // apply wind
            airPressureFlowField.forEach((x, y, val) => {
                const newVal = { ...val }
                newVal.z += -(val.x - val.y)/10
                // newVal.z = clamp(newVal.z, -0.1, 0.1)
                newVal.x = clamp(newVal.z/2 + newVal.x, 0, 255)
                airPressureFlowField.setVal(x, y, newVal)
            })

            // update particles
            particles.forEach( (particle, index) => {
                // todo: calculate force of wind on particles better
                const force = p.createVector(0.1, 0)
                particle.applyForce(force)
                particle.update({limit: 10, friction: 0.05})
                particle.display()
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

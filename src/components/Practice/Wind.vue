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
const scale = 10
let airPressureFlowField

let sketch = (config) => {
    return function (p) {
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
                let v = p.createVector(r, 0, 0)

                // fill airPressureFlowField with vector
                airPressureFlowField.setVal(x, y, v)
            })
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function applyConvolution(airPressureFlowField, x, y, kernel) {
            const kernelSize = kernel.length;
            const halfKernel = Math.floor(kernelSize / 2);
            let result = 0;

            // Iterate over the kernel
            for (let dy = -halfKernel; dy <= halfKernel; dy++) {
                for (let dx = -halfKernel; dx <= halfKernel; dx++) {
                    // Clamp the indices to the valid range
                    const neighborX = clamp(x + dx, 0, airPressureFlowField.cols - 1);
                    const neighborY = clamp(y + dy, 0, airPressureFlowField.rows - 1);

                    const weight = kernel[dy + halfKernel][dx + halfKernel];
                    const neighborValue = airPressureFlowField.getVal(neighborX, neighborY).x;
                    result += weight * neighborValue;
                }
            }

            return result;
        }

        function normalizeKernel(kernel) {
            const numElements = kernel.length * kernel[0].length; // Total elements in the kernel
            const sum = kernel.flat().reduce((acc, val) => acc + val, 0); // Sum of all elements
            const normalizationFactor = sum / numElements;

            // Normalize the kernel
            return kernel.map(row => row.map(val => val / normalizationFactor));
        }

        // Example usage with a simple 3x3 kernel
        // Sum of kernel elements must always equal number of kernel elements, otherwise runaway happens
        const kernelNotNormalized = [
            [0.5, 0.7, 0.5],
            [0.7, 1, 0.7],
            [0.5, 0.7, 0.5],
        ];
        const kernel = normalizeKernel(kernelNotNormalized)
        const kernelSize = kernel.reduce((total, row) => total + row.length, 0);

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
                const clusterSum = applyConvolution(airPressureFlowField, x, y, kernel)

                // take average
                const clusterAverage = clusterSum / kernelSize

                // vector.y encodes change to take place
                const newVal = airPressureFlowField.getVal(x, y)
                newVal.y = clusterAverage
            })

            // apply wind
            airPressureFlowField.forEach((x, y, val) => {
                const newVal = val.copy()
                if (val.x > val.y) {
                    // if cell is stronger than average, the wind blows away
                    newVal.z -= 0.001
                } else {
                    // if the cell is weaker than average, wind blows inwards
                    newVal.z += 0.001
                }
                newVal.z = clamp(newVal.z, -0.1, 0.1)
                newVal.x = clamp(newVal.z/2 + newVal.x, 0, 255)
                airPressureFlowField.setVal(x, y, newVal)
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

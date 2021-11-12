/* eslint-disable */

<template>
  <div>
    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-disable */
import P5 from 'p5'
import { colors, randomColor } from '../../colors.js'
import { Grid, Canvas } from '../../utils.js'


let sketch = (config) => {
  return function (p) {
    let i// = 0
    let color
    let grid
    let scale, rows, cols
    let canvas
    let offsetY = p.random(100000000)
    let offsetOrigY = 0
    let increment = 0.4
    p.setup = function () {

      canvas = new Canvas([p.createVector(50, 50),
        p.createVector(50, 650),
        p.createVector(650, 650),
        p.createVector(650, 50),
        ])
      scale = 40
      rows = canvas.height / scale
      cols = canvas.width / scale

      grid = new Grid(rows, cols)
      p.createCanvas(1000, 1000, p.WEBGL);
      p.ortho(-p.width/2, p.width/2, -p.height/2, p.height/2)
      i = 0
      color = p.color(config.bgColor.value)

      for (let y = 0; y < rows; y++) {
        let offsetX = 0
        for (let x = 0; x < cols; x++) {
          grid.setVal(x, y, p.noise(offsetX, offsetY))
          offsetX += increment
        }
        offsetY += increment
      }
    }
    p.angleMode(p.DEGREES)
    p.draw = function () {
      offsetOrigY += 0.01
      offsetY = offsetOrigY
      for (let y = 0; y < rows; y++) {
        let offsetX = 0
        for (let x = 0; x < cols; x++) {
          grid.setVal(x, y, p.noise(offsetX, offsetY))
          offsetX += increment
        }
        offsetY += increment
      }

      p.background(color)
      i++


      p.stroke(0)
      p.noFill()
      p.rectMode(p.CENTER)
      p.rotateX(45)
      p.rotateZ(45)

      p.translate(-200,-200,0)
      grid.forEach((x, y, val) => {
        const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
        const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
        p.strokeWeight(0.5)
        p.rect(x_ff, y_ff, scale, scale)
        p.push()
        let height = val*100 - 40
        p.translate(x_ff, y_ff,height/2)
        p.fill(255)
        if(height > 0)
          p.fill(100)

        p.translate(0,0, 300)
        p.box(scale, scale, height)
        p.pop()

      })


    }
  }
}

export default {
  data() {
    return {
      sketch: sketch,
      config: {
        key1: {
          type: 'number',
          value: 1
        },
        key2: {
          type: 'string',
          value: "helloe"
        },
        key3: {
          type: 'boolean',
          value: false
        },
        bgColor: {
          type: 'color',
          value: randomColor(colors)
        }
      }
    }
  }
}
</script>

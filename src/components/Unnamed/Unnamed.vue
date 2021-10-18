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

import { Grid } from '../../utils.js'
import { FlowField } from '../../utils.js'
import { isInPoly } from '../../utils.js'
import { closestPoint } from '../../utils.js'
import { RGBtoCMYK } from '../../utils.js'
import LineMachine from '../../linemachine.js'
import { colors } from '../../colors.js'
import { randomColor } from '../../colors.js'
import { hexToRgb } from '../../colors.js'
import { unnamedColorScheme } from '../../colors.js'





let sketch = (config) => {
  return function (p) {


    const isInCircle = (x_c, y_c, r) => {
      const c = p.createVector(x_c, y_c)
      return (x_p, y_p) => {
        const point = p.createVector(x_p * scale, y_p * scale)
        const dist = c.dist(point)
        return dist < r
      }
    }

    const isInRect = (x_r, y_r, w, h) => {
      return (x_p, y_p) => {
        return x_p * scale > x_r
            && x_p * scale < x_r + w
            && y_p * scale > y_r
            && y_p * scale < y_r + h
      }
    }



    const isLeftOf = (points, x, y) => {
      let closestPointObj = closestPoint(points, x, y)// points2[closestPointIndex] // assume it is point 0

      // create local variable for clear naming
      let currentPoint = p.createVector(x, y)


      // create vector along the direction of the shape's outline
      let v1 = p.createVector(closestPointObj.x, closestPointObj.y)
      let v2 = p.createVector(points[(points.indexOf(closestPointObj)+1)%points.length].x, points[(points.indexOf(closestPointObj)+1)%points.length].y)
      let closestToPlusOne = p.createVector(v2.x - v1.x, v2.y - v1.y)

      // and closestpoint to currentpoint
      // create vector from current pixel to closest point
      let closestToCurrent = p.createVector(currentPoint.x - v1.x, currentPoint.y - v1.y)

      // The sign of the angle between those two vectors indicates which side of the shape the pixel is (relative to the curve's orientation)
      let angleBetween = closestToCurrent.angleBetween(closestToPlusOne)
      let dist = closestPointObj.dist(currentPoint) 

      
      p.noStroke()
      p.noFill()
      return angleBetween > 0 // if pixel is to the left of the shape
    }




    const drawShapeOutline = (points, stroke) => {
      p.stroke(stroke || 0)
      p.strokeWeight(5)
      for (let i = 0; i < points.length - 1; i++) {
        let point1 = points[i]
        let point2 = points[i+1]
        let v1 = p.createVector(point1.x, point1.y)
        let v2 = p.createVector(point2.x, point2.y)
        p.line(point1.x, point1.y, point2.x, point2.y)
      }
    }



    const displayDot = (p, x, y, val, scale, r, radius, color, colorAlpha) => {
      let size = val * scale * 1
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

    // get a square just big enough so that no rotation of a set of points around its bounding box center results in a point going beyond the bigger square
    const rotationSafeBoundingBox = (machine) => {
      let x_max, y_max, x_min, y_min, width, height
      // get the bounds of the list of points
      ({maxX: x_max, maxY: y_max, minX: x_min, minY: y_min} = machine.traceInfo())

      width = (x_max - x_min)
      height = (y_max - y_min)

      // to fully cover any possible point within bounding box at any rotation
      // the actual bounding box to be used shall have width and height of length until corner

      // get length from corner to corner
      const newLength = p.createVector(x_min, y_min).dist(p.createVector(x_max, y_max))

      // adjust both min and max of both x and y 
      x_min -= (newLength - width) / 2
      y_min -= (newLength - height) / 2
      x_max += (newLength - width) / 2
      y_max += (newLength - height) / 2
      width = (x_max - x_min)
      height = (y_max - y_min)
      return {x_max, y_max, x_min, y_min, width, height}
    }

    // wrapper for use with grid iteration
    const isInPolyF = (points, s, minX, minY) => {
      return (x, y) => {
        return isInPoly(points, ((x + 1/2) * s + minX), ((y + 1/2) * s + minY))
      }
    }

    // rotate the shape around the center of its extended bounding box
    const rotatePoints = (points, angle, minX, minY, w, h) => {
      p.angleMode(p.DEGREES)
      let s = p.sin(-angle) // calculate outside of loop for comp eff
      let c = p.cos(-angle)
      let res = points.map((point) => {
        let new_p = p.createVector(point.x, point.y)
        new_p.x -= (minX + w / 2)
        new_p.y -= (minY + h / 2)

        let x_new = new_p.x * c - new_p.y * s
        let y_new = new_p.x * s + new_p.y * c

        new_p.x = x_new + (minX + w / 2)
        new_p.y = y_new + (minY + h / 2)

        return new_p
      })
      return res
    }

    const displayThing = (offsetX, offsetY, resize, resolution, color, symmetricity) => {

      p.push()
      p.translate(offsetX, offsetY)

      p.angleMode(p.RADIANS)
      let newMachine = LineMachine(config)(p)
      newMachine.waves = newMachine.generator.generateRandomWaves(18, 1/(1.618), symmetricity)
      newMachine.tracePoints()
      newMachine.resize(resize)
      newMachine.tracePoints()


      let x_max, y_max, x_min, y_min, width, height

      // get an extended bounding box
      ({ x_max,  y_max,  x_min,  y_min, width, height} = rotationSafeBoundingBox(newMachine))

      // scale also known as resolution. smaller number -> more computation needed
      let scale = resolution

      let cols = p.floor(width / scale)
      let rows = p.floor(height / scale)
      let g = new Grid(rows, cols)
 

      const rgb = hexToRgb(color)
      let cyan, magenta, yellow, black  
      [cyan, magenta, yellow, black] = RGBtoCMYK(...rgb)

      let angle = 0 // helper variable to keep track of f parameters
      g.forEach((x, y, val) => {
        g.setVal(x, y, yellow)
      })
      g.forEach(displayF(scale, angle, width/2, p.color('#FFFF00'), 255), isInPolyF(rotatePoints(newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min))
      
      g.forEach((x, y, val) => {
        g.setVal(x, y, cyan)
      })
      angle = p.random(90)//15
      g.forEach(displayF(scale, angle, width/2, p.color('#00FFFF'), 255), isInPolyF(rotatePoints(newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min))
      
      g.forEach((x, y, val) => {
        g.setVal(x, y, magenta)
      })
      angle = p.random(90)//45
      g.forEach(displayF(scale, angle, width/2, p.color('#FF00FF'), 255), isInPolyF(rotatePoints(newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min))

      g.forEach((x, y, val) => {
        g.setVal(x, y, black)
      })
      angle = p.random(90)//75
      g.forEach(displayF(scale, angle, width/2, p.color('#000000'), 255), isInPolyF(rotatePoints(newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min))

      p.pop()




      // frame and debugging
      p.push()
      p.translate(offsetX - x_min - width / 2, offsetY - y_min - height / 2)

      // debugging shape outline
      drawShapeOutline(newMachine.trace, p.color(colors.mineShaft))

      // // debugging bounding box
      // p.noFill()
      // p.rect(x_min, y_min, width, height)
      
      // const info = newMachine.traceInfo()
      // const margin = 20
      // p.strokeWeight(margin - 10)
      // p.noFill()
      // p.rect(info.minX - margin/2, info.minY - margin/2, info.maxX -  info.minX + margin,  info.maxY -  info.minY + margin)

      p.pop()
    }

    const displayThingF = (rows, cols) => {
      return (x, y) => {
        let resize = p.random(p.min(p.width/cols, p.height/rows) / 2, p.min(p.width/cols, p.height/rows) / 1.2) / (p.width/cols < p.height/rows ? p.height : p.width)
        let scale = 4
        let color = randomColor(unnamedColorScheme)
        let symmetricity = p.random(1) < 0.2
        let padding = p.width / math.pow(1.618, 5)
        return displayThing(padding + (x + 0.5) * (p.width - 2 * padding) / cols, padding + (y + 0.5) * (p.height - 2 * padding) / rows, resize, scale, color, symmetricity)
      }
    }
    p.setup = function () {
      p.createCanvas(4608 / 4, 8192 / 4);

      p.background(p.color(colors.springWood))
      // p.background(p.color(randomColor()))
      let rows = 6
      let cols = 3
      let g = new Grid(rows, cols)
      g.forEach((() => {return displayThingF(rows, cols)})())


      // g.forEach(
      //   displayThingF(0.2, 8, randomColor(), false, rows, cols)
      //   // let resize = 0.2
      //   // let scale = 8
      //   // let color = randomColor()
      //   // let symmetricity = p.random(1) < 0.5
      // )


      // displayThing(p.width * 2 / 5, p.height / 5, 1 / 1.618 / 1.618, scale, randomColor(), false)
      // displayThing(p.width * 3 / 5, p.height / 2, 1 / 1.618, scale, randomColor(), false)
      // displayThing(p.width * 2 / 7, p.height * 4 / 5, 1 / 1.618 / 1.618, scale, randomColor(), false)

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
      config: {
        speed: 10 //used by tracePoints
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

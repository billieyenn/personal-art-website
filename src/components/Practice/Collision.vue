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
import LineMachine from '../../linemachine.js'
import { colors } from '../../colors.js'
import { randomColor } from '../../colors.js'



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
  p.strokeWeight(1)
  for (let i = 0; i < points.length - 1; i++) {
    let point1 = points[i]
    let point2 = points[i+1]
    let v1 = p.createVector(point1.x, point1.y)
    let v2 = p.createVector(point2.x, point2.y)
    p.line(point1.x, point1.y, point2.x, point2.y)
  }
}


    p.setup = function () {
      p.createCanvas(710, 710);

      p.background(p.color(randomColor()))



      // let points = [] // generate a few points around which a curve is created
      let points2 = [] // store the outline of the curvy shape


/*
        // generate some random curvy shape
        for (let i = 0; i < 5; i++) {
          points.push(p.createVector(p.random(50, p.width - 50), p.random(50, p.height - 50)))
        }
        
        
        // first pass to quickly get outline size
        let steps = 100 // less steps used to figure out 
        for (let i = 0; i < points.length; i++) {
          for (let ii = 0; ii <= steps; ii++) {
            let t = ii / steps;
            let l = points.length
            let x = p.curvePoint(points[(i)%l].x, points[(i + 1)%l].x, points[(i + 2)%l].x, points[(i + 3)%l].x, t);
            let y = p.curvePoint(points[(i)%l].y, points[(i + 1)%l].y, points[(i + 2)%l].y, points[(i + 3)%l].y, t);
             points2.push(p.createVector(x, y))
          }
        }
*/
    



        p.translate(p.width / 2, p.height / 2)

        p.angleMode(p.RADIANS)
        let newMachine = LineMachine(config)(p)
        newMachine.waves = newMachine.generator.generateRandomWaves(18, 1/1.618, true)
        newMachine.tracePoints()
        newMachine.resize(0.8)
        newMachine.tracePoints()

        points2 = newMachine.trace






        // calculate the bounding box of the shape
        let x_max = p.max(points2.map(p => p.x))
        let y_max = p.max(points2.map(p => p.y))
        let x_min = p.min(points2.map(p => p.x))
        let y_min = p.min(points2.map(p => p.y))
        let width = (x_max - x_min)
        let height = (y_max - y_min)

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


        let scale = 8

        let cols = p.floor(width / scale)
        let rows = p.floor(height / scale)
        // let g = new Grid(rows, cols)
        let g = new FlowField(p, rows, cols, 0.05)


        const displayDot = (p, x, y, val, scale, r, radius, color, colorAlpha) => {
            let size = val * scale * 1.5
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

        const displayPointF = (angle) => {
          return (x, y, val) => {
            p.stroke(0)
            p.push()
            p.translate(x_min + width / 2, y_min + height / 2) // to center of bounding box (BB)
            p.rotate(angle)
            p.translate(-width/2, -height/2) // to 'top left' corner of BB (origin)
            p.translate(scale * (x + 1/2), scale * (y + 1/2)) // to each pixel's position
            p.point(0, 0)
            p.pop()
          }
        }

        const conditionF = (points) => {
          return (x, y, val) => {
            return isInPoly(points, ((x + 1/2) * scale + x_min), ((y + 1/2) * scale + y_min))
          }
        }

        // rotate the shape around the center of the bounding box
        const rotatePoints = (points, angle) => {
          p.angleMode(p.DEGREES)
          let s = p.sin(-angle) // calculate outside of loop for comp eff
          let c = p.cos(-angle)
          let res = points.map((point) => {
            let new_p = p.createVector(point.x, point.y)
            new_p.x -= (x_min + width / 2)
            new_p.y -= (y_min + height / 2)

            let x_new = new_p.x * c - new_p.y * s
            let y_new = new_p.x * s + new_p.y * c

            new_p.x = x_new + (x_min + width / 2)
            new_p.y = y_new + (y_min + height / 2)

            return new_p
          })
          return res
        }
        

        // p.blendMode(p.LIGHTER)
        let angle = 0
        // g.forEach(displayPointF(angle), conditionF(rotatePoints(points2, angle)))

        g.forEach(displayF(scale, angle, width/2, p.color('#FFFF00'), 255), conditionF(rotatePoints(points2, angle)))

        angle = 15
        g.forEach(displayF(scale, angle, width/2, p.color('#00FFFF'), 255), conditionF(rotatePoints(points2, angle)))
        
        angle = 45
        g.forEach(displayF(scale, angle, width/2, p.color('#FF00FF'), 255), conditionF(rotatePoints(points2, angle)))

        angle = 75
        g.forEach(displayF(scale, angle, width/2, p.color('#000000'), 255), conditionF(rotatePoints(points2, angle)))



        // // debugging shape outline
        // drawShapeOutline(points2)

        // // debugging  bounding box
        // p.stroke(0)
        // p.noFill()
        // p.rect(x_min, y_min, x_max - x_min, y_max - y_min)














        // // iterate over each pixel in bounding box
        // let resolution = 5 // directional collision 
        // for (let x = x_min; x < x_max; x += resolution) {
        //   for (let y = y_min; y < y_max; y += resolution) {

        //     p.noStroke()
        //     p.noFill()
        //     p.strokeWeight(1)

        //     if (isInPoly(points2, x, y))
        //       // p.stroke(0)
        //       p.fill(0)
        //     // p.point(x, y)


        //     // if (isLeftOf(points2, x, y) > 0) // if pixel is to the left of the shape
        //     //   p.stroke(0)

        //     // can skip computing pixels until distance to closest pixel is travelled
        //     let dist = closestPoint(points2, x, y).dist(p.createVector(x, y))
        //     let width = p.min(x - x_min, p.min(x_max - x, dist))
        //     let height = p.min(y - y_min, p.min(y_max - y, dist))
        //     // p.line(x, y, x, y + height)
        //     p.ellipse(x, y, width, height)
        //     y += height/1.618

        //   }
        // }

    }
    p.draw = function () {

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
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

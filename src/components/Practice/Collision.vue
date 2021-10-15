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

import {Grid as Grid} from '../../utils.js'


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

const isInPoly = (points, x, y) => {
  // collision detection
  // source http://www.jeffreythompson.org/collision-detection/poly-poly.php?fbclid=IwAR3pveFV5i-hQD3e6G1jWsTNc5LL8SmHd74yX6tDQ7KP2apj9JX4th1mcjA
  let collision = false

  // iterate over each point in shape
  points.forEach((po, i) => {

    // for each pair of consecutive points along shape
    const vc = po
    const vn = points[(i + 1)%points.length]

    // if y-coord of those points are on different sides of the pixel
    const cond_1 = (vc.y > y && vn.y < y)
    const cond_2 = (vc.y < y && vn.y > y)
    // and if the below condition
    const cond_3 = (x < (vn.x - vc.x) * (y - vc.y) / (vn.y - vc.y) + vc.x)


    // then collision
    if ((cond_1 || cond_2) && cond_3) {
      collision = !collision
    }

  })
  return collision
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

const closestPoint = (points, x, y) => {

  let closestPointIndex = 0 // assume it is point 0
  let closestPoint = points[closestPointIndex] // assume it is point 0
  let currentPoint = p.createVector(x, y)

  // find closest point of the shape to this pixel
  points.forEach((po, i) => {
    if (currentPoint.dist(po) < currentPoint.dist(closestPoint)) {
      closestPoint = po
      closestPointIndex = i
    }
  })

  return closestPoint
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

    let x = 710/4
    let y = 710/4

    p.setup = function () {
      p.createCanvas(710, 710);

      p.background(250)

      p.angleMode(p.DEGREES)


      let points = [] // generate a few points around which a curve is created
      let points2 = [] // store the outline of the curvy shape

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


        // debugging shape outline
        // drawShapeOutline(points2)

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
        y_max += (newLength - width) / 2
        width = (x_max - x_min)
        height = (y_max - y_min)

        // just show where the shape is for debugging
        p.stroke(0)
        p.noFill()
        // draw bounding box
        // p.rect(x_min, y_min, x_max - x_min, y_max - y_min)

        let scale = 8

        let cols = p.floor(width / scale)
        let rows = p.floor(height / scale)

        let g = new Grid(rows, cols)
        let angle = 30
        const displayPoint = (x, y, val) => {
          p.stroke(0)
          p.push()
          p.translate(x_min + width / 2, y_min + height / 2)
          p.rotate(angle)
          p.translate(-width/2, -height/2)
          p.translate(scale * (x + 1/2), scale * (y + 1/2))
          p.point(0, 0)
          p.pop()
        }


        // rotate the shape for collision detection
        p.angleMode(p.DEGREES)
        let s = p.sin(-angle) // calculate outside of loop for comp eff
        let c = p.cos(-angle)

        let points_rotated = points2.map((point) => {
          let new_p = p.createVector(point.x, point.y)
          new_p.x -= (x_min + width / 2)
          new_p.y -= (y_min + height / 2)

          let x_new = new_p.x * c - new_p.y * s
          let y_new = new_p.x * s + new_p.y * c

          new_p.x = x_new + (x_min + width / 2)
          new_p.y = y_new + (y_min + height / 2)

          return new_p
        })



        const condition = (x, y, val) => {
          return isInPoly(points_rotated, ((x + 1/2) * scale + x_min), ((y + 1/2) * scale + y_min))
        }
        

        g.forEach(displayPoint, condition)


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
    /*
    const baseURI = 'https://raw.githubusercontent.com/billieyenn/test-art/main/sketch.js'
    let sketch = await this.getSketch(baseURI, this.config)
    console.log(sketch)
    */

    this.p5canvas = new P5(sketch(), 'canvas')

  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
    async getSketch(url, config) {
      let result = await this.$http.get(url)
      const curry = new Function(result.data)()(config) // eslint-disable-line no-new-func
      console.log(curry)
      return curry
    }
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

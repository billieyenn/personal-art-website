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


let count = 0
let g
let scale = 10
let size = 710
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




      let x = 710/4
      let y = 710/4
    p.setup = function () {
      p.createCanvas(710, 710);
      let cols = p.floor(size / scale)
      let rows = p.floor(size / scale)
      g = new Grid(rows, cols)

      p.background(250)
      p.push()
      // populate points
      g.forEach( (x, y, val) => {
        g.setVal(x, y, p.createVector(x * scale, y * scale))
      } )

      // display points
      p.angleMode(p.DEGREES)
      p.fill(0)
      // p.ellipse(x, y, 10)
      // p.translate(x, y)
//      p.translate(p.width / 2, p.height / 2)



/*
      p.translate(-size / 4, -size / 4)

      g.forEach((x, y, val) => {
        p.push()
        // p.translate(x, y)
        p.translate(x * scale, y * scale)
        p.strokeWeight(2)
        p.point(0, 0)
        p.pop()
      }
      , isInCircle(size/2, size/2, 710/4 )
      )



      p.translate(p.width, p.height / 2)
      p.rotate(count)
      let x_1 = 0
      let y_1 = 0
      let w = 300
      let h = 300
      p.translate(-w/2, -h/2)

      g.forEach((x, y, val) => {
        p.push()
        // p.translate(x, y)
        p.translate(x * scale, y * scale)
        p.strokeWeight(2)
        p.point(0, 0)
        p.pop()
      }
      , isInRect(x_1, y_1, x_1 + w, y_1 + h)
      )

*/

      p.pop()

      let points = []
      let points2 = []

        // generate some random curvy shape
        for (let i = 0; i < 5; i++) {
          points.push(p.createVector(p.random(50, p.width - 50), p.random(50, p.height - 50)))
        }
        
        
        let totalRotation = 0
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

        for (let i = 0; i < points2.length - 2; i++) {
          let point1 = points2[i]
          let point2 = points2[i + 1]
          let point3 = points2[i + 2]

          let v1 = p.createVector(point2.x - point1.x, point2.y - point1.y)
          let v2 = p.createVector(point3.x - point2.x, point3.y - point2.y)
          totalRotation += v2.heading() - v1.heading()
        }

        console.log(totalRotation)


/*        //debugging
        for (let i = 0; i < points2.length - 1; i++) {
          let point1 = points2[i]
          let point2 = points2[i+1]
          let v1 = p.createVector(point1.x, point1.y)
          let v2 = p.createVector(point2.x, point2.y)
          let heading = v1.sub(v2).rotate(90).heading()
          // let heading = v1.sub(v2).rotate(-90).heading()
          p.push()
          p.translate(v2.x, v2.y)
          p.rotate(heading)
          // if(heading !== 0)
          //   p.line(0, 0, 10, 0)
          p.pop()
          p.line(point1.x, point1.y, point2.x, point2.y)
        }
*/

        // calculate the bounding box of the shape
        const x_max = p.max(points2.map(p => p.x))
        const y_max = p.max(points2.map(p => p.y))
        const x_min = p.min(points2.map(p => p.x))
        const y_min = p.min(points2.map(p => p.y))

        // just show where the shape is for debugging
        p.stroke(0)
        p.noFill()
        // p.rect(x_min, y_min, x_max - x_min, y_max - y_min)

        // find closest point
        let closestPointIndex = 0 // assume it is point 0
        let closestPoint = points2[closestPointIndex] // assume it is point 0
        let resolution = 2
        for (let x = x_min; x < x_max; x += resolution) {
          for (let y = y_min; y < y_max; y += resolution) {
            let currentPoint = p.createVector(x, y)
            points2.forEach((po, i) => {
              if (currentPoint.dist(po) < currentPoint.dist(closestPoint)) {
                closestPoint = po
                closestPointIndex = i
              }
            })

            let v1 = p.createVector(closestPoint.x, closestPoint.y)
            let v2 = p.createVector(points2[(closestPointIndex+1)%points2.length].x, points2[(closestPointIndex+1)%points2.length].y)

            // angle between closestpoint to closestpoint + 1
            // and closestpoint to currentpoint
            let closestToPlusOne = p.createVector(v2.x - v1.x, v2.y - v1.y)
            let closestToCurrent = p.createVector(currentPoint.x - v1.x, currentPoint.y - v1.y)

            let angleBetween = closestToCurrent.angleBetween(closestToPlusOne)
            let dist = closestPoint.dist(currentPoint)

            
            p.noStroke()
            p.noFill()            
            if (angleBetween > 0)

              p.fill(200)
            // p.rect(x, y, resolution, resolution)
            let width = p.min(x - x_min, p.min(x_max - x, dist))
            let height = p.min(y - y_min, p.min(y_max - y, dist))
            p.ellipse(x, y, width, height)
            y += height/2
          }
        }



      // for each point in shape bounding box, 
      // find pair of points on curve closest to that point
      // 


      count++
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

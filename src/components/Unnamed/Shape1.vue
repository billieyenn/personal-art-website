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
import { sin } from 'mathjs'
import { cos } from 'mathjs'





let sketch = (config) => {
  return function (p) {

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
      const size = val * scale * 1
      p.noStroke()
      color.setAlpha(colorAlpha || 255)
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

      // console.log(x_max, y_max, x_min, y_min, width, height)
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
        return isInPoly(points, (x * s + minX), (y * s + minY))
      }
    }

    // rotate the shape around the center of its extended bounding box
    const rotatePoints = (points, angle, pivot_x, pivot_y) => {
      p.angleMode(p.DEGREES)
      let s = p.sin(-angle) // calculate outside of loop for comp eff
      let c = p.cos(-angle)
      let res = [...points].map((point) => {
        let new_p = p.createVector(point.x, point.y)
        // let new_p = point
        new_p.x -= pivot_x
        new_p.y -= pivot_y

        let x_new = new_p.x * c - new_p.y * s
        let y_new = new_p.x * s + new_p.y * c

        new_p.x = x_new + pivot_x
        new_p.y = y_new + pivot_y

        return new_p
      })
      return res
    }

    const displayThing = (vectorlist, offsetX, offsetY, resize, resolution, color) => {

      p.push()
      p.translate(offsetX, offsetY)



      p.angleMode(p.RADIANS)


      let newMachine = LineMachine(config)(p)
      newMachine.waves = vectorlist ? newMachine.generator.generateWavesFromVectorList(vectorlist, vectorlist.length) : newMachine.generator.generateRandomWaves(18, 1/(1.618))
      newMachine.tracePoints()
      newMachine.resize(resize)
      newMachine.tracePoints()



      let x_max, y_max, x_min, y_min, width, height

      // get an extended bounding box
      ({ x_max,  y_max,  x_min,  y_min, width, height} = rotationSafeBoundingBox(newMachine))

      let cols = p.floor(width / resolution)
      let rows = p.floor(height / resolution)
      let g = new Grid(rows, cols)
 

      const rgb = hexToRgb(color)
      let cyan, magenta, yellow, black  
      [cyan, magenta, yellow, black] = RGBtoCMYK(...rgb)

      let angle = 0 // helper variable to keep track of f parameters
      g.forEach((x, y, val) => {
        g.setVal(x, y, yellow)
      })
      g.forEach(
        displayF(resolution, angle, width/2, p.color('#FFFF00')), 
        isInPolyF(rotatePoints(newMachine.trace, angle, x_min + width / 2, y_min + height / 2), resolution, x_min, y_min)
        )
      
      g.forEach((x, y, val) => {
        g.setVal(x, y, cyan)
      })
      angle = 15
      // angle = p.random(90)//15
      g.forEach(
        displayF(resolution, angle, width/2, p.color('#00FFFF')), 
        isInPolyF(rotatePoints(newMachine.trace, angle,  x_min + width / 2, y_min + height / 2), resolution, x_min, y_min)
        )
      
      g.forEach((x, y, val) => {
        g.setVal(x, y, magenta)
      })
      angle = 45
      // angle = p.random(90)//45
      g.forEach(
        displayF(resolution, angle, width/2, p.color('#FF00FF')), 
        isInPolyF(rotatePoints(newMachine.trace, angle,  x_min + width / 2, y_min + height / 2), resolution, x_min, y_min)
        )

      g.forEach((x, y, val) => {
        g.setVal(x, y, black)
      })
      angle = 75
      // angle = p.random(90)//75
      g.forEach(
        displayF(resolution, angle, width/2, p.color('#000000')), 
        // () => {return true}
        isInPolyF(rotatePoints(newMachine.trace, angle,  x_min + width / 2, y_min + height / 2), resolution, x_min, y_min)
        )

      p.pop()

      // // frame and debugging
      p.push()
      p.translate(offsetX - x_min - width / 2, offsetY - y_min - height / 2)

      // debugging shape outline
      drawShapeOutline(newMachine.trace, p.color(colors.mineShaft))



      // machine.fill = false
      // machine.color = p.color(rgb)
      // machine.display(30, 1)

      // // debugging bounding box
      // p.noFill()
      // p.rect(x_min, y_min, width, height)
      
      // const info = machine.traceInfo()
      // const margin = 20
      // p.strokeWeight(margin - 10)
      // p.noFill()
      // p.rect(info.minX - margin/2, info.minY - margin/2, info.maxX -  info.minX + margin,  info.maxY -  info.minY + margin)


      p.pop()
    }

    const noisyBackground = (color, std) => {
      let c = color
      p.loadPixels();
      let noiseStandardDeviation = std
      let d = p.pixelDensity();
      let image = 4 * (p.width * d) * (p.height * d);
      for (let i = 0; i < image; i += 4) {
        p.pixels[i] = p.randomGaussian(c[0], noiseStandardDeviation);
        p.pixels[i + 1] = p.randomGaussian(c[1], noiseStandardDeviation);
        p.pixels[i + 2] = p.randomGaussian(c[2], noiseStandardDeviation);
        p.pixels[i + 3] = 255;
      }
      p.updatePixels();
    }

    const noiseEverywhere = (std) => {
      p.loadPixels();
      let noiseStandardDeviation = std
      let d = p.pixelDensity();
      let image = 4 * (p.width * d) * (p.height * d);
      for (let i = 0; i < image; i += 4) {
        p.pixels[i] = p.randomGaussian(p.pixels[i], noiseStandardDeviation);
        p.pixels[i + 1] = p.randomGaussian(p.pixels[i + 1], noiseStandardDeviation);
        p.pixels[i + 2] = p.randomGaussian(p.pixels[i + 2], noiseStandardDeviation);
        p.pixels[i + 3] = p.pixels[i + 3];
      }
      p.updatePixels();
    }

    p.setup = function () {
      p.createCanvas(4608 / 8, 8192 / 8); // 9:16
      // p.createCanvas(8192 / 8, 4608 / 8); // 9:16
      p.background(p.color(colors.springWood))
      noisyBackground(hexToRgb(colors.springWood), 7)
      let newMachine = LineMachine(config)(p)
      const scale = 4
      const color = randomColor(unnamedColorScheme)
        
      const resize = 2 * (1 - 1 / 1.618 / 1.618)//(width > height ? p.height : p.width)
      let vectors






      // const right = [[2506,3040],[-37,652],[-40,513],[-153,72],[139,93],[-75,-58],[93,-13],[-95,-83],[63,-24],[-49,-61],[13,15],[-30,-24],[32,-30],[41,-46],[12,-10],[33,-45],[-9,-31],[18,-21],[-1,-17],[7,-9],[1,-4],[10,2],[-7,7],[18,11],[-7,4],[4,3],[-5,-2],[5,3],[7,-2],[2,-4],[-0,4],[-0,0],[-0,-1],[-9,-1],[3,-3],[-3,3],[3,3],[2,1],[-2,3]]
      // vectors = right.map(w => p.createVector(w[0], w[1]))
      // p.push()


      // p.translate(120, 0)
      // displayThing(vectors, 0.5 * p.width, 0.5 * p.height, resize, scale, "#bd9383")
      // p.pop()

      const left = [[1730,3539],[-481,-339],[314,-372],[-194,-494],[133,-115],[53,-5],[7,-196],[112,-12],[-130,84],[74,34],[0,-80],[-72,-38],[-28,-30],[-6,8],[21,-2],[-20,-22],[13,2],[32,-43],[-27,4],[-3,-8],[6,25],[8,3],[-4,-11],[11,14],[-0,12],[16,-1],[8,-16],[12,-3],[-2,-3],[1,7],[6,0],[4,-4],[-3,-9],[2,8],[-5,4],[-3,-3],[13,-6],[9,6],[-0,0]]
      vectors = left.map(w => p.createVector(w[0], w[1]))

      displayThing(vectors, 0.5 * p.width, 0.5 * p.height, resize, scale, "#4a2008")



      noiseEverywhere(5)
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

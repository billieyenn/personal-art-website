/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <button @click="refresh">Redraw</button>
    <p>Try moving your mouse across the canvas!</p>
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
import { noiseEverywhere } from '../../utils.js'
import { noisyBackground, drawShapeOutline, rotatePoints, rotatePoint, convertCoordsToPixelArrayIndex } from '../../utils.js'




let sketch = (config) => {
  return function (p) {


    const isInCircle = (x_c, y_c, r) => {
      const c = p.createVector(x_c, y_c)
      return (x_p, y_p) => {
        const point = p.createVector(x_p, y_p)
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


    const displayDot = (p, x, y, val, scale, r, radius, color) => {
      // let size = val * scale * 1
      let size = p.sqrt(val * scale * 1) // sqrt for some reason has nice appearance?
      p.noStroke()
      color.setAlpha( 255)
 
      p.push() // the frame has translated once to center its container before this
      p.rotate(r)
      p.translate(-radius, -radius)
      p.translate(x * scale, y * scale)
      
      p.fill(color) // color should depend on pixel color on location. Where is dot? 

      p.ellipse(0, 0, size, size)
      p.pop()
    }

    const displayF = (scale, r, radius, color, ) => {
      return (x, y, val) => {
        displayDot(p, x, y, val, scale, r, radius, color, )  
      }
    }

    // wrapper for use with grid iteration
    const isInPolyF = (points, s, minX, minY) => {
      return (x, y) => {
        return isInPoly(points, (x * s + minX), (y * s + minY))
      }
    }

    const isNearPointF = (point, s, minX, minY, distance) => {
      return (x, y) => {
        return p.sqrt(p.pow((x * s + minX - point.x), 2) + p.pow((y * s + minY - point.y), 2)) < distance
      }
    }

    // scan the canvas and initialise the cmyk grids
    const initCYMK = (offsetX, offsetY, resolution) => {

      // simulate a square box as a shape instead
      let newMachine = LineMachine(config)(p)
      // instead of filling the odd shape, fill a square
      const wholeScreen = [

            p.createVector(-p.width + offsetX,  -p.height + offsetY), 
            p.createVector(offsetX,             -p.height + offsetY),
            p.createVector(offsetX,             offsetY), 
            p.createVector(-p.width + offsetX,  offsetY)
            ]

      newMachine.trace = wholeScreen


      // figure out the potential boundaries of the shape when rotated  
      let width, height
      // get an extended bounding box
      ({ width, height } = newMachine.rotationSafeBoundingBox())

      // rename variable
      const scale = resolution

      // prepare dot grid
      // draw the dots with a grid instance
      const cols = p.floor(width / scale)
      const rows = p.floor(height / scale)
      const yellowGrid  = new Grid(rows, cols)
      const cyanGrid    = new Grid(rows, cols)
      const magentaGrid = new Grid(rows, cols)
      const blackGrid   = new Grid(rows, cols)
      const grids = [cyanGrid, magentaGrid, yellowGrid, blackGrid]
      const angles = [0, 15, 45, 75] // rosetta angles
      const idk = -p.width/5 // idk why this is quite right but it seems to
      const idk_y = -p.height/5 // idk why this is quite right but it seems to
      let red_, green_, blue_
      let cymkResult
      let unrotatedPoint
      let indexInPixelArray
      let angle

      // analyse the whole current canvas to assign values for each CMYK grid
      // each rosette CMYK dot grid gets its separate iteration
      p.loadPixels(); // call before accessing p.pixels // outside loop for performance
      grids.forEach((grid, index) => {
        angle = angles[index] // helper variable to keep track of f parameters
        grid.forEach((x, y, val) => { // iterate over each dot in the specific dot grid

          // earlier transformations need to be undone first
          unrotatedPoint = rotatePoint(p, offsetX, offsetY, angle, (x * scale + idk), (y * scale + idk_y))
          indexInPixelArray = convertCoordsToPixelArrayIndex(p, p.floor(unrotatedPoint[0]), p.floor(unrotatedPoint[1]))
          red_ = p.pixels[indexInPixelArray]
          green_ = p.pixels[indexInPixelArray+1]
          blue_ = p.pixels[indexInPixelArray+2]
          // value set to cyan/yellow/magenta/black amount converted from the rgb at the pixel 
          grid.setVal(x, y, RGBtoCMYK(red_, green_, blue_)[index]) // THIS IS VERY IMPORTANT

        })
      })

      return [grids, angles, newMachine]
    }

    const displayThing = (offsetX, offsetY, resolution, grids, angles, newMachine) => {
      // scale also known as resolution. smaller number -> more computation needed
      const scale = resolution
     
      // figure out the potential boundaries of the shape when rotated  
      let x_min, y_min, width, height
      // get an extended bounding box
      ({  x_min,  y_min, width, height} = newMachine.rotationSafeBoundingBox())

      const colorsHex = [ 
        p.color('#00FFFF'), 
        p.color('#FF00FF'),
        p.color('#FFFF00'), 
        p.color('#000000'),
        ]

  
      p.push()
      p.translate(offsetX, offsetY) // put in middle of its frame of reference (in this case the screen)

      // clear the canvas
      // p.background('white')
      // apply and draw the grid
      p.fill('white')
      p.noStroke()
      let cursorDiameter = 100
      let cursorRadius = cursorDiameter / 2
      let mouseX = p.mouseX - offsetX
      let mouseY = p.mouseY - offsetY
      p.ellipse(mouseX, mouseY, cursorDiameter, cursorDiameter)
      grids.forEach((grid, index) => {
        let angle = angles[index] // helper variable to keep track of parameters

        // // apply effect to whole screen
        // grid.forEach(displayF(scale, angle, width/2, colorsHex[index]),
        //   isInPolyF(rotatePoints(p, newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min)
        //   )

        // apply effect close to mouse
        grid.forEach(displayF(scale, angle, width/2, colorsHex[index]),
          isNearPointF(rotatePoints(p, [p.createVector(mouseX, mouseY)], angle, x_min, y_min, width, height)[0], scale, x_min, y_min, cursorRadius)
          )

      })

      p.pop()
    }


    const displayBorder = (x, y, width, height, stroke) => {
      p.stroke(stroke || colors.bigStone)
      let strokeWeight = p.sqrt(p.min(width,height))
      p.strokeWeight(strokeWeight)
      p.noFill()
      p.rect(0, 0, width , height, 30)
    }


    // preload image
    let img;
     p.preload = function () {
      img = p.loadImage('/image_2.png');
    }

    // setup
    const size = 500 // canvas size
    const scale = 2 // big number means faster render time

    let offsetX
    let offsetY
    const color = colors.bigStone/*colors.springWood*//*colors.goblin*//*randomColor(unnamedColorScheme)*/
    let grids2, angles2, newMachine2

    p.setup = function () {
      p.pixelDensity(1)
      // prepare canvas
      // p.createCanvas(4608 / 8, 8192 / 8); // handy tall frame
      p.createCanvas(size, size);
      p.background(p.color(colors.springWood))
      noisyBackground(p, hexToRgb(colors.springWood), 7)
      img.resize(size, 0)
      p.image(img,0,0)
      noiseEverywhere(p, 3) // after showing image, introduce noise


      // read config
      const width = p.width
      const height = p.height

      offsetX = 0.5 * width
      offsetY = 0.5 * height

      // some weird syntax bug prevents compilation due to assigning value left hand side, hence this dumb solution
      let grids, angles, newMachine
      [grids, angles, newMachine] = initCYMK(offsetX, offsetY, scale) // analyse image and convert to CYMK dot grids
      grids2 = grids
      angles2 = angles
      newMachine2 = newMachine
      p.background(p.color(colors.springWood)) // clear out image

      // do the main thing
      displayThing(offsetX, offsetY, scale, grids2, angles2, newMachine2)


      displayBorder(0, 0, width, height, color)

      // again introduce noise to simulate effect of photograph
      noiseEverywhere(p, 3)
    }

    p.draw = function() {
      p.background(p.color(colors.springWood))

      // img.resize(size, 0)
      // p.image(img,0,0)

      // read config
      const width = p.width
      const height = p.height

      // let grids, angles, newMachine
      // [grids, angles, newMachine] = initCYMK(offsetX, offsetY, scale) // analyse image and convert to CYMK dot grids
      // grids2 = grids
      // angles2 = angles
      // newMachine2 = newMachine


      // do the main thing
      displayThing(offsetX, offsetY, scale, grids2, angles2, newMachine2)
      displayBorder(0, 0, width, height, color)


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

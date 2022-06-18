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
import { noiseEverywhere } from '../../utils.js'
import { noisyBackground, drawShapeOutline, rotatePoints, rotatePoint } from '../../utils.js'




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

    // probably doesnt work
    // const isInCircleF = (s, minX, minY, ellipseCenterX, ellipseCenterY, radius) => {
    //   return (x, y) => {
    //     return isInCircle(ellipseCenterX, ellipseCenterY, radius)((x * s + minX), (y * s + minY))
    //   }
    // }


    const displayThing = (offsetX, offsetY, resize, resolution, color, symmetricity) => {

      p.push()
      p.translate(offsetX, offsetY) // put in middle of its frame of reference (in this case the screen)
      // // start make a random shape
      // p.angleMode(p.RADIANS)
      // let newMachine = LineMachine(config)(p)
      // newMachine.waves = newMachine.generator.generateRandomWaves(5, 1/(1.618), symmetricity)
      // newMachine.tracePoints()
      // newMachine.resize(resize)
      // newMachine.tracePoints()


      // simulate a square box as a shape instead
      let newMachine = LineMachine(config)(p)
      // instead of filling the odd shape, fill a square
      const wholeScreen = [

            p.createVector(-p.width/2, -p.height/2), 
            p.createVector(p.width/2, -p.height/2),
            p.createVector(p.width/2, p.height/2), 
            p.createVector(-p.width/2, p.height/2)
            ]

      newMachine.trace = wholeScreen


      // // use waveform input to generate shape
      // const left = [[1730,3539],[-481,-339],[314,-372],[-194,-494],[133,-115],[53,-5],[7,-196],[112,-12],[-130,84],[74,34],[0,-80],[-72,-38],[-28,-30],[-6,8],[21,-2],[-20,-22],[13,2],[32,-43],[-27,4],[-3,-8],[6,25],[8,3],[-4,-11],[11,14],[-0,12],[16,-1],[8,-16],[12,-3],[-2,-3],[1,7],[6,0],[4,-4],[-3,-9],[2,8],[-5,4],[-3,-3],[13,-6],[9,6],[-0,0]]
      // let vectorlist = left.map(w => p.createVector(w[0], w[1]))

      // let newMachine = LineMachine(config)(p)
      // newMachine.waves = vectorlist ? newMachine.generator.generateWavesFromVectorList(vectorlist, vectorlist.length) : newMachine.generator.generateRandomWaves(18, 1/(1.618))
      // newMachine.tracePoints()
      // newMachine.resize(resize)
      // newMachine.tracePoints()


      // figure out the potential boundaries of the shape when rotated  
      let x_max, y_max, x_min, y_min, width, height
      // get an extended bounding box
      ({ x_max,  y_max,  x_min,  y_min, width, height} = newMachine.rotationSafeBoundingBox())
      // console.log(x_max,  y_max,  "x_min:", x_min, "y_min;",  y_min, width, height)

      // scale also known as resolution. smaller number -> more computation needed
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
 

      const rgb = hexToRgb(color) // take the default color provided in DoTheThing
      let cyan, magenta, yellow, black  
      [cyan, magenta, yellow, black] = RGBtoCMYK(...rgb)
      const colorsCYMK = [cyan, magenta, yellow, black] // this is a sort of backup color
      const colorsHex = [ 
        p.color('#00FFFF'), 
        p.color('#FF00FF'),
        p.color('#FFFF00'), 
        p.color('#000000'),
        ] // hex representation of CYMK Colors

      // analyse the whole current canvas to assign values for each CMYK grid
      // each rosette CMYK dot grid gets its separate iteration
      grids.forEach((grid, index) => {
        let angle = angles[index] // helper variable to keep track of f parameters
        grid.forEach((x, y, val) => { // iterate over each dot in the specific dot grid

          // index tells us which color grid we are in
          // colorsCYMK contains contains the cymk values precomputed based on the main color in rgb given earlier
          let color2 = colorsCYMK[index] 
          let cya, mag, yel, bla 
          let CYMKValues
          

          const idk = -p.width/5 // idk why this is quite right but it seems to
          const idk_y = -p.height/5 // idk why this is quite right but it seems to
          let unrotatedPoint = rotatePoint(p, offsetX, offsetY, angle, (x * scale + idk), (y * scale + idk_y))
          const colorAtPixel = p.get(unrotatedPoint[0], unrotatedPoint[1])
          let cymkResult =  RGBtoCMYK(
            colorAtPixel[0],
            colorAtPixel[1],
            colorAtPixel[2])

          color2 = cymkResult[index]

          grid.setVal(x, y, (color2)) // THIS IS VERY IMPORTANT

        })
      })

      // clear the canvas
      p.background('white')
      // apply and draw the grid
      grids.forEach((grid, index) => {
        let angle = angles[index] // helper variable to keep track of parameters
        grid.forEach(displayF(scale, angle, width/2, colorsHex[index]),
          isInPolyF(rotatePoints(p, newMachine.trace, angle, x_min, y_min, width, height), scale, x_min, y_min)
          )
      })

      p.pop()

      // // frame and debugging
      // p.push()
      // p.translate(offsetX - x_min - width / 2, offsetY - y_min - height / 2)

      // // debugging shape outline
      //  // drawShapeOutline(newMachine.trace, p.color(colors.mineShaft))
      // // drawShapeOutline(newMachine.trace, p.color(...rgb))//mineShaft))

      // // newMachine.fill = false
      // // newMachine.color = p.color(rgb)
      // // newMachine.display(30, 1)

      // // // debugging bounding box
      // // p.noFill()
      // // p.rect(x_min, y_min, width, height)
      
      // // const info = newMachine.traceInfo()
      // // const margin = 20
      // // p.strokeWeight(margin - 10)
      // // p.noFill()
      // // p.rect(info.minX - margin/2, info.minY - margin/2, info.maxX -  info.minX + margin,  info.maxY -  info.minY + margin)

      // p.pop()
    }


    const displayBorder = (x, y, width, height, stroke) => {
      p.stroke(stroke || colors.bigStone)
      let strokeWeight = p.sqrt(p.min(width,height))
      p.strokeWeight(strokeWeight)
      p.noFill()
      // p.rect(width * x + strokeWeight, height * y + strokeWeight, width - strokeWeight*2, height - strokeWeight*2, p.sqrt(p.min(width,height)))
      p.rect(0, 0, width , height, 30)
    }


    // preload image
    let img;
     p.preload = function () {
      img = p.loadImage('/image_2.png');
    }

    // setup
    p.setup = function () {
      // prepare canvas
      // p.createCanvas(4608 / 8, 8192 / 8); // handy tall frame
      const size = 500
      p.createCanvas(size, size);
      p.background(p.color(colors.springWood))
      noisyBackground(p, hexToRgb(colors.springWood), 7)
      img.resize(size, 0)
      p.image(img,0,0)
      noiseEverywhere(p, 3) // after showing image, introduce noise


      // read config
      const width = p.width
      const height = p.height
      const resize = p.min(width, height) / p.height * 1.3//(width > height ? p.height : p.width)
      const scale = 2 //big number means faster render time
      const color = colors.bigStone/*colors.springWood*//*colors.goblin*//*randomColor(unnamedColorScheme)*/
      const symmetricity = p.random(1) < 0.2 //symmetricity is true once in five

      // do the main thing
      displayThing(0.5 * width, 0.5 * height, resize, scale, color, symmetricity)

      displayBorder(0, 0, width, height, color)

      // again introduce noise to simulate effect of photograph
      noiseEverywhere(p, 3)
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

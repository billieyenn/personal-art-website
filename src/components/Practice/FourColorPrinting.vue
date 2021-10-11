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
import {colors as colors} from '../../colors.js'


let sketch = (config) => {
  return function (p) {
    const scale = 5
    const increment = 0.02 // kind of 'zoom'
    let flowField
    let flowField2
    let flowField3
    let flowField4
    let rows
    let cols
    let offsetY = 0
    let rotationAngle = 137.5
    let colorAlpha = 255




    p.setup = function () {
      p.createCanvas(700, 700);
      p.background(p.color(colors.pearlBush))
      rows = p.floor(p.width / scale)
      cols = p.floor(p.height / scale)
      p.angleMode(p.DEGREES)
      p.blendMode(p.MULTIPLY)


            //YELLOW
      {
        flowField3 = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let size = p.noise(offsetX, offsetY) * scale
            let v = p.createVector(1,0)
            offsetX += increment
            p.noStroke()
            let color = p.color('#FFFF00')
            color.setAlpha(colorAlpha)
            p.fill(color)
            p.push()
            p.translate(x * scale, y * scale)

            p.ellipse(0,0,size,size)
            p.pop()
          }
          offsetY += increment
        }
      }



p.push()
      p.translate(p.width/2, p.height/2)


            p.rotate(15)

      //CYAN
      {
        flowField = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let size = p.noise(offsetX, offsetY) * scale
            let v = p.createVector(1,0)
            offsetX += increment
            p.noStroke()
            let color = p.color('#00FFFF')
            color.setAlpha(colorAlpha)
            p.fill(color)
            p.push()
            p.translate(x * scale - p.width/2, y * scale - p.height/2)

            p.ellipse(0,0,size,size)
            p.pop()
          }
          offsetY += increment
        }
      }

      

      p.rotate(30)
            //BLACK
      {
        flowField4 = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let size = p.noise(offsetX, offsetY) * scale
            let v = p.createVector(1,0)
            offsetX += increment
            p.noStroke()
            let color = p.color('#000000')
            color.setAlpha(colorAlpha)
            p.fill(color)
            p.push()
            p.translate(x * scale - p.width/2, y * scale - p.height/2)

            p.ellipse(0,0,size,size)
            p.pop()
          }
          offsetY += increment
        }
      }


      p.rotate(30)
      //MAGENTA
      {
        flowField2 = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let size = p.noise(offsetX, offsetY) * scale
            let v = p.createVector(1,0)
            offsetX += increment
            p.noStroke()
            let color = p.color('#FF00FF')
            color.setAlpha(colorAlpha)
            p.fill(color)
            p.push()
            p.translate(x * scale - p.width/2, y * scale - p.height/2)

            p.ellipse(0,0,size,size)
            p.pop()
          }
          offsetY += increment
        }
      }



            p.pop()

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

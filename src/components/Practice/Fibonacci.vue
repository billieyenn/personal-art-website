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
import blob from '../../linemachine.js'

//console.log(blob)

let sketch = (config) => {
  return function (p) {

    const G = (1 + math.sqrt(5)) / 2 // the golden ratio
    
    const fibonacci = (n) => {
      if (n <= 1) return 1;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }

    const drawGoldenRectangle = (width, steps, until) => {
      p.push()
      let u = width / fibonacci(steps) / G
      if (steps % 4 == 0)
        p.translate(-fibonacci(steps+1)*u, 0*u)
      if (steps % 4 == 1)
        p.translate(0, fibonacci(steps)*u)
      if (steps % 4 == 2)
        p.translate(fibonacci(steps)*u, 0*u)
      if (steps % 4 == 3)
        p.translate(-0, -fibonacci(steps+1)*u)

      for (let i = steps; i > (until || 0); i--) {
        if (i % 4 == 0)
          p.translate(fibonacci(i+1)*u, 0*u)
        if (i % 4 == 3)
          p.translate(fibonacci(i-1)*u, fibonacci(i+1)*u)
        if (i % 4 == 2)
          p.translate(-fibonacci(i)*u, fibonacci(i-1)*u)
        if (i % 4 == 1)
          p.translate(-0, -fibonacci(i)*u)
        const keys = Object.keys(colors)
        const colLen = keys.length
        const col = colors[keys[Math.floor(Math.random()*colLen)]]
        p.fill(p.color(col))
        p.rect(0, 0, fibonacci(i)*u, fibonacci(i)*u, p.sqrt(fibonacci(i)*u))
//        p.ellipseMode(p.CORNER)
//        p.ellipse(0, 0, fibonacci(i)*u, fibonacci(i)*u)
      }
      p.pop()
    }




let L

    p.setup = function () {
      p.createCanvas(1404, 1404 / G)
      p.background(p.color(colors.pearlBush))



    const LineMachine = blob(config)
    L = LineMachine(p)
    L.waves = L.generator.generateRandomWaves(3, 1, false)
    L.tracePoints()
    L.resize(0.5)
    L.tracePoints()

    console.log(L)



      //p.noFill()
      //p.stroke(0)
      //p.strokeWeight(5)
      p.noStroke()

      let recursions = 15
      let width = (p.width - p.width / G / G / G / G) / 2
      let u = 1

      p.push()
// centered
//      p.translate(p.width / 2 - width / 2, p.height / 2 - width / G / 2)

      p.translate( p.width / G / G / G / G / G / G / G, p.width / G / G / G / G / G / G / G / G)
      drawGoldenRectangle(width, recursions, 5)

      p.translate(p.width / 2 , 0)
      drawGoldenRectangle(width, recursions, 10)


      p.translate(- p.width / 2 , p.height / 2) 
      drawGoldenRectangle(width, recursions, 13)

      p.translate(p.width / 2, 0)
      drawGoldenRectangle(width, recursions, recursions - 1)

//      p.translate(p.width / 2 - width, p.height / 2 - width / G)
      
      /*
      p.translate(width * 2, width * G)
      p.rotate(p.PI)
      drawGoldenRectangle(width, recursions, recursions - 5)
      */
      
      p.pop()
    


    L.display()
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

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

    const randomColor = (colors) => {
      const keys = Object.keys(colors)
      const colLen = keys.length
      const col = colors[keys[Math.floor(Math.random()*colLen)]]
      return col
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

        p.fill(p.color(randomColor(colors)))
//        p.rect(0, 0, fibonacci(i)*u, fibonacci(i)*u, p.sqrt(fibonacci(i+1)*u))
        p.ellipseMode(p.CORNER)
        p.ellipse(0, 0, fibonacci(i)*u, fibonacci(i)*u)

        // add some other element in the rect
        p.push()
        p.translate(fibonacci(i)*u / 2, fibonacci(i)*u / 2)
        let newMachine = LineMachine(p)
        newMachine.waves = newMachine.generator.generateRandomWaves(i, 1/G, false)
        newMachine.tracePoints()
        const resize = fibonacci(i - 1)*u / p.min(p.width, p.height)
        newMachine.resize(resize)
        newMachine.tracePoints()
        newMachine.fill = false
        newMachine.color = randomColor(colors)
        newMachine.display(25, 1)
        p.pop()
      }
      p.pop()
    }


    let LineMachine// = blob(config)

    p.setup = function () {
      p.createCanvas(1404 / G, 1404)
      p.background(p.color(colors.pearlBush))
    
    LineMachine = blob(config)



      p.noStroke()
  
      let recursions = 18
      let width = (p.width - p.width / G /G /G) * 2 
      let u = 1
      p.translate( p.width / G / G / G / G / G / G / G / G, p.width / G / G / G / G / G / G / G / G / G)

      drawGoldenRectangle(width, recursions, 5)

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

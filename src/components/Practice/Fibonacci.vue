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

import colors from '../../colors.js'

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
        p.fill(p.color(colors[Object.keys(colors)[Math.floor(Math.random()*Object.keys(colors).length)]]))
        p.rect(0, 0, fibonacci(i)*u, fibonacci(i)*u, p.sqrt(fibonacci(i)*u))
      }
      p.pop()
    }



    p.setup = function () {
      p.createCanvas(1404, 1404 / G)
      p.background(p.color(colors.pearlBush))
      //p.noFill()
      p.stroke(0)
      p.strokeWeight(5)

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
      drawGoldenRectangle(width, recursions, 14)

//      p.translate(p.width / 2 - width, p.height / 2 - width / G)
      
      /*
      p.translate(width * 2, width * G)
      p.rotate(p.PI)
      drawGoldenRectangle(width, recursions, recursions - 5)
      */
      
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

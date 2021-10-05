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
    
    const randomColor = (colors) => {
      const keys = Object.keys(colors)
      const colLen = keys.length
      const col = colors[keys[Math.floor(Math.random()*colLen)]]
      return col
    }

    let LineMachine
    let excrement

    let machines

    let flies
    p.setup = function () {
      p.createCanvas(1000, 1000/*, p.WEBGL*/)
//      p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, 0, 1000);
      p.background(p.color(colors.pearlBush))
      LineMachine = blob(config)
      excrement = LineMachine(p)
      excrement.waves = excrement.generator.generateRandomWaves(7, 1/G, false)
      excrement.tracePoints()
      excrement.resize(0.6)
      excrement.tracePoints()
      excrement.fill = true
      excrement.color = '#7b5c00'

      flies = []
      machines = []
      {
        for (let i = 0; i < 100; i++) 
          machines.push(LineMachine(p))
      }

      machines.forEach(newMachine => {
        newMachine.fill = false
        newMachine.color = randomColor(colors)
        newMachine.waves = newMachine.generator.generateRandomWaves(p.random(5, 10), 1/G, false)  // generate a flight path for flies randomly
        newMachine.tracePoints()
        newMachine.resize(p.random(0.2, 0.4)) // make the flight path varying in size
        newMachine.tracePoints()

        const randomPoint = excrement.trace[p.floor(p.random(0, excrement.trace.length - 1))]
        newMachine.waves[0].vector.x = randomPoint.x // translate the starting point of a fly to the outline of the excrement
        newMachine.waves[0].vector.y = randomPoint.y

//        newMachine.waves[0].vector.x = p.random( - p.width * 0.6 / 2, p.width * 0.6 / 2)
//        newMachine.waves[0].vector.y = p.random( - p.height * 0.6 / 2, p.height * 0.6 / 2)
        let newFly = LineMachine(p)
        newFly.waves = newFly.generator.generateWavesFromVectorList(newMachine.waves.map(w => p.createVector(w.vector.x,w.vector.y)), 4)
        newFly.waves[0].vector.x = 0
        newFly.waves[0].vector.y = 0
        newFly.tracePoints()
        newFly.resize(0.1) // make the flight path varying in size
        newFly.tracePoints()
        newFly.waves[newFly.waves.length - 1].freeze()

        console.log(newFly.waves[newFly.waves.length - 1])
        newFly.fill = true
        newFly.color = randomColor(colors)

        flies.push(newFly)
      })
    }

    p.draw = function() {
      p.background(p.color(colors.pearlBush))
      p.translate(p.width / 2, p.height / 2)
      //p.rotateX(-2)
      excrement.display(15)

      {
        for(let i = 0; i < machines.length; i++) {
          let newMachine = machines[i]
        /*machines.forEach(newMachine => {*/
          newMachine.rotate()
          const firstPoint = p.createVector(newMachine.waves[0].vector.x, newMachine.waves[0].vector.y)
          const firstPoint2 = p.createVector(newMachine.waves[0].vector.x, newMachine.waves[0].vector.y)
          const newPoint = newMachine.waves.reduce((_, wave) => firstPoint.add(wave.vector))
          p.fill(p.color(newMachine.color))
//          p.noStroke()
          p.ellipse(newPoint.x, newPoint.y, 5)
          //console.log(flies[i].trace.length)
          p.push()
          p.translate(firstPoint2.x, firstPoint2.y)

          //newMachine.display()
          p.pop()

          p.push()
          p.translate(newPoint.x, newPoint.y)
          let fly = flies[i]
//          fly.rotate()
//          console.log(fly.trace)
//          fly.tracePoints()
//          fly.display()
          p.pop()
        }
      }
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
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

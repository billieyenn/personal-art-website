/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <button @click="refresh">Redraw</button>
    <br>
    <label for="complexity">Complexity</label>
    <input v-model="config.complexity" type="number" name="complexity">
    <br>
    <label for="speed">Slowdown factor</label>
    <input v-model="config.speed" type="number" name="speed">
    <br>
    <p>Press 'spacebar' to pause</p>
    <button @click="pause">Or press this button to pause, followed by redraw</button>

    <div >
      <div id="canvas" :key="componentKey"></div>
    </div>

  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */

let sketch = (config) => {
  return function (p) {
function randomHash () {
      const x = '0123456789abcdef'
      let hash = '0x'
      for (let i = 64; i > 0; --i) {
        hash += x[math.floor(math.random() * x.length)]
      }
      return hash
    }

    const tokenData = {
      hash: randomHash(),
      // "hash": "0x0d11e9a6862358fcd49514c34d1008d4a5bba02dd48abe03731a711bc1543620",
      tokenId: '123000456'
    }
    console.log('hash: ' + tokenData.hash)

    const seed = parseInt(tokenData.hash.slice(0, 16), 16)
    console.log('seed: ' + seed)

    // inspiration from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
    class Mulberry32 {
      constructor (seed) {
        this.seed = seed
      }

      randomDec () {
        var t = this.seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
      }

      randomNum (a, b) {
        return a + (b - a) * this.randomDec()
      }

      randomInt (a, b) {
        return Math.floor(this.randomNum(a, b + 1))
      }
    }

    const R = new Mulberry32(seed)
   

const generateRandomWaves = function (complexity, decay, symmetricity, rotationDirections) {
      const waves = []
      let newvect = p.createVector(0, 0)
      const w1 = new Wave(
        newvect,
        0
      )
      waves.push(w1)
      // loop condition keeps wave counts small by not letting too many pointless vectors to exist
      for (let i = 1; i < complexity && p.pow(decay, i - 1) > 0.01; i++) {
        const dec = p.pow(decay, i - 1)
        const randomNumbers = []
        if (symmetricity) { // if symmetrical
          const randomNumber1 = R.randomNum(dec, -dec)
          randomNumbers.push(randomNumber1)
          randomNumbers.push(randomNumber1)
          const randomNumber2 = R.randomNum(dec, -dec)
          randomNumbers.push(randomNumber2)
          randomNumbers.push(randomNumber2)
        } else {
          let iii = 0
          while (iii < 4) {
            randomNumbers.push(R.randomNum(dec, -dec))
            iii++
          }
        }

        let frequency = i
        let parent
          newvect = p.createVector(randomNumbers[0], randomNumbers[1])
          parent = waves[waves.length - 1]
          waves.push(new Wave(newvect, frequency, parent))

        newvect = p.createVector(randomNumbers[2], randomNumbers[3])
        frequency = -i
        parent = waves[waves.length - 1]
        waves.push(new Wave(newvect, frequency, parent))
      }
      return waves
    }

    const constructWaveFunctions = function (c, complexity) {
      const waves = []

      const w1 = new Wave(c[0], 0)
      waves.push(w1)
      let ii = 1
      for (let i = 1; i < complexity; i++) {
        let vector = c[ii]
        let frequency = i
        let parent = waves[waves.length - 1]
        waves.push(new Wave(vector, frequency, parent))
        ii++

        vector = c[ii]
        frequency = -i
        parent = waves[waves.length - 1]
        waves.push(new Wave(vector, frequency, parent))
        ii++
      }
      return waves
    }

    const tracePoints = function (waves, fps, slowdownFactor, complexity) {
      const trace = []
      const wavesIncluded = waves.slice(0, complexity * 2 + 1)
      // accumulate points until full cycle complete
      while (fps * slowdownFactor > trace.length) { // -2 bc then first and last point are same
        p.push()
        wavesIncluded.forEach((el) => {
          el.rotate()
          // el.display() //show the vectors as they go
        })
        p.pop()

        const newPoint = p.createVector(waves[0].vector.x, waves[0].vector.y)
        trace.push(waves.reduce((_, wave) => newPoint.add(wave.vector)))
      }
      return trace
    }

     class Wave {
      constructor (vector, f, parent) {
        this.frequency = (f * p.TWO_PI) / fps / slowdownFactor // full circle performed after
        this.vector = vector
        this.parent = parent
      }

      rotate () {
        this.vector.rotate(this.frequency)
      }

      display () {
        if (this.parent) {
          p.translate(this.parent.vector.x, this.parent.vector.y)
        }
        p.line(0, 0, this.vector.x, this.vector.y)
      }

      mult (a) {
        this.vector.mult(a)
      }
    }


     // display output
    const display = function (trace, weight, filled = false, cycleRatio, bgColor, randomColorIndex) {
      // line art
      const traceLength = trace.length * cycleRatio
      // the trace goes around
        /*
        p.noFill()
        */
        p.strokeWeight(0.1)
        p.fill(p.color('#fb8b24'))
        //p.noStroke()
         p.beginShape()
        for (let ii = 0; ii < 0 + traceLength - 1; ii++) {
          const i = ii + 0 % trace.length
          /*
          p.line(trace[(i)].x, trace[(i)].y, trace[(i+1)].x, trace[(i+1)].y )
          */
          p.curveVertex(trace[(i) % trace.length].x, trace[(i) % trace.length].y)
          //p.curveVertex(trace[(i + 1) % trace.length].x, trace[(i + 1) % trace.length].y)
          //p.curveVertex(trace[(i + 2) % trace.length].x, trace[(i + 2) % trace.length].y)
          //p.curveVertex(trace[(i + 3) % trace.length].x, trace[(i + 3) % trace.length].y)
        }
           p.endShape()
      
    }

    const traceInfo = function (trace) {
      const traceX = trace.map(el => el.x)
      const traceY = trace.map(el => el.y)
      const maxX = p.max(traceX)
      const maxY = p.max(traceY)
      const minX = p.min(traceX)
      const minY = p.min(traceY)
      const offsetX = (maxX + minX) / 2
      const offsetY = (maxY + minY) / 2
      let totalDistance = 0
      for (let i = 0; i < trace.length - 1; i++) {
        totalDistance += trace[i].dist(trace[i + 1])
      }
      // scale waves to generate shape within bounds
      const traceSize = p.max(maxX - minX, maxY - minY) // assumption: width == height
      return {
        maxX, maxY, minX, minY, offsetX, offsetY, traceSize, totalDistance
      }
    }
    const windowSize = 1000

    const fps = 60
    let slowdownFactor// = 8 * complexity // bigger number is slower drawing
    let complexity
    let waves = [] // the tracer machine stores its parameters here
    let trace = [] // points for the drawing are stored here
    const weight = windowSize / 2400 * 10
    let knobs = []
    const knobSize = 100
    let knobSelected = false
    let selectedKnob = null

    let paused// = config.paused

class Knob {
  constructor (pos, index, size, wave) {
    this.pos = pos
    this.index = index
    this.size = size
    this.wave = wave
    this.selected = false
    this.edited = false
  }

  isClicked () {
    if (!this.selected && this.isPressed()) {
      this.select()
    }
  }

  select () {
    if (!knobSelected) {
      this.selected = true
      selectedKnob = this
      knobSelected = true
      // console.log(this.index + " is selected")
    }
  }

  isPressed () {
    return p.mouseIsPressed && p.createVector(p.mouseX, p.mouseY).dist(this.pos) < this.wave.vector.mag() / 2 + 10 // the +10 is because mouse moves more than 1 pixel per frame
  }

  drag () {
    if (this.isPressed() && this.selected) {
      //this.wave.vector.x = (p.mouseX - this.pos.x) * 2
      //this.wave.vector.y = (p.mouseY - this.pos.y) * 2
      this.edited = true
    }
  }

  display () {
    if (this.isPressed()) {
      p.fill(200)
    } else {
      p.fill(255)
    }
    p.ellipse(this.pos.x, this.pos.y, this.wave.vector.mag())
    p.line(this.pos.x, this.pos.y, this.pos.x + this.wave.vector.x / 2, this.pos.y + this.wave.vector.y / 2)
  }
}

    p.setup = function () {
      complexity = config?.complexity || 4
      slowdownFactor = config.speed || 4 * complexity
      paused = config.pause

      p.createCanvas(windowSize, windowSize);
      p.background(250)

      waves = generateRandomWaves(complexity, 1, false, 2)
      // console.log(waves)
      // let the wave machine run a trace
      trace = tracePoints(waves, fps, slowdownFactor, complexity)
      let traceInfoObj = traceInfo(trace)
      const resizeFactor = p.width * 0.8 / traceInfoObj.traceSize
      waves.forEach(w => w.vector.mult(resizeFactor))

      // rerun machine with corrected scale
      trace = tracePoints(waves, fps, slowdownFactor, complexity)

      p.push()
      p.translate(p.width/2, p.height/2)
      display(trace, weight, false, 1, null, null)
      p.pop()
      let i = 0
      const temp = []
      for (const wave of waves) {
        temp.push(new Knob(
          p.createVector(knobSize / 2 + i * p.width / waves.length, p.height - knobSize), 
          p.ceil(wave.frequency / p.TWO_PI * fps * slowdownFactor), 
          knobSize, 
          wave)
        )
        i++
      }
      knobs = temp
      // console.log(knobs)
    }
    p.draw = function () {
      p.background(250)
      /*
      if (!p.mouseIsPressed) {
        p.push()
        p.translate(p.width/2, p.height/2)
        display(trace, weight, false, 1, null, null)
        p.pop()
      } 
      */

      knobs.forEach(knob => {
       // knob.display()
       knob.isClicked()
       knob.drag() 
      })

    

      //draw shape
      p.push()
      p.translate(p.width/2, p.height/2)
      display(trace, weight, false, 1, null, null)
      p.pop()
      
      //draw tracer
      p.push()
      p.translate(p.width/2, p.height/2)
      waves.forEach(wave => { 
        if (!paused) {
          wave.rotate(); 
        }
        wave.display()})
      p.pop()

      //draw knobs
      knobs.forEach(knob => {
       knob.display()
      })


      if (p.mouseIsPressed) {
        if (selectedKnob) {
        selectedKnob.wave.vector.x = (p.mouseX - selectedKnob.pos.x) * 2
        selectedKnob.wave.vector.y = (p.mouseY - selectedKnob.pos.y) * 2
        trace = tracePoints(waves, fps, slowdownFactor, complexity)

      }
      }
    }

    p.mouseReleased = function () {
      knobSelected = false
      selectedKnob = null
      knobs.forEach(knob => {
        if (knob.edited) {
          knob.edited = false
        }
        knob.selected = false
      })
    }
/*
    p.mousePressed = function () {
      if (selectedKnob) {
        selectedKnob.wave.vector.x = (p.mouseX - selectedKnob.pos.x) * 2
        selectedKnob.wave.vector.y = (p.mouseY - selectedKnob.pos.y) * 2
        trace = tracePoints(waves, fps, slowdownFactor, complexity)

      }
    }
*/

    p.keyPressed = function () {
      if (p.keyCode === 32) {
    paused = !paused

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
      componentKey: 0,
      config: {
        complexity: 3,
        speed: 4,
        pause: false
      }
    }
  },
  async mounted () {
    /*
    const baseURI = 'https://raw.githubusercontent.com/billieyenn/test-art/main/sketch.js'
    let sketch = await this.getSketch(baseURI, this.config)
    console.log(sketch)
    */

    this.p5canvas = new P5(sketch(this.config), 'canvas')

  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
    pause () {
      this.config.pause = !this.config.pause
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

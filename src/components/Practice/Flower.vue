/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <button @click="refresh">Redraw</button>
    <br>
    <label for="hash">Hash</label>
    <input v-model="config.hash" type="text" name="hash">
    <br>
    <label for="complexity">Complexity</label>
    <input v-model="config.complexity" type="number" name="complexity">
    <br>
    <label for="speed">Slowdown factor</label>
    <input v-model="config.speed" type="number" name="speed">
    <br>
    <label for="vectorList">Vector List: See console log for array of vectors</label>
    <input v-model="config.vectorList" type="text" name="vectorList">
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



import { flower as colors } from '../../colors.js'

let sketch = (config) => {
  return function (p) {
    const randomHash = function () {
      const x = '0123456789abcdef'
      let hash = '0x'
      for (let i = 64; i > 0; --i) {
        hash += x[math.floor(math.random() * x.length)]
      }
      return hash
    }

    const tokenData = {
      hash: randomHash(),
      tokenId: '123000456'
    }


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

    class Wave {
      constructor (vector, f, parent, frozen) {
        this.frequency = (f * math.PI * 2) / fps / slowdownFactor // full circle performed after
        this.vector = vector
        this.parent = parent
        this.frozen = frozen || false
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


    class Generator {
      constructor () {}

      generateWavesFromVectorList (vectorlist, complexity) {
        const waves = []; 
        let w1 = new Wave(
          vectorlist[0],
          0
          );
        waves.push(w1);
        let ii = 1;
        //loop condition keeps wave counts small by not letting too many pointless vectors to exist
        for (let i = 1; i < vectorlist.length / 2; i++) {
          if (waves.length >= complexity*2 - 1 && complexity != 1)
            break
          waves.push(new Wave(vectorlist[ii], i, waves[waves.length - 1]));
          ii++;
          waves.push(new Wave(vectorlist[ii], -i, waves[waves.length - 1]));
          ii++;
        }
        return waves
      }

      constructWaveFunctions (c, complexity) {
        const waves = []

        const w1 = new Wave(c[0], 0)
        waves.push(w1)
        let ii = 1
        for (let i = 1; i < complexity; i++) {
          waves.push(new Wave(c[ii], i, waves[waves.length - 1]))
          ii++
          waves.push(new Wave(c[ii], -i, waves[waves.length - 1]))
          ii++
        }
        return waves
      }

      generateRandomWaves (complexity, decay, symmetricity, rotationDirections) {
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

          newvect = p.createVector(randomNumbers[0], randomNumbers[1])
          waves.push(new Wave(newvect, i, waves[waves.length - 1]))

          newvect = p.createVector(randomNumbers[2], randomNumbers[3])
          waves.push(new Wave(newvect, -i, waves[waves.length - 1]))
        }
        return waves
      }
    }

    class Machine {
      constructor (waves, trace, fill, color) {
        this.waves = waves
        this.trace = trace || []
        this.fill = fill || false
        this.color = color || p.color(200)
      }

      tracePoints (fps, slowdownFactor) {
        const trace = []
        const wavesIncluded = this.waves.slice(0, this.waves.length)
        // accumulate points until full cycle complete
        while (fps * slowdownFactor > trace.length) { // -2 bc then first and last point are same
          p.push()
          wavesIncluded.forEach((el) => {
            el.rotate()
            // el.display() //show the vectors as they go
          })
          p.pop()

          const newPoint = p.createVector(this.waves[0].vector.x, this.waves[0].vector.y)
          trace.push(this.waves.reduce((_, wave) => newPoint.add(wave.vector)))
        }
        this.trace = trace
      }

      display (weight, filled = false, cycleRatio, bgColor, randomColorIndex) {
        // line art
        const traceLength = this.trace.length * cycleRatio
        // the trace goes around
        if (this.fill) {
          p.fill(this.color)
          p.noStroke()
        } else {
          p.noFill()
          p.strokeWeight(1)

        }
        /*
        */
        //p.noStroke()
        p.push()
        p.translate(this.waves[0].vector.x, this.waves[0].vector.y)
        p.beginShape()
        for (let ii = 0; ii < 0 + traceLength + 3; ii++) {
          const i = ii + 0 % this.trace.length
          p.curveVertex(this.trace[(i) % this.trace.length].x, this.trace[(i) % this.trace.length].y)
        }
        p.endShape()
        p.pop()
      }

      resize (scale) {
        let traceInfoObj = this.traceInfo()
        const resizeFactor = p.width * scale / traceInfoObj.traceSize
        console.log(resizeFactor)
        this.waves.forEach(w => w.vector.mult(resizeFactor))

        // rerun machine with corrected scale
        this.trace = this.tracePoints(fps, slowdownFactor)
      }

      traceInfo () {
        const traceX = this.trace.map(el => el.x)
        const traceY = this.trace.map(el => el.y)
        const maxX = p.max(traceX)
        const maxY = p.max(traceY)
        const minX = p.min(traceX)
        const minY = p.min(traceY)
        const offsetX = (maxX + minX) / 2
        const offsetY = (maxY + minY) / 2
        let totalDistance = 0
        for (let i = 0; i < this.trace.length - 1; i++) {
          totalDistance += this.trace[i].dist(this.trace[i + 1])
        }
        // scale waves to generate shape within bounds
        const traceSize = p.max(maxX - minX, maxY - minY) // assumption: width == height
        return {
          maxX, maxY, minX, minY, offsetX, offsetY, traceSize, totalDistance
        }
      }
    }


    let seed
    let R
    const windowSize = 1000
    const fps = 60
    let slowdownFactor// = 8 * complexity // bigger number is slower drawing
    let complexity
    const weight = windowSize / 2400 * 10

    let knobs = []
    const knobSize = 100
    let knobSelected = false
    let selectedKnob = null

    let paused// = config.paused
    let vectorPrefixes

    let machines// = []

    p.setup = function () {
      const hash = config.hash || tokenData.hash
      console.log('hash: ' + hash)

      seed = parseInt(hash.slice(0, 16), 16)
      R = new Mulberry32(seed)
      complexity = config?.complexity || 4
      slowdownFactor = config.speed || 4 * complexity
      paused = config.pause
      vectorPrefixes = (config.vectorList.length === 0) ? [] : JSON.parse(config.vectorList)


      p.createCanvas(windowSize, windowSize);
      p.background(p.color(colors.pearlBush))


      let vectors = vectorPrefixes.map(w => p.createVector(w[0], w[1]))

      let flowerVectors = [["0.0","0.0"],["-89.0","10.0"],["46.0","-7.2"],["-14.9","2.0"],["24.2","37.8"],["-8.6","0.8"],["9.8","-8.4"],["-7.9","14.8"],["32.6","5.2"],["-3.3","4.3"],["2.6","17.0"],["-8.9","1.8"],["3.5","-6.4"],["-0.3","5.3"],["7.8","-0.8"],["-8.5","0.0"],["6.8","14.8"],["4.5","1.8"],["2.0","1.1"],["4.7","5.4"],["-0.1","2.2"],["0.1","2.8"],["11.8","3.8"],["0.1","-0.8"],["2.2","0.3"],["3.5","7.4"],["2.5","-4.9"],["-2.4","8.5"],["-1.7","5.3"],["0.1","-5.4"],["5.0","-7.2"],["2.1","-4.3"],["-4.7","3.8"],["-0.8","1.7"],["-4.9","1.5"],["-4.5","3.6"],["3.9","10.2"],["1.1","0.4"],["6.1","-2.8"],["2.4","-2.1"],["0.4","-1.3"],["-0.3","-3.9"],["-2.0","4.6"],["-4.2","0.3"],["2.9","1.1"],["-6.7","-2.4"],["-0.3","1.4"],["-0.6","1.3"],["-0.3","1.8"],["1.0","0.1"],["7.9","7.0"],["-3.1","-0.3"],["1.8","-0.8"],["-2.5","-6.3"],["1.3","0.1"],["-4.6","1.0"],["2.6","4.0"],["-6.3","-0.8"],["5.2","1.3"],["-7.0","0.8"],["-2.0","0.8"],["-1.4","3.8"],["0.7","4.2"],["-4.9","4.2"],["2.6","1.5"],["-2.1","1.0"],["0.3","4.5"],["-2.0","0.3"],["2.6","3.3"],["-6.0","4.7"],["0.3","0.4"],["-2.5","1.8"],["-0.8","-0.0"],["-1.5","4.6"],["0.8","7.0"],["-0.6","5.2"],["1.4","3.1"],["-4.2","2.8"],["-0.3","2.8"],["-0.4","5.7"],["-1.5","1.3"],["-0.3","6.7"],["0.8","4.0"],["-0.7","4.9"],["-0.4","2.5"],["0.8","0.8"],["-2.8","2.9"],["1.0","4.0"],["-2.1","1.8"],["0.1","7.1"],["-1.0","4.6"],["1.0","2.9"],["0.3","2.8"],["4.0","2.9"],["-3.2","1.5"],["4.2","2.8"],["-4.3","2.6"],["0.6","4.6"],["-0.6","2.5"],["3.9","-0.6"],["-1.5","1.4"],["4.3","1.0"],["-4.3","2.4"],["3.6","0.6"],["-2.9","2.8"],["2.0","-1.0"],["-2.2","0.0"],["5.0","-1.1"],["-1.8","1.3"],["2.6","-2.0"],["-4.2","1.1"],["2.8","-3.5"],["-2.4","1.7"],["2.5","-2.2"],["-4.0","0.1"],["0.7","-1.4"],["-1.0","1.8"],["0.8","-3.3"],["-2.8","0.4"],["2.4","-4.3"],["-3.8","-0.1"],["1.8","-2.0"],["-4.0","0.7"],["-1.0","-3.9"],["-0.3","0.6"],["0.3","-5.6"],["-2.5","-1.1"],["-0.4","-4.9"],["-4.3","0.8"],["-3.2","-2.5"],["-4.3","1.7"],["-4.3","-3.1"],["-1.1","-0.3"],["-1.5","-2.9"],["-3.2","-2.4"],["-2.1","-2.2"],["-3.8","0.3"],["-3.2","-2.0"],["-2.2","-0.0"],["-5.3","-2.4"],["-2.5","-1.4"],["-3.3","-0.8"],["-3.2","-0.6"],["-4.6","-0.4"],["-3.1","-0.6"],["-3.6","-0.3"],["-2.6","-1.3"],["-4.0","0.7"],["-3.5","-1.4"],["-3.8","1.8"],["-1.4","-1.3"],["-3.5","1.0"],["-2.5","-2.0"],["-2.8","2.4"],["-2.5","-2.4"],["-4.2","3.2"],["-2.6","-0.6"],["-3.5","2.5"],["-0.4","-2.9"],["-1.3","2.8"],["-3.1","-1.8"],["-0.8","3.5"],["-2.6","-2.0"],["-2.5","3.8"],["-1.4","-1.1"],["-1.4","3.1"],["-1.3","-3.2"],["-0.3","4.2"],["-2.2","-2.2"],["0.8","3.6"],["-2.1","-1.0"],["0.7","3.9"],["-0.7","-2.8"],["0.4","2.2"],["-1.3","-3.3"],["1.7","2.5"],["-2.0","-2.5"],["1.4","2.4"],["-0.0","-1.7"],["0.4","2.6"],["-1.7","-3.1"],["1.3","1.4"],["-1.3","-3.1"],["2.1","3.3"],["-0.8","-2.0"],["2.8","1.8"],["0.4","-3.1"],["2.4","0.4"],["-1.0","-2.6"],["3.3","-0.1"],["-0.3","-2.4"],["1.4","0.1"],["0.4","-2.8"],["2.0","-0.7"],["-1.0","-2.2"],["2.2","-1.0"],["0.3","-2.2"],["0.6","-0.1"],["0.1","-2.8"],["1.4","-1.3"],["0.3","-3.3"],["1.5","-0.4"],["0.6","-1.3"],["1.5","-0.7"],["1.3","-2.5"],["-0.1","-2.0"],["0.6","-2.2"],["0.7","-1.3"],["0.3","-2.4"],["0.1","-0.4"],["1.3","-1.5"],["-0.3","-0.8"],["0.8","-2.1"],["0.3","-2.4"],["0.4","-2.0"],["-0.1","-1.1"],["0.8","-2.0"],["-1.0","0.0"],["1.3","-0.8"],["-1.1","-1.4"],["1.8","-1.5"],["-0.3","-1.0"],["0.6","-1.7"],["-0.4","-0.8"],["0.4","-1.3"],["-2.2","0.4"],["2.0","-0.7"],["-0.8","-1.1"],["1.5","-1.4"],["-0.7","0.1"],["0.3","-1.0"],["-0.8","0.1"],["1.0","-0.3"],["-1.8","-0.1"],["1.3","-1.3"],["-0.3","0.3"],["1.4","-0.6"],["-0.7","0.3"],["0.6","-0.4"],["-0.4","-0.4"],["1.1","-0.4"],["-0.4","0.1"],["0.4","-0.7"],["-1.1","0.6"],["1.5","0.0"],["-1.1","-0.1"],["0.8","-0.4"],["-0.1","-0.3"],["0.3","-0.3"],["-0.3","1.1"],["-0.0","0.1"],["-1.3","0.4"],["1.8","0.1"],["0.0","-0.3"],["0.8","-0.7"],["0.3","-0.1"],["-0.1","0.3"],["-0.7","0.6"],["-0.1","0.7"],["-1.4","-0.1"],["1.3","0.0"],["0.0","-0.1"],["0.3","-0.8"],["0.0","0.1"],["-0.3","0.6"],["-0.6","0.1"],["0.4","0.4"],["-1.3","-0.1"],["0.4","-0.3"],["-0.3","0.3"],["-0.3","0.1"],["-0.8","0.3"],["-0.1","0.3"],["-0.3","-0.0"],["0.1","-0.0"],["-0.7","0.1"],["-0.6","-0.1"],["-0.7","0.7"],["0.6","-0.1"],["-0.6","0.1"],["-0.1","-0.3"],["-0.3","0.6"],["-0.3","-0.4"],["-1.1","1.0"],["-0.4","0.4"],["-1.1","0.4"],["0.7","-0.8"],["-0.1","0.6"],["-0.6","-0.3"],["0.0","1.0"],["-0.6","-0.1"],["-1.0","1.0"],["-0.0","0.1"],["-0.6","0.6"],["0.1","-1.0"],["-0.1","1.1"],["-0.6","-0.6"],["0.1","1.0"],["-0.7","0.3"],["0.0","1.3"],["0.0","-0.7"],["-0.3","0.4"],["-0.3","-1.1"],["0.3","0.8"],["-0.7","-0.7"],["0.3","0.8"],["0.4","-0.1"],["-0.4","1.0"],["-0.6","-1.0"],["0.0","0.3"],["-0.4","-1.0"],["0.4","1.5"],["-0.4","-0.4"],["0.6","0.7"],["0.4","-1.1"],["0.4","0.3"],["-0.4","-0.8"],["1.1","0.1"],["-0.1","-0.7"],["0.1","0.4"],["0.3","-1.0"],["0.6","-0.0"],["-0.6","-0.8"],["0.8","-0.1"],["0.1","-0.7"],["-0.1","0.4"],["0.1","-1.1"],["0.6","-0.4"],["0.1","-1.5"],["0.6","0.1"],["0.3","-0.4"],["0.7","0.1"],["0.7","-1.1"],["-0.3","-0.6"],["0.3","-1.0"],["0.4","-0.1"],["0.0","-1.0"],["0.1","0.3"],["0.6","-0.6"],["-0.1","-0.0"],["0.4","-1.0"],["0.3","-1.0"],["0.3","-0.8"],["0.1","-0.3"],["0.4","-1.0"],["-0.4","0.4"],["0.7","-0.3"],["-0.4","-0.6"],["1.1","-0.8"],["0.1","-0.4"],["0.1","-0.8"],["0.1","-0.3"],["0.1","-0.6"],["-1.1","0.4"],["1.0","-0.3"],["-0.3","-0.6"],["1.0","-0.8"],["-0.1","0.1"],["0.1","-0.6"],["-0.3","0.1"],["0.6","-0.1"],["-0.8","-0.0"],["0.7","-0.7"],["-0.0","0.1"],["0.7","-0.3"],["-0.3","0.1"],["0.1","-0.3"],["-0.1","-0.3"],["0.7","-0.3"],["-0.1","0.0"],["0.3","-0.4"],["-0.7","0.3"],["1.0","0.1"],["-0.6","-0.1"],["0.4","-0.3"],["0.0","-0.3"],["0.1","-0.3"],["-0.1","0.7"],["0.0","0.0"],["-0.8","0.1"],["1.1","0.1"],["-0.0","-0.3"],["0.6","-0.4"],["0.1","-0.1"],["-0.1","0.1"],["-0.4","0.3"],["-0.1","0.4"],["-1.0","-0.1"],["0.8","0.0"],["0.0","0.0"],["0.1","-0.6"],["0.0","0.1"],["-0.1","0.3"],["-0.3","0.3"],["0.4","0.1"],["-0.8","-0.1"],["0.4","-0.3"],["-0.1","0.1"],["0.0","0.0"]].map(v => p.createVector(v[0], v[1]))

      let flowerBGVectors = [["-14","-62"],["-90","29"],["-11","-3"],["5","-4"],["2","-10"]].map(v => p.createVector(v[0], v[1]))

      let flowerStemVectors = [["6.0","38.0"],["-74.0","4.0"],["80.0","-6.0"],["-18.0","12.0"],["12.0","2.0"]].map(v => p.createVector(v[0], v[1]))

      let flowerLeafRightVectors = [["30.0","28.0"],["54.0","-36.0"],["-0.0","12.0"],["12.0","-20.0"],["-20.0","-0.0"]].map(v => p.createVector(v[0], v[1]))

      let flowerLeafLeftVectors = [["-44.0","58.0"],["44.0","-66.0"],["-2.0","4.0"],["4.0","-8.0"],["-8.0","12.0"]].map(v => p.createVector(v[0], v[1]))
     

      const G = new Generator()
      machines = []
      /*
      if (vectors.length > 0) {
        machines.push(new Machine(G.generateWavesFromVectorList(vectors, complexity)))
      } else {
        machines.push(new Machine(G.generateRandomWaves(complexity, 1, false, 2)))
      }
      */

      //machines.push(new Machine(G.generateRandomWaves(3, 1, false, 2), [], true))
      /*
      machines[0].tracePoints(fps, slowdownFactor)
      machines[0].resize(0.5)
      machines[0].waves[0].vector = p.createVector(R.randomNum(-p.width/4, p.width/4), R.randomNum(-p.height/4, p.height/4))
      machines[0].tracePoints(fps, slowdownFactor)
      */


      //rose
      machines.push(new Machine(G.generateWavesFromVectorList(flowerStemVectors, 2), [], true, p.color(colors.millbrook)))
      machines.push(new Machine(G.generateWavesFromVectorList(flowerLeafRightVectors, 3), [], true, p.color(colors.goblin)))
      machines.push(new Machine(G.generateWavesFromVectorList(flowerLeafLeftVectors, 3), [], true, p.color(colors.goblin)))
      machines.push(new Machine(G.generateWavesFromVectorList(flowerBGVectors, 3), [], true, p.color(colors.roseBud)))
      machines.push(new Machine(G.generateWavesFromVectorList(flowerVectors, 20), [], false))

      //machines.push(new Machine(G.generateRandomWaves(complexity, 1, false, 2)))
      
      {
        let a = 0
        while (a < 0) {
          machines.push(new Machine(G.generateWavesFromVectorList(flowerVectors, complexity)))
          a++    
        }
      }

      machines.forEach(m => {
        m.waves.push(new Wave(p.createVector(R.randomNum(1,5), 0), 1, m.waves[m.waves.length-1], true))
        m.tracePoints(fps, slowdownFactor)
      })


      console.log(JSON.stringify(machines[0].waves.map(w => [w.vector.x.toFixed(1), w.vector.y.toFixed(1)])))


      let i = 0
      const temp = []
      for (const wave of machines[0].waves) {
        temp.push(new Knob(
          p.createVector(knobSize / 2 + i * p.width / machines[0].waves.length, p.height - knobSize), 
          p.ceil(wave.frequency / math.PI * 2 * fps * slowdownFactor), 
          knobSize, 
          wave)
        )
        i++
      }
      knobs = temp
      // console.log(knobs)
    }
    p.draw = function () {
      p.background(p.color(colors.pearlBush))



      knobs.forEach(knob => {
       // knob.display()
       knob.isClicked()
       knob.drag() 
      })

      //draw knobs
      knobs.forEach(knob => {
       knob.display()
      })

for (let ii = 0; ii < 4; ii++) {
for (let i = 0; i < 4; i++) {
  p.push()
      p.translate(250*i + 50*ii, 250 * ii)

      machines.forEach(m => {
        //p.translate(40, 1)
        //draw shape
        p.push()
        //p.translate(p.width/2, p.height/2)
        m.display(weight, false, 1, null, null)
        p.pop()
      
      /*
        //draw tracer
        p.push()
        p.translate(p.width/2, p.height/2)
        m.waves.forEach(wave => { 
          wave.display()
        })
        p.pop()
      
      */
         })

p.pop()
}
}
      machines.forEach(m => {

        //rotate tracers
        m.waves.forEach(wave => { 
          if (!paused) 
                    if (!wave.frozen)
          wave.rotate();
        })

        m.tracePoints(fps, slowdownFactor)

      })


      if (p.mouseIsPressed) {
        if (selectedKnob) {
          selectedKnob.wave.vector.x = (p.mouseX - selectedKnob.pos.x) * 2
          selectedKnob.wave.vector.y = (p.mouseY - selectedKnob.pos.y) * 2
          machines.forEach(m => {
            m.tracePoints(fps, slowdownFactor)
        
          })
          //machines[0].tracePoints(fps, slowdownFactor)
        }
      }
    }

    p.mouseReleased = function () {
      if(knobSelected) {
        console.log(JSON.stringify(machines[0].waves.map(w => [w.vector.x.toFixed(1), w.vector.y.toFixed(1)])))
      }
      knobSelected = false
      selectedKnob = null
      knobs.forEach(knob => {
        if (knob.edited) {
          knob.edited = false
        }
        knob.selected = false
      })
    }

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
        pause: false,
        vectorList: "",
        hash: this.tokenData().hash
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
    },
     randomHash () {
      const x = '0123456789abcdef'
      let hash = '0x'
      for (let i = 64; i > 0; --i) {
        hash += x[math.floor(math.random() * x.length)]
      }
      return hash
    },

    tokenData () {
      return {
      hash: this.randomHash(),
      tokenId: '123000456'

      }
    }
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

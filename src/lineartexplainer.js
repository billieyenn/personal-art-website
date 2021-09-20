/* eslint-enable */
/* eslint-disable */

const curry = function (config) {
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
      tokenId: '123000456'
    }

    const seed = parseInt(tokenData.hash.slice(0, 16), 16)

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

    const windowSize = 400//p.max(window.innerWidth * 0.5, window.innerHeight * 0.5)
    const fps = 60
    const slowdownFactor = 8 // bigger number is slower drawing
    let waves = [] // the tracer machine stores its parameters here
    let trace = [] // points for the drawing are stored here
    let desiredX
    let desiredY
    let traceInfoObj
    p.setup = function () {
      const selectedConfig = config

      // play with these values

      const symmetricity = selectedConfig.symmetricity // [true, false]
      const rotationDirections = selectedConfig.rotation_directions // [1, 2]
      const bgShapeComplexity = selectedConfig.bg_shape_complexity
      const complexities = [selectedConfig.complexity]
      const decay = selectedConfig.decay // [0.0, ..., 1.0, ..., 10] the relative size of each subsequent wave
      const cycleRatio = selectedConfig.cycle_ratio // reduce the number to below 1 to stop the trace early

      // not touch these
      const rows = 1
      const columns = 1
      const weight = windowSize / 2400 * 10 / math.sqrt(rows * columns)


      // background color
      const bgColor = []

      const n = 0
      const cN = math.complex(0, 0)

      let c = []

      p.createCanvas(windowSize, windowSize)
      p.frameRate(fps)

      const randomColorIndex = p.floor(R.randomNum(0, bgColor.length))

      const scale = 3 / rows

      let ii = 0
      waves = generateRandomWaves(complexities[0], decay, symmetricity, rotationDirections)

      for (let i = rows * columns; i > 0; i--) {
        ii = rows * columns - i
        p.push()

        desiredX = columns !== 1 ? p.width / columns * (ii % columns) + p.width / columns / 2 : p.width / 2// + width / columns / 2
        desiredY = rows !== 1 ? p.height / rows * Math.floor(ii / columns) + p.height / rows / 2 : p.height / 2// + height / rows / 2

        // let the wave machine run a trace
         trace = tracePoints(waves, fps, slowdownFactor, complexities[ii])
         traceInfoObj = traceInfo(trace)
         const resizeFactor = p.width / columns * 0.8 / traceInfoObj.traceSize
         waves.forEach(w => w.vector.mult(resizeFactor))

        // rerun machine with corrected scale
        //trace = tracePoints(waves, fps, slowdownFactor, complexities[ii])
        //traceInfoObj = traceInfo(trace)
        //console.log('traced')
        p.pop()
      }
      trace = []
    }

    p.draw = function () {
      p.background(255)
      p.push()
      p.translate(windowSize / 2 , windowSize / 2)
      
      // accumulate points until full cycle complete
        p.push()
        waves.forEach((el) => {
          el.rotate()
          el.display() //show the vectors as they go
        })
        p.pop()

      if (fps * slowdownFactor > trace.length ) { // -2 bc then first and last point are same
        const newPoint = p.createVector(waves[0].vector.x, waves[0].vector.y)
        trace.push(waves.reduce((_, wave) => newPoint.add(wave.vector)))
      }
      display(trace, 3, false, 1)
      p.pop()    
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
        // p.line(0, 0, this.vector.x, this.vector.y)
        p.noFill()
        p.ellipse(0, 0, 2 * this.vector.mag(), 2  * this.vector.mag())
      }

      mult (a) {
        this.vector.mult(a)
      }
    }

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
        if (rotationDirections === 2) {
          newvect = p.createVector(randomNumbers[0], randomNumbers[1])
          parent = waves[waves.length - 1]
          waves.push(new Wave(newvect, frequency, parent))
        }

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
      while (fps * slowdownFactor > trace.length - 2) { // -2 bc then first and last point are same
        p.push()
        wavesIncluded.forEach((el) => {
          el.rotate()
        })
        p.pop()

        const newPoint = p.createVector(waves[0].vector.x, waves[0].vector.y)
        trace.push(waves.reduce((_, wave) => newPoint.add(wave.vector)))
      }
      return trace
    }

    // display output
    let nCycle = 0
    const display = function (trace, weight, filled = false, cycleRatio, bgColor, randomColorIndex) {
      // line art
      const traceLength = trace.length * cycleRatio
      if (!filled) {
      // the trace goes around
        p.noFill()
        p.stroke(0)
        const newWeight = weight
        p.strokeWeight(newWeight)
        const strokeWeightChangeLimit = 0.5 // limit change rapidity, otherwise corners get weird circles. Experimentally found value
        for (let ii = nCycle; ii < nCycle + traceLength; ii++) {
          p.beginShape()
          const i = ii + nCycle % trace.length
          // the 'faster' the movement, the thinner the line
          p.point(trace[(i) % trace.length].x, trace[(i) % trace.length].y)
          p.endShape()
        }
        nCycle = (nCycle + 1) % trace.length
      }
    }
  }
}
export { curry }

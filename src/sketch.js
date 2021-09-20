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

    // const windowSize = p.max(window.innerWidth * 0.5, window.innerHeight * 0.5)
    const windowSize = 2400

    const fps = 60
    const slowdownFactor = 80 // bigger number is slower drawing
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

      let waves = [] // the tracer machine stores its parameters here
      let trace = [] // points for the drawing are stored here

      // background color
      const bgColor = []

      const n = 0
      const cN = math.complex(0, 0)

      let c = []

      const colors = [['#264653'],
        ['#2a9d8f'],
        ['#e9c46a'],
        ['#f4a261'],
        ['#e76f51'],
        ['#5f0f40'],
        ['#9a031e'],
        ['#fb8b24'],
        ['#e36414'],
        ['#0f4c5c'],
        ['#233d4d'],
        ['#fe7f2d'],
        ['#fcca46'],
        ['#a1c181'],
        ['#619b8a'],
        ['#136f63'],
        ['#00a676'],
        ['#386641'],
        ['#580aff']
      ]

      // p.createCanvas(2400, 2400)
      p.createCanvas(windowSize, windowSize)
      // p.background(255)
      p.frameRate(fps)

      for (c of colors) {
        const col = p.color(...c)
        col.setAlpha(100)
        bgColor.push(col)
      }
      const randomColorIndex = p.floor(R.randomNum(0, bgColor.length))

      const scale = 3 / rows

      let ii = 0
      waves = generateRandomWaves(complexities[0], decay, symmetricity, rotationDirections)

      for (let i = rows * columns; i > 0; i--) {
        ii = rows * columns - i
        // console.log(ii)
        p.push()

        const desiredX = columns !== 1 ? p.width / columns * (ii % columns) + p.width / columns / 2 : p.width / 2// + width / columns / 2
        const desiredY = rows !== 1 ? p.height / rows * Math.floor(ii / columns) + p.height / rows / 2 : p.height / 2// + height / rows / 2

        // let the wave machine run a trace
        trace = tracePoints(waves, fps, slowdownFactor, complexities[ii])
        let traceInfoObj = traceInfo(trace)
        const resizeFactor = p.width / columns * 0.8 / traceInfoObj.traceSize
        waves.forEach(w => w.vector.mult(resizeFactor))

        // rerun machine with corrected scale
        trace = tracePoints(waves, fps, slowdownFactor, complexities[ii])

        traceInfoObj = traceInfo(trace)
        p.translate(desiredX - traceInfoObj.offsetX, desiredY - traceInfoObj.offsetY)
        console.log('traced')

        const backgroundShapeTrace = tracePoints(waves, fps, slowdownFactor, bgShapeComplexity)

        // display background blob
        p.push()
        display(backgroundShapeTrace, weight, true, cycleRatio, bgColor, randomColorIndex)
        p.pop()

        display(trace, weight, false, cycleRatio, bgColor, randomColorIndex)
        p.pop()
      }
      console.log('complexity: ' + p.ceil(waves.length / 2))
      console.log('bgShapeComplexity: ' + bgShapeComplexity)
      console.log('decay: ' + decay)
      console.log('Color: ' + bgColor[randomColorIndex])
      console.log('symmetricity: ' + symmetricity)
      console.log('rotationDirections: ' + rotationDirections)
      console.log('trace.length: ' + trace.length)
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
        p.line(0, 0, this.vector.x, this.vector.y)
      }

      mult (a) {
        this.vector.mult(a)
      }
    }

    const integrateComplexFourierSeries = function (xs, ys, n) {
      const steps = xs.length
      const delta = 1 / steps
      let cN = math.complex(0, 0)
      for (let i = 0; i < steps; i++) {
        const t = i / steps
        const x = xs[i]
        const y = ys[i]
        let a = math.complex(x, y)
        const expNumb = n * 2 * p.PI * t
        const im = math.complex(0, 1)
        const exponent = math.multiply(im, expNumb)
        a = math.multiply(a, math.exp(exponent))
        a = math.multiply(a, delta)
        cN = math.add(cN, a)
      }
      return cN
    }

    const SVGToPoints = function (steps) {
      let xs = []
      let ys = []
      // extract points from svg
      const paths = document.getElementsByTagName('path')
      for (const path of paths) {
        var pathLength = Math.floor(path.getTotalLength())
        const xp = [...Array(steps).keys()].map(el => { return path.getPointAtLength(el / steps * pathLength).x })
        const yp = [...Array(steps).keys()].map(el => { return path.getPointAtLength(el / steps * pathLength).y })
        xs = xs.concat(xp)
        ys = ys.concat(yp)
      }
      return [xs, ys]
    }

    const calculateComplexPrefixes = function (xs, ys, complexity, scale) {
      const c = []
      let cN = math.complex(0, 0)
      cN = math.add(cN, integrateComplexFourierSeries(xs, ys, 0))
      cN = p.createVector(math.re(cN), math.im(cN))
      c.push(cN)
      for (let i = 1; i < complexity; i++) {
        cN = math.complex(0, 0)
        cN = math.add(cN, integrateComplexFourierSeries(xs, ys, i))
        cN = p.createVector(math.re(cN), math.im(cN))
        c.push(cN)
        cN = math.complex(0, 0)
        cN = math.add(cN, integrateComplexFourierSeries(xs, ys, -i))
        cN = p.createVector(math.re(cN), math.im(cN))
        c.push(cN)
      }
      return c.map(v => v.mult(scale))
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
          // el.display() //show the vectors as they go
        })
        p.pop()

        const newPoint = p.createVector(waves[0].vector.x, waves[0].vector.y)
        trace.push(waves.reduce((_, wave) => newPoint.add(wave.vector)))
      }
      return trace
    }

    // display output
    const display = function (trace, weight, filled = false, cycleRatio, bgColor, randomColorIndex) {
      let nCycle = 0
      // line art
      const traceLength = trace.length * cycleRatio
      if (!filled) {
      // the trace goes around

        p.noFill()
        p.stroke(0)

        let prevStrokeWeight = 0
        const strokeWeightChangeLimit = 0.5 // limit change rapidity, otherwise corners get weird circles. Experimentally found value
        for (let ii = nCycle; ii < nCycle + traceLength - 3; ii++) {
          p.beginShape()
          const i = ii + nCycle % trace.length
          // the 'faster' the movement, the thinner the line
          const distance = trace[(i) % trace.length].dist(trace[(i + 3) % trace.length])
          let newWeight = p.min(weight, weight * 3 / distance)
          if (p.abs(newWeight - prevStrokeWeight) > strokeWeightChangeLimit) {
            if (newWeight > prevStrokeWeight) {
              newWeight = prevStrokeWeight + strokeWeightChangeLimit
            } else {
              newWeight = prevStrokeWeight - strokeWeightChangeLimit
            }
          }
          p.strokeWeight(newWeight)
          p.curveVertex(trace[(i) % trace.length].x, trace[(i) % trace.length].y)
          p.curveVertex(trace[(i + 1) % trace.length].x, trace[(i + 1) % trace.length].y)
          p.curveVertex(trace[(i + 2) % trace.length].x, trace[(i + 2) % trace.length].y)
          p.curveVertex(trace[(i + 3) % trace.length].x, trace[(i + 3) % trace.length].y)
          p.endShape()
          prevStrokeWeight = newWeight
        }
        nCycle = (nCycle + 1) % trace.length

        /*
        */
      } else {
        // filled shape
        p.fill(bgColor[randomColorIndex])
        p.noStroke()
        p.beginShape()
        for (let i = 0; i < trace.length - 3; i++) {
          p.curveVertex(trace[i].x, trace[i].y)
        }
        p.endShape()
      }
    }
  }
}
export { curry }

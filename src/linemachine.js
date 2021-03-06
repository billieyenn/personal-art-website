/* eslint-enable */
/* eslint-disable */

export default function sketch(config) {
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

    class Wave {
      constructor (vector, f, parent, frozen, fps, slowdownFactor) {
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

      freeze () {
        this.frozen = true
      }

      unFreeze () {
        this.frozen = false
      }

      toggleFreeze () {
        this.frozen != this.frozen
      }
    }


    class Generator {
      constructor (fps, slowdownFactor) {
        this.fps = fps
        this.slowdownFactor = slowdownFactor
      }

      generateWavesFromVectorList (vectorlist, complexity) {
        const waves = []; 
        let w1 = new Wave(
          vectorlist[0],
          0,
          null,
          false,
          this.fps, this.slowdownFactor
          );
        waves.push(w1);
        let ii = 1;
        //loop condition keeps wave counts small by not letting too many pointless vectors to exist
        for (let i = 1; i < vectorlist.length / 2; i++) {
          if (waves.length >= complexity*2 - 1 && complexity != 1)
            break
          waves.push(new Wave(vectorlist[ii], i, waves[waves.length - 1], false, this.fps, this.slowdownFactor));
          ii++;
          waves.push(new Wave(vectorlist[ii], -i, waves[waves.length - 1], false, this.fps, this.slowdownFactor));
          ii++;
        }
        return waves
      }

      constructWaveFunctions (c, complexity) {
        const waves = []

        const w1 = new Wave(c[0], 0, this.fps, this.slowdownFactor)
        waves.push(w1)
        let ii = 1
        for (let i = 1; i < complexity; i++) {
          waves.push(new Wave(c[ii], i, waves[waves.length - 1], false, this.fps, this.slowdownFactor))
          ii++
          waves.push(new Wave(c[ii], -i, waves[waves.length - 1], false, this.fps, this.slowdownFactor))
          ii++
        }
        return waves
      }

      generateRandomWaves (complexity, decay, symmetricity) {
        const waves = []
        let newvect = p.createVector(0, 0)
        const w1 = new Wave(
          newvect,
          0, 
          null,
          false,
          this.fps, this.slowdownFactor
        )
        waves.push(w1)
        // loop condition keeps wave counts small by not letting too many pointless vectors to exist
        for (let i = 1; i < complexity && p.pow(decay, i - 1) > 0.001; i++) {
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
          waves.push(new Wave(newvect, i, waves[waves.length - 1], false, this.fps, this.slowdownFactor))

          newvect = p.createVector(randomNumbers[2], randomNumbers[3])
          waves.push(new Wave(newvect, -i, waves[waves.length - 1], false, this.fps, this.slowdownFactor))
        }
        return waves
      }
    }

    class Machine {
      constructor (waves, trace, fill, color, fps, slowdownFactor) {
        this.waves = waves || []
        this.trace = trace || []
        this.fill = fill || false
        this.color = color || p.color(200)
        this.generator = new Generator(fps, slowdownFactor)
      }

      tracePoints () {
        const trace = []
        // accumulate points until full cycle complete
        while (this.generator.fps * this.generator.slowdownFactor > trace.length) { // -2 bc then first and last point are same          
          this.rotate()
          const newPoint = p.createVector(this.waves[0].vector.x, this.waves[0].vector.y)
          trace.push(this.waves.reduce((_, wave) => newPoint.add(wave.vector)))
        }
        this.trace = trace
      }

      rotate (steps) {
        this.waves.forEach((el) => {
          let i = 0
          let until = steps || 1
          if (!el.frozen)
          while (i < until) {
            el.rotate()
            i++
          }
        })
      }

      display (weight, cycleRatio) {
        // line art
        const traceLength = this.trace.length * (cycleRatio || 1)
        // the trace goes around
        if (this.fill) {
          p.fill(this.color)
          p.noStroke()
          p.push()
          p.beginShape()
          for (let ii = 0; ii < 0 + traceLength + 4; ii++) {
            const i = ii + 0 % this.trace.length
            p.curveVertex(this.trace[(i) % this.trace.length].x, this.trace[(i) % this.trace.length].y)
          }
          p.endShape()
          p.pop()
        } else {
          p.noFill()
          p.stroke(this.color)

          const traceInfoObj = this.traceInfo()
          const size = (traceInfoObj.maxX - traceInfoObj.minX + traceInfoObj.maxY - traceInfoObj.minY) / 2 // average of width and height

          let prevStrokeWeight = 0
          const strokeWeightChangeLimit = 0.5 // limit change rapidity, otherwise corners get weird circles. Experimentally found value
        
          for (let ii = 0; ii < 0 + traceLength + 3; ii++) {
            //p.beginShape()
            const i = ii + 0 % this.trace.length
            const distance = this.trace[(i) % this.trace.length].dist(this.trace[(i + 3) % this.trace.length])
            //console.log(distance)
            let newWeight = p.min(weight, weight * 10 / distance)

            if (p.abs(newWeight - prevStrokeWeight) > strokeWeightChangeLimit) {
              if (newWeight > prevStrokeWeight) {
                newWeight = prevStrokeWeight + strokeWeightChangeLimit
              } else {
                newWeight = prevStrokeWeight - strokeWeightChangeLimit
              }
            }
            //console.log(newWeight)
            p.strokeWeight(newWeight * size / p.max(p.width, p.height))

            const p1x = this.trace[(i) % this.trace.length].x
            const p1y = this.trace[(i) % this.trace.length].y
            const p2x = this.trace[(i+1) % this.trace.length].x
            const p2y = this.trace[(i+1) % this.trace.length].y
p.beginShape()
            for(let a = 0; a < 4; a++) {
              p.curveVertex(this.trace[(i + a) % this.trace.length].x, this.trace[(i + a) % this.trace.length].y)
            }
p.endShape()
            prevStrokeWeight = newWeight
          }
        }
      }

      resize (scale) {
        let traceInfoObj = this.traceInfo()
        // console.log(traceInfoObj)
        // console.log(p.width, p.height)
        const resizeFactor = p.min(p.width, p.height) * scale / traceInfoObj.traceSize
        // const resizeFactor = (p.abs(traceInfoObj.maxX - traceInfoObj.minX) / p.width > p.abs(traceInfoObj.maxY - traceInfoObj.minY) / p.height) ? p.width * scale / (traceInfoObj.maxX - traceInfoObj.minX) : p.width * scale / (traceInfoObj.maxY - traceInfoObj.minY)
        // console.log(p.width, p.height, scale, traceInfoObj.traceSize, resizeFactor)
        this.waves.forEach(w => w.vector.mult(resizeFactor))

        // rerun machine with corrected scale
        this.tracePoints()
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
        const traceSize = p.max(p.abs(maxX - minX), p.abs(maxY - minY)) // assumption: width == height
        return {
          maxX, maxY, minX, minY, offsetX, offsetY, traceSize, totalDistance
        }
      }

      // get a square just big enough so that no rotation of a set of points around its bounding box center results in a point going beyond the bigger square
      rotationSafeBoundingBox () {
        let x_max, y_max, x_min, y_min, width, height
        // get the bounds of the list of points
        ({maxX: x_max, maxY: y_max, minX: x_min, minY: y_min} = this.traceInfo())

        width = (x_max - x_min)
        height = (y_max - y_min)

        // to fully cover any possible point within bounding box at any rotation
        // the actual bounding box to be used shall have width and height of length until corner

        // get length from corner to corner
        const newLength = p.createVector(x_min, y_min).dist(p.createVector(x_max, y_max))

        // adjust both min and max of both x and y 
        x_min -= (newLength - width) / 2
        y_min -= (newLength - height) / 2
        x_max += (newLength - width) / 2
        y_max += (newLength - height) / 2
        width = (x_max - x_min)
        height = (y_max - y_min)
        return {x_max, y_max, x_min, y_min, width, height}
      }
    }


    const fps = 60
    const slowdownFactor = config?.speed || 4
    const hash = config?.hash || tokenData.hash
    //console.log('hash: ' + hash)

    const seed = parseInt(hash.slice(0, 16), 16)
    const R = new Mulberry32(seed)

    return new Machine([], [], null, null, fps, slowdownFactor)

//    return Machine

  }
}
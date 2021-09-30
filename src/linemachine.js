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
          fps, slowdownFactor
          );
        waves.push(w1);
        let ii = 1;
        //loop condition keeps wave counts small by not letting too many pointless vectors to exist
        for (let i = 1; i < vectorlist.length / 2; i++) {
          if (waves.length >= complexity*2 - 1 && complexity != 1)
            break
          waves.push(new Wave(vectorlist[ii], i, waves[waves.length - 1], fps, slowdownFactor));
          ii++;
          waves.push(new Wave(vectorlist[ii], -i, waves[waves.length - 1], fps, slowdownFactor));
          ii++;
        }
        return waves
      }

      constructWaveFunctions (c, complexity) {
        const waves = []

        const w1 = new Wave(c[0], 0, fps, slowdownFactor)
        waves.push(w1)
        let ii = 1
        for (let i = 1; i < complexity; i++) {
          waves.push(new Wave(c[ii], i, waves[waves.length - 1], fps, slowdownFactor))
          ii++
          waves.push(new Wave(c[ii], -i, waves[waves.length - 1], fps, slowdownFactor))
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
          fps, slowdownFactor
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
          waves.push(new Wave(newvect, i, waves[waves.length - 1], fps, slowdownFactor))

          newvect = p.createVector(randomNumbers[2], randomNumbers[3])
          waves.push(new Wave(newvect, -i, waves[waves.length - 1], fps, slowdownFactor))
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
        const wavesIncluded = this.waves.slice(0, this.waves.length)
        // accumulate points until full cycle complete
        while (this.generator.fps * this.generator.slowdownFactor > trace.length) { // -2 bc then first and last point are same
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

      display (weight, filled = false, cycleRatio) {
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


    const fps = 60
    const slowdownFactor = config?.speed || 4
    const hash = config?.hash || tokenData.hash
    console.log('hash: ' + hash)

    const seed = parseInt(hash.slice(0, 16), 16)
    const R = new Mulberry32(seed)

    return new Machine(null, null, null, null, fps, slowdownFactor)

  }
}
/* eslint-disable */

<template>
  <div>
    <p>Instructions: trace a circle in the canvas and then wait</p>
    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-disable */
import P5 from 'p5'
import { colors, randomColor } from '../../colors.js'
import { isInPoly, Canvas } from '../../utils.js'
import LineMachine from '../../linemachine.js'



let sketch = (config) => {
  return function (p) {



class Particle {
      constructor(pos, canvas) {
        this.canvas = canvas
        this.pos = pos || this.randomPos()
        this.vel = p.createVector(0, 0)
        this.acc = p.createVector(0, 0)
        // this.startingRadius = particleRadius
        // this.startingRadius = p.random() > 0.99 ? particleRadius/2 : particleRadius
        this.startingRadius = p.random(2, particleRadius)
        this.radius = this.startingRadius
        // this.radius = p.random(3, particleRadius)
        this.area = this.radius * this.radius * p.PI
        this.solved = false
      }

      randomPos() { 
        const { minX, maxX, minY, maxY } = this.canvas
        return p.createVector(p.random(minX, maxX), p.random(minY, maxY))
      }

      getArea() {
        return this.radius * this.radius * p.PI
      }

      getStartingArea() {
        return this.startingRadius * this.startingRadius * p.PI
      }

      update() {
        // find the closest point on the container canvas
        const closestPoint = this.canvas.vertices.reduce((previousValue, currentValue) => previousValue.dist(this.pos) < currentValue.dist(this.pos) ? previousValue : currentValue)
        this.solved = true
        // if the particle is too close to the outside of the container
        if (this.outOfBounds() || closestPoint.dist(this.pos) < this.radius) {

          // push particle towards wall
          const direction = p.createVector(closestPoint.x - this.pos.x, closestPoint.y - this.pos.y)

          // if inside, push away from the wall
          if (!this.outOfBounds())
            direction.rotate(p.PI)

          // apply constant force
          direction.setMag(2)

          this.vel.add(direction)
          this.radius -= p.random()/50
          this.solved = false
        }
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.setMag(0)
        this.vel.setMag(this.vel.mag() * 0.2)

        // if the particle moves, it should shrink
        if (this.vel.mag() > 0.001)
        // very slowly shrinking ensure eventually the particles fit?
          this.radius -= p.random()/100 // try to get some circles to expire at different times

        if (this.radius / this.startingRadius < 0.85)
          this.canvas.particles.splice(this.canvas.particles.indexOf(this), 1)
      }

      applyForce(force) {
        this.acc.add(force)
      }

      display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(p.color(colors.bigStone))
        p.noFill()
        p.ellipse(0, 0, this.radius * 2, this.radius * 2)
        p.pop()
      }

      outOfBounds() {
        return this.canvas.outOfBounds(this.pos)
      }
    }













  // return random value between lower and higher bound, with values closer to higher bound having a  higher probability of being returned
  const linearRandom = (() => {
    let set = []
    for (let i = 0; i < 1; i+= 0.01)
      for (let ii = 0; ii < i; ii+=0.01)
        set.push(i)

    return (a = 0, b = 1) => {
      return p.map(set[p.floor(p.random(set.length))], 0, 1, a, b)
    }
  })()


  const linearRandomBetween = (a, b) => linearRandom(a, b)

  // find those points for each point that are particularly close
  // function dependent on global arrays neighbourGraph and points being declared
  const calculateNeighbourGraph = () => {
    neighbourGraph = []
    if (points)
    points.forEach(point => {
      points.forEach(p2 => {
        if (point != p2)
          if (point.dist(p2) < armslength * 2)
            neighbourGraph.push([point, p2])
      })
    })
  }

  let points
  let neighbourGraph
  let traces
  let canvasses
  let improvedTraces

  let solved = false
  let allParticlesInContainer = true
  let allParticlesNoOverlap = true
  let canvasExists = false

  let armslength// = 12.5 * 2
  let pathwidth = 6.25 * 2
  let canvasWidth, canvasHeight, numberOfPoints, maxAttempts
  let particleRadius = 10

  let totalArea// = 0


  p.setup = () => {
    ({
      canvasX: {
        value: canvasWidth = 700
      } = {},
      canvasY: {
        value: canvasHeight = 700
      } = {},
      numberOfPoints: {
        value: numberOfPoints = 700
      } = {},
      maxAttempts: {
        value: maxAttempts = 16000
      } = {},
      armslength: {
        value: armslength = 25
      } = {},
      pathwidth: {
        value: pathwidth = 12.5
      } = {}
    } = config)

    armslength = Number(armslength)
    pathwidth = Number(pathwidth)
    // console.log(armslength)

    totalArea = 1
    p.createCanvas(canvasWidth, canvasHeight);
    traces = []
    points = []
    neighbourGraph = []
    arrangedPoints = []
    graphAsPolygon = []
    contour = []
    canvasses = []
    traces = []
    improvedTraces = []

  }

  // takes an outline (trace) as input, and generates random point paths within the trace
  // what if no trace provided
  const generateRandomWalk = (trace = []) => {
    // console.log(trace)
    let attempts = 0
    // let points = []

    // start walking from the middle of the trace
    if (trace.length > 0) {
      // calculate average position to put seed point in middle
      const xAve = trace.map(t => t.x).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length
      const yAve = trace.map(t => t.y).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length
      points.push(p.createVector(xAve, yAve))
    } else {
      console.log("no trace provided")
    }

    if (points.length > 0)
    for (let i = 0; points.length < numberOfPoints && attempts < maxAttempts; i++) {
      
      // more recent points more likely to be selected (as old points are already fully blocked)
      let randomVector = points[p.floor(linearRandomBetween(0, points.length))]

      let xMin = randomVector.x - armslength - pathwidth
      let xMax = randomVector.x + armslength + pathwidth
      let yMin = randomVector.y - armslength - pathwidth
      let yMax = randomVector.y + armslength + pathwidth
      let randomX = p.max(0, p.min(p.width, p.random(xMin, xMax)))
      let randomY = p.max(0, p.min(p.height, p.random(yMin, yMax)))

      // check if next iteration is inside a trace, if there is a trace

      // if(traces[0])
        if (isInPoly(trace, randomX, randomY)) {

          let overlaps = 0
          let newVector = p.createVector(randomX, randomY)

          points.forEach(point => {
            if (newVector.dist(point) < armslength * 2) {
              overlaps ++
            }
            if (overlaps >= 2)
              return

          })
          
          if (overlaps < 2)
            points.push(newVector)
          else
            i-- // try again
      }
      attempts ++
    }

    // cutting out nodes with many neighbours slices graph into
    // several smaller graphs, resulting in performance gain
    // but less plantable area
    points.forEach(point => {
      let neighbours = 0
      points.forEach(point2 => {
        if (point != point2)
          if (point.dist(point2) < armslength * 2)
            neighbours++
      })
      if (neighbours >= 3) {
        if (p.random() > 0.9) 
          points.splice(points.indexOf(point), 1)// : return 
      }
    })
  }

  const getClosestPoint = (points, point) => {
    return points.reduce(
        (previousValue, currentValue) => 
        currentValue != point && point.dist(previousValue) > point.dist(currentValue) ? currentValue : previousValue)
    }

  const integrateComplexFourierSeries = function(xs, ys, n) {
    const steps = xs.length
    const delta = 1 / steps
    let c_n = math.complex(0,0);
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      let x = xs[i]
      let y = ys[i]
      let a = math.complex(x, y)
      const exp_numb = n * 2 * p.PI * t
      const im = math.complex(0, 1)
      const exponent = math.multiply(im, exp_numb)
      a  = math.multiply(a, math.exp(exponent))
      a  = math.multiply(a, delta)
      c_n = math.add(c_n, a)
    }
    return c_n
  }

  const calculateComplexPrefixes = function(x_s, y_s, complexity, scale) {
    let c = []
    let c_n = math.complex(0,0)
    c_n = math.add(c_n, integrateComplexFourierSeries(x_s, y_s, 0))
    c_n = p.createVector(math.re(c_n), math.im(c_n));
    c.push(c_n)
    for(let i = 1; i < complexity; i++) {
      c_n = math.complex(0,0)
      c_n = math.add(c_n, integrateComplexFourierSeries(x_s, y_s, i))
      c_n = p.createVector(math.re(c_n), math.im(c_n));
      c.push(c_n)
      c_n = math.complex(0,0)
      c_n = math.add(c_n, integrateComplexFourierSeries(x_s, y_s, -i))
      c_n = p.createVector(math.re(c_n), math.im(c_n));
      c.push(c_n)
    } 
    return c.map(v => v.mult(scale))
  }



  // const normalizeByPointDistance = (points, distance) => {
  //   for (let a = points.length - 1; a >= 0; a--) {
  //     const p1 = createVector(points[a][0], points[a][1])
  //     for (let b = points.length - 1; b >= 0; b--) {
  //       const p2 = createVector(points[b][0], points[b][1])
  //       if (a != b)
  //       if (p1.dist(p2) < distance) {
  //         points.splice(b, 1)
  //         break
  //       }
  //     }
  //   }
  //   return points
  // }

  const zip = (a, b) => a.map((k, i) => [k, b[i]])


  let graphAsPolygon
  let contour
  let graphcount = 0

  let anothercount = 0

  let arrangedPoints
  // let arrangedPointsPoints // contains a list of will-be canvasses

  p.draw = () => {
    

    if (traced)
    {
      generateRandomWalk(traces[traces.length - 1])
      calculateNeighbourGraph()
      // p.noLoop()
    }
    p.background(p.color(colors.springWood));
    
    p.strokeWeight(armslength * 2 - pathwidth)
    // p.stroke(p.color('#f2aeb1'))
    p.stroke(0)
    neighbourGraph.forEach((a) => {
      p.line(a[0].x, a[0].y, a[1].x, a[1].y)
    })

    
      p.noStroke()
    
    let mouse = p.createVector(p.mouseX, p.mouseY)

    points.forEach(point => {
      if (point.dist(mouse) < armslength) {
        if (p.mouseIsPressed) {
          points.splice(points.indexOf(point), 1)
          calculateNeighbourGraph()

        }
      }
      // p.fill(0, 20)
      p.fill(0)
      p.ellipse(p.x, p.y, armslength * 2, armslength * 2)
    })

  
  // get the points of the contour
  let factor = 4 // some multiple of 2

  if (traced) {
    graphAsPolygon = []
    contour = []

    p.loadPixels();
    let d = p.pixelDensity();
    let image = 4 * (p.width * d) * (p.height * d) - 4 * factor * p.width;
    let x, y
    for (let i = 4 * factor + 4 * factor * p.width; i < image; i += 4 * factor) {
      x = i / 4 % p.width
      if (x == 0) // each time cols loops around, also skip rows
        i += p.width * (factor - 1) * 4
      y = p.floor(i / 4 / p.width)

      // if current pixel different from previous left and previous up
      if (p.pixels[i] != p.pixels[i - 2 * factor] || 
        p.pixels[i] != p.pixels[i + 2 * factor] || 
        p.pixels[i] != p.pixels[i - 2 * factor * p.width] || 
        p.pixels[i] != p.pixels[i + 2 * factor * p.width]
        )
        if (x != 0 && y != 0 && x < p.width && y < p.height) {
          const newPoint = p.createVector(x, y)
          graphAsPolygon.push(newPoint)
          contour.push(newPoint)
        }
    }
    p.updatePixels();
  }
  p.background(p.color(colors.springWood));

  if (traced) {

  // merge those points that are really close to each other
    const mergeDistanceLimit = 5

      // go thru the entire array once and do some merging
    for (var i = graphAsPolygon.length - 1; i >= 0; i--) {
      const point = graphAsPolygon[i]
      let closestPoint = getClosestPoint(graphAsPolygon, point)
      if (closestPoint.dist(point) < mergeDistanceLimit) {

        let mergedPoint = p.createVector((point.x + closestPoint.x) / 2, (point.y + closestPoint.y) / 2)
        graphAsPolygon.splice(graphAsPolygon.indexOf(closestPoint), 1)
        graphAsPolygon.splice(graphAsPolygon.indexOf(point), 1)
        graphAsPolygon.push(mergedPoint)
        closestPoint = getClosestPoint(graphAsPolygon, mergedPoint)
      }
    }
  }

  // p.fill(0,0,255)
  // contour.forEach(point => {
  //   p.rect(point.x, point.y, 1, 1)
  // })

  // // draw a green dot for each point in the graph
  // p.fill(0,255,0)
  // graphAsPolygon.forEach(point => {
  //   p.ellipse(point.x, point.y, 3, 3)
  // })

  // draw a blue dot for each point in the graph
  p.fill(0,0,255)
  canvasses.forEach(canvas => {
    const points = canvas.vertices
    points.forEach(point => {
      p.ellipse(point.x, point.y, 3, 3)
    })
  })

  p.stroke(0)
  p.strokeWeight(1)
  // p.text(graphAsPolygon.length, 15, 15)


  // graphAsPolygon.forEach(point => {
  //   point.next = undefined
  //   point.prev = undefined
  //   point.visited = false
  // })


  if (traced) {
    arrangedPoints = []
    // arrangedPointsPoints = []
    canvasses = []

  // visit a random point, find its closest and keep iterating
  if (graphAsPolygon.length > 0) // if graph is generated
  {
    let graphAsPolygonCopy = [...graphAsPolygon] // don't modify the original

    while (graphAsPolygonCopy.length > 1) { // while points remain

      // let randomIndex = p.floor(p.random(graphAsPolygonCopy.length))
      let randomPoint = graphAsPolygonCopy[0] // start at a random point, for example the first point
      // randomPoint.visited = true
      // let loopLimit = 10000

      // while points remain
      while (graphAsPolygonCopy.length > 1/* && loopLimit > 0*/) {

        // remove a point from the graph and add them to subgraphs
        let indexofrandompoint = graphAsPolygonCopy.indexOf(randomPoint)
        arrangedPoints.push(...graphAsPolygonCopy.splice(indexofrandompoint, 1))

        // find the point closest to the recently removed point
        let closestPoint = getClosestPoint(graphAsPolygonCopy, randomPoint)

        // no more nearby points, shape has ended
        if (randomPoint.dist(closestPoint) > 20) {// TODO: find a better way than hardcoding 'big jump'
          if (arrangedPoints.length > 1) {
          // arrangedPointsPoints.push(arrangedPoints)

          // // smooth out the shape 
          // p.angleMode(p.RADIANS)

          // const x_s = arrangedPoints.map(point => point.x)
          // const y_s = arrangedPoints.map(point => point.y)

          // let newMachine = LineMachine(config)(p)
          // newMachine.generator.slowdownFactor = 10
          // newMachine.waves = newMachine.generator.constructWaveFunctions(calculateComplexPrefixes(x_s, y_s, 100, 1), 100)
          // newMachine.tracePoints()
          // console.log(newMachine.traceInfo())
          // const traceInfo = newMachine.traceInfo()
          // if (traceInfo.minX > 0 && traceInfo.minY > 0)
          // canvasses.push(newMachine.trace)

          const canvas = new Canvas(arrangedPoints)
          canvas.particles = []

          canvasses.push(canvas)

          }
          arrangedPoints = []
          break
        }
        // randomPoint.next = closestPoint
        // closestPoint.prev = randomPoint
        randomPoint = closestPoint
        // loopLimit--
      }
    }

    // when points have run out, the final shape has formed
    if (arrangedPoints.length > 1) {
      const canvas = new Canvas(arrangedPoints)
      canvas.particles = []
      canvasses.push(canvas)
    }
  }
  console.log(canvasses.length)
}




    // visualise the arranged points
  // arrangedPointsPoints.forEach(arrangedPoints => {
  //   p.stroke(0)
  //   p.strokeWeight(1)
  //   p.fill(255)
  //   for (var i = arrangedPoints.length - 1; i >= 1; i--) {
  //     p.line(arrangedPoints[i].x, arrangedPoints[i].y, arrangedPoints[i - 1].x, arrangedPoints[i - 1].y)
  //     p.fill(255,0,0)
  //     if (anothercount%arrangedPoints.length == i) {
  //       p.ellipse(arrangedPoints[i].x, arrangedPoints[i].y, 4, 4)
  //     }
  //   }
  // })


    // visualise the arranged points

  // canvasses.forEach(canvas => {
  //   const arrangedPoints = canvas.vertices
  //   p.stroke(0)
  //   p.strokeWeight(1)
  //   p.fill(255)
  //   for (var i = arrangedPoints.length - 1; i >= 1; i--) {
  //     p.line(arrangedPoints[i].x, arrangedPoints[i].y, arrangedPoints[i - 1].x, arrangedPoints[i - 1].y)
  //     p.fill(255,0,0)
  //     if (anothercount%arrangedPoints.length == i) {
  //       p.ellipse(arrangedPoints[i].x, arrangedPoints[i].y, 4, 4)
  //     }
  //   }

  // })
  // anothercount++







{


// assume all particles are in container
      allParticlesInContainer = true
      allParticlesNoOverlap = true
      canvasExists = false

      canvasses.forEach(canvas => {
        canvasExists = canvas.particles.length > 0
        const particles = canvas.particles
        // console.log(particles)

        particles.forEach(particle => {
          // particles affect outward force on each other
          if (!solved) // but only if system not yet in equilibrium
          particles.forEach(particle2 => {
            if (particle2 != particle) {
              let force
              let distance = particle2.pos.dist(particle.pos)
              // if too close, push away
              if (distance < particle.radius + particle2.radius) {
                allParticlesNoOverlap = false
                force = p.createVector(particle2.pos.x - particle.pos.x, particle2.pos.y - particle.pos.y)
                force.setMag(2)

                particle2.applyForce(force)
                p.angleMode(p.RADIANS)
                particle.applyForce(force.rotate(p.PI))
              }
            }
          })
          particle.update()
          // if(solved)
          particle.display()
          if (!particle.solved) // look at this after update 
            allParticlesInContainer = false
        })
      })

      // if all points are inside the bounds and not overlapping with each other, the system has reached equilibrium
      if (canvasExists && allParticlesInContainer && allParticlesNoOverlap) {
        solved = true
        console.log("solved!")
        p.noLoop()
      }




      if (traced) {
        // particles = []

        canvasses.forEach(canvas => {
          const trace = canvas.vertices
          const { length } = trace
          let area = 0;  // Accumulates area in the loop   
          let particlesArea = 0

          if (length > 0) {

            // make the trace into a container
            // const canvas = new Canvas(trace)
            // canvas.particles = []
            // calculate average position to put seed point in middle
            const xAve = trace.map(t => t.x).reduce((previousValue, currentValue) => previousValue + currentValue) / length
            const yAve = trace.map(t => t.y).reduce((previousValue, currentValue) => previousValue + currentValue) / length


            // calculate the area of the container
            let j = length - 1;  // The last vertex is the 'previous' one to the first

            for (let i = 0; i < length - 1; i++) { 
              area = area +  (trace[j].x + trace[i].x) * (trace[j].y - trace[i].y) 
              j = i;  //j is previous vertex to i
            }
            area /= 2
            area = p.abs(area)
            totalArea += area

            // fill area with as many circles as can fit
            let count = 100000
            for (var i = 0; particlesArea < area; i++) {
              const { minX, maxX, minY, maxY } = canvas
              const newParticle = new Particle(p.createVector(p.random(minX, maxX), p.random(minY, maxY)), canvas)

              // check if next circle would still fit
              if (particlesArea + newParticle.getArea() * 1 < area/* && !newParticle.outOfBounds()*/) {
                particlesArea += newParticle.getArea() * 1
                canvas.particles.push(newParticle)
              } else {
                if (count <= 0) // try a few times, maybe a smaller circle would fit
                break
              }
              count --
            }
          }
          console.log(area, particlesArea, canvas.particles.length)
        })
      }
    }

    p.stroke(0)
    p.strokeWeight(1)
    // p.text("Points: " + particles.length, 15, 30)
    // p.text("Canvasses: " + particles.length, 15, 45)
    // p.text("arrangedPointsPoints: " + arrangedPointsPoints.length, 15, 60)

    traced = false

  }


  p.mousePressed = () => {
    traces.push([])
  }
  p.mouseDragged = () => {
    traces[traces.length-1].push(p.createVector(p.mouseX, p.mouseY))
  }
  let traced = false
    p.mouseReleased = () => {
      traced = true
    }
  }
}

export default {
  data() {
    return {
      sketch: sketch,
      config: {
        canvasX: {
          type: 'number',
          value: 800
        },
        canvasY: {
          type: 'number',
          value: 800
        },
        numberOfPoints: {
          type: 'number',
          value: 2000
        },
        maxAttempts: {
          type: 'number',
          value: 16000
        },
        armslength: {
          type: 'number',
          value: 25
        },
        pathwidth: {
          type: 'number',
          value: 12.5
        },
      }
    }
  }
}
</script>

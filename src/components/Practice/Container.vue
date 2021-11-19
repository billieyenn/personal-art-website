/* eslint-disable */

<template>
  <div>
    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-disable */
import P5 from 'p5'
import { colors, randomColor } from '../../colors.js'
import { Canvas } from '../../utils.js'


let sketch = (config) => {
  return function (p) {


class Particle {
      constructor(pos, canvas) {
        this.canvas = canvas
        this.pos = pos || this.randomPos()
        this.vel = p.createVector(0, 0)
        this.acc = p.createVector(0, 0)
        // this.startingRadius = particleRadius
        this.startingRadius = p.random(particleRadius)
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
          this.radius -= p.random()/100
          this.solved = false
        }
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.setMag(0)
        this.vel.setMag(this.vel.mag() * 0.2)

        if (this.vel.mag() > 0.001)
        // very slowly shrinking ensure eventually the particles fit?
          this.radius -= p.random()/100 // try to get some circles to expire at different times

        if (this.radius / this.startingRadius < 0.85)
          points.splice(points.indexOf(this), 1)
      }

      applyForce(force) {
        this.acc.add(force)
      }

      display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(p.color(colors.bigStone))
        // p.noStroke()
        // p.fill(255)
        p.noFill()
        p.ellipse(0, 0, this.radius * 2, this.radius * 2)
        // p.point(0, 0)
        p.pop()
      }

      outOfBounds() {
        return this.canvas.outOfBounds(this.pos)
      }
    }






    let i// = 0
    let color
    let traces
    let improvedTraces

    let points

    let particleRadius = 25

    let solved = false
    let allParticlesInContainer = true
    let allParticlesNoOverlap = true
    let totalArea// = 0
    p.setup = function () {
      p.createCanvas(700, 700);
      totalArea = 1
      i = 0
      color = p.color(config.bgColor.value)
      traces = []
      improvedTraces = []
      points = []
    }

    p.draw = function () {
      p.background(color)
      i++
      p.stroke(0)
      p.strokeWeight(1)
      p.text("Points: " + points.length, 15, 15)
      // let previousValue = 0
      let currentArea = points.reduce((previousValue, currentValue) => previousValue + currentValue.getArea(), 0)
      p.text("Filled Area: " + (currentArea/totalArea).toFixed(2)*100 + "%", 15, 30)

      // the sum of starting areas
      let originalArea = points.reduce((previousValue, currentValue) => previousValue + currentValue.getStartingArea(), 0)

      // console.log(originalArea)
      p.text("Size of Remaining points: " + (currentArea / originalArea).toFixed(2), 15, 45)

      let newWeight = 2
      p.strokeWeight(newWeight)
      p.stroke(0)
      // p.noFill()

      improvedTraces.forEach(trace => {
        const { length } = trace
        if (length > 3)
        for (let ii = 0; ii < 0 + length + 3; ii++) {
          const i = ii + 0 % length
          const distance = trace[(i) % length].dist(trace[(i + 3) % length])
         
          const p1x = trace[(i) % length].x
          const p1y = trace[(i) % length].y
          const p2x = trace[(i+1) % length].x
          const p2y = trace[(i+1) % length].y
          p.beginShape()
          for(let a = 0; a < 4; a++) {
            p.curveVertex(trace[(i + a) % length].x, trace[(i + a) % length].y)
            // p.ellipse(trace[(i + a) % length].x, trace[(i + a) % length].y, 5)

          }
          p.endShape()
        }
      })

      traces.forEach(trace => {
        const { length } = trace

        if (length > 3)
        for (let ii = 0; ii < 0 + length + 3; ii++) {
          const i = ii + 0 % length
          const distance = trace[(i) % length].dist(trace[(i + 3) % length])
         
          const p1x = trace[(i) % length].x
          const p1y = trace[(i) % length].y
          const p2x = trace[(i+1) % length].x
          const p2y = trace[(i+1) % length].y
          p.beginShape()
          for(let a = 0; a < 4; a++) {
            p.curveVertex(trace[(i + a) % length].x, trace[(i + a) % length].y)
          }
          p.endShape()
        }
      })

      p.fill(0)

      // assume all particles are in container
      allParticlesInContainer = true
      allParticlesNoOverlap = true
      points.forEach(particle => {
        // particles affect outward force on each other
        if (!solved) // but only if system not yet in equilibrium
        points.forEach(particle2 => {
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

      // if all points are inside the bounds and not overlapping with each other, the system has reached equilibrium
      if (points.length > 0 && allParticlesInContainer && allParticlesNoOverlap) {
        solved = true
        console.log("solved!")
        p.noLoop()
      }

      // if a new trace was just drawn
      if (traced) {
        points = []
         // clear out emtpy traces
        traces.forEach(trace => {

          // don't add empty traces
          if (trace.length <= 0) {
            traces.splice(traces.indexOf(trace), 1)
          } else {

          // smooth out the trace
          const improvedTrace = []

          trace = [...trace, trace[0].copy(), trace[1].copy(), trace[2].copy(), trace[3].copy()]
          { // new namespace for laziness reasons
            let count = 0
            let steps = 1
            while (count < trace.length - 3) {
              for (let i = 0; i <= steps; i++) {
                let t = i / steps;
                let x = p.curvePoint(...trace.slice(count, count+4).map(t => t.x), t);
                let y = p.curvePoint(...trace.slice(count, count+4).map(t => t.y), t);
                improvedTrace.push(p.createVector(x, y))
              }
              count += 1
            }
          }

          // swap out the bad, swap in the good
          traces.splice(traces.indexOf(trace), 1)
          // traces.push(improvedTrace)
          improvedTraces.push(improvedTrace)
          }
        })

        improvedTraces.forEach(trace => {
          const { length } = trace

          // make the trace into a container
          const canvas = new Canvas(trace)
          // calculate average position to put seed point in middle
          const xAve = trace.map(t => t.x).reduce((previousValue, currentValue) => previousValue + currentValue) / length
          const yAve = trace.map(t => t.y).reduce((previousValue, currentValue) => previousValue + currentValue) / length


          // calculate the area of the container
          let area = 0;  // Accumulates area in the loop   
          let j = length - 1;  // The last vertex is the 'previous' one to the first

          for (let i = 0; i < length - 1; i++) { 
            area = area +  (trace[j].x + trace[i].x) * (trace[j].y - trace[i].y) 
            j = i;  //j is previous vertex to i
          }
          area /= 2
          area = p.abs(area)
          totalArea += area

          const particleArea = p.PI * particleRadius * particleRadius
          const canFitAtMost = area / particleArea * 0.8

          // fill area with as many circles as can fit
          let particlesArea = 0
          let count = canFitAtMost * 10
          for (var i = 0; particlesArea < area; i++) {
            // const newParticle = new Particle(p.createVector(xAve + p.random() - 0.5, yAve + p.random() - 0.5), canvas)
            const { minX, maxX, minY, maxY } = canvas
            const newParticle = new Particle(p.createVector(p.random(minX, maxX), p.random(minY, maxY)), canvas)

            // check if next circle would still fit
            if (particlesArea + newParticle.getArea() * 1.2 < area && !newParticle.outOfBounds()) {
              particlesArea += newParticle.getArea() * 1.2
              points.push(newParticle)
            } else {
              if (count <= 0) // try a few times, maybe a smaller circle would fit
              break
            }
            count --
          }
        })
      }
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
        key1: {
          type: 'number',
          value: 1
        },
        key2: {
          type: 'string',
          value: "helloe"
        },
        key3: {
          type: 'boolean',
          value: false
        },
        bgColor: {
          type: 'color',
          value: randomColor(colors)
        }
      }
    }
  }
}
</script>

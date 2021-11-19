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
        this.radius = particleRadius
        // this.radius = p.random(3, particleRadius)
        this.area = this.radius * this.radius * p.PI
      }

      randomPos() {
        const minX = this.canvas.minX
        const maxX = this.canvas.maxX
        const minY = this.canvas.minY
        const maxY = this.canvas.maxY
        return p.createVector(p.random(minX, maxX), p.random(minY, maxY))
      }


      update() {
        // find the closest point on the container canvas
        const closestPoint = this.canvas.vertices.reduce((previousValue, currentValue) => previousValue.dist(this.pos) < currentValue.dist(this.pos) ? previousValue : currentValue)

        // if the particle is too close to the outside of the container
        if (this.outOfBounds() || closestPoint.dist(this.pos) < this.radius) {

          // push particle towards wall
          const direction = p.createVector(closestPoint.x - this.pos.x, closestPoint.y - this.pos.y)

          // if inside, push away from the wall
          if (!this.outOfBounds())
            direction.rotate(p.PI)

          // apply constant force
          direction.setMag(1)

          this.vel.add(direction)

          // very slowly shrinking ensure eventually the particles fit?
          this.radius -= 0.01
        }
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.setMag(0)
        this.vel.setMag(0)

      }

      applyForce(force) {
        this.acc.add(force)
      }

      display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(p.color(colors.bigStone))
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
    p.setup = function () {
      p.createCanvas(700, 700);
      i = 0
      color = p.color(config.bgColor.value)
      traces = []
      improvedTraces = []
      points = []
    }

    p.draw = function () {
      p.background(color)
      i++

      let newWeight = 2
      p.strokeWeight(newWeight)
      p.stroke(0)
      // p.noFill()

      improvedTraces.forEach(trace => {
        if (trace.length > 3)
        for (let ii = 0; ii < 0 + trace.length + 3; ii++) {
          const i = ii + 0 % trace.length
          const distance = trace[(i) % trace.length].dist(trace[(i + 3) % trace.length])
         
          const p1x = trace[(i) % trace.length].x
          const p1y = trace[(i) % trace.length].y
          const p2x = trace[(i+1) % trace.length].x
          const p2y = trace[(i+1) % trace.length].y
          p.beginShape()
          for(let a = 0; a < 4; a++) {
            p.curveVertex(trace[(i + a) % trace.length].x, trace[(i + a) % trace.length].y)
            // p.ellipse(trace[(i + a) % trace.length].x, trace[(i + a) % trace.length].y, 5)

          }
          p.endShape()
        }
      })

      traces.forEach(trace => {
        if (trace.length > 3)
        for (let ii = 0; ii < 0 + trace.length + 3; ii++) {
          const i = ii + 0 % trace.length
          const distance = trace[(i) % trace.length].dist(trace[(i + 3) % trace.length])
         
          const p1x = trace[(i) % trace.length].x
          const p1y = trace[(i) % trace.length].y
          const p2x = trace[(i+1) % trace.length].x
          const p2y = trace[(i+1) % trace.length].y
          p.beginShape()
          for(let a = 0; a < 4; a++) {
            p.curveVertex(trace[(i + a) % trace.length].x, trace[(i + a) % trace.length].y)
          }
          p.endShape()
        }
      })

      p.fill(0)
      points.forEach(particle => {
        // particles affect outward force on each other
        points.forEach(particle2 => {
          if (particle2 != particle && particle2.pos.dist(particle.pos) < particle.radius + particle2.radius) {

            const force = p.createVector(particle2.pos.x - particle.pos.x, particle2.pos.y - particle.pos.y)
            force.setMag(1)
            particle2.applyForce(force)
            p.angleMode(p.RADIANS)
            particle.applyForce(force.rotate(p.PI))
          }
        })
        particle.update()
        particle.display()
      })

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

          trace.push(trace[0].copy())
          trace.push(trace[1].copy())
          trace.push(trace[2].copy())
          trace.push(trace[3].copy())
          // trace.push(trace[3].copy)
          { // new namespace for laziness reasons
            let count = 0
            let steps = 6
            while (count < trace.length - 3) {
              for (let i = 0; i <= steps; i++) {
                let t = i / steps;
                let x = p.curvePoint(...trace.slice(count, count+4).map(t => t.x), t);
                let y = p.curvePoint(...trace.slice(count, count+4).map(t => t.y), t);
                improvedTrace.push(p.createVector(x, y))
              }
              count += 4
            }
          }

          // swap out the bad, swap in the good
          traces.splice(traces.indexOf(trace), 1)
          // traces.push(improvedTrace)
          improvedTraces.push(improvedTrace)
          }
        })

        improvedTraces.forEach(trace => {
          // make the trace into a container
          const canvas = new Canvas(trace)
        // calculate average position to put seed point in middle
          const xAve = trace.map(t => t.x).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length
          const yAve = trace.map(t => t.y).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length


          // calculate the area of the container (named trace)


          let area = 0;  // Accumulates area in the loop   
          let j = trace.length-1;  // The last vertex is the 'previous' one to the first

            for (let i=0; i<trace.length-1; i++)
            { 
              area = area +  (trace[j].x+trace[i].x) * (trace[j].y-trace[i].y); 
                j = i;  //j is previous vertex to i
            }
            area /= 2
            area = p.abs(area)
            // return area/2; 
            // console.log(area)

            const particleArea = p.PI * particleRadius * particleRadius
            const canFitAtMost = area / particleArea * 0.8
            // console.log(area, particleArea, area / particleArea)

          let particlesArea = 0
          let count = 1000
          for (var i = 0; particlesArea < area; i++) {
            const newParticle = new Particle(p.createVector(xAve + p.random() - 0.5, yAve + p.random() - 0.5), canvas)

            // check if next circle would still fit
            if (particlesArea + newParticle.area * 1.2 < area) {
              particlesArea += newParticle.area * 1.2
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

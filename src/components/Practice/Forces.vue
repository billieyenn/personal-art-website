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
import { Grid } from '../../utils.js'

let sketch = (config) => {
  return function (p) {
    let paused = false
    p.angleMode(p.DEGREES)

    const lorentz = (vel, limit) => {
        return 1 /  p.sqrt(p.max(0.00001, 1 - p.pow(vel / limit, 2)))
    }
    class Particle {
      constructor(pos, mass) {
        this.pos = pos || p.createVector(p.random(p.width), p.random(p.height))
        this.vel = p.createVector(p.random(-0.7, 0.7), p.random(-0.7, 0.7))
        // this.vel.limit(forcePropagationSpeed)
        this.acc = p.createVector(0, 0)
        this.mass = mass
        // this.inverted = p.random() > 0.5 ? 1 : -1
      }

      randomPos() {
        return p.createVector(p.random(0, p.width), p.random(0, p.height))
      }

      update(limit) {
          this.vel.add(this.acc)
          this.vel = this.vel.limit(forcePropagationSpeed) // the speed of light can't be exceeded
          if(limit)
            this.vel = this.vel.limit(limit) // additional limit

          this.pos.add(this.vel)
          this.acc.setMag(0)

          if (this.pos.x > p.width)
            this.pos.x = 0
          if (this.pos.x < 0)
            this.pos.x = p.width
          if (this.pos.y > p.height)
            this.pos.y = 0
          if (this.pos.y < 0)
            this.pos.y = p.height
      }

      applyForce(force) {
        const l = lorentz(force.mag(), forcePropagationSpeed)
        force.div(l)
        this.acc.add(force)
      }

      display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(p.color(colors.bigStone))
        p.fill(255)
        p.ellipse(0, 0, 5, 5)
        // p.point(0, 0)
        p.pop()
      }
    }
  

    // when adjusting propagationspeed, remember to also adjust margin of errer for force application.

    class Circle {
      constructor (pos, diameter, intensity, parent) {
        this.diameter = diameter
        this.pos = pos
        this.intensity = intensity || 1
        this.alive = true
        this.parent = parent
      }

      display () {
        p.strokeWeight(p.min(this.force() * 100, forcePropagationSpeed))
        p.ellipse(this.pos.x, this.pos.y, this.diameter)
      }

      propagate () {
        this.diameter += forcePropagationSpeed
      }

      force () {
        const G = 1
        const pow = 2
        const gravity = this.intensity * G / (p.pow(this.diameter, 3) / (p.pow(100, 3) / 10))

        return gravity// - 4 * this.intensity * G / (p.pow(this.diameter, 0.5) / (p.pow(100, 0.5) / 10))
      }

      // if even one of the frame corners is farther away than the
      outOfBounds () {
        let corner = p.createVector(0, 0)
        let dist = corner.dist(this.pos)
        if (this.diameter / 2 < dist) {
          return false
        }

        corner = p.createVector(p.width, 0)
        dist = corner.dist(this.pos)
        if (this.diameter / 2 < dist) {
          return false
        }

        corner = p.createVector(p.width, p.height)
        dist = corner.dist(this.pos)
        if (this.diameter / 2 < dist) {
          return false
        }

        corner = p.createVector(0, p.height)
        dist = corner.dist(this.pos)
        if (this.diameter / 2 < dist) {
          return false
        }
        return true
      }

      die () {
        this.alive = false
      }

      // if waves are too far or weak, they will no longer affect the system meaningfully
      checkLiveness () {
        if (this.outOfBounds() 
          || this.force() < 0.0002
          )
          this.die()
      }
    }

    // what kind of forces to add? Gravi
    // parameters to tweak
    // - speed at which forces propagate
    // - force formula (inverse square or cube or others)

    // const windowSize = 1000
    const forcePropagationSpeed = 40
    const marginOfError = forcePropagationSpeed / 2
    let waves = []
    let particles = []
    let masslessParticles = []
    let rows
    let cols
    let scale = 20
    let flowField


    p.setup = function () {
      p.createCanvas(700, 700);

      // particles that cause gravity waves
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(null, p.random(0.5, 2)))
      }

      // particles that don't create gravity waves
      for (let i = 0; i < 2000; i++) {
        masslessParticles.push(new Particle(null, 0))
      }

      rows = p.floor(p.width / scale)
      cols = p.floor(p.height / scale)
      

      
      // the flow field keeps track of local gravity
      flowField = new Grid(rows, cols)
        flowField.forEach((x, y, val) => {
          flowField.setVal(x, y, p.createVector(0, 0))
        })
        p.background(p.color(colors.pearlBush))
    }

    p.draw = function () {
      if (!paused) {
        const color = p.color(colors.pearlBush)
        color.setAlpha(35)
        p.noStroke()
        p.fill(color)
        p.rect(0, 0, p.width, p.height)

        // reset the flowfield
        flowField.forEach((x, y, val) => {
          flowField.getVal(x, y).setMag(0)
        })

        // each particle creates a force wave
        particles.forEach((particle, i) => {
          waves.push(new Circle(p.createVector(particle.pos.x, particle.pos.y), forcePropagationSpeed, particle.mass, particle))
        })

        waves.forEach((w, i) => {
          w.propagate()
          w.checkLiveness()
          if (!w.alive)
            waves.splice(i, 1)
          particles.forEach(particle => {
            if (particle !== w.parent) { // convenience cheat, todo come up with math to make this redundant
              const dist = particle.pos.dist(w.pos)
              // if distance between particle and wave origin == wave radius, apply force
              if (dist + marginOfError > w.diameter / 2 && dist - marginOfError < w.diameter / 2 ) {
                // make vector of magnitude w.force() in the direction of the wave
                const force = p.createVector(w.pos.x - particle.pos.x, w.pos.y - particle.pos.y)
                force.setMag(w.force())
                // force.rotate(90)
                particle.applyForce(force)
              }
            }
          })


          flowField.forEach((x, y, val) => {
            const dist = p.createVector((x+0.5)*scale, (y+0.5)*scale).dist(w.pos)

            if (dist + marginOfError > w.diameter / 2 && dist - marginOfError < w.diameter / 2 ) {
              const force = p.createVector(w.pos.x - (x+0.5)*scale, w.pos.y - (y+0.5)*scale)
              force.setMag(w.force())
              force.rotate(90)
              let ff = flowField.getVal(x, y)
              const l = lorentz(force.mag(), forcePropagationSpeed)
              force.div(l)
              ff.add(force)
            }
          })


          p.stroke(p.color(colors.bigStone))
          p.noFill()

          // w.display()
        })
  
        // p.strokeWeight(1)
        // flowField.forEach((x, y, val) => {
        //   p.line((x+0.5)*scale, (y+0.5)*scale, (x+0.5)*scale + val.x*scale, (y+0.5)*scale + val.y*scale)
        // })

        particles.forEach((particle, i) => {
          particle.update()
          // particle.vel.add(particle.acc)
          // particle.vel.setMag(1)
          // particle.pos.add(particle.vel)
          // particle.display()
          // p.stroke(0)
          // p.fill(0)
          // p.strokeWeight(1)
          // p.textSize(15)
          // p.text(particle.vel.mag().toFixed(1) + " " + lorentz(particle.vel.mag(), forcePropagationSpeed), 0, 15 * (i+0.5))
        })

        const bigStone = p.color(colors.bigStone)
        bigStone.setAlpha(200)
        p.stroke(bigStone)
        masslessParticles.forEach((particle) => {
          const x_i = p.max(0, p.floor(particle.pos.x / scale) - 1)
          const y_i = p.max(0, p.floor(particle.pos.y / scale) - 1)
          // console.log(x_i ,y_i)
          // console.log(flowField.grid[y_i])
          const localForce = flowField.getVal(x_i, y_i)
          // console.log(localForce)
          const prevPos = p.createVector(particle.pos.x, particle.pos.y)
          if(localForce) {
            particle.applyForce(localForce)
            // particle.update(forcePropagationSpeed/8)
            particle.update(1)
            // particle.vel.add(particle.acc)
            // particle.vel.setMag(1)
            // particle.pos.add(particle.vel)

          }
          // particle.display()
          p.strokeWeight(1)
          // p.point(particle.pos.x, particle.pos.y)
          if (particle.pos.dist(prevPos) < p.width / 2)
          p.line(particle.pos.x, particle.pos.y, prevPos.x, prevPos.y)

        })
      }
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

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

let sketch = (config) => {
  return function (p) {
    let paused = false
    p.angleMode(p.DEGREES)

    class Particle {
      constructor(pos, mass) {
        this.pos = pos || p.createVector(p.random(p.width), p.random(p.height))
        this.vel = p.createVector(p.random(-0.7, 0.7), p.random(-0.7, 0.7))
        this.vel.limit(forcePropagationSpeed)
        this.acc = p.createVector(0, 0)
        this.mass = mass
        // this.inverted = p.random() > 0.5 ? 1 : -1
      }

      randomPos() {
        return p.createVector(p.random(0, p.width), p.random(0, p.height))
      }

      update() {
          this.vel.add(this.acc)
          this.vel.limit(forcePropagationSpeed * 0.8) // the speed of light can't be exceeded
          this.pos.add(this.vel)
          this.acc.mult(0)

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
        force.mult(p.sqrt(1-p.pow(this.vel.mag() / forcePropagationSpeed), 2))
        this.acc.add(force)
      }

      display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(p.color(colors.bigStone))
        p.fill(p.color(colors.bigStone))
        p.ellipse(0, 0, 5, 5)
        // p.point(0, 0)
        p.pop()
      }
    }
  

    // when adjusting propagationspeed, remember to also adjust margin of errer for force application.
    const forcePropagationSpeed = 5

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
        const pow = 3
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
    let waves = []
    let particles = []
    p.setup = function () {
      p.createCanvas(700*9/16, 700);
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(null, p.random(0.5, 2)))
      }
    }

    p.draw = function () {
      if (!paused) {

        p.background(p.color(colors.pearlBush))
        waves.forEach((w, i) => {
          w.propagate()
          w.checkLiveness()
          if (!w.alive)
            waves.splice(i, 1)
          particles.forEach(particle => {
            if (particle !== w.parent) { // convenience cheat, todo come up with math to make this redundant
              const dist = particle.pos.dist(w.pos)
              const marginOfError = 0.5
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
          p.stroke(p.color(colors.bigStone))
          p.noFill()

          w.display()
        })
        particles.forEach(particle => {
          particle.update()
          particle.display()
          waves.push(new Circle(p.createVector(particle.pos.x, particle.pos.y), 15, particle.mass, particle))
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

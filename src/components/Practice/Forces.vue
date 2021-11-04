/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import {colors as colors} from '../../colors.js'
import { Grid, noiseEverywhere } from '../../utils.js'

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
        this.type = "ROTATE"
        // this.inverted = p.random() > 0.5 ? 1 : -1
      }

      randomPos() {
        return p.createVector(p.random(0, p.width), p.random(0, p.height))
      }


      update(limit) {
          const friction = this.mass ? 0 : 0.03 // particles without mass have friction
          this.acc.sub(friction * this.vel.x, friction * this.vel.y) // add friction to acceleration
          this.vel.add(this.acc)
          this.vel = this.vel.limit(forcePropagationSpeed) // the speed of light can't be exceeded
          if(limit)
            this.vel = this.vel.limit(limit) // additional limit

          this.pos.add(this.vel)
          this.acc.setMag(0)

          let outOfBounds = false
          if (this.pos.x > p.width) {
            this.pos.x = 0
            outOfBounds = true
          }
          if (this.pos.x < 0) {
            this.pos.x = p.width
            outOfBounds = true
          }
          if (this.pos.y > p.height) {
            this.pos.y = 0
            outOfBounds = true
          }
          if (this.pos.y < 0) {
            this.pos.y = p.height
            outOfBounds = true
          }
          if (outOfBounds) {
            this.vel.setMag(this.mass)
            this.vel.rotate(p.random(360))
            this.pos = this.randomPos()
          }
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
          || this.force() < 0.00002
          )
          this.die()
      }
    }

    // provided in config
    let forcePropagationSpeed
    let scale, limit
    let width, height
    let particlesCount, masslessParticlesCount
    let showWaves
    
    // computed at a later stage
    let marginOfError
    let waves
    let particles
    let masslessParticles
    let rows
    let cols
    let flowField

    p.setup = function () {

      // destructure config for starters
      // the first ( is a quirk of using let earlier
      ({
        scale: { // access the property 'scale'
          value: scale = 20 // take its property 'value', rename it to 'scale', and if not provided, default to 20 
        } = {}, // if no 'scale' property provided, default to {}
        limit: {
          value: limit = 50
        } = {},
        canvasX: {
          value: width = 700
        } = {},
        canvasY: {
          value: height = 700
        } = {},
        forcePropagationSpeed: {
          value: forcePropagationSpeed = 10
        } = {},
        masslessParticles: {
          value: masslessParticlesCount = 4000
        } = {},
        particles: {
          value: particlesCount = 4
        } = {},
        showWaves: {
          value: showWaves = false
        } = {},
      } = config)

      marginOfError = forcePropagationSpeed / 2

      p.createCanvas(width, height);
      waves = []
      particles = []
      masslessParticles = []
      // particles that cause gravity waves
      const particleTypes = ["PUSH", "PUSH", "PUSH","PUSH", "PUSH", "PUSH", "PUSH", "PUSH"]
      for (let i = 0; i < particlesCount; i++) {
        const newPart = new Particle(null, p.random(0.5, 2))
        newPart.type = particleTypes[i]
        particles.push(newPart)
      }

      // particles that don't create gravity waves
      for (let i = 0; i < masslessParticlesCount; i++) {
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
      const color = p.color(colors.pearlBush)
      color.setAlpha(35)
      p.noStroke()
      p.fill(color)
      p.rectMode(p.CORNER)
      p.rect(0, 0, p.width, p.height)

      // // reset the flowfield
      // flowField.forEach((x, y, val) => {
      //   flowField.getVal(x, y).mult(0.99) // force fades away over time
      // })


      // each particle creates a force wave
      particles.forEach((particle, i) => {
        waves.push(new Circle(p.createVector(particle.pos.x, particle.pos.y), forcePropagationSpeed / 2, particle.mass, particle))
      })

      // each wave affects the flow/force field when at the right distance
      waves.forEach((w, i) => {
        w.propagate()
        w.checkLiveness() // within bounds etc
        if (!w.alive)
          waves.splice(i, 1)
        particles.forEach(particle => { // particles affect other particles
          if (particle !== w.parent) { // convenience cheat, todo come up with math to make this redundant
            const dist = particle.pos.dist(w.pos)
            // if distance between particle and wave origin == wave radius, apply force
            if (dist + marginOfError > w.diameter / 2 && dist - marginOfError < w.diameter / 2 ) {
              // make vector of magnitude w.force() in the direction of the wave
              const force = p.createVector(w.pos.x - particle.pos.x, w.pos.y - particle.pos.y)
              force.setMag(w.force())
              // force.rotate(90) // alternate physics
              particle.applyForce(force)
            }
          }
        })

        // updating each flowField cell is too intense, lets instead update a small random subset
        {
          // flowField.forEach((x, y, val) => { etc
          let i = 0
          while (i < limit) {
            const x = p.floor(p.random(cols))
            const y = p.floor(p.random(rows))

            flowField.getVal(x, y).mult(0.99) // force fades away over time


            const dist = p.createVector((x+0.5)*scale, (y+0.5)*scale).dist(w.pos)

            // if wave hits the flow field cell
            if (dist + marginOfError > w.diameter / 2 && dist - marginOfError < w.diameter / 2 ) {
              const force = p.createVector(w.pos.x - (x+0.5)*scale, w.pos.y - (y+0.5)*scale)
              force.setMag(w.force())

              // can get interesting effects with forces in other directions
              if (w.parent.type === "ROTATE") {
                force.rotate(90)
              } else if (w.parent.type === "PUSH") {
                force.rotate(180)
              }
              let ff = flowField.getVal(x, y)
              const l = lorentz(force.mag(), forcePropagationSpeed)
              force.div(l)
              ff.add(force)
            }

            i++
          }
        }

        if (showWaves) {
          p.stroke(p.color(colors.bigStone))
          p.noFill()
          w.display()
        }
      })

      // // show flowfield outline
      // p.strokeWeight(1)
      // p.stroke(0)
      // p.noFill()
      // p.rectMode(p.CENTER)
      // flowField.forEach((x, y, val) => {
      //   p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
      //   p.line((x+0.5)*scale, (y+0.5)*scale, (x+0.5)*scale + val.x*scale, (y+0.5)*scale + val.y*scale)
      // })

      particles.forEach((particle, i) => {
        particle.update()
      })

      const bigStone = p.color(colors.bigStone)
      bigStone.setAlpha(200)
      p.stroke(bigStone)
      masslessParticles.forEach((particle) => {
        const x_i = p.max(0, p.floor(particle.pos.x / scale) - 1)
        const y_i = p.max(0, p.floor(particle.pos.y / scale) - 1)
        const localForce = flowField.getVal(x_i, y_i)
        const prevPos = p.createVector(particle.pos.x, particle.pos.y)
        if(localForce) {
          particle.applyForce(localForce)
          particle.update(5)
        }
        p.strokeWeight(1)
        if (particle.pos.dist(prevPos) < forcePropagationSpeed + 1) // hack to hide when particles wrap around
          p.line(particle.pos.x, particle.pos.y, prevPos.x, prevPos.y)

      })
      // noiseEverywhere(p, 7)
    
    }
  }
}
/* eslint-disable */

import P5 from 'p5'
export default {
  data () {
    return {
      sketch: sketch,
      config: {
        canvasX: {
          type: 'number',
          value: 700
        },
        canvasY: {
          type: 'number',
          value: 700
        },
        scale: {
          type: 'number',
          value: 20
        },
        limit: {
          type: 'number',
          value: 50
        },
        forcePropagationSpeed: {
          type: 'number',
          value: 10
        },
        masslessParticles: {
          type: 'number',
          value: 8000
        },
        particles: {
          type: 'number',
          value: 3
        },
        showWaves: {
          type: 'boolean',
          value: false
        }
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

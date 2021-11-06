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
import { colors as colors } from '../../colors.js'
import { Grid, noiseEverywhere, randomItem } from '../../utils.js'

let sketch = (config) => {
  return function (p) {
    let paused = false
    p.angleMode(p.RADIANS)

    const lorentz = (vel, limit) => {
      return 1 /  p.sqrt(p.max(0.00001, 1 - p.pow(vel / limit, 2)))
    }
    class Particle {
      constructor(pos, mass) {
        this.pos = pos || p.createVector(p.random(p.width), p.random(p.height))
        this.vel = p.createVector(p.random(-mass, mass), p.random(-mass, mass))
        // this.vel.limit(forcePropagationSpeed)
        this.acc = p.createVector(0, 0)
        this.mass = mass
        this.type = "ROTATE"
      }

      randomPos() {
        return p.createVector(p.random(0, p.width), p.random(0, p.height))
      }


      update(limit) {
        const friction = this.mass ? 0 : particlesHaveFriction // particles without mass have friction
        this.acc.sub(friction * this.vel.x, friction * this.vel.y) // add friction to acceleration
        this.vel.add(this.acc)
        this.vel = this.vel.limit(forcePropagationSpeed) // the speed of light can't be exceeded
        if(limit)
          this.vel = this.vel.limit(limit) // additional limit

        if(!dynamic && this.mass)
          this.vel.setMag(0)

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
          // this.vel.setMag(this.mass)
          this.pos = this.randomPos()
          const headingToCenter = p.atan2(p.height / 2 - this.pos.y, p.width / 2 - this.pos.x);
          // this.vel.setHeading(headingToCenter)
          this.vel.rotate(p.random(p.TWO_PI))
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
    let showWaves, showFlowfield
    let particlesHaveFriction, flowfieldDecays
    let particleVelLimit
    let particleTypes
    let dynamic

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
      // https://javascript.info/destructuring-assignment

      // the first ( is a quirk of using let earlier
      ({
        scale: { // access the property 'scale'
          value: scale = 40 // take its property 'value', rename it to 'scale', and if not provided, default to 20 
        } = {}, // if no 'scale' property provided, default to {}
        limit: {
          value: limit = 20
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
          value: masslessParticlesCount = 1000
        } = {},
        particles: {
          value: particlesCount = 4
        } = {},
        showWaves: {
          value: showWaves = false
        } = {},
        showFlowfield: {
          value: showFlowfield = false
        } = {},
        particlesHaveFriction: {
          value: particlesHaveFriction = false
        } = {},
        flowfieldDecays: {
          value: flowfieldDecays = false
        } = {},
        speedLimit: {
          value: particleVelLimit = 0
        } = {},
        particleTypes: {
          value: particleTypes = ["PUSH", "ROTATE", "ROTATE_RIGHT", "PULL"]
        } = {},
        dynamic: {
          value: dynamic = false
        } = {},

      } = config)

      particleVelLimit = Number(particleVelLimit) // for some reason number input comes out as string
      if (typeof particleTypes == 'string')
        particleTypes = particleTypes.split(',')
      // console.log(particleTypes, typeof particleTypes)

      marginOfError = forcePropagationSpeed / 2


      p.createCanvas(width, height);
      waves = []
      particles = []
      masslessParticles = []

      // particles that cause gravity waves
      for (let i = 0; i < particlesCount; i++) {
        const newPart = new Particle(null, p.random(0.5, 5))
        newPart.type = randomItem(particleTypes)
        particles.push(newPart)
      }

      // particles that don't create gravity waves
      for (let i = 0; i < masslessParticlesCount; i++) {
        masslessParticles.push(new Particle(null, 0))
      }

      rows = p.floor(p.height / scale)
      cols = p.floor(p.width / scale)      

      
      // the flow field keeps track of local gravity
      flowField = new Grid(rows, cols)
        flowField.forEach((x, y, val) => {
          flowField.setVal(x, y, p.createVector(0, 0))
        })
      p.background(p.color(colors.pearlBush))
    }





    p.draw = function () {

      // instead of background, use a rect of size canvas
      const color = p.color(colors.pearlBush)
      color.setAlpha(35)
      p.noStroke()
      p.fill(color)
      p.rectMode(p.CORNER)
      p.rect(0, 0, p.width, p.height)

      // reset the flowfield
      if (flowfieldDecays) {
        flowField.forEach((x, y, val) => {
          flowField.getVal(x, y).mult(0.99) // force fades away over time
        })
      }


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

        // particles affect other particles
        particles.forEach(particle => { 
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
        // bounding box of wave
        const x_min = w.pos.x - w.diameter / 2
        const x_max = w.pos.x + w.diameter / 2
        const y_min = w.pos.y - w.diameter / 2
        const y_max = w.pos.y + w.diameter / 2

        // updating each flowField cell is too intense, lets instead update a small random subset
        {
          // flowField.forEach((x, y, val) => { etc
          let i = 0
          while (i < limit) {


            // index of flow field randomly on wave circumference
            const angle = p.random() * p.TWO_PI
            const x = p.min(cols - 1, p.max(0, p.floor((w.pos.x + p.cos(angle) * w.diameter / 2)/scale)))
            const y = p.min(rows - 1, p.max(0, p.floor((w.pos.y + p.sin(angle) * w.diameter / 2)/scale)))

            // position of flow field
            const x_ff = (x+0.5)*scale
            const y_ff = (y+0.5)*scale

            // flowField.getVal(x, y).mult(0.999) // force fades away over time


            const dist = p.createVector(x_ff, y_ff).dist(w.pos)

            // if wave hits the flow field cell // check not necessary anymore bcus of random sampling along circle
            // if (dist + marginOfError > w.diameter / 2 && dist - marginOfError < w.diameter / 2 ) {
              const force = p.createVector(w.pos.x - x_ff, w.pos.y - y_ff)
              force.setMag(w.force())

              // can get interesting effects with forces in other directions
              if (w.parent.type === "ROTATE") {
                force.rotate(p.PI/2)
              } else if (w.parent.type === "ROTATE_RIGHT") {
                force.rotate(-p.PI/2)
              } else if (w.parent.type === "PUSH") {
                force.rotate(p.PI)
              }
              let ff = flowField.getVal(x, y)
              const l = lorentz(force.mag(), forcePropagationSpeed)
              force.div(l)
              // force.limit(1)
              ff.add(force)
              ff.limit(1)
            // }

            i++
          }
        }

        if (showWaves) {
          p.stroke(p.color(colors.bigStone))
          p.noFill()
          w.display()
        }
      })

      // show flowfield outline
      if (showFlowfield) {
        p.stroke(0)
        p.noFill()
        p.rectMode(p.CENTER)
        flowField.forEach((x, y, val) => {
          p.strokeWeight(0.5)
          // p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
          p.line((x+0.5)*scale, (y+0.5)*scale, (x+0.5)*scale + val.x*scale, (y+0.5)*scale + val.y*scale)
          p.strokeWeight(2)
          p.point((x+0.5)*scale + val.x*scale, (y+0.5)*scale + val.y*scale)
        })
      }

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
          particle.update(particleVelLimit)
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
          value: 10
        },
        limit: {
          type: 'number',
          value: 20
        },
        forcePropagationSpeed: {
          type: 'number',
          value: 10
        },
        masslessParticles: {
          type: 'number',
          value: 2000
        },
        particles: {
          type: 'number',
          value: 4
        },
        showWaves: {
          type: 'boolean',
          value: false
        },
        showFlowfield: {
          type: 'boolean',
          value: false
        },
        particlesHaveFriction: {
          type: 'number',
          value: 0.06
        },
        flowfieldDecays: {
          type: 'boolean',
          value: true
        },
        speedLimit: {
          type: 'number',
          value: 2
        },
        particleTypes: {
          type: 'string',
          value: ["PUSH", "ROTATE", "ROTATE_RIGHT", "PULL"]
        },
        dynamic: {
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

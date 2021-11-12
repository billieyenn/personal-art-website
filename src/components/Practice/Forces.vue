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
import { Grid, noiseEverywhere, randomItem, Canvas } from '../../utils.js'

let sketch = (config) => {
  return function (p) {
    p.angleMode(p.RADIANS)

    const lorentz = (vel, limit) => {
      return 1 /  p.sqrt(p.max(0.00001, 1 - p.pow(vel / limit, 2)))
    }
    class Particle {
      constructor(pos, mass, canvas) {
        this.canvas = canvas
        this.pos = pos || this.randomPos()//p.createVector(p.random(p.width), p.random(p.height))
        this.vel = p.createVector(p.random(-mass, mass), p.random(-mass, mass))
        // this.vel.limit(forcePropagationSpeed)
        this.acc = p.createVector(0, 0)
        this.mass = mass
        this.type = "ROTATE"
      }

      randomPos() {
        const minX = this.canvas.minX
        const maxX = this.canvas.maxX
        const minY = this.canvas.minY
        const maxY = this.canvas.maxY
        return p.createVector(p.random(minX, maxX), p.random(minY, maxY))
      }


      update(limit) {
        const friction = this.mass ? 0 : particlesHaveFriction // particles without mass have friction
        this.acc.sub(friction * this.vel.x, friction * this.vel.y) // add friction to acceleration
        this.vel.add(this.acc)
        this.vel = this.vel.limit(forcePropagationSpeed) // the speed of light can't be exceeded
        if (limit)
          this.vel = this.vel.limit(limit) // additional limit

        if (!dynamic && this.mass)
          this.vel.setMag(0)


        this.pos.add(this.vel)
        this.acc.setMag(0)

        while(this.outOfBounds()/* && i < 100*/) {

          // most of the time reset the point close to some other point
          const randomI = p.floor(p.random(masslessParticles.length))
          this.pos = masslessParticles[randomI].pos.copy()
          const jitterSize = 10
          this.pos.x += p.random(-jitterSize, jitterSize)
          this.pos.y += p.random(-jitterSize, jitterSize)

          // but sometimes apparate the point in random place
          if (p.random(1) < 0)
            this.pos = this.randomPos()

          let ff = flowField.getVal(p.floor(this.pos.x/scale), p.floor(this.pos.y/scale))
          if (ff)
            this.vel = ff.copy()

        }
          // const headingToCenter = p.atan2(p.height / 2 - this.pos.y, p.width / 2 - this.pos.x);
          // this.vel.setHeading(headingToCenter)
          // this.vel.rotate(p.random(p.TWO_PI))
          // this.vel = flowField.getVal(p.floor(this.pos.x/scale), p.floor(this.pos.y/scale)).copy()
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

      outOfBounds() {
        return this.canvas.outOfBounds(this.pos)
      }
    }
  

    // when adjusting propagationspeed, remember to also adjust margin of errer for force application.

    class Circle {
      constructor (pos, diameter, intensity, parent, canvas) {
        this.diameter = diameter
        this.pos = pos
        this.intensity = intensity || 1
        this.alive = true
        this.parent = parent
        this.canvas = canvas
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
        let outOfBounds = true
        this.canvas.vertices.forEach((v) => {
          let dist = p.createVector(v.x, v.y).dist(this.pos)
          if (this.diameter / 2 < dist) {
            outOfBounds = false
          }  
        })
        return outOfBounds
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
    let canvasWidth, canvasHeight
    let particlesCount, masslessParticlesCount
    let showWaves, showFlowfield
    let particlesHaveFriction, flowfieldDecays
    let particleVelLimit
    let particleTypes
    let dynamic
    let showMassyParticles
    let annihilation

    // computed at a later stage
    let marginOfError
    let waves
    let particles
    let masslessParticles
    let rows
    let cols
    let flowField

    let canvas, canvas2, canvas3, canvas4

    let startingColorOffset// = p.random(100)
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
          value: canvasWidth = 700
        } = {},
        canvasY: {
          value: canvasHeight = 700
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
          value: particlesHaveFriction = 0.06
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
        showMassyParticles: {
          value: showMassyParticles = false
        } = {},
        annihilation: {
          value: annihilation = false
        } = {}

      } = config)

      particleVelLimit = Number(particleVelLimit) // for some reason number input comes out as string
      forcePropagationSpeed = Number(forcePropagationSpeed) // for some reason number input comes out as string
      particlesHaveFriction = Number(particlesHaveFriction) // for some reason number input comes out as string

      if (typeof particleTypes == 'string')
        particleTypes = particleTypes.split(',')

      marginOfError = forcePropagationSpeed / 2
      startingColorOffset = p.random(100)


      p.createCanvas(canvasWidth, canvasHeight/*, p.WEBGL*/);

      // p.createCanvas(1000, 1000);
      // p.ortho(-p.width/2, p.width/2, -p.height/2, p.height/2)
      waves = []
      particles = []
      masslessParticles = []

      canvas = new Canvas([p.createVector(50, 50),
        p.createVector(50, 650),
        p.createVector(650, 650),
        p.createVector(650, 50),
        ])

      let canvasses = [canvas]

      canvasses.forEach(canvas => {
        // particles that cause gravity waves
        for (let i = 0; i < particlesCount; i++) {
          const newPart = new Particle(null, p.random(0.5, 5), canvas)
          newPart.type = randomItem(particleTypes)
          particles.push(newPart)
        }

        // let newPart = new Particle(p.createVector(250, 230), 0.5, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(350, 230), 0.5, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(300, 320), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(300, 350), 0.01, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(300, 380), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(230, 450), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(370, 450), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(300, 500), 5, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // // left leg
        // newPart = new Particle(p.createVector(200, 600), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // // right leg
        // newPart = new Particle(p.createVector(400, 600), 0.1, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // let newPart = new Particle(p.createVector(250, 250), 0.5, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(350, 350), 0.01, canvas)
        // newPart.type = "PUSH"
        // particles.push(newPart)

        // newPart = new Particle(p.createVector(450, 450), 0.5, canvas)
        // newPart.type = "ROTATE"
        // particles.push(newPart)


        // particles that don't create gravity waves
        for (let i = 0; i < masslessParticlesCount; i++) {
          masslessParticles.push(new Particle(null, 0, canvas))
        }

      })

      // rows = p.floor((canvas.maxY - canvas.minY) / scale)
      // cols = p.floor((canvas.maxX - canvas.minX) / scale)
      cols = p.floor(p.width / scale)
      rows = p.floor(p.height / scale)

      
      // the flow field keeps track of local gravity
      flowField = new Grid(rows, cols)
      flowField.canvas = canvas
      flowField.forEach((x, y, val) => {
        let point = p.createVector((x+1.5)*scale, (y+1.5)*scale)
        flowField.setVal(x, y, p.createVector(0, 0))
        // flowField.setVal(x, y, (!flowField.canvas.outOfBounds(point) ? p.createVector(0, 0) : undefined))
      })
      // console.log(flowField)
      p.background(p.color(colors.pearlBush))
    }





    p.draw = function () {
      p.colorMode(p.RGB);
      // p.angleMode(p.DEGREES)
      // p.rotateX(45)
      // p.rotateZ(45)
      // p.translate(-300,-300,100)
      // p.angleMode(p.RADIANS)

      // instead of background, use a rect of size canvas
      const color = p.color(colors.pearlBush)
      color.setAlpha(5)
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
        waves.push(new Circle(p.createVector(particle.pos.x, particle.pos.y), 0, particle.mass, particle, canvas))
        if (showMassyParticles) {
          p.noStroke()
          p.fill(p.color(colors.mojo))
          p.ellipse(particle.pos.x, particle.pos.y, p.sqrt(particle.mass)*10)
        }
      })

      // each wave affects the flow/force field when at the right distance
      waves.forEach((w, i) => {
        w.propagate()
        w.checkLiveness() // within bounds etc
        if (!w.alive)
          waves.splice(i, 1)

        // waves of particles affect other particles
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

        // particles that impact each other annihilate
        if (annihilation) {
          particles.forEach((p1, i) => {
            particles.forEach((p2, ii) => {
              let schwarzschildRadius = 2 / p.pow(forcePropagationSpeed, 2) * p.pow((p1.mass > p2.mass ? p1.mass : p2.mass), 2)
              if (p1 != p2 && p1.pos.dist(p2.pos) < schwarzschildRadius/*p.sqrt(p2.mass) + p.sqrt(p1.mass)*/) {
                particles.splice(i, 1)
                p2.mass += p1.mass
                console.log(schwarzschildRadius)
              }
            })
          })

          // when one massful particle remains, close the system
          if (particles.length <= 2) {
            particles.splice(0, 1)
            particles.splice(0, 1)
          }
        }



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
            const x = p.floor((w.pos.x + p.cos(angle) * w.diameter / 2)/scale)
            const y = p.floor((w.pos.y + p.sin(angle) * w.diameter / 2)/scale)

            // check if point is in canvas
            if (x >= cols 
              || x < 0 
              || y >= rows
              || y < 0)
              break

            // position of flow field on canvas
            const x_ff = (x+0.5)*scale
            const y_ff = (y+0.5)*scale

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
              const l = lorentz(force.mag(), forcePropagationSpeed)
              force.div(l)
              // force.limit(1)

              let ff = flowField.getVal(x, y)
              if (ff) {
                ff.add(force)
                ff.limit(1)
              }
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
        const x_ff = (x + 0.5) * scale
        const y_ff = (y + 0.5) * scale
          p.strokeWeight(0.5)
          // p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
          p.line(x_ff, y_ff, x_ff + val.x*scale, y_ff + val.y*scale)
          p.strokeWeight(2)
          p.point(x_ff + val.x*scale, y_ff + val.y*scale)
        })
      }

      particles.forEach((particle, i) => {
        particle.update(forcePropagationSpeed)
      })

      const bigStone = p.color(colors.bigStone)
      bigStone.setAlpha(200)

      p.stroke(bigStone)
      masslessParticles.forEach((particle) => {
        const x_i = p.max(0, p.floor(particle.pos.x / scale) - 1)
        const y_i = p.max(0, p.floor(particle.pos.y / scale) - 1)
        const localForce = flowField.getVal(x_i, y_i)
        p.strokeWeight(localForce.mag()*3)
        const prevPos = p.createVector(particle.pos.x, particle.pos.y)
        if(localForce) {
          particle.applyForce(localForce)
          particle.update(particleVelLimit)
        }
        p.colorMode(p.HSB, 100);
        p.stroke(((particle.vel.heading() + p.PI) / p.TWO_PI * 5 + p.frameCount/50 + startingColorOffset)%100, particle.vel.mag() / particleVelLimit * 100, /**/ 100, localForce.mag()*50)

        if (particle.pos.dist(prevPos) < forcePropagationSpeed + 1) // hack to hide when particles wrap around
          p.line(particle.pos.x, particle.pos.y, prevPos.x, prevPos.y)

      })
      // noiseEverywhere(p, 3)
    
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
          value: 5
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
          value: true
        },
        showMassyParticles: {
          type: 'boolean',
          value: false
        },
        annihilation: {
          type: 'boolean',
          value: true
        }
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

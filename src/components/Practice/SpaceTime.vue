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
import { Grid, Canvas } from '../../utils.js'


let sketch = (config) => {
  return function (p) {




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

          this.pos = this.randomPos()

          // let ff = grid.getVal(p.floor(this.pos.x/scale), p.floor(this.pos.y/scale))
          // if (ff)
          this.vel = p.createVector(p.random(-this.mass, this.mass), p.random(-this.mass, this.mass))

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




    let i// = 0
    let color
    let grid
    let scale, rows, cols
    let canvas
    let offsetY = p.random(100000000)
    let offsetOrigY = 0
    let increment = 0.4

    let forcePropagationSpeed = 10
    let limit// = 10
    let dynamic = true


    let massiveParticle// =  new Particle(null, p.random(0.5, 5), canvas)
    let waves
    let particles
    p.setup = function () {

      canvas = new Canvas([p.createVector(50, 50),
        p.createVector(50, 650),
        p.createVector(650, 650),
        p.createVector(650, 50),
        ])

      massiveParticle =  new Particle(null, 2, canvas)

      waves = []
      particles = [massiveParticle]

      for (let i = 0; i < 1; i++) {
        particles.push(new Particle(null, 2, canvas))
      }
      limit = 10
      scale = 30
      rows = canvas.height / scale
      cols = canvas.width / scale

      grid = new Grid(rows, cols)

      grid.canvas = canvas
      grid.forEach((x, y, val) => {
        grid.setVal(x, y, p.createVector(0, 0))
      })


      p.createCanvas(1000, 1000, p.WEBGL);
      p.ortho(-p.width/2, p.width/2, -p.height/2, p.height/2)
      i = 0
      color = p.color(config.bgColor.value)

    }
    p.draw = function () {
      // p.lights()
      // let dirX = (p.mouseX / p.width - 0.5) * 2;
      // let dirY = (p.mouseY / p.height - 0.5) * 2;
      // p.directionalLight(250, 250, 250, -dirX, -dirY, -1);

      grid.forEach((x, y, val) => {
        // grid.getVal(x, y).mult(0) // force fades away over time
        // grid.getVal(x, y).mult(0.95) // force fades away over time
        grid.getVal(x, y).mult(0.8) // force fades away over time
      })

      particles.forEach(particle => {
        waves.push(new Circle(p.createVector(particle.pos.x, particle.pos.y), 0, particle.mass, particle, canvas))
      })



      // each wave affects the flow/force field when at the right distance
      waves.forEach((w, i) => {
        w.propagate()
        w.checkLiveness() // within bounds etc
        if (!w.alive)
          waves.splice(i, 1)


        let marginOfError = forcePropagationSpeed / 2
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
        p.angleMode(p.RADIANS)

        {
          let i = 0
          while (i < limit) {

            // index of flow field randomly on wave circumference
            const angle = p.random() * p.TWO_PI
            // console.log(angle)
            const x = p.floor((w.pos.x + p.cos(angle) * w.diameter / 2)/scale)
            const y = p.floor((w.pos.y + p.sin(angle) * w.diameter / 2)/scale)
            // console.log(x, y)
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
              const force = p.createVector(w.pos.x - x_ff, w.pos.y - y_ff)
              force.setMag(w.force())
              const l = lorentz(force.mag(), forcePropagationSpeed)
              force.div(l)
              // force.limit(1)

              let ff = grid.getVal(x, y)
              // if (ff) {
                // ff.setMag()
                // ff.add((ff.mag() + force.mag()) / 2)
                ff.add(force)
                // ff.limit(1)
              // }

            i++
          }
        }
      })


      // p.background(color)

      // instead of background, use a rect of size canvas
      // const color = p.color(colors.pearlBush)
      p.push()
      p.translate(-p.width/2, -p.height/2)
      // color.setAlpha(150)
      p.noStroke()
      p.fill(color)
      p.rectMode(p.CORNER)
      p.rect(0, 0, p.width, p.height)
      p.pop()
      p.angleMode(p.DEGREES)

      p.stroke(0)
      p.noFill()
      p.rectMode(p.CENTER)
      p.rotateX(45)
      p.rotateZ(45)

      p.translate(-200,-200,0)
      const curveRows = new Array(grid.rows).fill([])
      const curveCols = new Array(grid.cols).fill([])
            // console.log(curveRows)

      grid.forEach((x, y, val) => {
        let height = val.mag()*1

        const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
        const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
        p.strokeWeight(0.5)
        p.fill(height*50)
        // p.rect(x_ff, y_ff, scale, scale) // 'floor tile'

        let height_xy = grid.getVal(x, y).mag()*1

        p.push()
        p.translate(x_ff, y_ff, -height)
        p.fill(255)
        p.noStroke()
        p.translate(0,0, 300)
        // p.rect(0, 0, scale, scale) // 'spacetime tile'
        p.pop()
        // curveRows[x].push(height_xy)
        // curveCols[y].push(height_xy)
      })

      // for (let i = 0; i < grid.cols; i++) {
        // for (let ii = 0; ii < grid.cols; ii++) {
        //   curveRows[0].push(grid.getVal(ii, 0).mag())
        //   // console.log(ii)
        // }
      // }

      // display gravity waves of rows
      p.stroke(0)
      p.strokeWeight(1)
      grid.grid.forEach((row, y) => {
        p.beginShape()
        row.forEach((val, x) => {
          const height = val.mag()
          const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
          const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
          p.curveVertex(x_ff, y_ff, - height + 300)
          // curveCols[y].push(height)
        })
        p.endShape()
      })


      const transpose = m => m[0].map((x,i) => m.map(x => x[i]))

      // display gravity waves of cols
      transpose(grid.grid).forEach((row, y) => {
        p.beginShape()
        row.forEach((val, x) => {
          const height = val.mag()
          const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
          const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
          p.curveVertex(y_ff, x_ff, - height + 300)
          // curveCols[y].push(height)
        })
        p.endShape()
      })
      // console.log(curveCols)


      // grid.grid.forEach((row, y) => {
      //   p.beginShape()
      //   row.forEach((val, x) => {
      //     p.push()
      //     const height = val
      //     const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
      //     const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
      //     // p.translate(x_ff, y_ff, -height)

      //     // p.translate(0,0, -300)

      //     p.curveVertex(x_ff, y_ff, height + 300)
      //     p.pop()
      //   })
      //   p.endShape()
      // })

      // for (let ii = 0; ii < grid.cols; ii++) {
      //   curveCols[0].push(grid.getVal(ii, 0).mag()*1)
      // }

      // }
      // for (let i = 0; i < grid.rows; i++) {
      //   curveCols.push(grid.grid.map(row => row[i]))
      // }
      // console.log(curveCols)

      // curveRows.forEach((r, x) => {
      //   p.beginShape()
      //   r.forEach((val, y) => {
      //     const x_ff = (x + 0.5) * scale + canvas.vertices[0].x
      //     const y_ff = (y + 0.5) * scale + canvas.vertices[0].y
      //     p.curveVertex(x_ff, y_ff, val)
      //   })

      //   p.endShape()
      // })


      // apply physics on particles
      // then do a little visualisation
      particles.forEach(particle => {
        const { pos: {x, y} } = particle
        particle.update(forcePropagationSpeed)
        p.push()
        p.fill(0)
        p.translate(x + 1.5*scale, y + 1.5*scale, 300)
        p.sphere(particle.mass*1)
        p.pop()
      })
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

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

    let rows
    let cols
    const scale = 10
    const increment = 0.01 // kind of 'zoom'
    const particles = []
    let flowField
    let flowField2

    const randomColor = (colors) => {
      const keys = Object.keys(colors)
      const colLen = keys.length
      const col = colors[keys[Math.floor(Math.random()*colLen)]]
      return col
    }

    const randomParticleColor = randomColor(colors)
    const randomBGColor = randomColor(colors)
    p.setup = function () {
      p.createCanvas(1000, 1000);
      p.background(randomBGColor)
//      p.background(colors.codGray)
      rows = p.floor(p.width / scale)
      cols = p.floor(p.height / scale)
      

      {
        flowField = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        let offsetY = 0
        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let index = (x + y * p.width) * 255
            let angle = p.noise(offsetX, offsetY) * p.TWO_PI * 1
            let r = p.noise(offsetX, offsetY) * 255
            let v = p.createVector(1,0)
            p.angleMode(p.RADIANS)
            v.rotate(angle)
            flowField[x][y] = v
            offsetX += increment
            p.stroke(0)
            p.push()
            p.translate(x * scale, y * scale)
            p.rotate(v.heading())
            p.pop()
          }
          offsetY += increment
        }
      }

      {
        flowField2 = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

        let offsetY = 0
        for (let y = 0; y < rows; y++) {
          let offsetX = 0
          for (let x = 0; x < cols; x++) {
            let index = (x + y * p.width) * 255
            let angle = p.noise(offsetX, offsetY) * p.TWO_PI * 4
            let r = p.noise(offsetX, offsetY) * 255
            let v = p.createVector(1,0)
            p.angleMode(p.RADIANS)
            v.rotate(angle)
            flowField2[x][y] = v
            offsetX += increment
            p.stroke(0)
            p.push()
            p.translate(x * scale, y * scale)
            p.rotate(v.heading())
            p.pop()
          }
          offsetY += increment
        }
      }
/*
      for (let i = 0; i < 1000; i++)
      {
        const newParticle = new Particle()
        //newParticle.field = newParticle.withinBounds() ? flowField : flowField2
        particles.push(newParticle)

      }
*/

      for (let x = 0; x < cols; x++)
        {
        for (let y = 0; y < rows; y++) {
          const newParticle = new Particle(p.createVector(x * scale, y * scale))
          //newParticle.field = newParticle.withinBounds() ? flowField : flowField2
          particles.push(newParticle)
        }
      }

    }
    p.draw = function () {
//            p.background(randomBGColor)

      particles.forEach(particle => {
        const x = particle.pos.x
        const y = particle.pos.y
        const x_i = p.floor(x / scale)
        const y_i = p.floor(y / scale)
        let localFlowField = p.createVector(0,0)
        if (particle.withinBounds()) {
          if (x_i >= 0 && x_i < particle.field.length && y_i >= 0 && y_i < particle.field[0].length)
          localFlowField = particle.field[x_i][y_i]
        } else { // particle out of bounds
          
          particle.pos = particle.randomPos()
          particle.vel = p.createVector(0, 0)
          particle.acc = p.createVector(0, 0)
          particle.prevPos = particle.pos
          
        }
        particle.applyForce(localFlowField)
        particle.update()
        particle.show()
        
      })


//      p.fill(colors.codGray)
      
//      p.noStroke()
//      p.rectMode(p.CENTER)
//      p.rect(p.width / 2, p.height / 2, p.width / 1.618 / 1.618 / 1.618, p.width / 1.618 / 1.618 / 1.618)
    }

    function Particle(pos) {
      this.pos = pos || p.createVector(p.random(p.width), p.random(p.height))
      this.prevPos = p.createVector(this.pos.x, this.pos.y)
      this.vel = p.createVector(0, 0)
      this.acc = p.createVector(0, 0)
      this.margin = (p.width / 1.618 / 1.618 - p.width / 1.618 / 1.618 / 1.618 ) / scale
      this.inverted = p.random() > 0.5 ? 1 : -1

      this.randomPos = () => {
//        return p.createVector(p.random(this.margin * scale, p.width - this.margin * scale), p.random(this.margin * scale, p.height - this.margin * scale))
        return p.createVector(p.random(0, p.width), p.random(0, p.height))
      }

      this.update = () => {
          this.vel.add(this.acc)
          this.vel.setMag(scale * 0.5)
          this.pos.add(this.vel)
          this.acc.mult(0)
        
      }

      this.applyForce = (force) => {
        this.acc.add(force.mult(this.inverted))
      }

      this.show = () => {

          //p.stroke(0, 5)
          const almostBlack = p.color(randomParticleColor)
  //        const almostBlack = p.color(colors.pearlBush)
          
          almostBlack.setAlpha(5)
          p.stroke(almostBlack)
          p.strokeWeight(1)
  //        p.point(this.pos.x, this.pos.y)
          if (this.pos.dist(this.prevPos) > 0.5)
          p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y)
          this.prevPos = p.createVector(this.pos.x, this.pos.y)
        
      }

      this.withinBounds = () => {
        const x_i = p.floor(this.pos.x / scale)
        const y_i = p.floor(this.pos.y / scale)
        const cond_1 = this.pos.x >= p.width / 1.618 / 1.618 / 1.618
                    && this.pos.x < p.width - p.width / 1.618 / 1.618 / 1.618
                    && this.pos.y >= p.height / 1.618 / 1.618 / 1.618
                    && this.pos.y < p.height - p.width / 1.618 / 1.618 / 1.618 // not in padding
        const cond_2 = this.pos.x >= (p.width / 1.618 / 1.618) 
                    && this.pos.x < (p.width - p.width / 1.618 / 1.618) 
                    && this.pos.y >= (p.height / 1.618  / 1.618) 
                    && this.pos.y < (p.height - p.height /  1.618 / 1.618)   // not in inner square
        const onscreen = this.pos.x >= 0
                    && this.pos.x < p.width
                    && this.pos.y >= 0
                    && this.pos.y < p.height // not offscreen
        const cond_4 = this.pos.dist(p.createVector(p.width / 2, p.height / 2)) < p.width / 1.618 / 1.618 / 1.618 / 2   // not in inner circle

        const res = cond_1 && !cond_4
        return (this.field == flowField ? res : !res) && onscreen
      }

      this.field = !this.withinBounds() ? flowField : flowField2
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
      config: {
        speed: 10
      }
    }
  },
  async mounted () {
    this.p5canvas = new P5(sketch(this.config), 'canvas')
  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

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
    const scale = 2
    const increment = 0.01 // kind of 'zoom'
    const particles = []
    let flowField
    p.setup = function () {
      p.createCanvas(1000, 1000);
      p.background(colors.pearlBush)
      rows = p.floor(p.width / scale)
      cols = p.floor(p.height / scale)
      flowField = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])
      for (let i = 0; i < 1000; i++)
        particles.push(new Particle())
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
//          p.line(0, 0, scale, 0)
          p.pop()
//          p.fill(r)
//          p.noStroke()
//          p.rect(x * scale, y * scale, scale, scale)
        }
        offsetY += increment
      }

    }
    p.draw = function () {
      particles.forEach(particle => {
        const x = particle.pos.x
        const y = particle.pos.y
        const x_i = p.floor(x / scale)
        const y_i = p.floor(y / scale)
        let localFlowField = p.createVector(0,0)
        if (particle.withinBounds()) {
          localFlowField = flowField[x_i][y_i]
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
    }

    function Particle() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height))
      this.prevPos = p.createVector(this.pos.x, this.pos.y)
      this.vel = p.createVector(0, 0)
      this.acc = p.createVector(0, 0)
      this.margin = (p.width / 1.618 / 1.618 - p.width / 1.618 / 1.618 / 1.618 ) / scale

      this.randomPos = () => {
        return p.createVector(p.random(this.margin * scale, p.width - this.margin * scale), p.random(this.margin * scale, p.height - this.margin * scale))
      }

      this.update = () => {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.mult(0)
        this.vel.setMag(scale )
      }

      this.applyForce = (force) => {
        this.acc.add(force)
      }

      this.show = () => {
        //p.stroke(0, 5)
        const almostBlack = p.color(colors.codGray)
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
        return x_i >= this.margin && x_i < flowField.length - this.margin && y_i >= this.margin && y_i < flowField[0].length - this.margin
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

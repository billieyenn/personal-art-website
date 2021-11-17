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


let sketch = (config) => {
  return function (p) {

  // return random value between lower and higher bound, with values closer to higher bound having a  higher probability of being returned
  const linearRandom = (() => {
    let set = []
    for (let i = 0; i < 1; i+= 0.01)
      for (let ii = 0; ii < i; ii+=0.01)
        set.push(i)

    return (a = 0, b = 1) => {
      return p.map(set[p.floor(p.random(set.length))], 0, 1, a, b)
    }
  })()


  const linearRandomBetween = (a, b) => linearRandom(a, b)

  // find those points for each point that are particularly close
  // function dependent on global arrays neighbourGraph and points being declared
  const calculateNeighbourGraph = () => {
    neighbourGraph = []
    points.forEach(point => {
      points.forEach(p2 => {
        if (point != p2)
          if (point.dist(p2) < armslength * 2)
            neighbourGraph.push([point, p2])
      })
    })
  }

  let points
  let neighbourGraph

  let armslength = 12.5
  let pathwidth = 6.25
  let canvasWidth, canvasHeight

  p.setup = () => {
    ({
      canvasX: {
        value: canvasWidth = 700
      } = {},
      canvasY: {
        value: canvasHeight = 700
      } = {}
    } = config)



    p.createCanvas(canvasWidth, canvasHeight);
    const maxAttempts = 64000
    const numberOfPoints = 400
    let attempts = 0
    points = []
    points.push(p.createVector(p.width/2, p.height/2))

    for (let i = 0; points.length < numberOfPoints && attempts < maxAttempts; i++) {
      
      // more recent points more likely to be selected (as old points are already fully blocked)
      let randomVector = points[p.floor(linearRandomBetween(0, points.length))]

      let xMin = randomVector.x - armslength - pathwidth
      let xMax = randomVector.x + armslength + pathwidth
      let yMin = randomVector.y - armslength - pathwidth
      let yMax = randomVector.y + armslength + pathwidth
      let randomX = p.max(0, p.min(p.width, p.random(xMin, xMax)))
      let randomY = p.max(0, p.min(p.height, p.random(yMin, yMax)))
      let newVector = p.createVector(randomX, randomY)
      let overlaps = 0
      points.forEach(point => {
        if (newVector.dist(point) < armslength * 2) {
          overlaps ++
        }
        if (overlaps >= 2)
          return
      })
      
      if (overlaps < 2)
        points.push(newVector)
      else
        i-- // try again
      attempts ++
    }
    console.log(attempts, points.length)        

    calculateNeighbourGraph()
  }



  p.draw = () => {
    p.background(240);
    
    p.strokeWeight(armslength * 2 - pathwidth)
    p.stroke(50)
    neighbourGraph.forEach((a) => {
      p.line(a[0].x, a[0].y, a[1].x, a[1].y)
    })

    
      p.noStroke()
    
    let mouse = p.createVector(p.mouseX, p.mouseY)
    points.forEach(point => {
      p.fill(0, 20)
      if (point.dist(mouse) < armslength) {
        p.fill(120)
        if (p.mouseIsPressed) {
          points.splice(points.indexOf(point), 1)
          calculateNeighbourGraph()

        }
      }
      p.ellipse(p.x, p.y, armslength * 2, armslength * 2)
    })
  }

  }
}

export default {
  data() {
    return {
      sketch: sketch,
      config: {
        canvasX: {
          type: 'number',
          value: 800
        },
        canvasY: {
          type: 'number',
          value: 800
        },
      }
    }
  }
}
</script>

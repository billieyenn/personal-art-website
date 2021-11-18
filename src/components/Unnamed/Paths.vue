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
import { isInPoly } from '../../utils.js'


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
    // if (pointpoints)
      // pointpoints.forEach(points => {

        if (points)
        points.forEach(point => {
          points.forEach(p2 => {
            if (point != p2)
              if (point.dist(p2) < armslength * 2)
                neighbourGraph.push([point, p2])
          })
        })
      // })
  }

  let points
  let pointpoints
  let neighbourGraph
  let traces


  let armslength = 12.5
  let pathwidth = 6.25
  let canvasWidth, canvasHeight, numberOfPoints, maxAttempts

  p.setup = () => {
    ({
      canvasX: {
        value: canvasWidth = 700
      } = {},
      canvasY: {
        value: canvasHeight = 700
      } = {},
      numberOfPoints: {
        value: numberOfPoints = 700
      } = {},
      maxAttempts: {
        value: maxAttempts = 700
      } = {}
    } = config)



    p.createCanvas(canvasWidth, canvasHeight);
    // const numberOfPoints = 400
    traces = []
    points = []
    pointpoints = []
    neighbourGraph = []


    // calculateNeighbourGraph()
  }

  // what if no trace provided
  const generatePoints = (trace = []) => {
    console.log(trace)
    // const maxAttempts = 64000
    let attempts = 0
    // let points = []

    // console.log(trace)
    if (trace.length > 0) {

    // traces.forEach(trace => {
      // calculate average position to put seed point in middle
      const xAve = trace.map(t => t.x).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length
      const yAve = trace.map(t => t.y).reduce((previousValue, currentValue) => previousValue + currentValue) / trace.length

      points.push(p.createVector(xAve, yAve))
    } else {
      console.log("no trace provided")
      points.push(p.createVector(p.width / 2, p.height / 2))
    }

    for (let i = 0; points.length < numberOfPoints && attempts < maxAttempts; i++) {
      
      // more recent points more likely to be selected (as old points are already fully blocked)
      let randomVector = points[p.floor(linearRandomBetween(0, points.length))]

      let xMin = randomVector.x - armslength - pathwidth
      let xMax = randomVector.x + armslength + pathwidth
      let yMin = randomVector.y - armslength - pathwidth
      let yMax = randomVector.y + armslength + pathwidth
      let randomX = p.max(0, p.min(p.width, p.random(xMin, xMax)))
      let randomY = p.max(0, p.min(p.height, p.random(yMin, yMax)))

      // check if next iteration is inside a trace, if there is a trace

      // if(traces[0])
        if (isInPoly(trace, randomX, randomY)) {

          let overlaps = 0
          let newVector = p.createVector(randomX, randomY)

            points.forEach(point => {
              if (newVector.dist(point) < armslength * 2) {
                overlaps ++
              }
              if (overlaps >= 2)
                return

            })
          // pointpoints.forEach(points => {
          //   if (overlaps >= 2)
          //     return
          // })
          
          if (overlaps < 2)
            points.push(newVector)
          else
            i-- // try again
}
      attempts ++
    }
    console.log(attempts, points.length)  
    // return points
  }


  p.draw = () => {
    if (traced)
    {
      generatePoints(traces[traces.length - 1])
      // pointpoints.push(generatePoints(traces[traces.length - 1]))
      calculateNeighbourGraph()
      traced = false
    }
    p.background(p.color(colors.springWood));
    
    p.strokeWeight(armslength * 2 - pathwidth)
    // p.stroke(p.color('#f2aeb1'))
    p.stroke(0)
    neighbourGraph.forEach((a) => {
      p.line(a[0].x, a[0].y, a[1].x, a[1].y)
    })

    
      p.noStroke()
    
    let mouse = p.createVector(p.mouseX, p.mouseY)
    // pointpoints.forEach(points => {

      points.forEach(point => {
        if (point.dist(mouse) < armslength) {
          if (p.mouseIsPressed) {
            points.splice(points.indexOf(point), 1)
            calculateNeighbourGraph()

          }
        }
        // p.fill(0, 20)
        p.fill(0)
        p.ellipse(p.x, p.y, armslength * 2, armslength * 2)
      })
    // })

 
    // let newWeight = 2
    // p.strokeWeight(newWeight)
    // p.stroke(0)

    // traces.forEach(trace => {
    //   if (trace.length > 3)
    //   for (let ii = 0; ii < 0 + trace.length + 3; ii++) {
    //     const i = ii + 0 % trace.length
    //     const distance = trace[(i) % trace.length].dist(trace[(i + 3) % trace.length])
       
    //     const p1x = trace[(i) % trace.length].x
    //     const p1y = trace[(i) % trace.length].y
    //     const p2x = trace[(i+1) % trace.length].x
    //     const p2y = trace[(i+1) % trace.length].y
    //     p.beginShape()
    //     for(let a = 0; a < 4; a++) {
    //       p.curveVertex(trace[(i + a) % trace.length].x, trace[(i + a) % trace.length].y)
    //     }
    //     p.endShape()
    //   }
    // })
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
        canvasX: {
          type: 'number',
          value: 800
        },
        canvasY: {
          type: 'number',
          value: 800
        },
        numberOfPoints: {
          type: 'number',
          value: 2000
        },
        maxAttempts: {
          type: 'number',
          value: 16000
        },
      }
    }
  }
}
</script>

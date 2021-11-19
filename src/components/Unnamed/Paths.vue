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
    if (points)
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
  let traces


  let armslength// = 12.5 * 2
  let pathwidth = 6.25 * 2
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
        value: maxAttempts = 16000
      } = {},
      armslength: {
        value: armslength = 25
      } = {},
      pathwidth: {
        value: pathwidth = 12.5
      } = {}
    } = config)

    armslength = Number(armslength)
    pathwidth = Number(pathwidth)
    // console.log(armslength)

    p.createCanvas(canvasWidth, canvasHeight);
    // const numberOfPoints = 400
    traces = []
    points = []
    neighbourGraph = []
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
      // points.push(p.createVector(p.width / 2, p.height / 2))
    }

    if (points.length > 0)
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


  let graphAsPolygon
  let graphcount = 0
  p.draw = () => {
    graphAsPolygon = []
    if (traced)
    {
      generatePoints(traces[traces.length - 1])
      calculateNeighbourGraph()
      traced = false
      // p.noLoop()
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



  let factor = 4 // some multiple of 2
  p.loadPixels();
  let d = p.pixelDensity();
  let image = 4 * (p.width * d) * (p.height * d);
  let x, y
  for (let i = 4 * factor + factor * p.width; i < image; i += 4 * factor) {
    x = i / 4 % p.width
    if (x == 0) // each time cols loops around, also skip rows
      i += p.width * (factor - 1) * 4
    y = p.floor(i / 4 / p.width)

    // if current pixel different from previous left and previous up
    if (p.pixels[i] != p.pixels[i - 4 * factor] || p.pixels[i] != p.pixels[i - factor * p.width] || p.pixels[i] != p.pixels[i + factor * p.width])
        graphAsPolygon.push(p.createVector(x, y))
  }
  p.updatePixels();

    p.background(p.color(colors.springWood));

  // p.fill(255,0,0)
  // graphAsPolygon.forEach(point => {
  //   p.ellipse(point.x, point.y, 5, 5)
  // })
  p.stroke(0)
  p.strokeWeight(1)
  p.text(graphAsPolygon.length, 15, 15)


  graphAsPolygon.forEach(point => {
    point.next = undefined
    point.prev = undefined
  })

  //find closest point for each point
  // if (graphAsPolygon.length > 0)
  {
    // graphcount = 0
    // let point = graphAsPolygon[graphcount]
    // if (point) {
    graphAsPolygon.forEach(point => {
      const closestPoint = graphAsPolygon.reduce(
        (previousValue, currentValue) => 
        (currentValue != point && point.dist(previousValue) > point.dist(currentValue) && typeof currentValue.prev == 'undefined') && point.prev != currentValue ? currentValue : previousValue)
      point.next = closestPoint
      closestPoint.prev = point
    })
  }

  const getClosestPoint = (points, point) => {
    return points.reduce(
        (previousValue, currentValue) => 
        currentValue != point && point.dist(previousValue) > point.dist(currentValue) ? currentValue : previousValue)
  }

  const get2ClosestPoints = (points, point) => {
    const selflessPoints = [...points.filter(self => point != self)]
    const randP1 = selflessPoints[p.floor(p.random(points.length)) - 1]
    const randP2 = selflessPoints[p.floor(p.random(points.length)) - 1]
    let top2 = [randP1, randP2] // keep track of 2 closest points found so far, randomly initialized
    points.forEach(p2 => {
      if (p2 != point && typeof top2[0] != 'undefined' && typeof top2[1] != 'undefined') { // so long as the tested point isn't the point itself
        // console.log(point, p2, top2[0], top2[1])
        if (point.dist(p2) < point.dist(top2[0])) {
          top2 = [p2, top2[0]]
        } else if (point.dist(p2) < point.dist(top2[1])) {
          top2 = [top2[0], p2]          
        }
      }
    })
    return top2
//     return points.reduce(
//         (previousValue, currentValue) => 
//         currentValue != point ? 
//           point.dist(previousValue[0]) > point.dist(currentValue) ? 
//             [currentValue, previousValue[0]] : 
//             point.dist(previousValue[1]) > point.dist(currentValue) ? 
//             [previousValue[0], currentValue] : 
//           [previousValue[0], previousValue[1]] :
//           [previousValue[0], previousValue[1]]

//           , [points[p.floor(p.random(points.length)), p.floor(p.random(points.length))]]
// )
  }


  // find those links with outlier distances and sever the links
  const hardCodedReasonableDistance = 10
  graphAsPolygon.forEach(point => {
    if (point.dist(point.next) > hardCodedReasonableDistance) {
      let otherPoint = point.next.prev
      point.next.prev = undefined
      point.next = undefined

      // find new pairs for both points 
      const [ p1, p2 ] = get2ClosestPoints(graphAsPolygon, point)
      point.next = p1
      point.prev = p2

      // find new pairs for both points 
      const [ p3, p4 ] = get2ClosestPoints(graphAsPolygon, otherPoint)
      otherPoint.next = p3
      otherPoint.prev = p4
    }
  })

  graphAsPolygon.filter(point => typeof point.next == 'undefined' || typeof point.prev == 'undefined').forEach(point => {
    const closestPoint = graphAsPolygon.reduce(
        (previousValue, currentValue) => 
        currentValue != point && point.dist(previousValue) > point.dist(currentValue) ? currentValue : previousValue)
    point.next = closestPoint
    closestPoint.prev = point

  })




  // graphcount ++
  // graphcount = graphcount % graphAsPolygon.length

  p.stroke(0)
  p.strokeWeight(1)
  graphAsPolygon.forEach(point => {
    p.line(point.x, point.y, point.prev?.x, point.prev?.y)
    p.fill(0,255,0)
    if (typeof point.prev == 'undefined' || typeof point.next == 'undefined')
    p.fill(255, 0,0)

    // p.ellipse(point.x, point.y, 5, 5)
    p.line(point.x, point.y, point.next?.x, point.next?.y)
    // point.next = undefined
    // point.prev = undefined
  })


  if (graphAsPolygon.length > 0) {

    let graphaslist = []
    let graphAsPolygonCopy = [...graphAsPolygon]
    let randomPoint = graphAsPolygonCopy[p.floor(p.random(graphAsPolygonCopy.length))]
    // console.log(randomPoint)
    graphaslist.push(randomPoint)
    let iteratinLimit = 10000
    // let iterationcount = 0
    while(randomPoint.next && iteratinLimit > 0) {
      randomPoint = randomPoint.next
      if (graphaslist.indexOf(randomPoint) >= 0)
        break
      graphaslist.push(randomPoint)
      iteratinLimit--
    }

    graphaslist.forEach(point => {
      const { x, y } = point
      p.fill(255,0,0)
      p.ellipse(x, y, 5, 5)
    })
    console.log(graphaslist.length)
  }
  // for (var i = graphAsPolygonCopy.length - 1; i >= 0; i--) {
  //   let point = graphAsPolygonCopy[i]
  // }
  // graphAsPolygonCopy.forEach(point => {
  //   // graphaslist.push(point)
  //   while
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
        armslength: {
          type: 'number',
          value: 25
        },
        pathwidth: {
          type: 'number',
          value: 12.5
        },
      }
    }
  }
}
</script>

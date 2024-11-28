// use canvas to draw outline of a birch
// force field to follow along birch leaf outline
// branch holes of birch using oval-shaped force field source
// differing particle color per canvas 
// treat tree as stacked wobbly cones, and then do conic section to make wood pattern

/* eslint-enable */
/* eslint-disable */

<template>
  <div class="center-container">
    <button @click="exportCards">Export Cards</button>

    <sketch-template :sketch="sketch" :config="config"></sketch-template>
  </div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import { colors as colors } from '../../colors.js'
import { Grid, noiseEverywhere, randomItem, Canvas } from '../../utils.js'
import { getLeafPointsUnordered, calculateNeighbourGraph, scalePoints, rotatePointsAroundCenter, translatePoints } from '../../leaf.js'

import { getNextName } from '../../names.js'

let canvasses = []
let p5
let pg // buffer for exporting cards
const cutLineMargin = 10
const canvasMargin = 4
let font
let rectangleWidth
let rectangleHeight


let sketch = (config) => {
  return function (p) {
    p5 = p
  	let frame
    p.angleMode(p.RADIANS)

    const lorentz = (vel, limit) => {
      return 1 /  p.sqrt(p.max(0.00001, 1 - p.pow(vel / limit, 2)))
    }
    class Particle {
      constructor(pos, mass) {
        this.pos = pos || this.randomPos()//p.createVector(p.random(p.width), p.random(p.height))
        this.vel = p.createVector(p.random(-mass, mass), p.random(-mass, mass))
        // this.vel.limit(forcePropagationSpeed)
        this.acc = p.createVector(0, 0)
        this.mass = mass
        this.type = "ROTATE"
        this.age = 0
      }

      randomPos() {
        const minX = frame.minX
        const maxX = frame.maxX
        const minY = frame.minY
        const maxY = frame.maxY
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

        while(this.outOfBounds()/* && i < 100*/ || this.age > 100) {
          this.age = 0 
          this.pos = this.randomPos()
          let ff = flowField.getVal(p.floor(this.pos.x/scale), p.floor(this.pos.y/scale))
          if (ff)
            this.vel = ff.copy()

        }
        this.age += 1
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
        return this.pos.x > p.width || this.pos.x < 0 || this.pos.y > p.height || this.pos.y < 0
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
    let showLeafTrace

    // computed at a later stage
    let marginOfError
    let waves
    let particles
    let masslessParticles
    let rows
    let cols
    let flowField

  //console.log("asdf")
  let leafpoints = getLeafPointsUnordered(p)
  //console.log(leafpoints)

  let neighbourGraph = calculateNeighbourGraph(leafpoints)
  //console.log(neighbourGraph)

  let leafgraphcounter = 1000
  // Getting the first item
  const firstItem = neighbourGraph.entries().next().value[0];
  let leafTrace = [firstItem]
  leafTrace.push(neighbourGraph.get(firstItem))
  neighbourGraph.delete(firstItem)
  
  while(neighbourGraph.size > 0 && leafgraphcounter > 0)
  {
    let currentPoint = leafTrace[leafTrace.length - 1]
    let nextPoint = neighbourGraph.get(currentPoint);
    if (! neighbourGraph.delete(currentPoint) ) // currentpoitn likely was undefined due to having processed whole graph
    {
      break
    }
    leafTrace.push(nextPoint)
    leafgraphcounter--
  }

  // transform the leaf
  leafTrace = scalePoints(leafTrace, 5.5*8.6, 5.5*8.6)
  leafTrace = translatePoints(leafTrace, -125*8.6, -100*8.6) // experimentally determined translation
  leafTrace = rotatePointsAroundCenter(p, leafTrace, 3.14 / 8)
  
  p.preload = function () {
    //font = p.loadFont("https://fonts.cdnfonts.com/css/playfair-display")
    font = p.loadFont("/PlayfairDisplay-Italic.ttf")
  }

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
        } = {},
        leafTraceDisplay: {
          value: showLeafTrace = false
        } = {}

      } = config)

      particleVelLimit = Number(particleVelLimit) // for some reason number input comes out as string
      forcePropagationSpeed = Number(forcePropagationSpeed) // for some reason number input comes out as string
      particlesHaveFriction = Number(particlesHaveFriction) // for some reason number input comes out as string

      if (typeof particleTypes == 'string')
        particleTypes = particleTypes.split(',')

      marginOfError = forcePropagationSpeed / 2


      p.createCanvas(canvasWidth, canvasHeight);
      waves = []
      particles = []
      masslessParticles = []


	/*
  frame = new Canvas([
		p.createVector(50, 50), // top left
		p.createVector(p.width - 50, 50), // top right
		p.createVector(p.width - 50, p.height - 50), // bot right
		p.createVector(50, p.height - 50), // bot left
	]);
  */
  frame = new Canvas([...leafTrace])

	const numRectanglesX = 10
	const numRectanglesY = 11

	// Calculate the width and height of each rectangle
	rectangleWidth = Math.floor(frame.width / numRectanglesX);
	rectangleHeight = Math.floor(frame.height / numRectanglesY);

      // Loop to create the points
	for (let row = 0; row < numRectanglesY; row++) {
		for (let col = 0; col < numRectanglesX; col++) {
			// Calculate the x and y coordinates of the corner points
			const x = col * rectangleWidth;
			const y = row * rectangleHeight;
      
			const canvasTemp = new Canvas([
				p.createVector(frame.minX + col * rectangleWidth + canvasMargin, 					frame.minY + row * rectangleHeight + canvasMargin), // top left
				p.createVector(frame.minX + col * rectangleWidth + rectangleWidth - canvasMargin, 	frame.minY + row * rectangleHeight + canvasMargin), // top right
				p.createVector(frame.minX + col * rectangleWidth + rectangleWidth - canvasMargin, 	frame.minY + row * rectangleHeight + rectangleHeight - canvasMargin), // bot right
				p.createVector(frame.minX + col * rectangleWidth + canvasMargin, 					frame.minY + row * rectangleHeight + rectangleHeight - canvasMargin), // bot left
				]);
			// Append the points to the array
			canvasses.push(canvasTemp);
		}
	}



  // remove irrelevant canvasses
  canvasses = canvasses.filter((canvas) => !frame.outOfBounds(canvas.vertices[0]) || 
          !frame.outOfBounds(canvas.vertices[1]) || 
          !frame.outOfBounds(canvas.vertices[2]) || 
          !frame.outOfBounds(canvas.vertices[3])
  )


  //canvasses.push(frame)

        // particles that cause gravity waves
    for (let i = 0; i < particlesCount; i++) {
          const newPart = new Particle(null, p.random(0.5,80))
          newPart.type = randomItem(particleTypes)
          particles.push(newPart)
        }

    // filter particles that are inside frame
    // particles = particles.filter((particle) => !frame.outOfBounds(particle.pos))

// particles that don't create gravity waves
        for (let i = 0; i < masslessParticlesCount; i++) {
          masslessParticles.push(new Particle(null, 0))
        }
      

      cols = p.floor(600 * 1.41)
      rows = p.floor(600)

//      scale = p.width / cols // assuming cols and rows have same scale as p.canvas
      
      // the flow field keeps track of local gravity
      flowField = new Grid(rows, cols)
      flowField.canvas = frame
      flowField.forEach((x, y, val) => {
        flowField.setVal(x, y, p.createVector(0, 0))
      })



      // calculate intensity of flowfield at each point
      particles.forEach((part, i) => {
        let totalForceByParticle = 0
        flowField.forEach((x, y, val) => {
          const dist = p.createVector((x+1.5)*scale * 8.6, (y+1.5)*scale * 8.6).dist(part.pos)
          if (dist < 500) { // for performance reasons
            let ff = flowField.getVal(x, y)
          
      			const force = p.createVector(part.pos.x - (x+1.5)*scale * 8.6, part.pos.y - (y+1.5)*scale * 8.6)
      			force.setMag(part.mass * 100/dist)
      			if (part.type === "ROTATE") {
                  force.rotate(p.PI/2)
                } else if (part.type === "ROTATE_RIGHT") {
                  force.rotate(-p.PI/2)
                } else if (part.type === "PUSH") {
                  force.rotate(p.PI)
                }
              ff.add(force)
              totalForceByParticle += force.mag()
          }
          
        });
        // console.log(i + " " + totalForceByParticle)
      })

      // limit flow field
      flowField.forEach((x, y, val) => {
        let ff = flowField.getVal(x, y)
        ff.limit(1)
      })

      // console.log(flowField)
      p.background(p.color(colors.wildSand))

      // show flowfield outline
      if (showFlowfield) {
        p.stroke(0)
        p.noFill()
        p.rectMode(p.CENTER)
        flowField.forEach((x, y, val) => {
        const x_ff = (x + 0.5) * scale * 8.6
        const y_ff = (y + 0.5) * scale * 8.6
          p.strokeWeight(0.5)
          // p.rect((x+0.5)*scale, (y+0.5)*scale, scale, scale)
          p.line(x_ff, y_ff, x_ff + val.x*scale * 8.6, y_ff + val.y*scale * 8.6)
          p.strokeWeight(2)
          p.point(x_ff + val.x*scale * 8.6, y_ff + val.y*scale * 8.6)
        })
      }

      /*
      // Draw cut lines
      canvasses.forEach(canvas => {
        p.stroke(0)
        p.strokeWeight(1)
        // vertical left line
        p.line(canvas.vertices[0].x+cutLineMargin, canvas.vertices[0].y-canvasMargin, canvas.vertices[3].x+cutLineMargin, canvas.vertices[3].y+canvasMargin)

        // horizontal bot line (From left to right)
        p.line(canvas.vertices[3].x-canvasMargin, canvas.vertices[3].y-cutLineMargin, canvas.vertices[2].x+canvasMargin, canvas.vertices[2].y-cutLineMargin)

        // horizontal top line 
        p.line(canvas.vertices[0].x-canvasMargin, canvas.vertices[0].y+cutLineMargin, canvas.vertices[1].x+canvasMargin, canvas.vertices[1].y+cutLineMargin)

        // vertical right line 
        p.line(canvas.vertices[1].x-cutLineMargin, canvas.vertices[1].y-canvasMargin, canvas.vertices[2].x-cutLineMargin, canvas.vertices[2].y+canvasMargin)
      })
      */

/*

      // BG under canvasses
      canvasses.forEach(canvas => {
        p.fill(p.color(colors.wildSand))
        p.noStroke()
        p.rect(canvas.vertices[0].x, canvas.vertices[0].y, canvas.width, canvas.height)
      })
*/
      
/*
      // Write out the name tags
      let namesInLeaf = 0
      canvasses.forEach(canvas => { 
          let name = getNextName()
          let fontsize = name.length > 15 ? 7*4.3 : 8*4.3
          p.textFont(font)
          p.textSize(fontsize)
          //p.textFont("playfair-display-italic")
          p.stroke(0)
          p.strokeWeight(0.2)
          p.fill(0)
          namesInLeaf++
          p.push()
          p.textAlign(p.CENTER, p.CENTER)
          p.translate(canvas.minX + canvas.width/2, canvas.minY)
          p.text(name, 0, rectangleHeight/2);
          p.pop()
        
      })
*/

       // show massive particles
      if (showMassyParticles) {
        
        particles.forEach((particle, i) => {
          p.noStroke()
          if (particle.type === "ROTATE") {
            p.fill(p.color(colors.cello))
          } else if (particle.type === "ROTATE_RIGHT") {
            p.fill(p.color(colors.mojo))
          } else if (particle.type === "PUSH") {
            p.fill(p.color(colors.lemonGrass))
          } else {
            p.fill(p.color(colors.lightningYellow))
          }
          p.ellipse(particle.pos.x, particle.pos.y, p.sqrt(particle.mass)*10)

          p.stroke(0)
          p.push()
          p.translate(particle.pos.x, particle.pos.y)
          p.text(i + " " + particle.type, 0, 32);
          p.pop()

        })
      }



      // draw the leaf trace
      if(showLeafTrace)
      {
        leafTrace.forEach((point, index) => {
          if(index < leafTrace.length - 2)
          {
            let nextPoint = leafTrace[index + 1]
            if (point !== null && point !== undefined && nextPoint !== null && nextPoint !== undefined)
            p.line(point.x, point.y, nextPoint.x, nextPoint.y)
          }
        })
      }

      pg = p.createGraphics(rectangleWidth + cutLineMargin + canvasMargin, rectangleHeight + cutLineMargin + canvasMargin)

    } // end of setup





    p.draw = function () {

      // instead of background, use a rect of size canvas
      const color = p.color(colors.wildSand)
      color.setAlpha(15)
      

      p.noStroke()
      p.fill(color)
      /*
      p.rectMode(p.CORNER)
      p.rect(0, 0, p.width, p.height)
*/
/*
      // reset the flowfield
      if (flowfieldDecays) {
        flowField.forEach((x, y, val) => {
          flowField.getVal(x, y).mult(0.99) // force fades away over time
        })
      }
*/ 


      const birchLeafGreen = p.color(colors.birchLeafGreen)
      birchLeafGreen.setAlpha(10)
      p.stroke(birchLeafGreen)
      masslessParticles.forEach((particle) => {
        const x_i = p.max(0, p.floor(particle.pos.x / scale / 8.6) - 1)
        const y_i = p.max(0, p.floor(particle.pos.y / scale / 8.6) - 1)
        const localForce = flowField.getVal(x_i, y_i)
        const prevPos = p.createVector(particle.pos.x, particle.pos.y)
        if(localForce) {
          particle.applyForce(localForce)
          particle.update(particleVelLimit)
        }
        p.strokeWeight(0.5)
        if (particle.pos.dist(prevPos) < forcePropagationSpeed + 1) // hack to hide when particles wrap around
        	//if (canvasses.some(canvas => !canvas.outOfBounds(particle.pos)))
        	  if (!frame.outOfBounds(particle.pos))
    	        p.line(particle.pos.x, particle.pos.y, prevPos.x, prevPos.y)

      })
      // noiseEverywhere(p, 3)      
    }
  }
}
/* eslint-disable */

let exportedCanvasIndex = 0

import P5 from 'p5'
export default {
  data () {
    return {
      sketch: sketch,
      config: {
        canvasX: {
          type: 'number',
          value: 6000 * 1.41
        },
        canvasY: {
          type: 'number',
          value: 6000
        },
        scale: {
          type: 'number',
          value: 3
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
          value: 800
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
          value: false
        },
        speedLimit: {
          type: 'number',
          value: 2
        },
        particleTypes: {
          type: 'string',
          value: ["PUSH", "ROTATE", "ROTATE_RIGHT"/*, "PULL"*/]
        },
        dynamic: {
          type: 'boolean',
          value: false
        },
        showMassyParticles: {
          type: 'boolean',
          value: false
        },
        annihilation: {
          type: 'boolean',
          value: true
        },
        leafTraceDisplay: {
          type: 'boolean',
          value: false
        }
      }
    }
  },
  methods: {
    exportCards() {
      // pg.background(51, 100, 150)

      let canvas = canvasses[exportedCanvasIndex] // select a randomg canvas for testing
      let i_start = p5.floor(canvas.vertices[0].x) - canvasMargin - canvasMargin
      let i_end =  i_start + pg.width
      let j_start = p5.floor(canvas.vertices[0].y) - canvasMargin - canvasMargin
      let j_end = j_start + pg.height
      let x, y, i, j
      for (i = i_start; i < i_end; i++) {
        let x = i - i_start
        for (j = j_start; j < j_end; j++) {
          let y = j - j_start
          //let c = color(204 - j, 153 - i, 0);
          let c = p5.get(i, j)
          pg.set(x, y, p5.color(c));
        }
      }
      pg.updatePixels()

      // Write out the name tags
      let name = getNextName()
      let fontsize = name.length > 15 ? 7*8.6 : 8*8.6

      pg.textFont(font)
      pg.textSize(fontsize)
      pg.stroke(0)
      pg.strokeWeight(0.2)
      pg.fill(0)
      pg.textAlign(pg.CENTER, pg.CENTER)
      pg.text(name, rectangleWidth/2, rectangleHeight/2);

      // Draw cut lines
      pg.stroke(0)
      pg.strokeWeight(1)

      // vertical left line
      pg.line(cutLineMargin, 0, cutLineMargin, cutLineMargin) // top
      pg.line(cutLineMargin, pg.height-cutLineMargin, cutLineMargin, pg.height) // bottom

      // horizontal top line (From left to right)
      pg.line(0, cutLineMargin, cutLineMargin, cutLineMargin) // left
      pg.line(pg.width-cutLineMargin, cutLineMargin, pg.width, cutLineMargin) // right

      // horizontal bot line 
      pg.line(0, pg.height-cutLineMargin, cutLineMargin, pg.height-cutLineMargin) // left
      pg.line(pg.width-cutLineMargin, pg.height-cutLineMargin, pg.width, pg.height-cutLineMargin) // right

      // vertical right line 
      pg.line(pg.width-cutLineMargin, 0, pg.width-cutLineMargin, cutLineMargin) // top
      pg.line(pg.width-cutLineMargin, pg.height-cutLineMargin, pg.width-cutLineMargin, pg.height) // bottom

      p5.image(pg, 150, 175) // display graphic
      let fileName = "placecard_"+name+"_"+exportedCanvasIndex+".png"
      p5.save(pg, fileName) // save graphic
      console.log(fileName)
      exportedCanvasIndex = (exportedCanvasIndex + 1) % canvasses.length
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
.center-container {
  text-align: center;
}
  button {
    margin: auto;
  }
 </style>

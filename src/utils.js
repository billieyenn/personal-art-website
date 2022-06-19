/* eslint-enable */
/* eslint-disable */

import { sqrt } from 'mathjs'
import { max, min } from 'mathjs'

class Grid {
	constructor(rows, cols) {
		this.rows = rows
		this.cols = cols
		this.grid = new Array(rows).fill(0).map(a => [...new Array(cols).fill(0)])
	}

	// higher order function, can optionally provide condition
	forEach(f, c) {
		this.grid.forEach((row, y) => {
        row.forEach((val, x) => {
        	if (typeof val !== 'undefined')
	        	if (c ? c(x, y, val) : true)
		        	f(x, y, val)
        })
      })
	}

	setVal(x, y, val) {
		this.grid[y][x] = val
	}

	getVal(x, y) {
		const temp = this.grid[y]
		if (temp)
			return temp[x]
		return undefined
		// return [x]
	}
}

class FlowField {
	constructor(p, rows, cols, increment) {
		this.p = p
		this.increment = increment
		this.flowField = new Grid(rows, cols)

	    let offsetY = p.random(100000000)
	    for (let y = 0; y < rows; y++) {
	      let offsetX = 0
	      for (let x = 0; x < cols; x++) {
	      	this.flowField.setVal(x, y, p.noise(offsetX, offsetY))
	        offsetX += increment
	      }
	      offsetY += increment
	    }
	}

	// please provide a display function
	display(f, c) {
		this.flowField.forEach(f, c)
	}

	forEach(f, c) {
		this.flowField.forEach(f, c)
	}
}

// Area to make custom canvases
// but really it is just some polygon
class Canvas {
	constructor(vertices) {
		this.vertices = vertices
		this.minX = min(this.vertices.map(v => v.x))
    this.maxX = max(this.vertices.map(v => v.x))
    this.minY = min(this.vertices.map(v => v.y))
    this.maxY = max(this.vertices.map(v => v.y))
    this.width = this.maxX - this.minX
    this.height = this.maxY - this.minY

	}

	outOfBounds(point) {
		return !isInPoly(this.vertices, point.x, point.y)
	}
}


// simple set of points connected with lines 
const drawShapeOutline = (p, points, stroke, strokeweight) => {
  p.stroke(stroke || 0)
  p.strokeWeight(strokeweight || 5)
  for (let i = 0; i < points.length - 1; i++) {
    let point1 = points[i]
    let point2 = points[i+1]
    let v1 = p.createVector(point1.x, point1.y)
    let v2 = p.createVector(point2.x, point2.y)
    p.line(point1.x, point1.y, point2.x, point2.y)
  }
  // and connect the last point to the first
  let point1 = points[0]
  let point2 = points[points.length-1]
  let v1 = p.createVector(point1.x, point1.y)
  let v2 = p.createVector(point2.x, point2.y)
  p.line(point1.x, point1.y, point2.x, point2.y)
}



// collision detection
/*
input: 
- points: array of p5 vectors
- x: x-coordinate of point to be tested
- y: y-coordinate of point to be tested

Output:
- boolean: is point 'inside' the polygon
*/
const isInPoly = (points, x, y) => {
  // source http://www.jeffreythompson.org/collision-detection/poly-poly.php?fbclid=IwAR3pveFV5i-hQD3e6G1jWsTNc5LL8SmHd74yX6tDQ7KP2apj9JX4th1mcjA
  let collision = false

  let copiedPoints = [...points]
  // iterate over each point in shape
  copiedPoints.forEach((po, i) => {

    // for each pair of consecutive points along shape
    const vc = po
    const vn = copiedPoints[(i + 1)%copiedPoints.length]

    // if y-coord of those points are on different sides of the pixel
    const cond_1 = (vc.y > y && vn.y < y)
    const cond_2 = (vc.y < y && vn.y > y)
    // and if the below condition
    const cond_3 = (x < (vn.x - vc.x) * (y - vc.y) / (vn.y - vc.y) + vc.x)

    // then collision
    if ((cond_1 || cond_2) && cond_3) {
      collision = !collision
    }
  })
  return collision
}

/*
input
- x0: x-coord of point 0
- x1: y-coord of point 0
- y0: x-coord of point 1
- y1: y-coord of point 1
output
- distance between the two points
*/
const dist = (x0, x1, y0, y1) => {
	return sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1) )
} 

/*
input: 
- points: array of p5 vectors
- x: x-coordinate of point to be tested
- y: y-coordinate of point to be tested

output:
- p5 vector representing a point of points with least distance to (x, y)
*/
const closestPoint = (points, x, y) => {
  let closestPoint = points[0] // assume it is point 0
  // find closest point of the shape to this pixel
  points.forEach((po) => {
  	if (dist(x, y, po.x, po.y) < dist(x, y, closestPoint.x, closestPoint.y))
      closestPoint = po
  })

  return closestPoint
}


// cyan, magenta, yellow, black values converted to red, green, blue 
const CMYKtoRGB = (c, m, y, k) => {
	let r = 255 * (1 - c) * (1 - k)
	let g = 255 * (1 - m) * (1 - k)
	let b = 255 * (1 - y) * (1 - k)
	return [r, g, b]
}

const RGBtoCMYK = (r, g, b) => {
	let r_ = r / 255
	let g_ = g / 255
	let b_ = b / 255

	let k = 1 - max(r_, g_, b_)
	let c = (1 - r_ - k) / (1 - k)
	let m = (1 - g_ - k) / (1 - k)
	let y = (1 - b_ - k) / (1 - k)
	return [c, m, y, k]
}

// use the pixels array and gaussian noise to imitate noise real cameras have
// taxe pixel values at coordinates and add noise to pixels
const noiseEverywhere = (p, std) => {
  p.loadPixels();
  let noiseStandardDeviation = std
  let d = p.pixelDensity();
  let image = 4 * (p.width * d) * (p.height * d);
  for (let i = 0; i < image; i += 4) {
    p.pixels[i] = p.randomGaussian(p.pixels[i], noiseStandardDeviation);
    p.pixels[i + 1] = p.randomGaussian(p.pixels[i + 1], noiseStandardDeviation);
    p.pixels[i + 2] = p.randomGaussian(p.pixels[i + 2], noiseStandardDeviation);
    p.pixels[i + 3] = p.pixels[i + 3];
  }
  p.updatePixels();
}

// use the pixels array and gaussian noise to imitate noise real cameras have
// draw a background color with noise in it
const noisyBackground = (p, color, std) => {
  let c = color
  p.loadPixels();
  let noiseStandardDeviation = std
  let d = p.pixelDensity();
  let image = 4 * (p.width * d) * (p.height * d);
  for (let i = 0; i < image; i += 4) {
    p.pixels[i] = p.randomGaussian(c[0], noiseStandardDeviation);
    p.pixels[i + 1] = p.randomGaussian(c[1], noiseStandardDeviation);
    p.pixels[i + 2] = p.randomGaussian(c[2], noiseStandardDeviation);
    p.pixels[i + 3] = 255;
  }
  p.updatePixels();
}

// remember to call p.loadPixels before using this 
const convertCoordsToPixelArrayIndex = (p, x, y) => {
  let d = p.pixelDensity()
  return (x + y*p.width) * 4 * d
}


// provided an object or array, return a random item
const randomItem = (enumerable) => {
	const keys = Object.keys(enumerable || colors)
	const colLen = keys.length
	const col = enumerable[keys[Math.floor(Math.random()*colLen)]]
	return col
}


// rotate the shape around the center of its extended bounding box
const rotatePoints = (p, points, angle, minX, minY, w, h) => {
  p.angleMode(p.DEGREES)
  let s = p.sin(-angle) // calculate outside of loop for comp eff
  let c = p.cos(-angle)
  let res = points.map((point) => {
    let new_p = p.createVector(point.x, point.y)
    new_p.x -= (minX + w / 2)
    new_p.y -= (minY + h / 2)

    let x_new = new_p.x * c - new_p.y * s
    let y_new = new_p.x * s + new_p.y * c

    new_p.x = x_new + (minX + w / 2)
    new_p.y = y_new + (minY + h / 2)

    return new_p
  })
  return res
}


const rotatePoint = (p, pivot_x, pivot_y, angle, point_x, point_y) => {
  p.angleMode(p.DEGREES)
  let s = p.sin(angle)
  let c = p.cos(angle)
  let new_x = point_x
  let new_y = point_y
  new_x -= (pivot_x)
  new_y -= (pivot_y)

  let x_new = new_x * c - new_y * s
  let y_new = new_x * s + new_y * c

  new_x = x_new + ( pivot_x)
  new_y = y_new + ( pivot_y)

  return [new_x, new_y]
}

// compare a set of points with a point to see if that point is to the left of all of those points
const isLeftOf = (p, points, x, y) => {
  let closestPointObj = closestPoint(points, x, y)// points2[closestPointIndex] // assume it is point 0

  // create local variable for clear naming
  let currentPoint = p.createVector(x, y)


  // create vector along the direction of the shape's outline
  let v1 = p.createVector(closestPointObj.x, closestPointObj.y)
  let v2 = p.createVector(points[(points.indexOf(closestPointObj)+1)%points.length].x, points[(points.indexOf(closestPointObj)+1)%points.length].y)
  let closestToPlusOne = p.createVector(v2.x - v1.x, v2.y - v1.y)

  // and closestpoint to currentpoint
  // create vector from current pixel to closest point
  let closestToCurrent = p.createVector(currentPoint.x - v1.x, currentPoint.y - v1.y)

  // The sign of the angle between those two vectors indicates which side of the shape the pixel is (relative to the curve's orientation)
  let angleBetween = closestToCurrent.angleBetween(closestToPlusOne)
  let dist = closestPointObj.dist(currentPoint) 

  
  p.noStroke()
  p.noFill()
  return angleBetween > 0 // if pixel is to the left of the shape
}

export { FlowField, 
		Grid, 
		isInPoly, 
		closestPoint, 
		dist, 
		RGBtoCMYK, 
		CMYKtoRGB,
		noiseEverywhere,
		noisyBackground,
		convertCoordsToPixelArrayIndex,
		randomItem,
		drawShapeOutline,
		rotatePoints,
		rotatePoint,
		Canvas,
		isLeftOf }
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

// provided an object or array, return a random item
const randomItem = (enumerable) => {
	const keys = Object.keys(enumerable || colors)
	const colLen = keys.length
	const col = enumerable[keys[Math.floor(Math.random()*colLen)]]
	return col
}

export { FlowField, 
		Grid, 
		isInPoly, 
		closestPoint, 
		dist, 
		RGBtoCMYK, 
		CMYKtoRGB,
		noiseEverywhere,
		randomItem,
		Canvas }
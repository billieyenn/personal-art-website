/* eslint-enable */
/* eslint-disable */


class Grid {
	constructor(rows, cols) {
		this.grid = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])
	}

	// higher order function, can optionally provide condition
	forEach(f, c) {
		this.grid.forEach((row, y) => {
        row.forEach((val, x) => {
        	if(c ? c(x, y, val) : true)
	        	f(x, y, val)
        })
      })
	}

	setVal(x, y, val) {
		this.grid[x][y] = val
	}

	getVal(x, y) {
		return this.grid[x][y]
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
}

export  {FlowField, Grid}
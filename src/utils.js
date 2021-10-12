/* eslint-enable */
/* eslint-disable */



class FlowField {
	constructor(p, rows, cols, increment) {
		this.p = p
		this.rows = rows
		this.cols = cols
		this.increment = increment
		this.flowField = new Array(cols).fill(0).map(a => [...new Array(rows).fill(0)])

	    let offsetY = p.random(100000000)
	    for (let y = 0; y < rows; y++) {
	      let offsetX = 0
	      for (let x = 0; x < cols; x++) {
	        this.flowField[x][y] = p.noise(offsetX, offsetY)
	        offsetX += increment
	      }
	      offsetY += increment
	    }
	}

	display(f) {
		this.flowField.forEach((row, y) => {
        row.forEach((val, x) => {
        	f(x, y, val)
        })
      })
	}
}

export  {FlowField}
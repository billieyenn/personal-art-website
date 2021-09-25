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

let sketch = (config) => {
  return function (p) {

    class Grid {
      constructor (x, y, cells) {
        this.x = x
        this.y = y
        this.positions = [...Array(this.y)].map(x=>Array(this.x))       
        this.cells = cells || []
        if ( this.cells.length > 0 ) {
        }
      }

      addCell (cell) {
        this.cells.push(cell)
      }

      displayGrid () {
        this.cells.forEach(c => {
         c?.displayCell() 
        })
      }

      display () {
        this.cells.forEach(c => {
         c?.displayObj() 
        })
      }
    }

    class Cell {
      constructor (w, h, pos, obj) {
        this.width = w
        this.height = h
        this.pos = pos || p.createVector(0, 0)
        this.posOffset = p.createVector(0, 0)
        this.obj = obj || null
        this.size = 0
      }

      displayCell () {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.translate(this.posOffset.x, this.posOffset.y)
        p.rect(0, 0, this.width, this.height)
        p.pop()
      }

      displayObj () {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.translate(this.posOffset.x, this.posOffset.y)
        this.obj?.display()
        p.pop()
      }

      setPosition (pos) {
        this.pos = pos
        return this
      }

      setPositionOffset (pos) {
        this.posOffset = pos
        return this
      }

      setSize (s) {
        this.size = s
      }

      setObject (obj) {
        this.obj = obj
      }
    }

    class Circle {
      constructor (diameter) {
        this.d = diameter
      }

      display () {
        p.ellipse(0, 0, this.d)
      }
    }

    const windowSize = 710
    const gridSize = 13
    const grid = new Grid(gridSize, gridSize)
    p.setup = function () {
      p.createCanvas(windowSize, windowSize);
      p.rectMode(p.CENTER)
      p.ellipseMode(p.CENTER)

      // make basic grid of squares
      for (let i = 0; i < gridSize; i++) {
        for (let ii = 0; ii < gridSize; ii++) {
          let newCellW = windowSize / gridSize
          let newCellH = windowSize / gridSize
          let newCell = new Cell(newCellW, newCellH)
          let newPosX = ii * windowSize / gridSize + newCellW / 2
          let newPosY = i * windowSize / gridSize + newCellH / 2
          newCell.setPosition(p.createVector(newPosX, newPosY))
          newCell.size = newCell.width / (windowSize / gridSize)
          grid.addCell(newCell)
        } 
      }

      //make a random cell big
      const makeRandomCellBig = () => {
        let x = p.floor(p.random(0, gridSize - 1))
        let y = p.floor(p.random(0, gridSize - 1))
        let cellIndex = x + y * gridSize
        let cell = grid.cells[cellIndex]

        // try again if null cell
        {
          let i = 0
          while (!cell && i < 5) {
            // cellIndex++
            x = p.floor(p.random(0, gridSize - 1))
            y = p.floor(p.random(0, gridSize - 1))
            cellIndex = x + y * gridSize
            cell = grid.cells[cellIndex]
            i++
          }
        }

        if (cell) 
        if (x + cell.size < gridSize && y + cell.size < gridSize) //make sure circles stay in bounds
        {
          let assumeSafeToGrow = true
          // check if growth is possible
          // cells adjacent to the right column
/*
          for (let i = 0; i < cell.size; i++) {
            if (grid.cells[cellIndex + cell.size + i * gridSize - 1] === null)
              assumeSafeToGrow = false
          }

          // cells adjacent to the bottom row
          for (let i = 0; i < cell.size; i++) {
            if (grid.cells[cellIndex + (cell.size - 1) * gridSize + i - 1] === null)
              assumeSafeToGrow = false
          }
          if (!assumeSafeToGrow)
            console.log("not safe")
*/

          if (assumeSafeToGrow) {
            cell.setPositionOffset(p.createVector(cell.width / 2, cell.height / 2))
            cell.width = cell.width + windowSize / gridSize // make cells one cell size bigger
            cell.height = cell.height + windowSize / gridSize
            cell.size = cell.width / (windowSize / gridSize)

            // delete 'overwritten cells'
            // cells adjacent to the right column
            for (let i = 0; i < cell.size; i++) {
              grid.cells[cellIndex + cell.size + i * gridSize - 1] = null
            }

            // cells adjacent to the bottom row
            for (let i = 0; i < cell.size; i++) {
              grid.cells[cellIndex + (cell.size - 1) * gridSize + i - 1] = null
            }
          }
        }
      }

      // do the thing
      {
        let i = 0
        while (i < 50) {
          makeRandomCellBig()
          i++
        }
      }

      // fill cells with circles
      for (let i = 0; i < grid.cells.length; i++) {
        if(grid.cells[i]?.size > 1)
        grid.cells[i]?.setObject(new Circle(grid.cells[i].width * 0.5))
      }

      p.background(250)
      p.strokeWeight(1)
      p.stroke(0)
      p.fill(0)
      grid.display()
      p.noFill()
      grid.displayGrid()

    }
    p.draw = function () {
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
      config: {}
    }
  },
  async mounted () {
    /*
    const baseURI = 'https://raw.githubusercontent.com/billieyenn/test-art/main/sketch.js'
    let sketch = await this.getSketch(baseURI, this.config)
    console.log(sketch)
    */

    this.p5canvas = new P5(sketch(), 'canvas')

  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
    async getSketch(url, config) {
      let result = await this.$http.get(url)
      const curry = new Function(result.data)()(config) // eslint-disable-line no-new-func
      console.log(curry)
      return curry
    }
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

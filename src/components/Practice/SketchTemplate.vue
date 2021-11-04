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
    let i// = 0
    let color
    p.setup = function () {
      p.createCanvas(700, 700);
      i = 0
      color = p.color(config.bgColor.value)
    }

    p.draw = function () {
      p.background(color)
      p.text(i, p.width / 2, p.height / 2)
      i++
    }
  }
}

export default {
  data() {
    return {
      sketch: sketch,
      config: {
        key1: {
          type: 'number',
          value: 1
        },
        key2: {
          type: 'string',
          value: "helloe"
        },
        key3: {
          type: 'boolean',
          value: false
        },
        bgColor: {
          type: 'color',
          value: randomColor(colors)
        }
      }
    }
  }
}
</script>

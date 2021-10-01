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

import {colors as colors} from '../../colors.js'
import blob from '../../linemachine.js'

let sketch = (config) => {
  return function (p) {


    let L
    const G = (1 + math.sqrt(5)) / 2 // the golden ratio
    let BG
    p.setup = function () {
//      p.createCanvas(1000, 1000);
     // p.createCanvas(2400, 2400);
            p.createCanvas(710, 710/G);

//      p.background(colors.pearlBush)



      const LineMachine = blob(config)
    L = LineMachine(p)
    L.waves = L.generator.generateWavesFromVectorList([["0","0"],["-127","-392"],["138","185"],["-22","-146"],["-57","-46"],["-171","65"],["-95","102"],["-108","-59"],["90","78"],["24","35"],["-6","-28"],["40","-42"],["-0","-21"],["48","-1"],["-42","25"],["45","-32"],["8","-43"]].map(v => p.createVector(v[0], v[1])), 10)
   
    L.tracePoints()
    L.resize(1 -  1/G/G/G/G)
    L.tracePoints()
    L.fill = false
//    L.color = colors.bigStone
    L.color = colors.springWood



    BG = blob(config)(p)
    BG.color = colors.roseBud
  //  BG.color = colors.springWood

    BG.fill = true
    BG.waves = L.waves.slice(0, L.waves.length - 12)
    BG.waves[BG.waves.length - 1].freeze()
    BG.tracePoints()
    BG.resize(1 -  1/G/G/G/G)
    BG.tracePoints()




    }
    p.draw = function () {

/*
*/
      //rotate tracers
      BG.waves.forEach(wave => {  
          if (!wave.frozen)
        wave.rotate();
      })

      BG.tracePoints()


      p.push()
      p.background(colors.springWood)
      p.fill(colors.steelBlue)
      p.noStroke()
      let paddingX = 1/G/G/G/G/G/G * p.width
      let paddingY = 1/G/G/G/G/G/G * p.height
      p.rect(paddingX, paddingY, p.width - 2*paddingX, p.height - 2*paddingY, 50)
      p.translate(p.width / 2, p.height / 2)


      BG.display(0, 1)
      L.display(15, 1)
      p.pop()
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
      config: {
        speed: 10
      }
    }
  },
  async mounted () {
    this.p5canvas = new P5(sketch(this.config), 'canvas')
  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
  }




}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

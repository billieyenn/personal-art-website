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
    p.setup = function () {
      p.createCanvas(710, 400, p.WEBGL);
    }
    p.draw = function () {
      p.background(250)
      p.normalMaterial()

      p.translate(-240, -100, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.plane(70)
      p.pop()

      p.translate(240, 0, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.box(70, 70, 70)
      p.pop()

      p.translate(240, 0, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.cylinder(70, 70)
      p.pop()

      p.translate(-240 * 2, 200, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.cone(70, 70)
      p.pop()

      p.translate(240, 0, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.torus(70, 20)
      p.pop()

      p.translate(240, 0, 0)
      p.push()
      p.rotateZ(p.frameCount * 0.01)
      p.rotateX(p.frameCount * 0.01)
      p.rotateY(p.frameCount * 0.01)
      p.sphere(70)
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

/* eslint-enable */
/* eslint-disable */

<template>
  <div>
    <div id="canvas"></div>

    <button @click="toggleConfig">Show Config</button>
    <button @click="nextFrame">Next Frame</button>
    <button @click="toggleLoop"> {{ looping ? "Pause Drawing" : "Continue Drawing" }}</button>

    <div v-if="showConfig" class="card">
      <button @click="refresh">Restart</button>
      <div v-for="obj in Object.entries(config)" :key="obj[0]">
        <label :for="obj[0]">{{ obj[0] }}</label>
        <input      v-if="obj[1].type === 'string'"  :name="obj[0]" type="text"     v-model="obj[1].value">
        <input v-else-if="obj[1].type === 'number'"  :name="obj[0]" type="number"   v-model="obj[1].value">
        <input v-else-if="obj[1].type === 'boolean'" :name="obj[0]" type="checkbox" v-model="obj[1].value">
        <input v-else-if="obj[1].type === 'color'"   :name="obj[0]" type="color"    v-model="obj[1].value">
      </div>
    </div>
    <div>
    </div>

  </div>
</template>

<script>
import P5 from 'p5'
export default {
  data () {
    return {
      looping: true,
      showConfig: false
    }
  },
  props: {
    sketch: Function,
    config: Object
  },
  async mounted () {
    this.p5canvas = new P5(this.sketch(this.config), 'canvas')
  },
  methods: {
    refresh () {
      this.p5canvas.setup(this.config)
    },
    toggleLoop () {
      this.looping ? this.p5canvas.noLoop() : this.p5canvas.loop()
      this.looping = !this.looping
    },
    toggleConfig () {
      this.showConfig = !this.showConfig
    },
    nextFrame () {
      this.p5canvas.draw()
      this.p5canvas.noLoop()
      this.looping = false
    }
  }
}
</script>

<style scoped>
  /* eslint-disable */

  label {
    margin-right: 0.5rem;
  }

  input {
      padding: 0.3rem 1rem;
      border-radius: 5px;
      border:  1px solid #e9e3d5;
      margin-bottom: 0.5rem;
      width:  100%;
  }

  button {
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    font: inherit;
    background-color: #e9e3d5;
    border:  1px solid #e9e3d5;
    color:  black;
    cursor: pointer;
    border-radius: 10px;
    margin-bottom: 0.5rem;
    margin-right: 0.5rem;
    display: inline-block;
  }

  button:hover,
  button:active {
    background-color: #dfdab0;
    border-color: #dfdab0;
  }

  .card {
    border-radius: 12px;
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    margin: 2rem auto;
    max-width: 20rem;
    background-color: #2b2b2b;
    color: #faf8f5;
  }
</style>

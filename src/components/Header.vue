<template>
  
<div id="sidebar-wrapper">
<div class="header">
<!-- <img alt="logo" src="../assets/logo2.png" width="20%" height="20%"> -->
  <router-link to="/" tag="h1" active-class="active">BIL.ART</router-link>
  <router-link to="/twitter" tag="li" active-class="active"><a>Twitter</a></router-link>
  <router-link to="/github" tag="li" active-class="active"><a>Github</a></router-link>
  <router-link to="/opensea" tag="li" active-class="active"><a>OpenSea</a></router-link>
<!-- <router-link to="/gallery" tag="li" active-class="active"><a>Gallery</a></router-link> -->
  <hr>
  <router-link tag='li' to='/about/perdurable' style='cursor: pointer;'>Perdurable</router-link>
  <ul>
  <router-link tag='li' to='/sketches/perdurable/7' style='cursor: pointer;'>UltraMinimalist</router-link>
  <router-link tag='li' to='/sketches/perdurable/5' style='cursor: pointer;'>Minimalist</router-link>
  <router-link tag='li' to='/sketches/perdurable/1' style='cursor: pointer;'>PureShapes</router-link>
  <router-link tag='li' to='/sketches/perdurable/6' style='cursor: pointer;'>MinimalistBeans</router-link>
  <router-link tag='li' to='/sketches/perdurable/3' style='cursor: pointer;'>MediumBeans</router-link>
  <router-link tag='li' to='/sketches/perdurable/4' style='cursor: pointer;'>HighBeans</router-link>
  <router-link tag='li' to='/sketches/perdurable/11' style='cursor: pointer;'>Symmetrical</router-link>
  <router-link tag='li' to='/sketches/perdurable/2' style='cursor: pointer;'>PolySquiggle</router-link>
  <router-link tag='li' to='/sketches/perdurable/12' style='cursor: pointer;'>PolySymmetrical</router-link>
  <router-link tag='li' to='/sketches/perdurable/8' style='cursor: pointer;'>Toroid</router-link>
  <router-link tag='li' to='/sketches/perdurable/9' style='cursor: pointer;'>Storm</router-link>
  <router-link tag='li' to='/sketches/perdurable/10' style='cursor: pointer;'>Disc</router-link>
  </ul>
<!--
  <router-link tag='li' to='/about/test' style='cursor: pointer;'>Test</router-link>
  <ul>
      <router-link tag='li' to='/sketches/test/1' style='cursor: pointer;'>Test 1</router-link>
  </ul>
-->

  <router-link tag='li' to='/about/fourierplayground' style='cursor: pointer;'>Fourier Playground</router-link>
  <ul>
      <router-link tag='li' to='/sketches/fourier' style='cursor: pointer;'>Playground</router-link>
  </ul>

  <router-link tag='li' to='/about/practice' style='cursor: pointer;'>Practice</router-link>
  <ul>
      <router-link tag='li' to='/sketches/practice/placeholder' style='cursor: pointer;'>Placeholder</router-link>
      <router-link tag='li' to='/sketches/practice/flower' style='cursor: pointer;'>Flower</router-link>
      <router-link tag='li' to='/sketches/practice/fibonacci' style='cursor: pointer;'>Fibonacci</router-link>
      <router-link tag='li' to='/sketches/practice/goodmorning' style='cursor: pointer;'>gm</router-link>
      <router-link tag='li' to='/sketches/practice/fly' style='cursor: pointer;'>Fly</router-link>
      <router-link tag='li' to='/sketches/practice/perlinnoiseflowfield' style='cursor: pointer;'>PerlinNoiseFlowField</router-link>
      <router-link tag='li' to='/sketches/practice/fourcolorprinting' style='cursor: pointer;'>Four Color Printing</router-link>
      <router-link tag='li' to='/sketches/practice/fourcolorprinting_2' style='cursor: pointer;'>Four Color Printing 2</router-link>
      <router-link tag='li' to='/sketches/practice/collision' style='cursor: pointer;'>Collision</router-link>
      <router-link tag='li' to='/sketches/practice/grids' style='cursor: pointer;'>Grids</router-link>
      <router-link tag='li' to='/sketches/practice/forces' style='cursor: pointer;'>Forces</router-link>
      <router-link tag='li' to='/sketches/practice/gaussiannoise' style='cursor: pointer;'>Gaussian Noise</router-link>
      <!-- <router-link tag='li' to='/sketches/practice/sketchtemplate' style='cursor: pointer;'>sketchtemplate</router-link> -->
      <router-link tag='li' to='/sketches/practice/spacetime' style='cursor: pointer;'>Spacetime</router-link>
      <router-link tag='li' to='/sketches/practice/container' style='cursor: pointer;'>Container</router-link>
      <router-link tag='li' to='/sketches/practice/shaderone' style='cursor: pointer;'>Shader One</router-link>
  </ul>

   <router-link tag='li' to='/about/unnamed' style='cursor: pointer;'>WIP</router-link>
  <ul>
      <router-link tag='li' to='/sketches/unnamed' style='cursor: pointer;'>Unnamed</router-link>
      <router-link tag='li' to='/sketches/shape/1' style='cursor: pointer;'>Shape 1</router-link>
      <router-link tag='li' to='/sketches/practice/forceswindows' style='cursor: pointer;'>Windows</router-link>
      <router-link tag='li' to='/sketches/practice/birch' style='cursor: pointer;'>Birch</router-link>
      <router-link tag='li' to='/sketches/paths' style='cursor: pointer;'>Paths</router-link>
  </ul>

  <hr>
</div>
</div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
export default {
  methods: {}
}
</script>

<style>
li {
  list-style-type: none;
 }
 li:active{
  font-weight: bold
 }
 li.router-link-active{
 font-weight: bold
  
 }
</style>

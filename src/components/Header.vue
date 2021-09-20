<template>
<div id="sidebar-wrapper">
<div class="header">
<!-- <img alt="logo" src="../assets/logo2.png" width="20%" height="20%"> -->
<h1>BIL.ART</h1>
  <router-link to="/about" tag="li" active-class="active"><a>About</a></router-link>
  <router-link to="/twitter" tag="li" active-class="active"><a>Twitter</a></router-link>
  <router-link to="/github" tag="li" active-class="active"><a>Github</a></router-link>
<!-- <router-link to="/gallery" tag="li" active-class="active"><a>Gallery</a></router-link> -->
  <hr>
  <router-link tag='li' to='/about/perdurable' style='cursor: pointer;'>Perdurable</router-link>
  <ul>
  <router-link tag='li' to='/sketches/7' style='cursor: pointer;'>UltraMinimalist</router-link>
  <router-link tag='li' to='/sketches/5' style='cursor: pointer;'>Minimalist</router-link>
  <router-link tag='li' to='/sketches/1' style='cursor: pointer;'>PureShapes</router-link>
  <router-link tag='li' to='/sketches/6' style='cursor: pointer;'>MinimalistBeans</router-link>
  <router-link tag='li' to='/sketches/3' style='cursor: pointer;'>MediumBeans</router-link>
  <router-link tag='li' to='/sketches/4' style='cursor: pointer;'>HighBeans</router-link>
  <router-link tag='li' to='/sketches/11' style='cursor: pointer;'>Symmetrical</router-link>
  <router-link tag='li' to='/sketches/2' style='cursor: pointer;'>PolySquiggle</router-link>
  <router-link tag='li' to='/sketches/12' style='cursor: pointer;'>PolySymmetrical</router-link>
  <router-link tag='li' to='/sketches/8' style='cursor: pointer;'>Toroid</router-link>
  <router-link tag='li' to='/sketches/9' style='cursor: pointer;'>Storm</router-link>
  <router-link tag='li' to='/sketches/10' style='cursor: pointer;'>Disc</router-link>
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
</style>

<!-- Sketches want to be on their own page without a header or footer -->

<template>
<!--   <div class="container"> -->
<!--       <h1>Sketch</h1>
      <hr> -->
      <div class="center" style="background-color: white;">
        <router-view></router-view>
      </div>
<!--   </div> -->
</template>

<script>
/* eslint-enable */
/* eslint-disable */

export default {
}
</script>

<style scoped>

/*https://blog.hubspot.com/website/center-div-css#center-div-horizontally-vertically*/
.center {
position: absolute;
left: 50%;
top: 0;
transform: translate(-50%, 0);
padding: 10px;
}
</style>

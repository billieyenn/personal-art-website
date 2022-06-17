/* eslint-enable */
/* eslint-disable */
<template>
  <div>
    <h1>
      Practice makes perfect
    </h1>
    <p>
      Attempting to recreate classics is a way to improve as an artist
    </p>
    <h1>
      Four Color Printing 2
    </h1>
    <p>
      I label as four color printing the same printing method used to print comic books or magic trading cards. The basic idea is to use the CYMK colors (cyan, magenta, magenta, and key (black)) spread across the canvas using a grid of dots for each color. To form RGB colors, one changes the size of the CYMK dot in the region of the pixel, creating the impression of the correct color. When angling the grid of CYMK pixels relative to each other correctly, zooming in on the print reveals the 'rosette pattern' which I think is nice to look at.
    </p>
    <p>
      The square grids are centered in the middle of the item to be colored in, and stretched out so that after being rotated they still cover the whole shape. 
      <br>
      Helpful illustration of just the CMYK grids at the correct angles, with a set of sliders or sorts to adjust each angle
    </p>
    <p>
      Each dot needs to find out what is the color of the pixel underneath it so that a size value may be calculated for such a dot
      <br>
      after each dot in each color has a value assigned, the underlying image is wiped away so that the printing turns out right
    </p>
    <p>
      TODO
      <br>
      <ul>
        <li>restructure code architecturally</li>
        <li>measure perfromance</li>
        <li>improve perrformance</li>
      </ul>
    </p>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>

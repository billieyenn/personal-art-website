/* eslint-enable */
/* eslint-disable */
<template>
  <div>
    <h1>
      Perdurable
    </h1>
    <p>
      The infinite monkey theorem states that given infinite time, an undying monkey sitting at a typewriter will eventually recreate the entire works of Shakespeare.
      In a similar vein, the creations of a machine tracing a random line may end up giving shape to even those ideas that are yet incorporeal.
    </p>
    <p>
      This line art employs an algorithm that in theory has the capacity to draw any thing that can be expressed in one uninterrupted line. In practice, computational capacity draws the line (pun intended) at the limit of what can be produced. How this works is that the sum of an infinite series of circles of various sizes rotating in alternating directions traces points that approximate a shape. By limiting the number of circles included in the sum, the expressiveness of the algorithm diminishes and the accuracy drops.
    </p>
      <rotation-explainer></rotation-explainer>
    <p>
      The intent I had for the type of outputs to be produced is described in three words: soft, minimalistic, clean. I found this to be achieved by significantly or drastically decreasing complexity (see 'Minimalist' and 'UltraMinimalist'). A high complexity in contrast often results in a busy tangle of lines, though sometimes aesthetically pleasing as well (see 'PolySquiggle').
    </p>
    <p>
      A soft patch or blob is placed behind the line art to introduce color and context to each piece. Colors are chosen by chance from a palette of soft options. Curiously, the blob is generated using the same machine that produces the line, but modified in a way so as to reduce the output complexity. The consequence of this modification is that resulting the blob resembles eerily its line as though one were a projection of the other in a plane of reduced dimensionality - an echo if you will.
    </p>
    <h4>Trivia</h4>
    <p>
      Accident 1: One decimal point in the wrong place caused the algorithm to spit out an anomaly. While not what I'd aimed for, I thought it stunning. Instead of a series of circles decreasing in size adding finer and finer details to the drawing, the machine put out a series of same-size circles, which resulted in what you see in 'Storm'. Such pieces unfortunately do not fit my vision for the collection, and so are excluded.
    </p>
    <p>
      Exploration 1: At one point I decided to see what'd happen if all circles rotated in the same direction as opposed to alternating directions. The outcome is seen in the configurations 'MinimalistBeans', 'MediumBeans', and 'HighBeans'. A sort of embryonic cloud or soybean-like shape would emerge, which I thought visually appealing.
    </p>
    <p>
      Exploration 2: When two subsequent rotating circles are initialised with similar values (excluding the rotation direction) the most marvelous phenomena takes place: The trace emerges as a symmetrical shape! The configuration used results in the axis of symmetry being the top-left to bottom-right diagonal (see 'Symmetrical' or 'PolySymmetrical'). Personally, I find such pieces quite fascinating, albeit visually rather derivative of <a href="http://www.Cryptoblots.com/">Cryptoblots by Daïm Aggott-Hönsch</a>
    </p>
    <p>
      Exploration 3: Out of curiosity, I wondered what would happen should both symmetry and chaos be combined. Monodirectional chaotic symmetrical circles results in the generation of a sort of 'Disc' shape. The 'Toroid' is a variant of 'Storm' and emerges when chaoticness is cranked up to 11.
    </p>
    <h4>
      Collection
    </h4>
    <p>
      The collection is available on <a href="https://opensea.io/collection/perdurable">Opensea</a>, and consists of the following distribution of configurations
      <ul>
        <li>200x PureShapes</li>
        <li>51x MediumBeans</li>
        <li>51x MinimalistBeans</li>
        <li>51x Minimalists</li>
        <li>26x PolySymmetricals</li>
        <li>26x Symmetricals</li>
        <li>26x UltraMinimalists</li>
        <li>11x PolySquiggles</li>
      </ul>
    </p>
  </div>
</template>

<script>
import RotationExplainer from './RotationExplainer.vue'
export default {
  components: {
    RotationExplainer
  }
}
</script>

<style>

</style>

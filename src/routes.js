import About from './components/About.vue'
import Gallery from './components/Gallery.vue'
import Sketches from './components/Sketches.vue'
import LineArtPureShapes from './components/Lineart/PureShapes.vue'
import LineArtPolySquiggle from './components/Lineart/PolySquiggle.vue'
import LineArtAsymmetricalMediumComplex from './components/Lineart/AsymmetricalMediumComplex.vue'
import LineArtSymmetrical from './components/Lineart/Symmetrical.vue'
import LineArtPolySymmetrical from './components/Lineart/PolySymmetrical.vue'
import LineArtAsymmetricalHighComplex from './components/Lineart/AsymmetricalHighComplex.vue'
import LineArtMinimalist from './components/Lineart/Minimalist.vue'
import LineArtMinimalistBeans from './components/Lineart/MinimalistBeans.vue'
import LineArtUltraMinimalist from './components/Lineart/UltraMinimalist.vue'
import LineArtToroid from './components/Lineart/Toroid.vue'
import LineArtStorm from './components/Lineart/Storm.vue'
import LineArtDisc from './components/Lineart/Disc.vue'
import LineArtAbout from './components/Lineart/LineArtAbout.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export const routes = [
  {
    path: '/',
    name: 'about',
    components: {
      default: About,
      'header-top': Header,
      'header-bottom': Footer
    }
  },
  {
    path: '/about/perdurable',
    name: 'LineArtAbout',
    components: {
      default: LineArtAbout,
      'header-top': Header,
      'header-bottom': Footer
    }
  },
  {
    path: '/gallery',
    name: 'gallery',
    components: {
      default: Gallery,
      'header-top': Header,
      'header-bottom': Footer
    }
  },
  {
    path: '/sketches',
    name: 'sketches',
    components: {
      default: Sketches,
      'header-top': Header,
      'header-bottom': Footer

    },
    children: [
      { path: '1', component: LineArtPureShapes },
      { path: '2', component: LineArtPolySquiggle },
      { path: '3', component: LineArtAsymmetricalMediumComplex },
      { path: '4', component: LineArtAsymmetricalHighComplex },
      { path: '5', component: LineArtMinimalist },
      { path: '6', component: LineArtMinimalistBeans },
      { path: '7', component: LineArtUltraMinimalist },
      { path: '8', component: LineArtToroid },
      { path: '9', component: LineArtStorm },
      { path: '10', component: LineArtDisc },
      { path: '11', component: LineArtSymmetrical },
      { path: '12', component: LineArtPolySymmetrical }
    ]
  },
  {
    path: '/twitter',
    beforeEnter (to, from, next) {
      window.location.href = 'https://twitter.com/BillieYenn'
    }
  },
  {
    path: '/github',
    beforeEnter (to, from, next) {
      window.location.href = 'https://github.com/billieyenn'
    }
  },
  {
    path: '*', redirect: to => '/'
  }
]
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
import Test from './components/Test/Test.vue'
import TestAbout from './components/Test/TestAbout.vue'
import Practice from './components/Practice/Practice.vue'
import GoodMorning from './components/Practice/GoodMorning.vue'
import Flower from './components/Practice/Flower.vue'
import Fibonacci from './components/Practice/Fibonacci.vue'
import PracticeAbout from './components/Practice/PracticeAbout.vue'
import FourierPlaygroundAbout from './components/FourierPlayground/FourierPlaygroundAbout.vue'
import FourierPlayground from './components/FourierPlayground/FourierPlayground.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import SketchesAbout from './components/SketchesAbout.vue'

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
    path: '/about',
    name: 'LineArtAbout',
    components: {
      default: SketchesAbout,
      'header-top': Header,
      'header-bottom': Footer
    },
    children: [
      { path: 'perdurable', component: LineArtAbout },
      { path: 'test', component: TestAbout },
      { path: 'fourierplayground', component: FourierPlaygroundAbout },
      { path: 'practice', component: PracticeAbout }
    ]
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
      { path: 'perdurable/1', component: LineArtPureShapes },
      { path: 'perdurable/2', component: LineArtPolySquiggle },
      { path: 'perdurable/3', component: LineArtAsymmetricalMediumComplex },
      { path: 'perdurable/4', component: LineArtAsymmetricalHighComplex },
      { path: 'perdurable/5', component: LineArtMinimalist },
      { path: 'perdurable/6', component: LineArtMinimalistBeans },
      { path: 'perdurable/7', component: LineArtUltraMinimalist },
      { path: 'perdurable/8', component: LineArtToroid },
      { path: 'perdurable/9', component: LineArtStorm },
      { path: 'perdurable/10', component: LineArtDisc },
      { path: 'perdurable/11', component: LineArtSymmetrical },
      { path: 'perdurable/12', component: LineArtPolySymmetrical },
      { path: 'test/1', component: Test },
      { path: 'fourier', component: FourierPlayground },
      { path: 'practice/placeholder', component: Practice },
      { path: 'practice/fibonacci', component: Fibonacci },
      { path: 'practice/flower', component: Flower },
      { path: 'practice/goodmorning', component: GoodMorning }
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
    path: '/opensea',
    beforeEnter (to, from, next) {
      window.location.href = 'https://opensea.io/Billieyenn'
    }
  },
  {
    path: '*', redirect: to => '/'
  }
]

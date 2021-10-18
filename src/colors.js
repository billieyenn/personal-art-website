/* eslint-enable */
/* eslint-disable */

const colors =  {
	pearlBush: '#e9e3d5', 		// a natural white // quite nice background color
	lemonChiffon: '#fffcc9', 	// a yellowish white
	grainBrown: '#dfdab0', 		// slightly shady lemonChiffon
	mandy: '#ED555D', 			// a red
	chestnutRose: '#d04b54', 	// slightly shady mandy
	falcon: '#7b5770', 			// purple-ish
	keppel: '#41b797', 			// turqoise green
	oceanGreen: '#3d9f86', 		// slighly shady keppel,
	jetStream: '#b8d9ce', 		// a very light blue with a greenish tint
	millbrook: '#543e2e', 		// a sort of brown
	zest: '#e67d32', 			// a very orange orange, a hint darker
	cello: '#1f3359', 			// a deep blue
	roseBud: '#f7b1a1', 		// a candy pink
	goldenRod: '#fcd265', 		// pretty much golden
	lightningYellow: '#fcbc19', // a deeper yellow
	persianRed: '#d12a2f',		// a slightly deep red
	goblin: '#3f8c46',			// a very goblin green
	mineShaft: '#2b2b2b',		// ringers black
	ronchi: '#f2c945',			// ringers yellow
	wildSand: '#f5f5f5',		// ringers white (background)
	mojo: '#c3423f',			// ringers red
	beige: '#f7f7e6',			// ringers off-white
	steelBlue: '#4381c1',		// ringers blue
	chateauGreen: '#3b9764',	// ringers green
	japonica: '#db736b',		// terracottaish red (beridian bg)
	bunting: '#0f1833',			// reddish black (fidenza bg)
	codGray: '#1a1a1a',			// almost black
	viridianGreen: '#64836c',	// a green
	plantation: '#224a47',		// green-blue
	taupe: '#4c4434',			// brownish
	lemonGrass: '#9a9f8f',		// a green
	hitGray: '#a2acaf',			// a gray
	tomThumb: '#425d41', 		// a green
	oldRose: '#ba7b7a',			// dark pink
	norway: '#acbca4',			// light green with grayness
	bayOfMany: '#204973',		// nice blue
	mauvelous: '#f29191',		// nice pink
	elephant: '#15314d',		// dark blue
	lightApricot: '#fcd9b1',	// a warm yellow / pink
	bigStone: '#121a33',		// almost black. purplish
	springWood: '#faf8f5',		// almost white. beige-ish
	cabaret: '#d53e57',
	brickRed: '#d0304a',
	fuzzyWuzzyBrown: '#bf485c',
	amaranth: '#E53f5a',
	cranberry: '#d65a6f',
	mandysPink: '#f7d4cb',

}


const blackWhite = {
	codGray: colors.codGray,
	pearlBush: colors.pearlBush
}

const fidenza_6 = {
	bunting: colors.bunting,
	chestnutRose: colors.chestnutRose,
	mandy: colors.mandy,
	cabaret: colors.cabaret,
	brickRed: colors.brickRed,
	fuzzyWuzzyBrown: colors.fuzzyWuzzyBrown,
	amaranth: colors.amaranth,
	cranberry: colors.cranberry,
}

const fidenza_32 = {
	pearlBush: colors.pearlBush,
	viridianGreen: colors.viridianGreen,
	plantation: colors.plantation,			// green-blue
	taupe: colors.taupe,
	lemonGrass: colors.lemonGrass,
	hitGray: colors.hitGray,
	tomThumb: colors.tomThumb,
	oldRose: colors.oldRose,
	norway: colors.norway,
	bayOfMany: colors.bayOfMany,
	mauvelous: colors.mauvelous,
	elephant: colors.elephant,
	lightApricot: colors.lightApricot,
}

const fidenza_98 = {
	bigStone: colors.bigStone,
	springWood: colors.springWood,
}

const fidenza_110 = {
	cello: colors.cello,
	springWood: colors.springWood,
}


const ringers = {
	mineShaft: colors.mineShaft, 
	ronchi: colors.ronchi, 
	wildSand: colors.wildSand, 
	mojo: colors.mojo, 
	beige: colors.beige, 
	steelBlue: colors.steelBlue, 
	chateauGreen: colors.chateauGreen,
}

const flower = {
	goblin: colors.goblin,
	roseBud: colors.roseBud,
	pearlBush: colors.pearlBush,
	mandysPink: colors.mandysPink,
	millbrook: colors.millbrook,
}

const nicePairs = [
	[colors.springWood, colors.mineShaft],
	[colors.brickRed, colors.springWood],
]

const randomColor = () => {
	const keys = Object.keys(colors)
	const colLen = keys.length
	const col = colors[keys[Math.floor(Math.random()*colLen)]]
	return col
}

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

export {colors, 
		blackWhite, 
		fidenza_6, 
		fidenza_32, 
		ringers, 
		flower, 
		fidenza_98, 
		randomColor,
		hexToRgb
	}
/* eslint-disable */

// do this tricky bit to pass reference to p
// and then do const Particle = createParticleClass(p)
function createParticleClass(p, config = {}) {

// provided in config
let example

({
    example: {
        value: example = 0.06
    } = {},
} = config)

return class Particle {
    constructor(pos, mass, canvas) {
        this.canvas = canvas
        this.pos = pos || this.randomPos() // providing null position makes random position
        this.vel = p.createVector(p.random(-mass, mass), p.random(-mass, mass))
        this.acc = p.createVector(0, 0)
        this.mass = mass
    }

    randomPos() {
        const minX = this.canvas.minX
        const maxX = this.canvas.maxX
        const minY = this.canvas.minY
        const maxY = this.canvas.maxY
        return p.createVector(p.random(minX, maxX), p.random(minY, maxY))
    }

    update({
        limit = 40, 
        friction = 0,
    } = {}) {
        // velocity causes friction
        // todo: probably better to do friction via applyForce
        this.acc.sub(friction * this.vel.x, friction * this.vel.y)

        // after all sources of acceleration are added up, acc results in velocity
        this.vel.add(this.acc)
        if (limit)
            this.vel = this.vel.limit(limit) // a hard cap speed limit

        // velocity results in change of position
        this.pos.add(this.vel)

        // acceleration is calculated separately each cycle
        this.acc.setMag(0)

        while(this.outOfBounds()) {
            this.pos = this.randomPos()
        }
    }

    applyForce(force) {
        // force causes acceleration
        this.acc.add(force)
    }

    display() {
        p.push()
        p.translate(this.pos.x, this.pos.y)
        p.stroke(255); // Set the color of the pixel
        p.point(0, 0); // Draw a single pixel
        p.pop()
    }

    outOfBounds() {
        return this.canvas.outOfBounds(this.pos)
    }
}
}

export {
    createParticleClass
}
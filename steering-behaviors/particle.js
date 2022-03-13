function Particle(x, y, radius) {
	this.position = new Vector(x, y);
	this.target = new Vector(x, y);
	this.velocity = new Vector();
	this.radius = radius;
	this.maxspeed = 15;
	this.maxforce = 1.5;
	this.color = 'black';
}
Particle.prototype.update = function(mouse, mouseSize) {
	const arrive = this.arrive(this.target);
	const flee = this.flee(mouse, mouseSize);
	flee.mult(5);
	this.position.add(this.velocity);
	this.velocity.add(arrive);
	this.velocity.add(flee);
}
Particle.prototype.show = function() {
	fill(this.color);
	circle(this.position.x, this.position.y, this.radius);
}
Particle.prototype.arrive = function(target) {
	const desired = vecSub(target, this.position);
	const d = desired.mag();
	let speed = this.maxspeed;
	if (d < 100) {
		speed = map(d, 0, 100, 0, this.maxspeed);
	}
	desired.setMag(speed);
	const steer = vecSub(desired, this.velocity);
	steer.limit(this.maxforce);
	return steer;
}
Particle.prototype.flee = function(target, targetSize) {
	const desired = vecSub(target, this.position);
	const d = desired.mag();
	if (d < targetSize) {
		desired.setMag(this.maxspeed);
		desired.mult(-1);
		const steer = vecSub(desired, this.velocity);
		steer.limit(this.maxforce);
		return steer;
	} else {
		return new Vector();
	}
}


function Vector(x = 0, y = 0, z = 0) {
	this.x = x;
	this.y = y;
	this.z = z;
	return this;
}
Vector.prototype.add = function(vector) {
	this.x += vector.x;
	this.y += vector.y;
	this.z += vector.z;
	return this;
}
Vector.prototype.sub = function(vector) {
	this.x -= vector.x;
	this.y -= vector.y;
	this.z -= vector.z;
	return this;
}
Vector.prototype.mult = function(lambda) {
	this.x *= lambda;
	this.y *= lambda;
	this.z *= lambda;
	return this;
}
Vector.prototype.dot = function(vector) {
	return this.x * vector.x + this.y * vector.y + this.z * vector.z;
}
Vector.prototype.cross = function(vector) {
	const a1 = this.x;
	const a2 = this.y;
	const a3 = this.z;
	const b1 = vector.x;
	const b2 = vector.y;
	const b3 = vector.z;

	this.x *= a2 * b3 - a3 * b2;
	this.y *= a1 * b3 - a3 * b1;
	this.z *= a1 * b2 - a2 * b1;
	return this;
}
Vector.prototype.div = function(lambda) {
	if (lambda === 0) return this;
	this.x /= lambda;
	this.y /= lambda;
	this.z /= lambda;
	return this;
}
Vector.prototype.rotate = function(angle) {
	const x1 = this.x;
	const y1 = this.y;
	this.x = x1 * Math.cos(angle) - y1 * Math.sin(angle);
	this.y = x1 * Math.sin(angle) + y1 * Math.cos(angle);
	return this;
}
Vector.prototype.mag = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}
Vector.prototype.setMag = function(newMag) {
	let curMag = this.mag();
	if (curMag === 0) return this;
	this.x *= newMag / curMag;
	this.y *= newMag / curMag;
	this.z *= newMag / curMag;
	return this;
}
Vector.prototype.normalize = function() {
	return this.setMag(1);
}
Vector.prototype.limit = function(maxMag) {
	if (this.mag() > maxMag) {
		this.setMag(maxMag);
	}
	return this;
}
function vecAdd(vector1, vector2) {
	return new Vector(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
}
function vecSub(vector1, vector2) {
	return new Vector(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z);
}
function vecMult(vector, lambda) {
	return new Vector(vector.x * lambda, vector.y * lambda, vector.z * lambda);
}
function vecCross(vector1, vector2) {
	const a1 = vector1.x;
	const a2 = vector1.y;
	const a3 = vector1.z;
	const b1 = vector2.x;
	const b2 = vector2.y;
	const b3 = vector2.z;
	return new Vector(a2 * b3 - a3 * b2, a1 * b3 - a3 * b1, a1 * b2 - a2 * b1);
}
function distance(vector1, vector2) {
	return vecSub(vector1, vector2).mag();
}

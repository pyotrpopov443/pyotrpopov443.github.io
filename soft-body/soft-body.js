
/*==========================
Spring
==========================*/
function Spring(length, stiffness, index) {
	this.length = length;
	this.stiffness = stiffness;
	this.index = index;
}

/*==========================
SoftBodyNode
==========================*/
function SoftBodyNode(position, damping, springs) {
	this.position = new Vector(position.x, position.y);
	this.damping = damping;
	this.springs = springs;
	this.velocity = new Vector();
	this.globalVelocity = new Vector();
}
SoftBodyNode.prototype.integrateSprings = function(nodes) {
	for (const spring of this.springs) {
		const node = nodes[spring.index];
		const desiredPosition = vecSub(this.position, node.position);
		desiredPosition.setMag(spring.length);
		desiredPosition.add(node.position);
		const desired = vecSub(desiredPosition, this.position);
		desired.mult(spring.stiffness);
		this.velocity.add(desired);
	}
}
SoftBodyNode.prototype.calculateGlobal = function(softBody) {
	const pos = vecSub(this.position, softBody.position);
	const nodeAngularVelocity = new Vector(pos.x, pos.y).rotate(softBody.angularVelocity.z * Math.PI/180);
	nodeAngularVelocity.sub(pos);
	nodeAngularVelocity.div(softBody.averageDistance);
	this.globalVelocity = vecAdd(softBody.linearVelocity, nodeAngularVelocity);
}
SoftBodyNode.prototype.applyDamping = function() {
	this.velocity.sub(this.globalVelocity);
	this.velocity.mult(1 - this.damping);
	this.velocity.add(this.globalVelocity);
}
SoftBodyNode.prototype.integrateExternal = function(softBodyExternalForce) {
	this.velocity.add(softBodyExternalForce);
}
SoftBodyNode.prototype.update = function() {
	this.position.add(this.velocity);
}
SoftBodyNode.prototype.boundaryCollide = function(boundaryFriction) {
	if (this.position.x < 0 || this.position.x > canvas.width) {
		this.velocity.x *= -1;
		this.velocity.mult(1 - boundaryFriction);
	}
	if (this.position.y < 0 || this.position.y > canvas.height) {
		this.velocity.y *= -1;
		this.velocity.mult(1 - boundaryFriction);
	}
	this.position.x = constrain(this.position.x, 0, canvas.width);
	this.position.y = constrain(this.position.y, 0, canvas.height);
}
SoftBodyNode.prototype.collide = function(softBody, normal, damping, force) {
	let scalar = softBody.getPushingOutForce(this.position);
	if (scalar < 0) {
		this.velocity.sub(this.globalVelocity);
		this.velocity.sub(vecMult(normal, force * -scalar));
		this.velocity.mult(1 - damping * 0.85);
		this.velocity.add(this.globalVelocity);
	}
}

/*==========================
SoftBody
==========================*/
function SoftBody(nodes, color) {
	this.nodes = nodes;
	this.color = color;
	this.isDrag = false;
	this.resetAttributes();
}
SoftBody.prototype.resetAttributes = function() {
	this.angularVelocity = new Vector();
	this.linearVelocity = new Vector();
	this.position = new Vector();
	this.externalForce = new Vector();
	this.averageDistance = 0;
	this.radii = new Array(this.nodes.length);
	this.normals = new Array(this.nodes.length);
}
SoftBody.prototype.calculateAttributes = function() {
	for (const node of this.nodes) {
		this.linearVelocity.add(node.velocity);
		this.position.add(node.position);
	}
	this.linearVelocity.div(this.nodes.length);
	this.position.div(this.nodes.length);

	for (const node of this.nodes) {
		this.averageDistance += distance(node.position, this.position);
		const nodeAngularVelocity = vecSub(node.position, this.position);
		this.angularVelocity.add(vecCross(nodeAngularVelocity, node.velocity));
	}
	this.angularVelocity.div(this.nodes.length)
	this.averageDistance /= this.nodes.length;
}
SoftBody.prototype.calculateSurface = function() {
	let l = this.nodes.length;
	for (let i = 0; i < l; i++) {
		const prev = this.nodes[(i - 1) - l * Math.floor((i - 1) / l)].position;
		const curr = this.nodes[i].position;
		const next = this.nodes[(i + 1) % l].position;
		const normal = vecSub(prev, curr).rotate(Math.PI/2).normalize();
		normal.add(vecSub(curr, next).rotate(Math.PI/2).normalize())
		this.normals[i] = normal.normalize();
		this.radii[i] = distance(curr, this.position);
	}
}
SoftBody.prototype.getPushingOutForce = function(point) {
	let hrbf = 0;
	for (let i = 0; i < this.nodes.length; i++) {
		const position = this.nodes[i].position;
		const radius = this.radii[i];
		const normal = this.normals[i];
		const d = distance(point, position);
		const d_scl = d / radius
		if (0 <= d_scl && d_scl <= 1) {
			const r_sqr = radius * radius;
			const v1 = vecMult(normal, r_sqr / (20 + r_sqr));
			const v2 = vecSub(point, position);
			v2.mult(20 * Math.pow(d - radius, 3) / Math.pow(radius, 5));
			hrbf -= v1.dot(v2);
		}
	}
	return hrbf;
}
SoftBody.prototype.display = function() {
	fill(this.color);
	ctx.beginPath();
	ctx.moveTo(this.nodes[0].position.x, this.nodes[0].position.y);
	for (let i = 0; i < this.nodes.length - 1; i++) {
		const p0 = (i > 0) ? this.nodes[i - 1].position : this.nodes[0].position;
		const p1 = this.nodes[i].position;
		const p2 = this.nodes[i + 1].position;
		const p3 = (i !== this.nodes.length - 2) ? this.nodes[i + 2].position : p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
	}
	ctx.lineTo(this.nodes[0].position.x, this.nodes[0].position.y);
	ctx.fill();
}
SoftBody.prototype.integrateForces = function() {
	for (const node of this.nodes) {
		node.integrateExternal(this.externalForce);
		node.integrateSprings(this.nodes);
	}
}
SoftBody.prototype.center = function() {
	const sum = new Vector();
	for (const node of this.nodes) {
		sum.add(node.position);
	}
	return sum.div(this.nodes.length);
}
SoftBody.prototype.intersects = function(point) {
	let isCollision = false;
	for (let i = 0; i < this.nodes.length; i++) {
		const current = this.nodes[i].position;
		const next = this.nodes[(i + 1) % this.nodes.length].position;
		if (((current.y >= point.y && next.y < point.y) || (current.y < point.y && next.y >= point.y)) &&
			(point.x < (next.x - current.x) * (point.y - current.y) / (next.y - current.y) + current.x)) {
			isCollision = !isCollision;
		}
	}
	return isCollision;
}
SoftBody.prototype.drag = function(mouse) {
	if (mousePressed && this.intersects(mouse)) {
		this.isDrag = true;
	}
	if (!mousePressed) {
		this.isDrag = false;
	}
}
SoftBody.prototype.applyMouseForce = function(mouse) {
	if (this.isDrag) {
		const desired = vecSub(mouse, this.center());
		const d = desired.mag();
		const maxSpeed = 70;
		let speed = maxSpeed;
		if (d < 100) {
			speed = map(d, 0, 100, 0, maxSpeed);
		}
		desired.setMag(speed);
		for (const node of this.nodes) {
			let steer = vecSub(desired, node.velocity);
			steer.limit(maxSpeed);
			node.velocity.add(steer);
		}
	}
}
SoftBody.prototype.applyFriction = function(boundaryFriction) {
	for (const node of this.nodes) {
		node.calculateGlobal(this)
		node.applyDamping();
		node.update();
		node.boundaryCollide(boundaryFriction);
	}
}
SoftBody.prototype.collide = function(softBody, damping, force) {
	for (let i = 0; i < this.nodes.length; i++) {
		this.nodes[i].collide(softBody, this.normals[i], damping, force);
	}
}

/*==========================
SoftBodyScene
==========================*/
function SoftBodyScene(softBodies, forces) {
	this.softBodies = softBodies;
	this.boundaryFriction = 0.6;
	this.collisonDamping = 0.7;
	this.collisionForce = 500;
	this.forces = forces;
	this.isDrag = false;
}
SoftBodyScene.prototype.drag = function(softBody) {
	const mouse = new Vector(mouseX, mouseY);
	if (!this.isDrag) {
		softBody.drag(mouse);
		this.isDrag = softBody.isDrag;
	}
	if (!mousePressed) {
		this.isDrag = false;
	}
	softBody.applyMouseForce(mouse);
}
SoftBodyScene.prototype.update = function() {
	for (const softBody of this.softBodies) {
		for (let j = 0; j < this.forces.length; j++) {
			softBody.externalForce.add(this.forces[j](softBody));
		}
		this.drag(softBody);
		softBody.integrateForces();
		softBody.resetAttributes();
		softBody.calculateAttributes();
		softBody.calculateSurface();
		softBody.applyFriction(this.boundaryFriction);
		for (const sceneSoftBody of this.softBodies) {
			if (softBody !== sceneSoftBody) {
				softBody.collide(sceneSoftBody, this.collisonDamping, this.collisionForce);
			}
		}
		softBody.display();
	}
}

/*==========================
functions
==========================*/
function softBodyFromPoints(points, size, position, color) {
	const damping = 0.7;
	const stiffness = 0.06;

	let nodes = [];
	for (let i = 0; i < points.length; i++) {
		const springs = [];
		for (let j = 0; j < points.length; j++) {
			if (i !== j) {
				springs.push(new Spring(0, stiffness, j));
			}
		}
		nodes[i] = new SoftBodyNode(vecAdd(points[i], position), damping, springs);
	}
	for (const node of nodes) {
		for (const spring of node.springs) {
			let d = distance(node.position, nodes[spring.index].position);
			spring.length = d;
			spring.stiffness *= Math.sqrt(2) * size/d;
		}
	}
	return new SoftBody(nodes, color);
}

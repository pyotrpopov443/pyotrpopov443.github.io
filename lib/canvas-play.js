//canvas
const canvas = document.getElementById('canvas');
canvas.height = canvas.parentElement.getBoundingClientRect().height;
canvas.width = canvas.parentElement.getBoundingClientRect().width;
const ctx = canvas.getContext('2d');
ctx.textBaseline = "middle";
ctx.textAlign = "center";

//variables
let mouseX = 0;
let mouseY = 0;
let mousePressed = false;

//loop
setup();
draw();
setInterval(draw, 17);

//functions
function background(color) {
	fill(color);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function stroke(color) {
	ctx.strokeStyle = color;
}

function fill(color) {
	ctx.fillStyle = color;
}

function font(options) {
	ctx.font = options;
}

function circle(x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, true)
	ctx.fill();
	ctx.closePath();
}

//event listeners
window.addEventListener('mousemove', e => {
	mouseX = e.clientX - canvas.getBoundingClientRect().x;
	mouseY = e.clientY - canvas.getBoundingClientRect().y;
});
window.addEventListener('touchmove', e => {
	mouseX = e.touches[0].clientX - canvas.getBoundingClientRect().x;
	mouseY = e.touches[0].clientY - canvas.getBoundingClientRect().y;
});

window.addEventListener('mousedown', e => {
	if (e.button === 0) mousePressed = true;
});
window.addEventListener('touchstart', () => {
	mousePressed = true;
});
window.addEventListener('mouseup', e => {
	if (e.button === 0) mousePressed = false;
});
window.addEventListener('touchend', () => {
	mousePressed = false;
});

window.addEventListener('resize', () => {
	canvas.height = canvas.parentElement.getBoundingClientRect().height;
	canvas.width = canvas.parentElement.getBoundingClientRect().width;
	draw();
});

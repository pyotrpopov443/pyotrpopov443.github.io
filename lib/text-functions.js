function textToSoftbodies(text, damp, stiff, size) {
	const softbodies = [];
	const softColors = ['#8ad196', '#91bcbc', '#98a6e1'];
	const len = text.length;
	for (let i = 0; i < len; i++) {
		const pos = new Vector((i+2)*canvas.width/(len+3), canvas.height/2);
		const softBodyPoints = textToPoints(text[i], pos.x, pos.y, particleRadius * 2);
		softbodies.push(softBodyFromPoints(damp, stiff, softBodyPoints, size, pos, softColors[i % softColors.length]));
	}
	return softbodies;
}

function textToPoints(txt, x, y, spacing, sort = false) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	fill('#000000');
	ctx.strokeText(txt, x, y);

	const points = [];
	const data32 = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
	for(let i = 0; i < data32.length; i++) {
		if (data32[i] & 0xff000000) {
			const pos = new Vector(i % canvas.width, i / canvas.width);
			if (enoughSpace(pos)) {
				points.push(pos);
			}
		}
	}

	function enoughSpace(vec) {
		for (const point of points) {
			if (vecSub(vec, point).mag() < spacing) {
				return false;
			}
		}
		return true;
	}

	if (!sort) {
		return points;
	}
	const sortedPoints = [points[0]];
	points.splice(0, 1);
	while (points.length > 0) {
		const closestPoint = closest(sortedPoints[sortedPoints.length - 1]);
		sortedPoints.push(closestPoint.p);
		points.splice(closestPoint.i, 1);
	}
	function closest(currentPoint) {
		const closestPoint = {
			i: points.length - 1,
			p: points[points.length - 1]
		};
		let minDistance = distance(currentPoint, closestPoint.p);
		for (let i = 0; i < points.length; i++) {
			let d = distance(currentPoint, points[i]);
			if (d > 0 && d < minDistance) {
				minDistance = d;
				closestPoint.i = i;
				closestPoint.p = points[i];
			}
		}
		return closestPoint;
	}

	return sortedPoints;
}

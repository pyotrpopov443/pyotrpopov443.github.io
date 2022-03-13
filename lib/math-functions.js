function map(x, inputFrom, inputTo, outputFrom, outputTo) {
	return outputFrom + ((outputTo - outputFrom) / (inputTo - inputFrom)) * (x - inputFrom);
}

function constrain(value, lowerBound, upperBound) {
	if (value < lowerBound) return lowerBound;
	if (value > upperBound) return upperBound;
	return value;
}

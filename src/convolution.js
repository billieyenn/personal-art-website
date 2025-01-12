/* eslint-enable */
/* eslint-disable */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


// Ignore out-of-bounds neighbors
function ignoreStrategy(airPressureFlowField, neighborX, neighborY) {
    if (neighborX < 0 || neighborX >= airPressureFlowField.cols || 
        neighborY < 0 || neighborY >= airPressureFlowField.rows) {
        return null; // Return null to indicate "skip"
    }
    return airPressureFlowField.getVal(neighborX, neighborY);
}

// Clamp indices to the nearest valid values
function clampStrategy(airPressureFlowField, neighborX, neighborY) {
    const clampedX = clamp(neighborX, 0, airPressureFlowField.cols - 1);
    const clampedY = clamp(neighborY, 0, airPressureFlowField.rows - 1);
    return airPressureFlowField.getVal(clampedX, clampedY);
}

// Wrap indices around the grid
function wrapStrategy(airPressureFlowField, neighborX, neighborY) {
    const wrappedX = (neighborX + airPressureFlowField.cols) % airPressureFlowField.cols;
    const wrappedY = (neighborY + airPressureFlowField.rows) % airPressureFlowField.rows;
    return airPressureFlowField.getVal(wrappedX, wrappedY);
}

// Use a default value for out-of-bounds neighbors
function defaultValueStrategy(defaultValue) {
    return function (airPressureFlowField, neighborX, neighborY) {
        if (neighborX < 0 || neighborX >= airPressureFlowField.cols || 
            neighborY < 0 || neighborY >= airPressureFlowField.rows) {
            return defaultValue; // Return the specified default value
        }
        return airPressureFlowField.getVal(neighborX, neighborY);
    };
}

function applyConvolution(array, x, y, kernel, getterWithOutOfBoundsStrategy) {
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
    let result = 0;

    // Iterate over the kernel
    for (let dy = -halfKernel; dy <= halfKernel; dy++) {
        for (let dx = -halfKernel; dx <= halfKernel; dx++) {
            const neighborX = x + dx;
            const neighborY = y + dy;

            // Get the neighbor value using the provided handler
            const neighborValue = getterWithOutOfBoundsStrategy(array, neighborX, neighborY);

            const weight = kernel[dy + halfKernel][dx + halfKernel];
            result += weight * neighborValue.x;
        }
    }

    return result;
}


function getGradient(array, x, y, range, getterWithOutOfBoundsStrategy) {
    let gradientX = 0;
    let gradientY = 0;

    // Iterate over the kernel
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const neighborX = x + dx;
            const neighborY = y + dy;

            // Get the neighbor value using the provided handler
            const neighborValue = getterWithOutOfBoundsStrategy(array, neighborX, neighborY);

            // Calculate gradient components
            if (dx === -1) gradientX -= neighborValue.x; // Left
            if (dx === 1) gradientX += neighborValue.x;  // Right
            if (dy === -1) gradientY -= neighborValue.x; // Top
            if (dy === 1) gradientY += neighborValue.x;  // Bottom

        }
    }

    return Math.atan2(gradientY, gradientX)
}

function normalizeKernel(kernel) {
    const numElements = kernel.length * kernel[0].length; // Total elements in the kernel
    const sum = kernel.flat().reduce((acc, val) => acc + val, 0); // Sum of all elements
    const normalizationFactor = sum / numElements;

    // Normalize the kernel
    return kernel.map(row => row.map(val => val / normalizationFactor));
}

// Example usage with a simple 3x3 kernel
// Sum of kernel elements must always equal number of kernel elements, otherwise runaway happens
const kernelNotNormalized = [
    [0.5, 0.7, 0.5],
    [0.7, 1, 0.7],
    [0.5, 0.7, 0.5],
];
const kernel = normalizeKernel(kernelNotNormalized)


export {
    applyConvolution,
    getGradient,
    ignoreStrategy, 
    clampStrategy, 
    wrapStrategy, 
    defaultValueStrategy,
    kernel,
    clamp,
}
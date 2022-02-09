export default class ImageProcessing {
    // Find all runs of pixels in an image of an exact color
    static findColorRuns(imageData, color) {
        let matches = [];

        const a8 = imageData.data;
    
        let runLength = 0;
        for (let y = 0; y < imageData.height; ++y) {
            for (let x = 0; x < imageData.width; ++x) {
                const idx = 4 * (y * imageData.width + x);
    
                if (a8[idx] === color.r && a8[idx + 1] === color.g && a8[idx + 2] === color.b) {
                    runLength++;
                } else {
                    if (runLength >= color.length) {
                        const match = { x: (x - runLength + color.relX), y: (y + color.relY) };
                        const previous = matches.find(f => f.x === match.x && f.y === (match.y - 1));
                        if (previous) {
                            previous.y++;
                        } else {
                            matches.push(match);
                        }
                    }
    
                    runLength = 0;
                }
            }
        }
    
        return matches;
    }

    // Reduce opacity for pixels adjacent to transparent pixels
    static blurEdges(imageData) {
        var a8 = imageData.data;
        var width = imageData.width;

        for (var j = 2 * width; j < a8.length - 2 * width; j += 4) {
            if (a8[j + 3] !== 0) {
                if (
                    (a8[j + 3 - 4] === 0 && a8[j + 3 - 8] === 0)
                    || (a8[j + 3 + 4] === 0 && a8[j + 3 + 8] === 0)
                    || (a8[j + 3 - 4 * width] === 0 && a8[j + 3 - 4 * width] === 0)
                    || (a8[j + 3 + 4 * width] === 0 && a8[j + 3 + 4 * width] === 0)
                ) {
                    a8[j + 3] = 127;
                }
            }
        }
    }

    // Set identical pixels in imageData transparent
    static clearWhereSame(imageData, maskImageData) {
        // Get pixels for background and composite
        var id32 = new Int32Array(imageData.data.buffer);
        var mid32 = new Int32Array(maskImageData.data.buffer);

        for (var j = 0; j < id32.length; ++j) {
            if (id32[j] === mid32[j]) {
                id32[j] = 0;
            }
        }
    }

    // Set "too different" pixels in imageData transparent
    static clearWhereDifferent(imageData, maskImageData) {
        var l8 = maskImageData.data;
        var r8 = imageData.data;
        var row = imageData.width * 4;

        for (var j = row; j < r8.length - row; j += 4) {
            if (ImageProcessing.shouldClear(l8, r8, j) && (ImageProcessing.shouldClear(l8, r8, j - row) || ImageProcessing.shouldClear(l8, r8, j + row))) {
                r8[j] = 0;
                r8[j + 1] = 0;
                r8[j + 2] = 0;
                r8[j + 3] = 0;
            }
        }
    }

    static shouldClear(l8, r8, j) {
        // Clear pixel if left side transparent or saturation difference too high
        return l8[j + 3] === 0 || r8[j + 3] === 0 || (Math.abs(ImageProcessing.sat(r8, j) - ImageProcessing.sat(l8, j)) > 100);
    }

    static sat(a8, j) {
        // Calculate Pixel Saturation
        var cmax = Math.max(a8[j], a8[j + 1], a8[j + 2]) / 255;
        var cmin = Math.min(a8[j], a8[j + 1], a8[j + 2]) / 255;
        var delta = cmax - cmin;
        return (delta === 0 ? 0 : 255 * (delta / cmax));
    }

    // Clear pixels outside the circle this imageData circumscribes
    static clearOutsideCircle(imageData) {
        var i8 = imageData.data;

        for (var y = 0; y < imageData.height; ++y) {
            for (var x = 0; x < imageData.width; ++x) {
                var r2 = ((imageData.width / 2) - x) * ((imageData.width / 2) - x) + ((imageData.height / 2) - y) * ((imageData.height / 2) - y);
                if (r2 > (imageData.width / 2) * (imageData.height / 2) || y === 0 || y === imageData.height - 1) {
                    var p = 4 * (x + y * imageData.width);
                    i8[p + 3] = 0;
                }
            }
        }
    }
}
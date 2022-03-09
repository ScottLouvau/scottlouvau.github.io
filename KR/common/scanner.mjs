import allPositions from "../data/positions.min.mjs";
import towers from "../data/towers.min.mjs";
import settings from '../data/settings.mjs';

const classNames = ['Arca', 'Arch', 'Arch2', 'Arch3', 'Arti', 'Arti2', 'Arti3', 'Barb', 'Barr', 'Barr2', 'Barr3', 'BigB', 'Holy', 'Mage', 'Mage2', 'Mage3', 'Map', 'Musk', 'None', 'Rang', 'Sorc', 'Tesl'];
const IMAGE_WIDTH = 80;
const IMAGE_HEIGHT = 80;
const IMAGE_CHANNELS = 3;
const IMAGE_SIZE = IMAGE_WIDTH * IMAGE_HEIGHT * IMAGE_CHANNELS;

const ConfidenceThreshold = 0.95;
const SecondsPerFrame = 5;
const PlanEmptyLineAfterSeconds = 40;

export default class Scanner {
    constructor(tf, model, logger) {
        this.tf = tf;
        this.model = model;
        this.logger = logger;
        this.diagnosticDrawing = null;
    }

    circleAtPosition(ctx, drawing) {
        let result = null;
        const width = ctx.canvas.width;
        const id = ctx.getImageData(0, 0, width, ctx.canvas.height);
        const i8 = id.data;

        let sellR = null;
        for (let posName in this.positions) {
            // Look for dark rectangle over '$' in "low" (Barr/Arch) and "high" (Mage/Arti) ability circles
            sellR = this.toRect(this.positions[posName], { relX: -10, relY: 75, w: 20, h: 5 });
            let color = this.colors(i8, width, sellR);
            if (color.black < 0.9) {
                sellR.y -= 17;
                color = this.colors(i8, width, sellR);
            }

            // If neither area was dark, no circle here
            if (color.black < 0.9) { continue; }

            // Make sure we see the sell box silver top border to rule out a hint text box.
            const borderR = { x: sellR.x, y: sellR.y - 4, w: 20, h: 3 };
            color = this.colors(i8, width, borderR);
            if (color.silver < 0.65) { continue; }

            // This looks like an ability circle.
            result = { posName: posName };

            // Try looking for the 'Z' ability of X|Y|Z.
            //  These checks will hit the map (other | silver) unless this is a three-ability circle.
            const z = this.upgradeLevel(i8, width, { x: sellR.x + 96, y: sellR.y - 168, w: 5, h: 5 }, 3);

            if (z !== null) {
                // Three different upgrades (Barr)
                result.x = this.upgradeLevel(i8, width, { x: sellR.x - 78, y: sellR.y - 168, w: 5, h: 5 }, 3);
                result.y = this.upgradeLevel(i8, width, { x: sellR.x + 9, y: sellR.y - 213, w: 5, h: 5 }, 1);
                result.z = z;
            } else {
                // Two upgrades (Arch/Mage/Arti)
                result.x = this.upgradeLevel(i8, width, { x: sellR.x - 62, y: sellR.y - 187, w: 5, h: 5 }, 2);
                result.y = this.upgradeLevel(i8, width, { x: sellR.x + 79, y: sellR.y - 187, w: 5, h: 5 }, 3);

                // If this is an L2|3 tower upgrade, all pips will hit the map.
                // If this is an L4|5 tower upgrade, L2|L3 will hit the silver right border on the top tower choice buttons.
            }

            // If any ability upgrade pips looked wrong, report no circle location
            if (result?.x === null || result?.y === null || result?.z === null) { result = null; }

            // Draw ability circle diagnostics if we thought we identified a circle
            this.diagnosticDrawing?.drawBox({ x: sellR.x - 12, y: sellR.y - 4, w: 46, h: 46 }, { borderColor: (result ? "#0ff" : "#f0f") });

            break;
        }

        // Redraw tower diagnostics (always)
        this.drawDiagnostics();

        return result;
    }

    upgradeLevel(i8, width, pipR, minPips) {
        // Identify the ability level by looking for blue pips.
        //  Ensure all expected pips are black | blue. Optional ones could be silver (hitting upgrade circle).
        //  Pip positions which actually hit the map will be other | silver.

        // L1 - must be black or blue
        const l1 = this.colors(i8, width, pipR);
        this.diagnosticDrawing?.drawBox({ x: pipR.x - 5, y: pipR.y - 5, w: pipR.w + 9, h: pipR.h + 9 }, { borderWidth: 3, borderColor: l1.primary });
        if (l1.black < 0.8 && l1.blue < 0.8) { return null; }

        // L2 - must be black or blue if two pips expected
        pipR.x += 25;
        pipR.y += 10;
        const l2 = this.colors(i8, width, pipR);
        this.diagnosticDrawing?.drawBox({ x: pipR.x - 5, y: pipR.y - 5, w: pipR.w + 9, h: pipR.h + 9 }, { borderWidth: 3, borderColor: l2.primary });
        if (l2.other > 0.2) { return null; }
        if (l2.silver > 0.2 && minPips > 1) { return null; }

        // L3 - must not be silver if expected; must not be obscured if L2 is blue
        pipR.x += 9;
        pipR.y += 24;
        const l3 = this.colors(i8, width, pipR);
        this.diagnosticDrawing?.drawBox({ x: pipR.x - 5, y: pipR.y - 5, w: pipR.w + 9, h: pipR.h + 9 }, { borderWidth: 3, borderColor: l3.primary });
        if (l3.other > 0.2 && l2.black < 0.8) { return null; }
        if (l3.silver > 0.2 && minPips > 2) { return null; }

        // If L3 was blue, confirm L2 and L1.
        if (l3.blue >= 0.8) {
            return (l2.blue >= 0.8 && l1.blue >= 0.8 ? 3 : null);
        }

        // If L2 is blue, confirm L1
        if (l2.blue >= 0.8) {
            return (l1.blue >= 0.8 ? 2 : null);
        }

        if (l1.blue >= 0.8) {
            return 1;
        }

        return 0;
    }

    colors(i8, width, r) {
        let result = { black: 0, blue: 0, silver: 0, other: 0 };

        for (let y = r.y; y < r.y + r.h; ++y) {
            for (let x = r.x; x < r.x + r.w; ++x) {
                const i = 4 * (x + y * width);
                let c = this.color(i8, i);

                if (c.v <= 78) {
                    // Low Value (brightness) => black
                    result.black++;
                } else if (c.s <= 0.25) {
                    // Low Saturation => silver
                    result.silver++;
                } else if (c.h >= 170 && c.h <= 250) {
                    // High Blue, Low Red => blue
                    result.blue++;
                } else {
                    result.other++;
                }
            }
        }

        const count = r.w * r.h;
        result.black /= count;
        result.blue /= count;
        result.silver /= count;
        result.other /= count;

        if (result.black > 0.75) {
            result.primary = "#000";
        } else if (result.blue > 0.75) {
            result.primary = "#0ff";
        } else if (result.silver > 0.75) {
            result.primary = "#ccc";
        } else {
            result.primary = "#953";
        }

        return result;
    }

    color(i8, i) {
        const r = i8[i];
        const g = i8[i + 1];
        const b = i8[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        const val = max;
        const sat = (max === 0 ? 0 : delta / max);
        let hue = 0;
        if (max === r) {
            hue = (g - b) / delta;
        } else if (max === g) {
            hue = 2 + (b - r) / delta;
        } else {
            hue = 4 + (r - g) / delta;
        }
        hue = (60 * hue) % 360;

        return { r: r, g: g, b: b, h: hue, s: sat, v: val };
    }

    toRect(position, geo) {
        return {
            x: position.x + (geo.relX ?? 0),
            y: position.y + (geo.relY ?? 0),
            w: geo.w,
            h: geo.h
        };
    }

    imageDataToTensor(id) {
        // Convert ImageData to Tensor format (R, G, B channels as float)
        const a8 = id.data;
        const input = new Float32Array(IMAGE_SIZE);

        let out = 0;
        for (let y = 0; y < id.height; ++y) {
            for (let x = 0; x < id.width; ++x) {
                let j = 4 * (y * id.width + x);
                input[out++] = a8[j] / 255;
                input[out++] = a8[j + 1] / 255;
                input[out++] = a8[j + 2] / 255;
            }
        }

        return this.tf.tensor4d(input, [1, IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS]);
    }

    topPredictions(outTensor) {
        // Identify the two highest confidence predictions reported in the neural network output tensor
        const array = outTensor.dataSync();
        var matches = { best: null, prev: null };

        for (let i = 0; i < array.length; ++i) {
            var v = array[i];

            if (matches.best === null || matches.best.confidence < v) {
                matches.prev = matches.best;
                matches.best = { name: classNames[i], confidence: v };
            } else if (matches.prev === null || matches.prev.confidence < v) {
                matches.prev = { name: classNames[i], confidence: v };
            }
        }

        return matches;
    }

    scanPosition(ctx, pos) {
        // Return the top tower predictions at the given tower position in the provided image
        var r = this.toRect(pos, settings.geo.profile);
        const id = ctx.getImageData(r.x, r.y, r.w, r.h);

        const inTensor = this.imageDataToTensor(id);
        const outTensor = this.model.predict(inTensor);
        const predictions = this.topPredictions(outTensor);

        inTensor.dispose();
        outTensor.dispose();

        return predictions;
    }

    scanImage(ctx) {
        // Return the top tower predictions at all tower positions in the provided image
        this.state = {};

        for (let posName in this.positions) {
            this.state[posName] = this.scanPosition(ctx, this.positions[posName]);
        }

        this.drawDiagnostics();
        return this.state;
    }

    drawDiagnostics() {
        if (!this.diagnosticDrawing) { return; }

        for (let posName in this.positions) {
            const prediction = this?.state?.[posName]?.best;

            if (!prediction) { continue; }
            if (prediction.confidence >= 0.95 && (prediction.name === "None" || prediction.name === "Map")) { continue; }

            const color = (prediction.confidence >= 0.95 ? "#0f0" : (prediction.confidence >= 0.85 ? "#f92" : "#f00"));
            const options = { left: true, fontSizePx: 18, textColor: color, backColor: '#222', borderColor: color };
            const r = this.toRect(this.positions[posName], settings.geo.towerDiagnostics);

            this.diagnosticDrawing.drawBox(r, { borderColor: color });
            this.diagnosticDrawing.drawText({ x: r.x, y: r.y + 17 }, prediction.name, options);
            this.diagnosticDrawing.drawText({ x: r.x, y: r.y + r.h }, `${(prediction.confidence * 100).toFixed(0)}`, options);
        }
    }

    identifyMap(ctx) {
        let best = null;
        let scans = 0;

        // Try to identify by first position only
        for (let posIndex = 0; posIndex < 20; ++posIndex) {
            for (let mapName in allPositions) {
                const pos = Object.values(allPositions[mapName])[posIndex];
                if (!pos) { break; }

                const matches = this.scanPosition(ctx, pos);
                scans++;

                if (matches.best.name !== 'Map') {
                    if (best === null || matches.best.confidence > best.confidence) {
                        best = { name: mapName, confidence: matches.best.confidence };
                    }

                    if (best.confidence >= ConfidenceThreshold) { break; }
                }
            }

            if (best?.confidence >= ConfidenceThreshold) { break; }
        }

        //this.log(`Detected Map: ${(best.confidence * 100).toFixed(0)}% ${best.name} after ${scans}`);
        if (best?.confidence >= ConfidenceThreshold) {
            return best.name;
        } else {
            return null;
        }
    }

    evaluateStep(posName, matches, previous) {
        if (matches?.best?.name === null) {
            return { issue: `ERROR ${posName}: returned no detections.` };
        } else if (matches.best.confidence < ConfidenceThreshold) {
            return { issue: `WARN ${posName}: ignored low confidence ${matches.best.name} (${(matches.best.confidence * 100).toFixed(0)}%)` };
        } else if (matches.best.name === "Map") {
            return { issue: `WARN ${posName}: detection said non-position map space.` };
        } else if (matches.best.name === "None") {
            if (previous !== "None") {
                return { issue: `WARN ${posName}: ignored None where previously ${previous}.` };
            }
        } else if (matches.best.name !== previous) {
            const prevTower = towers.base[previous];
            const currTower = towers.base[matches.best.name];

            if (prevTower) {
                if (currTower.shortName[0] !== prevTower.shortName[0]) {
                    return { issue: `ERROR ${posName}: Can't build ${matches.best.name} on ${previous}.` };
                } else if (currTower.shortName[1] < prevTower.shortName[1]) {
                    return { issue: `ERROR: ${posName}: Tower downgrade to ${matches.best.name} from ${previous}.` };
                }
            }

            return { issue: null, isChange: true };
        }

        return { issue: null, isChange: false };
    }

    logPositionState(posName, matches, previously) {
        let message = `  ${posName}: `;

        if (previously) {
            message += `${previously} => `;
        }

        message += matches.best.name;

        if (matches.best.confidence < 0.98 || matches.prev.confidence > 0.05) {
            message += `     [${(matches?.best?.confidence * 100).toFixed(0)}% or ${(matches?.prev?.confidence * 100).toFixed(0)}% ${matches?.prev?.name}]`;
        }

        this.log(message);
    }

    reset() {
        this.mapName = null;
    }

    init(ctx, mapName) {
        if (!mapName) {
            this.log("Identifying map...");
            mapName = this.identifyMap(ctx);
            if (mapName === null) { return; }
        }

        this.log(mapName);
        this.mapName = mapName;
        this.positions = allPositions[mapName];
        this.plan = [mapName, ''];

        this.world = {};
        for (let posName in this.positions) {
            this.world[posName] = { base: 'None' };
        }

        this.i = 0;
    }

    nextFrame(ctx) {
        if (!this.mapName) {
            this.init(ctx);
            if (!this.mapName) { return; }
        }

        let state = this.scanImage(ctx);
        let loggedThisFrame = false;

        for (let posName in state) {
            let matches = state[posName];
            const previous = this.world[posName]?.base?.ln;

            const evaluation = this.evaluateStep(posName, matches, previous);
            if (evaluation.issue === null && evaluation.isChange === false) {
                continue;
            }

            if (loggedThisFrame === false) {
                this.log();
                this.log(`${this.toTimeString(this.i * SecondsPerFrame)}`);
                loggedThisFrame = true;
            }

            if (evaluation.issue != null) {
                this.log(`  ${evaluation.issue}`);
            } else {
                this.logPositionState(posName, matches, previous);

                // Add new step to plan output
                const planStep = `${posName} ${matches.best.name}`;
                if (this.plan[this.plan.length - 1].startsWith(posName)) {
                    // Replace previous step if for same position
                    this.plan[this.plan.length - 1] = planStep;
                } else {
                    // Add log separator if enough time passed since last step
                    if (this.lastChangedFrame < this.i) {
                        if ((this.i - this.lastChangedFrame) >= (PlanEmptyLineAfterSeconds / SecondsPerFrame) && this.plan.length > 2) {
                            this.plan.push('');
                            this.plan.push(`# ${this.toTimeString(this.i * SecondsPerFrame)}`);
                        }
                    }

                    this.plan.push(planStep);
                }


                // Update world state
                this.world[posName].base = towers.base.find((t) => t.ln === matches.best.name);
                this.lastChangedFrame = this.i;
            }
        }

        this.i++;
        return state;
    }

    // Scan a series of PNG frames over time; write the build plan to console and output file
    async scanFrames(nextImage) {
        let ctx = await nextImage();
        this.init(ctx);

        for (; ctx !== null; ctx = await nextImage()) {
            this.nextFrame(ctx);
        }

        return this.plan.join('\r\n');
    }

    log(message) {
        if (!message) { message = ""; }

        if (this.logger) {
            console.log(message);
            this.logger(message);
        }
    }

    toTimeString(totalSeconds) {
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds / 60)) % 60;
        let seconds = Math.floor(totalSeconds) % 60;
        let millis = Math.floor(totalSeconds * 1000) % 1000;

        if (totalSeconds > 0 && totalSeconds < 1) {
            return `${millis.toFixed(0)}ms`;
        }

        let result = `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`;

        if (hours > 0) {
            result = `${hours.toFixed(0).padStart(2, '0')}:${result}`;
        }

        if (millis !== 0 && totalSeconds < 10) {
            result += `.${millis.toFixed(0).padStart(3, '0')}`;
        }

        return result;
    }
}
import allPositions from "../data/positions.min.mjs";
import towers from "../data/towers.min.mjs";
import settings from '../data/settings.mjs';

const classNames = ['Arca', 'Arch', 'Arch2', 'Arch3', 'Arti', 'Arti2', 'Arti3', 'Barb', 'Barr', 'Barr2', 'Barr3', 'BigB', 'Holy', 'Mage', 'Mage2', 'Mage3', 'Map', 'Musk', 'None', 'Rang', 'Sorc', 'Tesl'];
const IMAGE_WIDTH = 80;
const IMAGE_HEIGHT = 80;
const IMAGE_CHANNELS = 3;
const IMAGE_SIZE = IMAGE_WIDTH * IMAGE_HEIGHT * IMAGE_CHANNELS;

const ConfidenceThreshold = 0.95;
const SecondsPerFrame = 20;
const PlanEmptyLineAfterSeconds = 40;

export default class Scanner {
    constructor(tf, model, logger) {
        this.tf = tf;
        this.model = model;
        this.logger = logger;
    }

    toProfileRect(position) {
        // Convert tower position coordinates to tower identification profile rectangle
        return {
            x: position.x + settings.geo.profile.relX,
            y: position.y + settings.geo.profile.relY,
            w: settings.geo.profile.w,
            h: settings.geo.profile.h
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
        var r = this.toProfileRect(pos);
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
        let state = {};

        for (let posName in this.positions) {
            state[posName] = this.scanPosition(ctx, this.positions[posName]);
        }

        return state;
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
        return best.name;
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

    init(ctx) {
        this.log("Identifying map...");
        const mapName = this.identifyMap(ctx);
        this.log(mapName);
        this.mapName = mapName;
        this.positions = allPositions[mapName];
        this.plan = [mapName, ''];

        this.world = {};
        for (let posName in this.positions) {
            this.world[posName] = 'None';
        }

        this.i = 0;
    }

    nextFrame(ctx) {
        if (this.mapName === null) {
            this.init(ctx);
            if (this.mapName === null) { return; }
        }

        let state = this.scanImage(ctx);
        let loggedThisFrame = false;

        for (let posName in state) {
            let matches = state[posName];
            const previous = this.world[posName];

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
                this.world[posName] = matches.best.name;
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

        console.log(message);
        if (this.logger) {
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
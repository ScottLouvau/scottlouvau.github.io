import * as tf from '../ref/tf.fesm.min.js';
import Scanner from '../common/scanner.mjs';
import PlanParser from '../common/planParser.mjs';
import Drawing from '../common/drawing.mjs';
import settings from '../data/settings.mjs';

const lastFrameSecondsBeforeEnd = 3;

let video = null;
let elapsedSeconds = null;
let duration = null;

let progress = null;
let link = null;
let planOut = null;
let diagnostic = null;
let drawing = null;

let parser = null;
let scanner = null;
let can = null;
let ctx = null;

async function scanVideo() {
    planOut.value = "";
    progress.style.width = 0;

    // Seek to start of video to start scanning frames
    // (If at zero, seek a bit after to ensure we wait for video to really be loaded)
    elapsedSeconds = 0;
    duration = video.duration;

    video.currentTime = (video.currentTime === 0 ? 0.1 : 0);
}


function onSeeked() {
    if (duration === null) { return; }

    // Grab a frame
    ctx.drawImage(video, 0, 0);

    if (elapsedSeconds === 0) {
        scanner.init(ctx);
        planOut.value = scanner.mapName;
    }

    // Scan it and report diagnostics
    const state = scanner.nextFrame(ctx);
    drawDiagnostics(state);
    progress.style.width = `${(100 * elapsedSeconds / duration).toFixed(2)}%`;

    // Continue seeking if video isn't over
    if (elapsedSeconds < duration - lastFrameSecondsBeforeEnd) {
        elapsedSeconds = Math.min(elapsedSeconds + 20, duration - lastFrameSecondsBeforeEnd);
        video.currentTime = elapsedSeconds;
    } else {
        progress.style.width = "100%";
        elapsedSeconds = null;
        duration = null;
    }

    const planText = scanner.plan.join('\r\n');
    planOut.value = planText;
    planOut.scrollTop = planOut.scrollHeight - planOut.clientHeight;

    updatePlanLink();
}

function updatePlanLink() {
    const planText = planOut.value;
    const parsed = parser.parse(planText);
    const shortText = parser.toShortText(parsed);
    const url = `https://relentlessoptimizer.com/KR/animate?p=${shortText}`;

    if (parsed.errors.length === 0) {
        link.innerText = "Animation Link";
        link.href = url;
    } else {
        link.innerText = "[Error]";
        link.href = "";
        link.title = `${parsed.errors.join("\n")}`;
    }
}

function drawDiagnostics(state) {
    drawing.drawImage(can, 0, 0);

    const positions = scanner.positions;
    const spread = 10;

    for (const posName in state) {
        const pos = positions[posName];
        const prediction = state[posName].best;
        if (prediction.confidence >= 0.95 && (prediction.name === "None" || prediction.name === "Map")) { continue; }

        const color = confidenceColor(prediction.confidence);
        const options = { left: true, fontSizePx: 18, textColor: color, backColor: '#222', borderColor: color };
        const r = {
            x: pos.x + settings.geo.profile.relX - (spread / 2),
            y: pos.y + settings.geo.profile.relY - (spread / 2),
            w: settings.geo.profile.w + spread,
            h: settings.geo.profile.h + spread
        };

        drawing.drawBox(r, { borderColor: color });
        drawing.drawText({ x: r.x, y: r.y + 17 }, prediction.name, options);
        drawing.drawText({ x: r.x, y: r.y + r.h }, `${(prediction.confidence * 100).toFixed(0)}`, options);
    }
}

function confidenceColor(confidence) {
    if (confidence >= 0.95) {
        return "#0f0";
    } else if (confidence >= 0.85) {
        return "#f92";
    } else {
        return "#f00";
    }
}

async function onDrop(e) {
    // Suppress browser opening file
    e.preventDefault();

    if (e.dataTransfer.items && e.dataTransfer.items.length >= 1) {
        let item = e.dataTransfer.items[0];
        if (item.kind === 'file') {
            const file = await item.getAsFile();
            const url = URL.createObjectURL(file);
            video.src = url;
        }
    }
}

// On keystrokes, update the plan but not constantly
let planChangeTimeout = null;
function onPlanChange() {
    if (planChangeTimeout === null) {
        planChangeTimeout = true;

        window.setTimeout(() => {
            planChangeTimeout = null;
            updatePlanLink();
        }, 2000);
    }
}

async function run() {
    const model = await tf.loadGraphModel('../data/models/v2-u8-graph/model.json');
    scanner = new Scanner(tf, model);
    parser = new PlanParser();

    progress = document.getElementById("progress");
    link = document.getElementById("link");
    planOut = document.getElementById("planOut");
    diagnostic = document.getElementById("diagnostic");
    drawing = new Drawing(diagnostic);

    // Create video element to play video and get frames
    video = document.createElement('video');
    video.width = 1920;
    video.height = 1080;
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('loadeddata', scanVideo);

    // Build canvas to copy frames to
    can = document.createElement("canvas");
    can.width = 1920;
    can.height = 1080;
    ctx = can.getContext('2d');

    // Accept drag-and-drop video anywhere
    document.body.addEventListener('dragover', (e) => { e.preventDefault(); });
    document.body.addEventListener('drop', onDrop);

    // On manual plan edits, update plan link and errors
    document.getElementById('planOut').addEventListener('keyup', onPlanChange);
}

document.addEventListener('DOMContentLoaded', run);
import * as tf from '../ref/tf.fesm.min.js';
import Scanner from '../common/scanner.mjs';
import PlanParser from '../common/planParser.mjs';
import Drawing from '../common/drawing.mjs';
import settings from '../data/settings.mjs';

const lastFrameSecondsBeforeEnd = 3;

// Video element and state of scanning
let video = null;
let elapsedSeconds = null;
let duration = null;
let manualSeeking = false;
let scanStartTime = null;

// Scanning feedback and outputs
let progress = null;
let link = null;
let planOut = null;
let errorsOut = null;
let diagnostic = null;
let drawing = null;

// Canvas capturing video frames and code to scan frames and parse plans
let parser = null;
let scanner = null;
let can = null;
let ctx = null;

async function scanVideo() {
    closeHelp();

    scanStartTime = performance.now();
    planOut.value = "";
    progress.style.width = 0;

    scanner.reset();
    elapsedSeconds = 0;
    duration = video.duration;

    // Seek to start of video to start scanning frames
    // (If at zero, seek a bit after to ensure we wait for video to really be loaded)
    video.currentTime = (video.currentTime === 0 ? 0.1 : 0);
}

function onSeeked() {
    if (elapsedSeconds === null && manualSeeking === false) { return; }
    const thisFrameElapsed = video.currentTime;

    // Grab a frame
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 1920, 1080);
    progress.style.width = `${(100 * thisFrameElapsed / duration).toFixed(2)}%`;

    // Start seeking to next frame immediately (if there's more)
    if (elapsedSeconds < duration - lastFrameSecondsBeforeEnd && manualSeeking === false) {
        elapsedSeconds = Math.min(elapsedSeconds + 20, duration - lastFrameSecondsBeforeEnd);
        video.currentTime = elapsedSeconds;
    }

    // Scan the frame and report diagnostics
    const state = (manualSeeking ? scanner.scanImage(ctx) : scanner.nextFrame(ctx));
    drawDiagnostics(state);

    // Scan and diagnostics only for manual seeks
    if (manualSeeking) {
        manualSeeking = false;
        return;
    }

    // Report when scanning done
    if (thisFrameElapsed >= duration - lastFrameSecondsBeforeEnd) {
        elapsedSeconds = null;
        progress.style.width = "100%";
        console.log(`Scanned ${scanner.toTimeString(duration)} video in ${scanner.toTimeString((performance.now() - scanStartTime) / 1000)}.`);
    }

    // Update long and short plan with each frame
    const planText = scanner.plan?.join('\r\n') ?? "Identifying Map...";
    planOut.value = planText;
    planOut.scrollTop = planOut.scrollHeight - planOut.clientHeight;

    updatePlanLink();
}

function updatePlanLink() {
    const planText = planOut.value;
    let errors = null;

    try {
        const parsed = parser.parse(planText);
        const shortText = parser.toShortText(parsed);
        const url = `https://relentlessoptimizer.com/KR/animate?p=${shortText}`;

        if (parsed.errors.length === 0) {
            link.href = url;
            link.title = "";
            errorsOut.value = "";
            errorsOut.style.display = "none";
            return;
        }
        
        errors = parsed.errors.join("\n");
    } catch (error) {
        errors = error;
    }

    link.href = "";
    link.title = `${errors}`;
    errorsOut.innerText = errors;
    errorsOut.style.display = "initial";
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

function closeHelp() {
    document.getElementById("help-container").style.display = "none";
    document.getElementById("container").style.display = "";
}

async function onDrop(e) {
    // Suppress browser opening file
    e.preventDefault();

    if (e.dataTransfer.items && e.dataTransfer.items.length >= 1) {
        let item = e.dataTransfer.items[0];
        if (item.kind === 'file') {
            const file = await item.getAsFile();

            if (item.type.startsWith("text")) {
                closeHelp();
                planOut.value = await file.text();
                updatePlanLink();
            } else {
                const url = URL.createObjectURL(file);
                video.src = url;
            }
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
        }, 500);
    }
}

function onProgressClick(e) {
    // Don't allow seeking until video done
    if (elapsedSeconds !== null) { return; }

    // Set manualSeeking and seek to a particular moment to show diagnostics
    const container = document.getElementById("progress-container");
    manualSeeking = true;
    const percentage = ((e.clientX - container.clientLeft) / container.clientWidth);
    video.currentTime = (percentage * duration);
}

function onSaveClick(e) {
    e.preventDefault();

    const planText = planOut.value;
    const blob = new Blob([ planText ], { type: "text/plain"} );

    let fileName = "Plan.txt";
    try {
        const parsed = parser.parse(planText);
        fileName = `${parsed.mapName}.txt`;
    } catch(error) {
        // ... Just default download filename
    }
    
    const tempLink = document.createElement("a");
    tempLink.download = fileName;
    tempLink.href = URL.createObjectURL(blob);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

async function run() {
    const model = await tf.loadGraphModel('../data/models/v2-u8-graph/model.json');
    scanner = new Scanner(tf, model);
    parser = new PlanParser();

    progress = document.getElementById("progress");
    link = document.getElementById("link");
    planOut = document.getElementById("planOut");
    errorsOut = document.getElementById("errorsOut");
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
    planOut.addEventListener('keyup', onPlanChange);

    // On progress bar click, analyze and show diagnostics for frame
    document.getElementById("progress-container").addEventListener('click', onProgressClick);

    document.getElementById("demo").addEventListener('click', () => { video.src = '../data/L10h-tiny.mp4'; });
    document.getElementById("handwrite").addEventListener('click', closeHelp);
    document.getElementById("save").addEventListener('click', onSaveClick);
}

document.addEventListener('DOMContentLoaded', run);
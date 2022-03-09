import * as tf from '../ref/tf.fesm.min.js';
import Scanner from '../common/scanner.mjs';
import PlanParser from '../common/planParser.mjs';
import Drawing from '../common/drawing.mjs';
import towers from "../data/towers.min.mjs";

const playbackRate = 8;
const circleIntervalSec = 0.5;
const scanIntervalSec = 5;

let pause = null;

// Video element and state of scanning
let image = null;
let video = null;
let duration = null;

let nextTowerScan = null;
let nextAbilityScan = null;

// Canvas capturing video frames and code to scan frames and parse plans
let parser = null;
let scanner = null;
let can = null;
let ctx = null;

let planOut = null;
let lastStep = null;
let diagnostic = null;
let drawing = null;

let state = null;

let start = null;
let end = null;
let interval = null;

async function onLoaded() {
    duration = video.duration;
    start = performance.now();

    nextTowerScan = 0;
    nextAbilityScan = 0;

    // Play at 16x speed
    video.playbackRate = playbackRate;
    video.play();

    interval = setTimeout(onFrame, (1000 * circleIntervalSec / playbackRate));
}

async function onFrame(e) {
    let elapsed = null;
    let next = null;

    while (true) {
        elapsed = video.currentTime;
        next = Math.min(nextTowerScan, nextAbilityScan);
        if (next > duration || next > elapsed) { break; }

        // Grab a frame
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 1920, 1080);
        drawing.drawImage(can, 0, 0);
        progress.style.width = `${(100 * elapsed / duration).toFixed(2)}%`;

        let circle = null;
        if (elapsed >= nextAbilityScan) {
            nextAbilityScan = elapsed + circleIntervalSec;
            circle = scanner.circleAtPosition(ctx);
        }

        if (elapsed >= nextTowerScan) {
            nextTowerScan = elapsed + scanIntervalSec;
            state = scanner.nextFrame(ctx);
        }

        if (circle !== null) {
            let last = scanner.world[circle.posName];

            if (last?.base?.sn?.[1] ?? 0 < 4) {
                state = scanner.nextFrame(ctx);
                last = scanner.world[circle.posName];
            }

            if (!last?.base?.sn) {
                console.log(`ERROR: Didn't find tower for ability upgrade at ${circle.posName}`);
            } else {
                checkForNewUpgrade(last, circle, "x");
                checkForNewUpgrade(last, circle, "y");
                checkForNewUpgrade(last, circle, "z");
            }
        }

        const last = scanner.plan?.[scanner?.plan?.length - 1];
        if (lastStep !== last) {
            lastStep = last;
            const planText = scanner.plan?.join('\r\n') ?? "Identifying Map...";
            planOut.value = planText;
            planOut.scrollTop = planOut.scrollHeight - planOut.clientHeight;
        }

        if (pause) {
            video.pause();
            return;
        }
    }

    if (next < duration) {
        const secToNext = (next - video.currentTime);
        setTimeout(onFrame, Math.min(10, (1000 * secToNext) / playbackRate));
    }
}

function scanImage() {
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, 1920, 1080);
    drawing.drawImage(can);
    state = scanner.nextFrame(ctx);
    scanner.circleAtPosition(ctx);
}

function checkForNewUpgrade(last, circle, letter) {
    const newLevel = circle[letter];
    if (newLevel && newLevel > (last[letter]?.level ?? 0)) {
        let upgrade = towers.upgrades.find((u) => u.on === last.base.sn && u.sn === letter);

        if (!upgrade) {
            console.log(`ERROR: Didn't find upgrade ${letter}${newLevel} on ${last.base.ln} at ${circle.posName}`);
        } else {
            last[letter] = { level: newLevel };
            const step = `${circle.posName} ${upgrade.ln}${newLevel}`;
            if (scanner.plan[scanner.plan.length - 1].startsWith(step.slice(0, -1))) {
                scanner.plan[scanner.plan.length - 1] = step;
            } else {
                scanner.plan.push(step);
            }
        }

        pause = true;
    }
}

async function onEnded(e) {
    end = performance.now();
    const timeSeconds = (end - start) / 1000;
    console.log(`Video Played through in: ${timeSeconds.toFixed(1)}s (${(video.duration / timeSeconds).toFixed(1)}x)`);

    if (interval) {
        clearInterval(interval);
        interval = null;
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

            scanner.mapName = null;
            state = null;

            if (item.type.startsWith("image/")) {
                image.src = url;
            } else if (item.type.startsWith("video/")) {
                video.src = url;
            }
        }
    }
}

function keyDown(e) {
    if (e.keyCode === 32) {
        e.preventDefault();
        pause = false;
        video.play();
        onFrame();
    }
}

async function run() {
    const model = await tf.loadGraphModel('../data/models/v2-u8-graph/model.json');
    scanner = new Scanner(tf, model);
    parser = new PlanParser();

    image = document.createElement('img');
    image.addEventListener('load', scanImage);

    // Create video element to play video and get frames
    video = document.getElementById('video');
    video.width = 1920;
    video.height = 1080;
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('ended', onEnded);
    video.style.display = "none";

    // Build canvas to copy frames to
    can = document.createElement("canvas");
    can.width = 1920;
    can.height = 1080;
    ctx = can.getContext('2d');

    planOut = document.getElementById('planOut');
    diagnostic = document.getElementById("diagnostic");
    drawing = new Drawing(diagnostic);

    // Hack to punch through diagnostics
    scanner.diagnosticDrawing = drawing;

    // Accept drag-and-drop video anywhere
    document.body.addEventListener('dragover', (e) => { e.preventDefault(); });
    document.body.addEventListener('drop', onDrop);
    document.addEventListener('keydown', keyDown);
}

document.addEventListener('DOMContentLoaded', run);
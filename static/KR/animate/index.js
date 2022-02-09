import Drawing from "../common/drawing.mjs";
import Animator from "../common/animator.mjs";

// Pre-fetching indirect dependencies
import PlanParser from "../common/planParser.mjs";
import settings from "../data/settings.mjs";
import allPositions from "../data/positions.min.mjs";
import towers from "../data/towers.min.mjs";

async function loadImage(url) {
    const img = new Image();
    const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => { resolve(); };
    });

    img.src = url;
    await loadPromise;
    return img;
}

async function loadJson(url) {
    return await (await fetch(url)).json();
}

let paused = false;
let justEntered = false;
let animator = null;

async function run(fmt, planText) {
    const outCanvas = document.getElementById("main");
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;

    const drawOut = new Drawing(outCanvas);
    animator = new Animator(loadImage, loadJson, canvas, () => {
        drawOut.drawImage(canvas);
    });

    const plan = await animator.parsePlan(planText, fmt);

    if (plan.errors.length > 0) {
        for (let i = 0; i < plan.errors.length; ++i) {
            console.log(plan.errors[i]);
        }

        return;
    }

    animate();

    document.addEventListener('keydown', keyDown);
    outCanvas.addEventListener('mouseenter', () => mouse(true));
    outCanvas.addEventListener('mouseleave', () => mouse(false));
    outCanvas.addEventListener('click', canvasClicked);
}

function canvasClicked(e) {
    e.stopPropagation();

    const r = e.target.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width);
    const y = ((e.clientY - r.top) / r.height);

    if (!justEntered) {
        if (x < 0.25) {
            if (y < 0.67) {
                animator.prev();
            } else {
                animator.start();
            }
        } else if (x > 0.75) {
            if (y < 0.67) {
                animator.next();
            } else {
                animator.end();
            }
        } else {
            togglePause();
        }
    }
}

function mouse(enter) {
    animator.showControls = (enter === true);
    animator.drawWorld();
    justEntered = true;
    setTimeout(() => justEntered = false, 50);
}

function togglePause() {
    paused = !paused;
    //document.getElementById("playPause").innerText = (paused ? "▶️" : "⏸️");
    animator.paused = paused;
    animate();
}

function animate() {
    if (paused) {
        animator.drawWorld();
        return;
    }

    animator.next();

    if (animator.drawUntil < animator.plan.steps.length) {
        setTimeout(animate, 500);
    }
}

function keyDown(e) {
    if (e.keyCode === 36 || e.keyCode === 38) {
        // Home | Up Arrow
        animator.start();
    } else if (e.keyCode === 37) {
        // Left Arrow
        animator.prev();
    } else if (e.keyCode === 32) {
        // Space
        togglePause();
    } else if (e.keyCode === 39) {
        // Right Arrow
        animator.next();
    } else if (e.keyCode === 35 || e.keyCode === 40) {
        // End | Down Arrow
        animator.end();
    }
}

export { run };

//document.addEventListener('DOMContentLoaded', run);
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
        img.onerror = () => { reject(`Image '${url}' was invalid or not found.`); };
    });

    img.src = url;
    await loadPromise;
    return img;
}

let justEntered = false;
let animator = null;

async function run(planText) {
    // Setup (once)
    if (animator === null) {
        // Create scratch canvas to render to
        const canvas = document.createElement("canvas");
        canvas.width = 1920;
        canvas.height = 1080;

        // Attach to output canvas
        const outCanvas = document.getElementById("main");
        const drawOut = new Drawing(outCanvas);
        animator = new Animator(loadImage, canvas, () => {
            drawOut.drawImage(canvas);
        });

        // Event handler hookup
        outCanvas.addEventListener('mousemove', () => mouse(true));
        outCanvas.addEventListener('mouseenter', () => mouse(true));
        outCanvas.addEventListener('mouseleave', () => mouse(false));
        outCanvas.addEventListener('click', canvasClicked);
        
        document.getElementById("demo").addEventListener('click', async () => run("L5:G7t3E9p2E7r4xG6pE7y3G6p2E7x2"));
        document.addEventListener('keydown', keyDown);
        document.addEventListener('dragover', (e) => { e.preventDefault(); });
        document.addEventListener('drop', onDrop);
    }

    // If plan provided...
    if (planText !== null) {
        // Hide help and show canvas
        document.getElementById("main").style.display = "";
        document.getElementById("help-container").style.display = "none";

        // Parse and start animating
        await animator.parsePlan(planText, document.imageFormat);
        animator.paused = false;
        animator.start();
        animate();
    }
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

let hideControlsTimer = null;
function mouse(enter) {
    // Redraw when we first enter or exit the canvas
    if (animator.showControls !== enter) {
        animator.showControls = enter;
        animator.drawWorld();
        justEntered = true;
        setTimeout(() => justEntered = false, 50);
    }

    // Hide controls three seconds after last mouse movement
    if (enter) {
        if (hideControlsTimer !== null) { clearTimeout(hideControlsTimer); }
        hideControlsTimer = setTimeout(() => mouse(false), 2500);
    }
}

function togglePause() {
    animator.paused = !animator.paused;
    if (animator.isDone()) { animator.start(); }
    animate();
}

function animate() {
    if (animator.paused) {
        animator.drawWorld();
        return;
    }

    animator.next();

    if (animator.isDone()) {
        animator.paused = true;
        animator.drawWorld();
    } else {
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

async function onDrop(e) {
    // Suppress browser opening file
    e.preventDefault();

    if (e.dataTransfer.items && e.dataTransfer.items.length >= 1) {
        let item = e.dataTransfer.items[0];
        if (item.kind === 'file') {
            const file = item.getAsFile();
            const planText = await file.text();

            await run(planText);
        }
    }
}

export { run };
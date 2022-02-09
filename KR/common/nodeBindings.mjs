import fs from 'fs';
import canvas from 'canvas';

async function loadJson(url) {
    return JSON.parse(await fs.promises.readFile(url, 'utf8'));
}

async function loadImage(url) {
    return canvas.loadImage(url);
}

function createCanvas(width, height) {
    return canvas.createCanvas(width, height);
}

async function loadToCanvas(url) {
    const img = await canvas.loadImage(url);
    const can = createCanvas(img.width, img.height);
    const ctx = can.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return can;
}

async function saveAsPng(path, can, height) {
    let toSave = can;

    if (height && height != can.height) {
        const can2 = createCanvas(Math.floor(can.width * (height / can.height)), height);
        const ctx2 = can2.getContext('2d');
        ctx2.drawImage(can, 0, 0, can2.width, can2.height);
        toSave = can2;
    }

    await fs.promises.writeFile(path, await toSave.toBuffer('image/png'));
}

export { loadJson, loadImage, createCanvas, loadToCanvas, saveAsPng };
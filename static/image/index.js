(() => {
  // index.ts
  var HIGHLIGHT_FILL = "rgb(251, 247, 25)";
  var ADJUST_PIXELS = 2;
  var NEW_RECTANGLE_WIDTH = 4;
  var NEW_RECTANGLE_LINE_HEIGHT = 18;
  var visibleCanvas;
  var visibleCtx;
  var foregroundCanvas;
  var foregroundCtx;
  var imageName;
  var background;
  var highlights = [];
  var Rectangle = class {
    constructor(fromX, fromY, toX, toY) {
      this.fromX = fromX;
      this.fromY = fromY;
      this.toX = toX;
      this.toY = toY;
    }
    width() {
      return this.toX - this.fromX;
    }
    height() {
      return this.toY - this.fromY;
    }
    redraw(ctx, background2) {
      ctx.fillStyle = HIGHLIGHT_FILL;
      ctx.drawImage(background2, this.fromX, this.fromY, this.width(), this.height(), this.fromX, this.fromY, this.width(), this.height());
      ctx.fillRect(this.fromX, this.fromY, this.width(), this.height());
    }
  };
  async function loadImage(image) {
    background = image;
    highlights = [];
    visibleCanvas.width = image.width;
    visibleCanvas.height = image.height;
    foregroundCanvas.width = image.width;
    foregroundCanvas.height = image.height;
    await redraw();
  }
  async function saveImage() {
    const url = visibleCanvas.toDataURL();
    const link = document.createElement("a");
    const name = imageName || "screenshot";
    link.href = url;
    link.download = `${name}.png`;
    link.click();
    link.remove();
  }
  async function redraw() {
    if (background == null) {
      return;
    }
    foregroundCtx.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);
    for (const highlight2 of highlights) {
      highlight2.redraw(foregroundCtx, background);
    }
    visibleCtx.drawImage(background, 0, 0, background.width, background.height);
    visibleCtx.globalAlpha = 0.5;
    visibleCtx.drawImage(foregroundCanvas, 0, 0, background.width, background.height);
    visibleCtx.globalAlpha = 1;
  }
  var highlight;
  async function highlightStart(event) {
    if (event.button !== 0) {
      return;
    }
    if (highlights.length > 0) {
      const lastHeight = highlights[highlights.length - 1].height();
      const lastLines = lastHeight / NEW_RECTANGLE_LINE_HEIGHT;
      if (lastLines < 2) {
        NEW_RECTANGLE_LINE_HEIGHT = lastHeight;
      }
    }
    visibleCanvas.getBoundingClientRect();
    const x = event.pageX - visibleCanvas.offsetLeft;
    const y = event.pageY - visibleCanvas.offsetTop;
    highlight = new Rectangle(x, y - NEW_RECTANGLE_LINE_HEIGHT / 2, x + NEW_RECTANGLE_WIDTH, y + NEW_RECTANGLE_LINE_HEIGHT / 2);
    highlights.push(highlight);
  }
  async function highlightMove(event) {
    if (highlight == null || background == null) {
      return;
    }
    visibleCanvas.getBoundingClientRect();
    const x = event.pageX - visibleCanvas.offsetLeft;
    const y = event.pageY - visibleCanvas.offsetTop;
    highlight.fromX = Math.min(highlight.fromX, x);
    highlight.toX = Math.max(highlight.toX, x);
    const linesUp = Math.max(0, Math.round((highlight.fromY - y) / NEW_RECTANGLE_LINE_HEIGHT));
    const linesDown = Math.max(0, Math.round((y - highlight.toY) / NEW_RECTANGLE_LINE_HEIGHT));
    if (linesUp > 0) {
      highlight.fromY -= linesUp * NEW_RECTANGLE_LINE_HEIGHT;
    } else if (linesDown > 0) {
      highlight.toY += linesDown * NEW_RECTANGLE_LINE_HEIGHT;
    }
    await redraw();
  }
  async function highlightEnd() {
    highlight = null;
  }
  async function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items.length >= 1) {
      let item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        const file = await item.getAsFile();
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadImage(img);
        };
        if (file.name) {
          imageName = file.name.replace(/\.[^/.]+$/, "");
        }
        const help = document.getElementById("help");
        if (help) {
          document.body.removeChild(help);
          document.body.appendChild(visibleCanvas);
        }
      }
    }
  }
  async function onKeyDown(e) {
    if (highlights.length > 0) {
      const last = highlights[highlights.length - 1];
      const shiftDown = e.shiftKey;
      if (e.key === "ArrowDown") {
        if (!shiftDown) {
          last.fromY += ADJUST_PIXELS;
        }
        last.toY += ADJUST_PIXELS;
        await redraw();
      } else if (e.key === "ArrowUp") {
        if (!shiftDown)
          last.fromY -= ADJUST_PIXELS;
        last.toY -= ADJUST_PIXELS;
      } else if (e.key === "ArrowLeft") {
        if (!shiftDown)
          last.fromX -= ADJUST_PIXELS;
        last.toX -= ADJUST_PIXELS;
      } else if (e.key === "ArrowRight") {
        if (!shiftDown)
          last.fromX += ADJUST_PIXELS;
        last.toX += ADJUST_PIXELS;
      } else if (e.key === "Backspace" || e.key === "Delete") {
        highlights.pop();
      } else if (e.key === "s") {
        await saveImage();
        return;
      } else {
        return;
      }
      e.preventDefault();
      await redraw();
    }
  }
  async function main() {
    visibleCanvas = document.createElement("canvas");
    visibleCanvas.id = "main-canvas";
    document.body.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    document.body.addEventListener("drop", onDrop);
    document.body.addEventListener("keydown", onKeyDown);
    visibleCanvas.addEventListener("mousedown", highlightStart);
    visibleCanvas.addEventListener("mousemove", highlightMove);
    visibleCanvas.addEventListener("mouseup", highlightEnd);
    const visibleContext = visibleCanvas.getContext("2d");
    if (!visibleContext) {
      throw new Error("Could not get canvas context");
    }
    visibleCtx = visibleContext;
    foregroundCanvas = document.createElement("canvas");
    const foregroundContext = foregroundCanvas.getContext("2d");
    if (!foregroundContext) {
      throw new Error("Could not get canvas context");
    }
    foregroundCtx = foregroundContext;
  }
  document.addEventListener("DOMContentLoaded", main);
})();

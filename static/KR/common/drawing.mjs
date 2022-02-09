export default class Drawing {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    drawImage(image) {
        this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawSprite(pos, spriteMap, spriteGeo, spriteIndex) {
        const from = {
            x: spriteGeo.w * (spriteIndex % spriteGeo.cols),
            y: spriteGeo.h * Math.floor(spriteIndex / spriteGeo.cols)
        };

        const to = {
            x: pos.x + (spriteGeo.relX ?? 0),
            y: pos.y + (spriteGeo.relY ?? 0),
        };

        this.ctx.drawImage(
            spriteMap,
            from.x, from.y, spriteGeo.w, spriteGeo.h,
            to.x, to.y, spriteGeo.w, spriteGeo.h
        );
    }

    drawText(pos, text, options) {
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.font = `bold ${options.fontSizePx}px Arial`;

        const pad = (options.pad ?? 2);
        const measure = this.ctx.measureText(text);
        const width = Math.max(measure.actualBoundingBoxRight + measure.actualBoundingBoxLeft + (2 * pad), options.minWidth ?? 0);
        const height = Math.max(measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + (2 * pad), options.minHeight ?? 0);

        // Containing Box
        const box = {
            x: Math.ceil(pos.x - (options.left ? 0 : width / 2) + (options.relX ?? 0)),
            y: pos.y - height + (options.relY ?? 0),
            w: width,
            h: height
        };

        this.drawBox(box, options);

        // Text itself
        this.ctx.fillStyle = options.textColor;
        this.ctx.fillText(
            text,
            box.x + measure.actualBoundingBoxLeft + pad,
            box.y + measure.actualBoundingBoxAscent + pad
        );
    }

    drawBox(box, options) {
        // Border
        if (options.borderColor) {
            this.ctx.strokeStyle = options.borderColor;
            this.ctx.strokeWidth = 2;
            this.ctx.strokeRect(box.x - 1, box.y - 1, box.w + 2, box.h + 2);
        }

        // Background
        if (options.backColor) {
            this.ctx.fillStyle = options.backColor;
            this.ctx.fillRect(box.x, box.y, box.w, box.h);
        }
    }

    drawTriangle(box, options) {
        this.ctx.beginPath();

        if(options.dir === "right") {
            this.ctx.moveTo(box.x, box.y);
            this.ctx.lineTo(box.x, box.y + box.h);
            this.ctx.lineTo(box.x + box.w, box.y + box.h / 2);
            this.ctx.lineTo(box.x, box.y);
        } else {
            this.ctx.moveTo(box.x + box.w, box.y);
            this.ctx.lineTo(box.x + box.w, box.y + box.h);
            this.ctx.lineTo(box.x, box.y + box.h / 2);
            this.ctx.lineTo(box.x + box.w, box.y);
        }

        if (options.backColor) {
            this.ctx.fillStyle = options.backColor;
            this.ctx.fill();
        }

        if (options.borderColor) {
            this.ctx.strokeStyle = options.borderColor;
            this.ctx.strokeWidth = 2;
            this.ctx.stroke();
        }
    }

    drawGradientCircle(center, options) {
        var r = {
            x: center.x + (options.relX ?? 0) - options.radius,
            y: center.y + (options.relY ?? 0) - options.radius,
            w: 2 * options.radius,
            h: 2 * options.radius
        };

        var grad = this.ctx.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 0, r.x + r.w / 2, r.y + r.h / 2, options.radius);
        grad.addColorStop(0, options.color);
        grad.addColorStop(1, 'transparent');

        if (options.mid) {
            grad.addColorStop(options.mid.at, options.mid.color);
        }

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(r.x, r.y, r.w, r.h);
    }
}
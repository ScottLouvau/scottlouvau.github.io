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
        const lines = text.split(/\r?\n/);
        const padX = (options.padX ?? options.pad ?? 2);
        const padY = (options.padY ?? options.pad ?? 2);

        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.font = `${options.fontWeight ?? ''} ${options.fontSizePx ?? "24"}px ${options.fontFace ?? 'Arial'}`;

        // Compute maximum width and total height
        //  Ignore actualBoundingBoxLeft to measure width including non-drawing characters (space)
        //  Ignore actualBoundingBoxDescent to position lines evenly, ignoring letters below the main alphabetic line ('y')
        let width = 0;
        let height = 0;
        let measures = [];
        for (const line of lines) {
            const measure = this.ctx.measureText(line);
            measures.push(measure);
            width = Math.max(width, /* measure.actualBoundingBoxLeft + */ measure.actualBoundingBoxRight + (2 * padX), options.minWidth ?? 0);
            height = Math.max(height, /* measure.actualBoundingBoxDescent + */ measure.actualBoundingBoxAscent + (2 * padY), options.minHeight ?? 0);
        }

        // Draw surrounding box
        const fullHeight = height * lines.length + padY;
        const box = {
            x: Math.ceil(pos.x - (options.left ? 0 : width / 2) + (options.relX ?? 0)),
            y: Math.ceil(pos.y - fullHeight + (options.relY ?? 0)),
            w: Math.ceil(width),
            h: Math.ceil(fullHeight)
        };

        this.drawBox(box, options);

        // Draw text lines
        let nextY = box.y;
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            const measure = measures[i];

            this.ctx.fillStyle = (options.highlightIndex === i ? options.highlightColor : options.textColor);
            this.ctx.fillText(
                line,
                Math.floor(box.x + /*(options.left ? 0 : measure.actualBoundingBoxLeft)*/ + padX),
                Math.floor(nextY + height)
            );

            nextY += height;
        }
    }

    drawBox(box, options) {
        const width = options.width ?? 2;

        // Border
        if (options.borderColor) {
            this.ctx.fillStyle = options.borderColor;
            this.ctx.fillRect(box.x - width, box.y - width, width, box.h + (2 * width));
            this.ctx.fillRect(box.x + box.w, box.y - width, width, box.h + (2 * width));
            this.ctx.fillRect(box.x - width, box.y - width, box.w + (2 * width), width);
            this.ctx.fillRect(box.x - width, box.y + box.h, box.w + (2 * width), width);
        }

        // Background
        if (options.backColor) {
            this.ctx.fillStyle = options.backColor;
            this.ctx.fillRect(box.x, box.y, box.w, box.h);
        }
    }

    drawTriangle(box, options) {
        this.ctx.beginPath();

        if (options.dir === "right") {
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
            this.ctx.lineWidth = options.width ?? 2;
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
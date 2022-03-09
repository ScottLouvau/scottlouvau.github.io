import Drawing from "../common/drawing.mjs";
import PlanParser from "../common/planParser.mjs";

import settings from "../data/settings.mjs";
import allPositions from "../data/positions.min.mjs";

export default class Animator {
    constructor(loadImage, targetCanvas, onDraw) {
        this.loadImage = loadImage;
        this.targetDrawing = new Drawing(targetCanvas);
        this.onDraw = onDraw;

        this.showControls = false;
        this.paused = false;
        this.drawUntil = 0;
    }

    async init(imageFormat) {
        if (!this.planParser) {
            imageFormat ??= "png";
            this.imageFormat = imageFormat;

            try {
                const [towerSprites, upgradeSprites] = await Promise.all([
                    this.loadImage(`../img/${imageFormat}/sprites/towers.${imageFormat}`),
                    this.loadImage(`../img/${imageFormat}/sprites/upgrades.${imageFormat}`)
                ]);

                this.towerSprites = towerSprites;
                this.upgradeSprites = upgradeSprites;
            }
            catch (error) {
                this.error = error;
            }

            this.planParser = new PlanParser();
        }
    }

    async parsePlan(planText, imageFormat) {
        try {
            await this.init(imageFormat);

            this.planText = planText;
            this.plan = this.planParser.parse(planText);
            this.positions = allPositions[this.plan.mapName];

            if (!this.positions) {
                this.error = `Map '${this.plan?.mapName}' is invalid.`;
            } else {
                this.map = await this.loadImage(`../img/${this.imageFormat}/maps/${this.plan.mapName}.${this.imageFormat}`);
            }
        }
        catch (error) {
            this.error = "Plan Errors:\n" + error;
        }

        this.drawWorld();

        return this.plan;
    }

    drawControlHints() {
        const can = this.targetDrawing.canvas;
        this.drawControlPane({ x: 0, y: 0, w: can.width * 1 / 4, h: can.height * 2 / 3 }, "prev");
        this.drawControlPane({ x: 0, y: can.height * 2 / 3, w: can.width * 1 / 4, h: can.height * 1 / 3 }, "start");

        this.drawControlPane({ x: can.width * 1 / 4, y: 0, w: can.width * 1 / 2, h: can.height }, (this.paused ? "play" : "pause"));

        this.drawControlPane({ x: can.width * 3 / 4, y: 0, w: can.width * 1 / 4, h: can.height * 2 / 3 }, "next");
        this.drawControlPane({ x: can.width * 3 / 4, y: can.height * 2 / 3, w: can.width * 1 / 4, h: can.height * 1 / 3 }, "end");
    }

    drawControlPane(box, command) {
        const can = this.targetDrawing.canvas;
        const ctx = this.targetDrawing.ctx;

        const h = can.height / 10;
        const w = (command === "play" ? h * 2 / 3 : h / 2);
        let r = { x: box.x + (box.w / 2) - w / 2, y: box.y + (box.h / 2) - h / 2, w: w, h: h };
        let bo = { backColor: "rgba(20, 20, 20, 0.3)", borderColor: "rgba(0, 0, 0, 1)" };
        let to = { borderColor: "#111", backColor: "#86C6F4", dir: (command === "start" || command === "prev" ? "left" : "right") };
        let shift = (to.dir === "left" ? -(r.w + 4) : (r.w + 4));

        this.targetDrawing.drawBox(box, bo);

        if (command === "pause") {
            r.w = (h / 4);
            this.targetDrawing.drawBox(r, to);
            r.x += (h / 2);
            this.targetDrawing.drawBox(r, to);
            return;
        }

        this.targetDrawing.drawTriangle(r, to);

        if (command !== "play") {
            r.x += shift;
            this.targetDrawing.drawTriangle(r, to);
        }

        if (command === "end") {
            r.x += shift;
            r.w = (h / 12);
            this.targetDrawing.drawBox(r, to);
        } else if (command === "start") {
            r.w = (h / 12);
            r.x -= r.w + 4;
            this.targetDrawing.drawBox(r, to);
        }
    }

    drawPlan() {
        // Show up to 25 steps; at least five after current if present, and the rest before.
        const end = Math.min(this.plan.steps.length, Math.max(this.drawUntil + 5, 20));
        const start = Math.max(0, end - 20);

        let text = "";
        if (start > 0) { text += "..."; }
        for (let i = start; i < end; ++i) {
            text += `${(i > 0 ? "\n" : "")}${i === this.drawUntil - 1 ? " " : ""}${this.plan.steps[i].text}`;
        }
        if (end < this.plan.steps.length) { text += "\n..."; }

        this.targetDrawing.drawText(settings.labels.plan, text, { ...settings.labels.plan, highlightIndex: (this.drawUntil - (start > 0 ? start : 1)) });
    }

    drawWorld() {
        if (this.error || this.plan?.errors?.length > 0) {
            this.targetDrawing.drawText(settings.labels.error, this.error ?? this.plan.errors.join("\n"), settings.labels.error);
            if (this.onDraw) { this.onDraw(); }
            return;
        }

        if (!this.plan) { return; }

        let world = { steps: [] };
        for (let i = 0; i < this.drawUntil; ++i) {
            this.planParser.apply(this.plan.steps[i], world);
        }

        // Map background
        this.targetDrawing.drawImage(this.map);

        // Draw plan
        this.drawPlan();

        // Current tower glow and step text
        const current = world.steps?.[world.steps?.length - 1 ?? 0];
        if (current) {
            this.targetDrawing.drawGradientCircle(current.position, settings.circles.glow);
            //this.targetDrawing.drawText(settings.labels.message, `${world.steps.length}. ${current.text}`, settings.labels.message);
        }

        // Tower sprites
        for (let posName in this.positions) {
            const pos = this.positions[posName];
            const state = world[posName];
            if (state) {
                this.targetDrawing.drawSprite(pos, this.towerSprites, settings.geo.tower, state.base.index);
            }
        }

        // Tower upgrades and position labels (on top of overlapping towers from below)
        for (let posName in this.positions) {
            const pos = this.positions[posName];
            const state = world[posName];
            if (state) {
                this.drawUpgrades(state);
            }

            this.targetDrawing.drawText(pos, posName, settings.labels.small);
        }

        // Show control hints, if requested
        if (this.showControls) {
            this.drawControlHints();
        }

        if (this.onDraw) { this.onDraw(); }
    }

    drawUpgrades(state) {
        const count = (state?.x ? 1 : 0) + (state?.y ? 1 : 0) + (state?.z ? 1 : 0);
        if (count === 0) { return; }

        const geo = settings.geo.upgrade;
        const pip = settings.circles.pip;

        // Each upgrade has the pips top, icon bottom, with padding
        let upgradeBox = {
            w: geo.w + geo.pad * 2,
            h: pip.radius * 2 + geo.h + geo.pad * 2
        };

        // Draw a shared box and border around all upgrades, with another left/right padding
        const sharedBox =
        {
            x: this.centerToLeft(state.position.x, upgradeBox.w, 0, count),
            y: state.position.y - 8,
            w: count * upgradeBox.w,
            h: upgradeBox.h
        };

        this.targetDrawing.drawBox(sharedBox, geo);

        upgradeBox.x = sharedBox.x;
        upgradeBox.y = sharedBox.y + geo.pad;

        let index = 0;
        if (state.x) { this.drawUpgrade(state.x, upgradeBox); upgradeBox.x += upgradeBox.w; }
        if (state.y) { this.drawUpgrade(state.y, upgradeBox); upgradeBox.x += upgradeBox.w; }
        if (state.z) { this.drawUpgrade(state.z, upgradeBox); upgradeBox.x += upgradeBox.w; }
    }

    drawUpgrade(upgrade, box) {
        const geo = settings.geo.upgrade;
        const pip = settings.circles.pip;

        // Upgrade Sprite
        this.targetDrawing.drawSprite({ x: box.x + geo.pad, y: box.y + pip.radius * 2 }, this.upgradeSprites, geo, upgrade.index);

        // Upgrade level pips
        let pipPos = { x: this.centerToLeft(box.x + box.w / 2, pip.radius * 2, 0, upgrade.level) + pip.radius, y: box.y + pip.radius };
        for (var i = 0; i < upgrade.level; ++i) {
            this.targetDrawing.drawGradientCircle(pipPos, settings.circles.pip);
            pipPos.x += pip.radius * 2;
        }
    }

    centerToLeft(center, width, index, count) {
        const totalWidth = width * count;
        const left = center - totalWidth / 2;
        return left + (index * width);
    }

    start() {
        this.drawUntil = 0;
        this.drawWorld();
    }

    prev() {
        this.drawUntil = Math.max(this.drawUntil - 1, 0);
        this.drawWorld();
    }

    next() {
        this.drawUntil = Math.min(this.drawUntil + 1, (this.plan?.steps?.length ?? 0));
        this.drawWorld();
    }

    end() {
        this.drawUntil = (this.plan?.steps?.length ?? 0);
        this.drawWorld();
    }

    isDone() {
        return (this.drawUntil >= (this.plan?.steps?.length ?? 0));
    }
};
export default class PlanParser {
    constructor(allPositions, towers) {
        this.allPositions = allPositions;
        this.towers = towers;
    }

    parse(planText) {
        const steps = planText.split(/\r?\n/);
        if (steps.length === 1) {
            return this.parseShort(planText);
        }

        const mapName = steps[0].split(' ')[0];
        const positions = this.allPositions[mapName];

        var result = { mapName: mapName, steps: [], errors: [] };
        var world = {};

        if (!positions) {
            result.errors.push(`Line 1: Unknown map name ${mapName}.`);
            return result;
        }

        var count = 1;
        for (var i = 1; i < steps.length; ++i) {
            var text = steps[i];
            if (text === '') { continue; }
            if (text.startsWith('#')) { continue; }

            var stepParts = text.split(' ');
            var positionName = stepParts[0].toUpperCase();
            var action = stepParts[1];

            var position = positions[positionName];
            if (!position) {
                result.errors.push(`Line ${i}: Unknown position ${positionName} on ${mapName}.`);
                continue;
            }

            var base = this.towers.base.find(t => t.ln === action);
            var upgrade = this.towers.upgrades.find(u => action.toLowerCase().startsWith(u.ln.toLowerCase()));

            if (!base && !upgrade) {
                result.errors.push(`Line ${i}: Unknown action ${action} at ${step.positionName} on ${mapName}.`);
                continue;
            }

            var previous = world[positionName];

            var step = {
                text: text,
                positionName: positionName,
                position: position,
                action: action
            };

            if (base) {
                step.base = base;
                step.shortAction = base.sn;

                if (previous) {
                    if (base.sn[0] !== previous.base.sn[0]) {
                        result.errors.push(`Line ${i}: Can't build ${action} on ${previous.base.ln} at ${step.positionName}.`);
                        continue;
                    }

                    if (base.sn[1] <= previous.base.sn[1]) {
                        result.errors.push(`Line ${i}: Tower downgrade ${action} on ${previous.base.ln} at ${step.positionName}.`);
                        continue;
                    }
                }
            }

            if (upgrade) {
                if (!previous) {
                    result.errors.push(`Line ${i}: Upgrade ${action} on nothing at ${step.positionName}.`);
                    continue;
                }

                var lastUpgradeOfType = previous[upgrade.sn];
                var newLevel = (parseInt(action.at(-1)) || (lastUpgradeOfType?.level ?? 0) + 1);

                if (upgrade.on !== previous.base.sn) {
                    result.errors.push(`Line ${i}: Upgrade ${action} not valid on tower ${previous.base.ln} at ${step.positionName}.`);
                    continue;
                }

                if (lastUpgradeOfType && newLevel <= lastUpgradeOfType.level) {
                    result.errors.push(`Line ${i}: Ability downgrade ${action} at ${step.positionName}.`);
                    continue;
                }

                step.upgrade = upgrade;
                step.shortAction = `${upgrade.sn}${newLevel}`;
                step[upgrade.sn] = { ...upgrade, level: newLevel };
            }

            this.apply(step, world);
            result.steps.push(step);
            count++;
        }

        return result;
    }

    parseShort(shortText) {
        let ctx = { text: shortText, i: 0 };

        this.parseLevel(ctx);
        while (ctx.i < ctx.text.length) {
            this.parseStep(ctx);
        }

        return ctx.result;
    }

    parseLevel(ctx) {
        this.require(ctx, "L", "Plan didn't start with map (ex: 'L26:').");
        const number = this.number(ctx);
        this.require(ctx, ":", "Plan must have ':' after map name (ex: 'L26:').");

        const mapName = `L${number}`;
        ctx.positions = this.allPositions[mapName];
        ctx.result = { mapName: mapName, steps: [], errors: [] };
        ctx.world = {};

        if (!ctx.positions) { throw `@${ctx.i}: Unknown map '${mapName}' at beginning of plan.`; }
    }

    parseStep(ctx) {
        const ii = ctx.i;
        const posName = (this.parsePosition(ctx) ?? ctx.lastPosition);
        const pos = ctx.positions[posName];
        if (!pos) { throw `@${ctx.i}: Unknown position ${posName}.`; }

        const previous = ctx.world[posName];
        const action = this.parseAction(ctx);

        let step = {
            positionName: posName,
            position: pos,
            action: action
        };

        if (action.base) {
            if (action.base.length === 2) {
                step.base = this.towers.base.find(t => t.sn === action.base);
            } else {
                step.base = this.towers.base.find(t => t.sn === `${action.base}${previous.base.sn[1] + 1}`);
            }

            step.shortAction = step.base.sn;
            step.text = `${posName} ${step.base.ln}`;
        } else if (action.upgrade) {
            const on = previous?.base?.sn;
            if (!on) { throw `@${ctx.i}: Upgrade '${action.upgrade}' built at ${posName} where there is no tower.` }

            step.upgrade = this.towers.upgrades.find(u => u.on === on && u.sn === action.upgrade);
            if(!step.upgrade) { throw `@${ctx.i}: Upgrade '${action.upgrade} is not valid on ${previous.base.ln} at ${posName}.`};

            let lastUpgradeOfType = previous[step.upgrade.sn];
            let newLevel = (action.level ?? (lastUpgradeOfType?.level + 1) ?? 1);
            step[step.upgrade.sn] = { ...step.upgrade, level: newLevel };

            step.shortAction = `${step.upgrade.sn}${newLevel}`;
            step.text = `${posName} ${step.upgrade.ln}${newLevel}`;
        }

        this.apply(step, ctx.world);
        ctx.result.steps.push(step);
        ctx.lastPosition = posName;
    }

    parsePosition(ctx) {
        if (ctx.i + 1 >= ctx.text.length) { return null; }

        const letter = ctx.text[ctx.i].toUpperCase();
        if (letter < 'A' || letter > 'H') { return null; }

        const digit = ctx.text[ctx.i + 1];
        if (digit < '0' || digit > '9') { return null; }

        ctx.i += 2;
        return `${letter}${digit}`;
    }

    parseAction(ctx) {
        if (ctx.i + 1 >= ctx.text.length) { return null; }

        const letter = ctx.text[ctx.i].toLowerCase();
        const digit = ctx.text[ctx.i + 1];
        if (letter >= 'p' && letter <= 't') {
            if (digit >= '1' && digit <= '5') {
                ctx.i += 2;
                return { base: `${letter}${digit}` };
            } else {
                ctx.i++;
                return { base: letter };
            }
        } else if (letter >= 'x' && letter <= 'z') {
            if (digit >= '1' && digit <= '3') {
                ctx.i += 2;
                return { upgrade: letter, level: digit };
            } else {
                ctx.i++;
                return { upgrade: letter };
            }
        } else {
            throw `@${ctx.i}: Unknown action ${letter}${digit}.`;
        }
    }

    require(ctx, value, error) {
        if (ctx.text[ctx.i++] !== value) { throw error; }
    }

    number(ctx) {
        let numberString = "";
        while (ctx.i < ctx.text.length) {
            const c = ctx.text[ctx.i];
            if (c < "0" || c > "9") { break; }
            numberString += c;
            ctx.i++;
        }

        return numberString;
    }

    toShortText(plan, spacer) {
        var result = `${plan.mapName}:`;
        spacer = spacer || "";

        var last = {};
        for (var i = 0; i < plan.steps.length; ++i) {
            var step = plan.steps[i];

            if (i !== 0) {
                result += spacer;
            }

            if (step.positionName !== last.positionName) {
                result += step.positionName;
            }

            result += step.shortAction;
            last = step;
        }

        return result;
    }

    apply(step, world) {
        if (!world.steps) { world.steps = []; }
        world.steps.push(step);

        world[step.positionName] = { ...world[step.positionName], ...step };
    }
}
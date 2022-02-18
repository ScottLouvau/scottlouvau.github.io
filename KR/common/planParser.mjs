import allPositions from "../data/positions.min.mjs";
import towers from "../data/towers.min.mjs";

export default class PlanParser {
    parse(planText) {
        const steps = planText.split(/\r?\n/);
        if (steps.length === 1) {
            return this.parseShort(planText);
        }

        let mapName = null;
        let positions = null;
        let result = { steps: [], errors: [] };
        let world = {};

        for (let i = 0; i < steps.length; ++i) {
            let text = steps[i];
            if (text === '') { continue; }
            if (text.startsWith('#')) { continue; }

            let stepParts = text.split(' ');
            let positionName = stepParts?.[0]?.toUpperCase();
            let action = stepParts?.[1]?.toLowerCase();

            if (!mapName) {
                mapName = positionName;
                positions = allPositions[mapName];
                result.mapName = mapName;

                if (!positions) {
                    result.errors.push(`Line ${i + 1}: Unknown map name ${mapName}.`);
                    return result;
                }

                continue;
            }

            if (!positionName || !action) {
                result.errors.push(`Line ${i + 1}: Did not have a position and action.`);
                continue;
            }

            let position = positions[positionName];
            if (!position) {
                result.errors.push(`Line ${i + 1}: Unknown position '${positionName}' on ${mapName}.`);
                continue;
            }

            let base = towers.base.find(t => t.ln.toLowerCase() === action);
            let upgrade = towers.upgrades.find(u => action.startsWith(u.ln.toLowerCase()));

            if (!base && !upgrade) {
                result.errors.push(`Line ${i + 1}: Unknown action '${action}' at ${positionName} on ${mapName}.`);
                continue;
            }

            let previous = world[positionName];

            let step = {
                text: text,
                positionName: positionName,
                position: position,
                action: stepParts[1]
            };

            if (base) {
                step.base = base;
                step.shortAction = base.sn;

                if (previous) {
                    if (base.sn[0] !== previous.base.sn[0]) {
                        result.errors.push(`Line ${i + 1}: Can't build ${base.ln} on ${previous.base.ln} at ${step.positionName}.`);
                        continue;
                    }

                    if (base.sn[1] <= previous.base.sn[1]) {
                        result.errors.push(`Line ${i + 1}: Tower downgrade ${base.ln} on ${previous.base.ln} at ${step.positionName}.`);
                        continue;
                    }
                }
            }

            if (upgrade) {
                if (!previous) {
                    result.errors.push(`Line ${i + 1}: Upgrade '${upgrade.ln}' on nothing at ${step.positionName}.`);
                    continue;
                }

                let lastUpgradeOfType = previous[upgrade.sn];
                let newLevel = (parseInt(action?.[action?.length - 1 ?? 0]) || (lastUpgradeOfType?.level ?? 0) + 1);

                if (upgrade.on !== previous.base.sn) {
                    result.errors.push(`Line ${i + 1}: There is no '${upgrade.ln}' upgrade for ${previous.base.ln} at ${step.positionName}.`);
                    continue;
                }

                if (lastUpgradeOfType && newLevel <= lastUpgradeOfType.level) {
                    result.errors.push(`Line ${i + 1}: Ability downgrade from '${upgrade.ln}${lastUpgradeOfType.level}' to '${upgrade.ln}${newLevel}' at ${step.positionName}.`);
                    continue;
                }

                if (newLevel > upgrade.cost.length) {
                    result.errors.push(`Line ${i + 1}: Ability upgrade to level ${newLevel} when '${upgrade.ln}' max level is ${upgrade.cost.length} at ${step.positionName}.`);
                    continue;
                }

                step.upgrade = upgrade;
                step.shortAction = `${upgrade.sn}${newLevel}`;
                step[upgrade.sn] = { ...upgrade, level: newLevel };
            }

            this.apply(step, world);
            result.steps.push(step);
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
        this.skipWhitespace(ctx);
        this.require(ctx, "L", "Plan didn't start with map (ex: 'L26').");
        const number = this.number(ctx);
        this.require(ctx, ":", "Plan must have ':' after map name (ex: 'L26:').");

        const mapName = `L${number}`;
        ctx.positions = allPositions[mapName];
        ctx.result = { mapName: mapName, steps: [], errors: [] };
        ctx.world = {};

        if (!ctx.positions) { throw `@${ctx.i}: Unknown map '${mapName}' at beginning of plan.`; }
    }

    parseStep(ctx) {
        this.skipWhitespace(ctx);
        const ii = ctx.i;
        const posName = (this.parsePosition(ctx) ?? ctx.lastPosition);
        if (!posName) { throw `@${ctx.i}: No position provided and no previous position to re-use.`; }
        const pos = ctx.positions[posName];
        if (!pos) { throw `@${ctx.i}: Unknown position '${posName}'.`; }

        this.skipWhitespace(ctx);
        const previous = ctx.world[posName];
        const on = previous?.base?.sn;
        const action = this.parseAction(ctx);
        if (!action) { throw `@${ctx.i}: Incomplete step at end of plan.`; }

        let step = {
            positionName: posName,
            position: pos,
            action: action
        };

        if (action.base) {
            if (action.base.length === 2) {
                step.base = towers.base.find(t => t.sn === action.base);
            } else {
                step.base = towers.base.find(t => t.sn === `${action.base}${(on ? +on[1] + 1 : 1)}`);
            }

            if (!step.base) { throw `@${ctx.i}: Invalid tower name/level '${action.base}' at ${step.positionName}.`; }

            if (on) {
                if (step.base.sn[0] !== on[0]) { throw `@${ctx.i}: Can't build ${step.base.ln} on ${previous.base.ln} at ${step.positionName}.`; }
                if (step.base.sn[1] <= on[1]) { throw `@${ctx.i}: Tower downgrade ${step.base.ln} on ${previous.base.ln} at ${step.positionName}.`; }
            }

            step.shortAction = step.base.sn;
            step.text = `${posName} ${step.base.ln}`;
        } else if (action.upgrade) {
            if (!on) { throw `@${ctx.i}: Upgrade '${action.upgrade}' on nothing at ${posName}.`; }

            step.upgrade = towers.upgrades.find(u => u.on === on && u.sn === action.upgrade);
            if (!step.upgrade) { throw `@${ctx.i}: There is no '${action.upgrade}' upgrade for ${previous.base.ln} at ${posName}.`; }

            let lastUpgradeOfType = previous[step.upgrade.sn];
            let newLevel = (action.level ?? ((lastUpgradeOfType?.level ?? 0) + 1));
            if (newLevel <= (lastUpgradeOfType?.level ?? 0)) { throw `@${ctx.i}: Ability downgrade from '${action.upgrade}${lastUpgradeOfType?.level}' to '${action.upgrade}${action.level}' at ${posName}.`; }
            if (newLevel > step.upgrade.cost.length) { throw `@${ctx.i}: Ability upgrade to level ${newLevel} when ${step.upgrade.ln} max level is ${step.upgrade.cost.length} at ${posName}.`; }

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
        if (ctx.i >= ctx.text.length) { return null; }

        const letter = ctx.text[ctx.i].toLowerCase();
        const digit = (ctx.i + 1 < ctx.text.length ? ctx.text[ctx.i + 1] : '');
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
        if (ctx.i >= ctx.text.length || ctx.text[ctx.i++].toUpperCase() !== value.toUpperCase()) { throw error; }
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

    skipWhitespace(ctx) {
        // Whitespace allowed before level, between steps, and between position and action.
        // '.' and ';' may also be used as whitespace-equivalent separators.
        while (ctx.i < ctx.text.length) {
            const c = ctx.text[ctx.i];
            if (c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n' && c !== '.' && c !== ';') {
                break;
            }

            ctx.i++;
        }
    }

    toShortText(plan, spacer) {
        let result = `${plan.mapName}:`;
        spacer = spacer || "";

        let last = {};
        for (let i = 0; i < plan.steps.length; ++i) {
            let step = plan.steps[i];

            if (i !== 0) {
                result += spacer;
            }

            if (step.positionName !== last.positionName) {
                result += step.positionName;
            }

            if (step.shortAction.endsWith('1')) {
                result += step.shortAction.slice(0, -1);
            } else {
                result += step.shortAction;
            }
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
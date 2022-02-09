export default class PlanParser {
    constructor(allPositions, towers) {
        this.allPositions = allPositions;
        this.towers = towers;
    }

    parse(planText) {
        const steps = planText.split(/\r?\n/);
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
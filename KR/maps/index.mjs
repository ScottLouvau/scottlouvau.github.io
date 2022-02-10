import plans from "../data/plans.mjs";

const tile = { w: 416, h: 234 };
const tileOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 14, 18, 19, 13, 15, 22, 20, 21, 23, 24, 25, 26];
const mapNames = [
    "Southport",
    "The Outskirts",
    "Pagras",
    "Twin River Pass",
    "Silveroak Forest",
    "The Citadel",
    "Coldstep Mines",
    "Icewind Pass",
    "Stormcloud Temple",
    "The Wastes",
    "Forsaken Valley",
    "The Dark Tower",
    "Sarelgaz's Lair",
    "Ruins of Acaroth",
    "Rotten Forest",
    "Hushwood",
    "Bandit's Lair",
    "Glacial Heights",
    "Ha'Kraj Plateau",
    "Pit of Fire",
    "Pandaemonium",
    "Fungal Forest",
    "Rotwick",
    "Ancient Necropolis",
    "Nightfang Swale",
    "Castle Blackburn"
];

async function loadMaps(sprite) {
    const div = document.createElement("div");
    div.id = "container";

    // Create a tile for each map *in spritesheet order*
    for (let i = 0; i < tileOrder.length; ++i) {
        const name = `L${tileOrder[i]}`;
        const title = `${name}: ${mapNames[tileOrder[i] - 1]}`;
        const spriteRow = Math.floor(i / 6);
        const spriteCol = i % 6;

        const item = document.createElement("a");
        item.className = "item";
        item.href = `../img/webp/maps/labelled/${name}.webp`;

        const img = document.createElement("canvas");
        img.width = tile.w;
        img.height = tile.h;
        img.title = title;
        img.className = "img";

        const ctx = img.getContext('2d');
        ctx.drawImage(sprite, tile.w * spriteCol, tile.h * spriteRow, tile.w, tile.h, 0, 0, tile.w, tile.h);
        item.appendChild(img);

        const label = document.createElement("figcaption");
        label.innerText = title;
        label.className = "caption";
        item.appendChild(label);

        const links = document.createElement("div");
        for (let mode of [{ n: "Camp", s: "" }, { n: "Heroic", s: "h" }, { n: "Iron", s: "i" }]) {
            const planText = plans[`${name}${mode.s}`];
            if (planText) {
                const link = document.createElement("a");
                link.href = `../animate/?p=${planText}`;
                link.text = mode.n;
                links.appendChild(link);
            }
        }
        label.appendChild(links);

        div.appendChild(item);
    }

    document.body.appendChild(div);
}

window.onload = async () => {
    const img = document.createElement("img");
    img.onload = () => loadMaps(img);
    img.src = `../img/webp/sprites/maps.webp`;
};
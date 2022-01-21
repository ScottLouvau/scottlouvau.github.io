async function loadMaps(height) {
    const maps = await (await fetch("./maps.json")).json();
    const div = document.createElement("div");
    div.id = "container";

    for (let name in maps) {
        const title = `${name}: ${maps[name].name}`;

        const item = document.createElement("a");
        item.className = "item";
        item.href = `./432p-labelled/${name}.png`;

        const img = document.createElement("img");
        img.src = `${height}p-labelled/${name}.png`;
        img.title = title;
        item.appendChild(img);

        const label = document.createElement("figcaption");
        label.innerText = title;
        item.appendChild(label);

        div.appendChild(item);
    }

    document.body.appendChild(div);
}

window.onload = async () => {
    //await loadMaps(144);
    await loadMaps(216);
};
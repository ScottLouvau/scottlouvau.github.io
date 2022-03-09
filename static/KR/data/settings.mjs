export default
{
    maps: { 
        count: 26, width: 1920, height: 1080, originalsFolder: "../../source-data/maps",
        crop: { x: 128, y: 60, w: 1664, h: 936 },
        tileOrder: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 14, 18, 19, 13, 15, 22, 20, 21, 23, 24, 25, 26],
    },
    labels: {
        small: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 24, relY: -16, pad: 3 },
        medium: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 36, relY: -12, pad: 3 },
        large: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 56, relY: 12, pad: 4 },
        message: { x: 148, y: 46, textColor: "#DDD", backColor: "#231C17", fontSizePx: 18, minWidth: 170, minHeight: 26 },
        plan: { x: 12, y: 1050, left: true, textColor: "#eee", borderColor: "#eee", backColor: "#222", highlightColor: "#fe0", fontFace: "monospace", fontSizePx: 20, padX: 6, padY: 4, minWidth: 120 },
        error: { x: 960, y: 720, textColor: "#f00", borderColor: "#e00", backColor: "#222", fontSizePx: 60, pad: 30 },
    },
    geo: {
        tower: { w: 160, h: 140, relX: -80, relY: -104, cols: 5 },
        upgrade: { w: 28, h: 26, pad: 1, cols: 3, backColor: "#24211d", borderColor: "#efeddc" },
        upgradeLarge: { w: 56, h: 52 },
        profile: { w: 80, h: 80, relX: -40, relY: -64 },
        towerDiagnostics: { w: 90, h: 90, relX: -45, relY: -69 }
    },
    circles: {
        glow: { radius: 120, relY: -20, color: "rgba(255, 215, 0, 0.8)", mid: { at: 0.3, color: "rgba(255, 215, 0, 0.6)"} },
        pip: { radius: 5, color: "rgba(26, 181, 255, 1)", mid: { at: 0.5, color: "rgba(26, 181, 255, 0.6)" } }
    },
    colors: {
        beige: { r: 221, g: 216, b: 179, length: 20, relX: 9, relY: 20 },
        black: { r: 25, g: 18, b: 14, length: 17, relX: -19, relY: -55 },
    },
    upgradeSourcePos: { x: 606, y: 554, w: 275, h: 275, map: "L14", pos: "B4"}
}
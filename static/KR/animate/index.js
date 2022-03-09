// ../common/drawing.mjs
var Drawing = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
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
      y: pos.y + (spriteGeo.relY ?? 0)
    };
    this.ctx.drawImage(spriteMap, from.x, from.y, spriteGeo.w, spriteGeo.h, to.x, to.y, spriteGeo.w, spriteGeo.h);
  }
  drawText(pos, text, options) {
    const lines = text.split(/\r?\n/);
    const padX = options.padX ?? options.pad ?? 2;
    const padY = options.padY ?? options.pad ?? 2;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.font = `${options.fontWeight ?? ""} ${options.fontSizePx ?? "24"}px ${options.fontFace ?? "Arial"}`;
    let width = 0;
    let height = 0;
    let measures = [];
    for (const line of lines) {
      const measure = this.ctx.measureText(line);
      measures.push(measure);
      width = Math.max(width, measure.actualBoundingBoxRight + 2 * padX, options.minWidth ?? 0);
      height = Math.max(height, measure.actualBoundingBoxAscent + 2 * padY, options.minHeight ?? 0);
    }
    const fullHeight = height * lines.length + padY;
    const box = {
      x: Math.ceil(pos.x - (options.left ? 0 : width / 2) + (options.relX ?? 0)),
      y: Math.ceil(pos.y - fullHeight + (options.relY ?? 0)),
      w: Math.ceil(width),
      h: Math.ceil(fullHeight)
    };
    this.drawBox(box, options);
    let nextY = box.y;
    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i];
      const measure = measures[i];
      this.ctx.fillStyle = options.highlightIndex === i ? options.highlightColor : options.textColor;
      this.ctx.fillText(line, Math.floor(box.x + +padX), Math.floor(nextY + height));
      nextY += height;
    }
  }
  drawBox(box, options) {
    const width = options.width ?? 2;
    if (options.borderColor) {
      this.ctx.fillStyle = options.borderColor;
      this.ctx.fillRect(box.x - width, box.y - width, width, box.h + 2 * width);
      this.ctx.fillRect(box.x + box.w, box.y - width, width, box.h + 2 * width);
      this.ctx.fillRect(box.x - width, box.y - width, box.w + 2 * width, width);
      this.ctx.fillRect(box.x - width, box.y + box.h, box.w + 2 * width, width);
    }
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
    grad.addColorStop(1, "transparent");
    if (options.mid) {
      grad.addColorStop(options.mid.at, options.mid.color);
    }
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(r.x, r.y, r.w, r.h);
  }
};

// ../data/positions.min.mjs
var positions_min_default = {
  L1: { A9: { x: 761, y: 340 }, A8: { x: 646, y: 380 }, B5: { x: 781, y: 559 }, C3: { x: 909, y: 660 }, B3: { x: 774, y: 662 }, E3: { x: 1166, y: 683 }, G1: { x: 1381, y: 792 }, D1: { x: 1024, y: 836 } },
  L2: { C9: { x: 1117, y: 259 }, A9: { x: 869, y: 282 }, C8: { x: 1116, y: 371 }, A6: { x: 771, y: 487 }, C3: { x: 1017, y: 664 }, A3: { x: 879, y: 693 }, C1: { x: 1033, y: 866 } },
  L3: { C9: { x: 943, y: 162 }, A9: { x: 808, y: 195 }, E7: { x: 1238, y: 324 }, D7: { x: 1076, y: 327 }, B7: { x: 924, y: 362 }, D5: { x: 1161, y: 504 }, B4: { x: 816, y: 594 }, C3: { x: 967, y: 655 }, D2: { x: 1110, y: 697 }, A1: { x: 697, y: 792 }, F1: { x: 1362, y: 829 }, B1: { x: 834, y: 844 } },
  L4: { D9: { x: 898, y: 236 }, E9: { x: 1042, y: 241 }, C9: { x: 763, y: 275 }, B8: { x: 682, y: 352 }, G7: { x: 1249, y: 394 }, B6: { x: 670, y: 456 }, G6: { x: 1310, y: 500 }, B5: { x: 711, y: 535 }, G4: { x: 1319, y: 617 }, A4: { x: 493, y: 632 }, G3: { x: 1220, y: 698 }, D3: { x: 916, y: 700 }, E3: { x: 1075, y: 712 }, H1: { x: 1384, y: 854 }, F1: { x: 1175, y: 885 } },
  L5: { E9: { x: 1021, y: 178 }, B8: { x: 636, y: 260 }, A7: { x: 514, y: 326 }, G7: { x: 1286, y: 348 }, E7: { x: 1013, y: 378 }, G6: { x: 1348, y: 416 }, C6: { x: 770, y: 437 }, D4: { x: 964, y: 589 }, F4: { x: 1186, y: 597 }, B3: { x: 667, y: 625 }, D3: { x: 951, y: 677 }, F3: { x: 1168, y: 690 }, F1: { x: 1135, y: 795 }, B1: { x: 750, y: 840 } },
  L6: { G9: { x: 1252, y: 221 }, A9: { x: 646, y: 223 }, C9: { x: 789, y: 223 }, E9: { x: 1116, y: 226 }, B7: { x: 664, y: 421 }, C7: { x: 806, y: 421 }, E7: { x: 1110, y: 421 }, F7: { x: 1251, y: 421 }, D4: { x: 957, y: 612 }, H4: { x: 1373, y: 612 }, C4: { x: 813, y: 615 }, E4: { x: 1096, y: 615 }, A4: { x: 533, y: 624 }, C1: { x: 789, y: 833 }, E1: { x: 1124, y: 833 } },
  L7: { A9: { x: 767, y: 340 }, B9: { x: 914, y: 341 }, C9: { x: 1062, y: 345 }, C5: { x: 1007, y: 563 }, B5: { x: 868, y: 567 }, D5: { x: 1151, y: 567 }, A5: { x: 727, y: 570 }, B1: { x: 886, y: 777 }, C1: { x: 1024, y: 777 }, D1: { x: 1161, y: 783 }, E1: { x: 1279, y: 835 } },
  L8: { E9: { x: 1024, y: 375 }, F9: { x: 1162, y: 378 }, G9: { x: 1301, y: 380 }, D5: { x: 936, y: 580 }, C5: { x: 799, y: 583 }, E5: { x: 1075, y: 586 }, A3: { x: 526, y: 698 }, G2: { x: 1249, y: 749 }, H2: { x: 1381, y: 749 }, D2: { x: 950, y: 785 }, C2: { x: 806, y: 787 }, D1: { x: 993, y: 861 } },
  L9: { D9: { x: 903, y: 205 }, E9: { x: 1047, y: 210 }, F9: { x: 1187, y: 216 }, B7: { x: 680, y: 371 }, C7: { x: 805, y: 411 }, D7: { x: 945, y: 411 }, E7: { x: 1085, y: 413 }, G5: { x: 1336, y: 549 }, D4: { x: 934, y: 625 }, E4: { x: 1073, y: 625 }, F4: { x: 1214, y: 625 }, G4: { x: 1356, y: 650 }, F1: { x: 1179, y: 832 }, E1: { x: 1027, y: 835 }, C1: { x: 878, y: 837 }, A1: { x: 518, y: 858 } },
  L10: { E8: { x: 1093, y: 311 }, F8: { x: 1229, y: 311 }, C7: { x: 810, y: 331 }, F6: { x: 1159, y: 410 }, E5: { x: 1079, y: 487 }, B4: { x: 733, y: 546 }, C4: { x: 867, y: 546 }, G3: { x: 1364, y: 569 }, E3: { x: 1061, y: 594 }, D2: { x: 943, y: 645 }, E1: { x: 1058, y: 718 }, H1: { x: 1377, y: 742 }, A1: { x: 536, y: 745 }, B1: { x: 674, y: 745 } },
  L11: { B9: { x: 788, y: 186 }, E9: { x: 1123, y: 186 }, D7: { x: 1030, y: 372 }, C7: { x: 877, y: 373 }, F7: { x: 1168, y: 383 }, B7: { x: 743, y: 387 }, F6: { x: 1284, y: 434 }, A6: { x: 630, y: 435 }, A5: { x: 602, y: 541 }, G5: { x: 1319, y: 542 }, A3: { x: 660, y: 635 }, F3: { x: 1253, y: 643 }, B3: { x: 785, y: 676 }, E3: { x: 1117, y: 679 }, D1: { x: 1021, y: 809 }, C1: { x: 888, y: 812 }, A1: { x: 569, y: 833 }, G1: { x: 1324, y: 843 } },
  L12: { A9: { x: 636, y: 317 }, F9: { x: 1294, y: 330 }, F8: { x: 1310, y: 427 }, F6: { x: 1290, y: 521 }, A6: { x: 706, y: 538 }, B6: { x: 853, y: 538 }, C6: { x: 992, y: 538 }, B2: { x: 792, y: 763 }, C2: { x: 931, y: 763 }, D2: { x: 1066, y: 763 }, E2: { x: 1203, y: 763 }, F2: { x: 1332, y: 767 }, G1: { x: 1395, y: 859 } },
  L13: { A8: { x: 622, y: 335 }, G7: { x: 1297, y: 373 }, B4: { x: 649, y: 532 }, A4: { x: 515, y: 534 }, E4: { x: 1085, y: 548 }, F4: { x: 1221, y: 565 }, D4: { x: 940, y: 566 }, H4: { x: 1356, y: 566 }, C2: { x: 865, y: 657 }, A1: { x: 611, y: 715 }, B1: { x: 747, y: 719 }, F1: { x: 1124, y: 750 }, G1: { x: 1262, y: 760 }, H1: { x: 1401, y: 767 } },
  L14: { B9: { x: 749, y: 303 }, A9: { x: 595, y: 306 }, C9: { x: 891, y: 311 }, F9: { x: 1225, y: 333 }, G9: { x: 1370, y: 335 }, B8: { x: 774, y: 396 }, C7: { x: 843, y: 484 }, A6: { x: 542, y: 504 }, G6: { x: 1348, y: 538 }, E5: { x: 1080, y: 631 }, B4: { x: 742, y: 700 }, C4: { x: 888, y: 700 }, E3: { x: 1023, y: 739 }, G3: { x: 1331, y: 743 }, F3: { x: 1176, y: 745 }, C1: { x: 826, y: 904 } },
  L15: { C9: { x: 903, y: 216 }, B9: { x: 767, y: 220 }, E9: { x: 1104, y: 278 }, G7: { x: 1388, y: 378 }, E7: { x: 1116, y: 403 }, C7: { x: 836, y: 434 }, B7: { x: 699, y: 437 }, H6: { x: 1439, y: 475 }, E5: { x: 1111, y: 535 }, B5: { x: 678, y: 555 }, A4: { x: 559, y: 594 }, D4: { x: 993, y: 659 }, F4: { x: 1166, y: 659 }, H2: { x: 1429, y: 747 }, B2: { x: 719, y: 776 }, G1: { x: 1356, y: 857 }, E1: { x: 1071, y: 888 } },
  L16: { G9: { x: 1300, y: 275 }, A9: { x: 529, y: 309 }, D7: { x: 900, y: 383 }, G7: { x: 1224, y: 383 }, A7: { x: 566, y: 403 }, E6: { x: 1009, y: 445 }, B6: { x: 660, y: 454 }, F5: { x: 1206, y: 501 }, E5: { x: 1069, y: 521 }, C4: { x: 840, y: 583 }, B3: { x: 644, y: 639 }, F2: { x: 1159, y: 701 }, E2: { x: 1024, y: 721 }, A1: { x: 495, y: 794 } },
  L17: { F9: { x: 1138, y: 172 }, C9: { x: 840, y: 181 }, C7: { x: 813, y: 372 }, D7: { x: 952, y: 372 }, E7: { x: 1093, y: 372 }, A7: { x: 522, y: 390 }, F4: { x: 1154, y: 566 }, C4: { x: 864, y: 574 }, A4: { x: 559, y: 601 }, C3: { x: 768, y: 659 }, F3: { x: 1151, y: 676 }, G3: { x: 1301, y: 683 }, E2: { x: 1051, y: 739 }, A1: { x: 564, y: 805 }, G1: { x: 1244, y: 863 } },
  L18: { C9: { x: 937, y: 335 }, D9: { x: 1076, y: 335 }, A9: { x: 792, y: 341 }, E6: { x: 1256, y: 541 }, D6: { x: 1079, y: 546 }, B6: { x: 902, y: 565 }, A4: { x: 674, y: 659 }, E4: { x: 1162, y: 663 }, F4: { x: 1339, y: 680 }, C2: { x: 957, y: 811 }, B1: { x: 824, y: 839 }, F1: { x: 1307, y: 888 } },
  L19: { F9: { x: 1170, y: 184 }, D9: { x: 1038, y: 224 }, C8: { x: 912, y: 274 }, A7: { x: 583, y: 338 }, F7: { x: 1266, y: 378 }, H7: { x: 1404, y: 394 }, B6: { x: 775, y: 410 }, E5: { x: 1092, y: 480 }, A4: { x: 560, y: 607 }, G4: { x: 1294, y: 625 }, C3: { x: 895, y: 638 }, H3: { x: 1426, y: 671 }, C2: { x: 809, y: 745 }, B1: { x: 702, y: 816 }, F1: { x: 1260, y: 846 } },
  L20: { F9: { x: 1151, y: 196 }, B8: { x: 605, y: 321 }, C7: { x: 765, y: 372 }, H7: { x: 1438, y: 386 }, G7: { x: 1301, y: 390 }, F6: { x: 1187, y: 445 }, A5: { x: 577, y: 531 }, D4: { x: 891, y: 573 }, B4: { x: 661, y: 610 }, C3: { x: 750, y: 687 }, A2: { x: 466, y: 746 }, G2: { x: 1196, y: 769 }, E2: { x: 1024, y: 770 }, C1: { x: 742, y: 854 } },
  L21: { F6: { x: 1199, y: 489 }, E6: { x: 1009, y: 496 }, B6: { x: 594, y: 497 }, A5: { x: 442, y: 546 }, H5: { x: 1443, y: 552 }, E5: { x: 1072, y: 574 }, C5: { x: 761, y: 577 }, G4: { x: 1317, y: 607 }, A3: { x: 552, y: 695 }, D2: { x: 916, y: 736 }, F2: { x: 1152, y: 742 }, H2: { x: 1507, y: 753 }, C1: { x: 744, y: 812 }, G1: { x: 1277, y: 818 }, E1: { x: 1009, y: 832 } },
  L22: { C9: { x: 730, y: 245 }, G9: { x: 1355, y: 289 }, E8: { x: 1059, y: 333 }, B8: { x: 657, y: 341 }, D8: { x: 936, y: 366 }, F8: { x: 1213, y: 366 }, H6: { x: 1421, y: 489 }, B5: { x: 602, y: 531 }, C5: { x: 805, y: 538 }, E5: { x: 1052, y: 544 }, B4: { x: 632, y: 643 }, F3: { x: 1245, y: 679 }, H3: { x: 1512, y: 693 }, D3: { x: 850, y: 695 }, F2: { x: 1125, y: 741 }, A2: { x: 445, y: 784 }, G1: { x: 1332, y: 873 }, C1: { x: 833, y: 884 } },
  L23: { G9: { x: 1307, y: 245 }, H9: { x: 1443, y: 296 }, B8: { x: 697, y: 319 }, G8: { x: 1280, y: 356 }, D8: { x: 909, y: 382 }, F6: { x: 1099, y: 487 }, B6: { x: 692, y: 517 }, G5: { x: 1335, y: 584 }, C4: { x: 788, y: 634 }, A4: { x: 497, y: 660 }, F3: { x: 1100, y: 728 }, B2: { x: 666, y: 788 }, D2: { x: 936, y: 788 }, F1: { x: 1201, y: 874 } },
  L24: { D9: { x: 943, y: 243 }, F9: { x: 1218, y: 297 }, B8: { x: 668, y: 366 }, H6: { x: 1395, y: 449 }, A6: { x: 452, y: 452 }, E6: { x: 1073, y: 466 }, D6: { x: 858, y: 490 }, B4: { x: 649, y: 577 }, C4: { x: 829, y: 642 }, F3: { x: 1137, y: 649 }, H3: { x: 1402, y: 649 }, D2: { x: 957, y: 714 }, H2: { x: 1519, y: 731 }, B1: { x: 644, y: 791 }, G1: { x: 1258, y: 844 } },
  L25: { H9: { x: 1408, y: 316 }, G8: { x: 1310, y: 380 }, F7: { x: 1232, y: 461 }, A6: { x: 615, y: 507 }, H6: { x: 1525, y: 517 }, D5: { x: 978, y: 577 }, C4: { x: 840, y: 629 }, F4: { x: 1246, y: 684 }, G3: { x: 1383, y: 715 }, A3: { x: 525, y: 718 }, A2: { x: 643, y: 761 }, D2: { x: 999, y: 808 }, G1: { x: 1341, y: 823 }, D1: { x: 905, y: 873 } },
  L26: { E9: { x: 990, y: 171 }, C9: { x: 720, y: 240 }, F7: { x: 1110, y: 366 }, E6: { x: 1002, y: 425 }, B6: { x: 583, y: 448 }, C6: { x: 739, y: 456 }, A6: { x: 428, y: 463 }, H5: { x: 1289, y: 510 }, E3: { x: 959, y: 645 }, B3: { x: 636, y: 667 }, A3: { x: 486, y: 684 }, F2: { x: 1055, y: 725 }, C2: { x: 727, y: 760 }, H1: { x: 1369, y: 799 }, E1: { x: 979, y: 854 } }
};

// ../data/towers.min.mjs
var towers_min_default = {
  base: [
    { ln: "Barr", sn: "p1", on: null, cost: 70, unlock: 1, index: 0 },
    { ln: "Barr2", sn: "p2", on: "p1", cost: 110, unlock: 2, index: 1 },
    { ln: "Barr3", sn: "p3", on: "p2", cost: 160, unlock: 4, index: 2 },
    { ln: "Holy", sn: "p4", on: "p3", cost: 230, unlock: 6, index: 3 },
    { ln: "Barb", sn: "p5", on: "p3", cost: 230, unlock: 8, index: 4 },
    { ln: "Arch", sn: "r1", on: null, cost: 70, unlock: 1, index: 5 },
    { ln: "Arch2", sn: "r2", on: "r1", cost: 110, unlock: 2, index: 6 },
    { ln: "Arch3", sn: "r3", on: "r2", cost: 160, unlock: 4, index: 7 },
    { ln: "Rang", sn: "r4", on: "r3", cost: 230, unlock: 5, index: 8 },
    { ln: "Musk", sn: "r5", on: "r3", cost: 230, unlock: 7, index: 9 },
    { ln: "Mage", sn: "s1", on: null, cost: 100, unlock: 1, index: 10 },
    { ln: "Mage2", sn: "s2", on: "s1", cost: 160, unlock: 2, index: 11 },
    { ln: "Mage3", sn: "s3", on: "s2", cost: 240, unlock: 4, index: 12 },
    { ln: "Arca", sn: "s4", on: "s3", cost: 300, unlock: 6, index: 13 },
    { ln: "Sorc", sn: "s5", on: "s3", cost: 300, unlock: 9, index: 14 },
    { ln: "Arti", sn: "t1", on: null, cost: 125, unlock: 1, index: 15 },
    { ln: "Arti2", sn: "t2", on: "t1", cost: 220, unlock: 2, index: 16 },
    { ln: "Arti3", sn: "t3", on: "t2", cost: 320, unlock: 4, index: 17 },
    { ln: "BigB", sn: "t4", on: "t3", cost: 400, unlock: 8, index: 18 },
    { ln: "Tesl", sn: "t5", on: "t3", cost: 375, unlock: 10, index: 19 }
  ],
  upgrades: [
    { ln: "Heal", sn: "x", on: "p4", cost: [150, 150, 150], index: 0 },
    { ln: "Shie", sn: "y", on: "p4", cost: [250], index: 1 },
    { ln: "HolS", sn: "z", on: "p4", cost: [220, 150, 150], index: 2 },
    { ln: "More", sn: "x", on: "p5", cost: [300, 100, 100], index: 3 },
    { ln: "Whir", sn: "y", on: "p5", cost: [150, 100, 100], index: 4 },
    { ln: "Thro", sn: "z", on: "p5", cost: [200, 100, 100], index: 5 },
    { ln: "Pois", sn: "x", on: "r4", cost: [250, 250, 250], index: 6 },
    { ln: "Wrat", sn: "y", on: "r4", cost: [300, 150, 150], index: 7 },
    { ln: "Snip", sn: "x", on: "r5", cost: [250, 250, 250], index: 9 },
    { ln: "Shra", sn: "y", on: "r5", cost: [300, 300, 300], index: 10 },
    { ln: "Deat", sn: "x", on: "s4", cost: [350, 200, 200], index: 12 },
    { ln: "Tele", sn: "y", on: "s4", cost: [300, 100, 100], index: 13 },
    { ln: "Poly", sn: "x", on: "s5", cost: [300, 150, 150], index: 15 },
    { ln: "Summ", sn: "y", on: "s5", cost: [350, 150, 150], index: 16 },
    { ln: "Drag", sn: "x", on: "t4", cost: [250, 100, 100], index: 18 },
    { ln: "Clus", sn: "y", on: "t4", cost: [250, 125, 125], index: 19 },
    { ln: "Supe", sn: "x", on: "t5", cost: [250, 250], index: 21 },
    { ln: "Over", sn: "y", on: "t5", cost: [250, 125, 125], index: 22 }
  ]
};

// ../common/planParser.mjs
var PlanParser = class {
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
      if (text === "") {
        continue;
      }
      if (text.startsWith("#")) {
        continue;
      }
      let stepParts = text.split(" ");
      let positionName = stepParts?.[0]?.toUpperCase();
      let action = stepParts?.[1]?.toLowerCase();
      if (!mapName) {
        mapName = positionName;
        positions = positions_min_default[mapName];
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
      let base = towers_min_default.base.find((t) => t.ln.toLowerCase() === action);
      let upgrade = towers_min_default.upgrades.find((u) => action.startsWith(u.ln.toLowerCase()));
      if (!base && !upgrade) {
        result.errors.push(`Line ${i + 1}: Unknown action '${action}' at ${positionName} on ${mapName}.`);
        continue;
      }
      let previous = world[positionName];
      let step = {
        text,
        positionName,
        position,
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
        let newLevel = parseInt(action?.[action?.length - 1]) || (lastUpgradeOfType?.level ?? 0) + 1;
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
    ctx.positions = positions_min_default[mapName];
    ctx.result = { mapName, steps: [], errors: [] };
    ctx.world = {};
    if (!ctx.positions) {
      throw `@${ctx.i}: Unknown map '${mapName}' at beginning of plan.`;
    }
  }
  parseStep(ctx) {
    this.skipWhitespace(ctx);
    const ii = ctx.i;
    const posName = this.parsePosition(ctx) ?? ctx.lastPosition;
    if (!posName) {
      throw `@${ctx.i}: No position provided and no previous position to re-use.`;
    }
    const pos = ctx.positions[posName];
    if (!pos) {
      throw `@${ctx.i}: Unknown position '${posName}'.`;
    }
    this.skipWhitespace(ctx);
    const previous = ctx.world[posName];
    const on = previous?.base?.sn;
    const action = this.parseAction(ctx);
    if (!action) {
      throw `@${ctx.i}: Incomplete step at end of plan.`;
    }
    let step = {
      positionName: posName,
      position: pos,
      action
    };
    if (action.base) {
      if (action.base.length === 2) {
        step.base = towers_min_default.base.find((t) => t.sn === action.base);
      } else {
        step.base = towers_min_default.base.find((t) => t.sn === `${action.base}${on ? +on[1] + 1 : 1}`);
      }
      if (!step.base) {
        throw `@${ctx.i}: Invalid tower name/level '${action.base}' at ${step.positionName}.`;
      }
      if (on) {
        if (step.base.sn[0] !== on[0]) {
          throw `@${ctx.i}: Can't build ${step.base.ln} on ${previous.base.ln} at ${step.positionName}.`;
        }
        if (step.base.sn[1] <= on[1]) {
          throw `@${ctx.i}: Tower downgrade ${step.base.ln} on ${previous.base.ln} at ${step.positionName}.`;
        }
      }
      step.shortAction = step.base.sn;
      step.text = `${posName} ${step.base.ln}`;
    } else if (action.upgrade) {
      if (!on) {
        throw `@${ctx.i}: Upgrade '${action.upgrade}' on nothing at ${posName}.`;
      }
      step.upgrade = towers_min_default.upgrades.find((u) => u.on === on && u.sn === action.upgrade);
      if (!step.upgrade) {
        throw `@${ctx.i}: There is no '${action.upgrade}' upgrade for ${previous.base.ln} at ${posName}.`;
      }
      let lastUpgradeOfType = previous[step.upgrade.sn];
      let newLevel = action.level ?? (lastUpgradeOfType?.level ?? 0) + 1;
      if (newLevel <= (lastUpgradeOfType?.level ?? 0)) {
        throw `@${ctx.i}: Ability downgrade from '${action.upgrade}${lastUpgradeOfType?.level}' to '${action.upgrade}${action.level}' at ${posName}.`;
      }
      if (newLevel > step.upgrade.cost.length) {
        throw `@${ctx.i}: Ability upgrade to level ${newLevel} when ${step.upgrade.ln} max level is ${step.upgrade.cost.length} at ${posName}.`;
      }
      step[step.upgrade.sn] = { ...step.upgrade, level: newLevel };
      step.shortAction = `${step.upgrade.sn}${newLevel}`;
      step.text = `${posName} ${step.upgrade.ln}${newLevel}`;
    }
    this.apply(step, ctx.world);
    ctx.result.steps.push(step);
    ctx.lastPosition = posName;
  }
  parsePosition(ctx) {
    if (ctx.i + 1 >= ctx.text.length) {
      return null;
    }
    const letter = ctx.text[ctx.i].toUpperCase();
    if (letter < "A" || letter > "H") {
      return null;
    }
    const digit = ctx.text[ctx.i + 1];
    if (digit < "0" || digit > "9") {
      return null;
    }
    ctx.i += 2;
    return `${letter}${digit}`;
  }
  parseAction(ctx) {
    if (ctx.i >= ctx.text.length) {
      return null;
    }
    const letter = ctx.text[ctx.i].toLowerCase();
    const digit = ctx.i + 1 < ctx.text.length ? ctx.text[ctx.i + 1] : "";
    if (letter >= "p" && letter <= "t") {
      if (digit >= "1" && digit <= "5") {
        ctx.i += 2;
        return { base: `${letter}${digit}` };
      } else {
        ctx.i++;
        return { base: letter };
      }
    } else if (letter >= "x" && letter <= "z") {
      if (digit >= "1" && digit <= "3") {
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
    if (ctx.i >= ctx.text.length || ctx.text[ctx.i++].toUpperCase() !== value.toUpperCase()) {
      throw error;
    }
  }
  number(ctx) {
    let numberString = "";
    while (ctx.i < ctx.text.length) {
      const c = ctx.text[ctx.i];
      if (c < "0" || c > "9") {
        break;
      }
      numberString += c;
      ctx.i++;
    }
    return numberString;
  }
  skipWhitespace(ctx) {
    while (ctx.i < ctx.text.length) {
      const c = ctx.text[ctx.i];
      if (c !== " " && c !== "	" && c !== "\r" && c !== "\n" && c !== "." && c !== ";") {
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
      if (step.shortAction.endsWith("1")) {
        result += step.shortAction.slice(0, -1);
      } else {
        result += step.shortAction;
      }
      last = step;
    }
    return result;
  }
  apply(step, world) {
    if (!world.steps) {
      world.steps = [];
    }
    world.steps.push(step);
    world[step.positionName] = { ...world[step.positionName], ...step };
  }
};

// ../data/settings.mjs
var settings_default = {
  maps: {
    count: 26,
    width: 1920,
    height: 1080,
    originalsFolder: "../../source-data/maps",
    crop: { x: 128, y: 60, w: 1664, h: 936 },
    tileOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 14, 18, 19, 13, 15, 22, 20, 21, 23, 24, 25, 26]
  },
  labels: {
    small: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 24, relY: -16, pad: 3 },
    medium: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 36, relY: -12, pad: 3 },
    large: { textColor: "#49463a", backColor: "#efeddc", borderColor: "#49463a", fontWeight: "bold", fontSizePx: 56, relY: 12, pad: 4 },
    message: { x: 148, y: 46, textColor: "#DDD", backColor: "#231C17", fontSizePx: 18, minWidth: 170, minHeight: 26 },
    plan: { x: 12, y: 1050, left: true, textColor: "#eee", borderColor: "#eee", backColor: "#222", highlightColor: "#fe0", fontFace: "monospace", fontSizePx: 20, padX: 6, padY: 4, minWidth: 120 },
    error: { x: 960, y: 720, textColor: "#f00", borderColor: "#e00", backColor: "#222", fontSizePx: 60, pad: 30 }
  },
  geo: {
    tower: { w: 160, h: 140, relX: -80, relY: -104, cols: 5 },
    upgrade: { w: 28, h: 26, pad: 1, cols: 3, backColor: "#24211d", borderColor: "#efeddc" },
    upgradeLarge: { w: 56, h: 52 },
    profile: { w: 80, h: 80, relX: -40, relY: -64 },
    towerDiagnostics: { w: 90, h: 90, relX: -45, relY: -69 }
  },
  circles: {
    glow: { radius: 120, relY: -20, color: "rgba(255, 215, 0, 0.8)", mid: { at: 0.3, color: "rgba(255, 215, 0, 0.6)" } },
    pip: { radius: 5, color: "rgba(26, 181, 255, 1)", mid: { at: 0.5, color: "rgba(26, 181, 255, 0.6)" } }
  },
  colors: {
    beige: { r: 221, g: 216, b: 179, length: 20, relX: 9, relY: 20 },
    black: { r: 25, g: 18, b: 14, length: 17, relX: -19, relY: -55 }
  },
  upgradeSourcePos: { x: 606, y: 554, w: 275, h: 275, map: "L14", pos: "B4" }
};

// ../common/animator.mjs
var Animator = class {
  constructor(loadImage2, targetCanvas, onDraw) {
    this.loadImage = loadImage2;
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
      } catch (error) {
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
      this.positions = positions_min_default[this.plan.mapName];
      if (!this.positions) {
        this.error = `Map '${this.plan?.mapName}' is invalid.`;
      } else {
        this.map = await this.loadImage(`../img/${this.imageFormat}/maps/${this.plan.mapName}.${this.imageFormat}`);
      }
    } catch (error) {
      this.error = "Plan Errors:\n" + error;
    }
    this.drawWorld();
    return this.plan;
  }
  drawControlHints() {
    const can = this.targetDrawing.canvas;
    this.drawControlPane({ x: 0, y: 0, w: can.width * 1 / 4, h: can.height * 2 / 3 }, "prev");
    this.drawControlPane({ x: 0, y: can.height * 2 / 3, w: can.width * 1 / 4, h: can.height * 1 / 3 }, "start");
    this.drawControlPane({ x: can.width * 1 / 4, y: 0, w: can.width * 1 / 2, h: can.height }, this.paused ? "play" : "pause");
    this.drawControlPane({ x: can.width * 3 / 4, y: 0, w: can.width * 1 / 4, h: can.height * 2 / 3 }, "next");
    this.drawControlPane({ x: can.width * 3 / 4, y: can.height * 2 / 3, w: can.width * 1 / 4, h: can.height * 1 / 3 }, "end");
  }
  drawControlPane(box, command) {
    const can = this.targetDrawing.canvas;
    const ctx = this.targetDrawing.ctx;
    const h = can.height / 10;
    const w = command === "play" ? h * 2 / 3 : h / 2;
    let r = { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - h / 2, w, h };
    let bo = { backColor: "rgba(20, 20, 20, 0.3)", borderColor: "rgba(0, 0, 0, 1)" };
    let to = { borderColor: "#111", backColor: "#86C6F4", dir: command === "start" || command === "prev" ? "left" : "right" };
    let shift = to.dir === "left" ? -(r.w + 4) : r.w + 4;
    this.targetDrawing.drawBox(box, bo);
    if (command === "pause") {
      r.w = h / 4;
      this.targetDrawing.drawBox(r, to);
      r.x += h / 2;
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
      r.w = h / 12;
      this.targetDrawing.drawBox(r, to);
    } else if (command === "start") {
      r.w = h / 12;
      r.x -= r.w + 4;
      this.targetDrawing.drawBox(r, to);
    }
  }
  drawPlan() {
    const end = Math.min(this.plan.steps.length, Math.max(this.drawUntil + 5, 20));
    const start = Math.max(0, end - 20);
    let text = "";
    if (start > 0) {
      text += "...";
    }
    for (let i = start; i < end; ++i) {
      text += `${i > 0 ? "\n" : ""}${i === this.drawUntil - 1 ? " " : ""}${this.plan.steps[i].text}`;
    }
    if (end < this.plan.steps.length) {
      text += "\n...";
    }
    this.targetDrawing.drawText(settings_default.labels.plan, text, { ...settings_default.labels.plan, highlightIndex: this.drawUntil - (start > 0 ? start : 1) });
  }
  drawWorld() {
    if (this.error || this.plan?.errors?.length > 0) {
      this.targetDrawing.drawText(settings_default.labels.error, this.error ?? this.plan.errors.join("\n"), settings_default.labels.error);
      if (this.onDraw) {
        this.onDraw();
      }
      return;
    }
    if (!this.plan) {
      return;
    }
    let world = { steps: [] };
    for (let i = 0; i < this.drawUntil; ++i) {
      this.planParser.apply(this.plan.steps[i], world);
    }
    this.targetDrawing.drawImage(this.map);
    this.drawPlan();
    const current = world.steps?.[world.steps?.length - 1];
    if (current) {
      this.targetDrawing.drawGradientCircle(current.position, settings_default.circles.glow);
    }
    for (let posName in this.positions) {
      const pos = this.positions[posName];
      const state = world[posName];
      if (state) {
        this.targetDrawing.drawSprite(pos, this.towerSprites, settings_default.geo.tower, state.base.index);
      }
    }
    for (let posName in this.positions) {
      const pos = this.positions[posName];
      const state = world[posName];
      if (state) {
        this.drawUpgrades(state);
      }
      this.targetDrawing.drawText(pos, posName, settings_default.labels.small);
    }
    if (this.showControls) {
      this.drawControlHints();
    }
    if (this.onDraw) {
      this.onDraw();
    }
  }
  drawUpgrades(state) {
    const count = (state?.x ? 1 : 0) + (state?.y ? 1 : 0) + (state?.z ? 1 : 0);
    if (count === 0) {
      return;
    }
    const geo = settings_default.geo.upgrade;
    const pip = settings_default.circles.pip;
    let upgradeBox = {
      w: geo.w + geo.pad * 2,
      h: pip.radius * 2 + geo.h + geo.pad * 2
    };
    const sharedBox = {
      x: this.centerToLeft(state.position.x, upgradeBox.w, 0, count),
      y: state.position.y - 8,
      w: count * upgradeBox.w,
      h: upgradeBox.h
    };
    this.targetDrawing.drawBox(sharedBox, geo);
    upgradeBox.x = sharedBox.x;
    upgradeBox.y = sharedBox.y + geo.pad;
    let index = 0;
    if (state.x) {
      this.drawUpgrade(state.x, upgradeBox);
      upgradeBox.x += upgradeBox.w;
    }
    if (state.y) {
      this.drawUpgrade(state.y, upgradeBox);
      upgradeBox.x += upgradeBox.w;
    }
    if (state.z) {
      this.drawUpgrade(state.z, upgradeBox);
      upgradeBox.x += upgradeBox.w;
    }
  }
  drawUpgrade(upgrade, box) {
    const geo = settings_default.geo.upgrade;
    const pip = settings_default.circles.pip;
    this.targetDrawing.drawSprite({ x: box.x + geo.pad, y: box.y + pip.radius * 2 }, this.upgradeSprites, geo, upgrade.index);
    let pipPos = { x: this.centerToLeft(box.x + box.w / 2, pip.radius * 2, 0, upgrade.level) + pip.radius, y: box.y + pip.radius };
    for (var i = 0; i < upgrade.level; ++i) {
      this.targetDrawing.drawGradientCircle(pipPos, settings_default.circles.pip);
      pipPos.x += pip.radius * 2;
    }
  }
  centerToLeft(center, width, index, count) {
    const totalWidth = width * count;
    const left = center - totalWidth / 2;
    return left + index * width;
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
    this.drawUntil = Math.min(this.drawUntil + 1, this.plan?.steps?.length ?? 0);
    this.drawWorld();
  }
  end() {
    this.drawUntil = this.plan?.steps?.length ?? 0;
    this.drawWorld();
  }
  isDone() {
    return this.drawUntil >= (this.plan?.steps?.length ?? 0);
  }
};

// index.js
async function loadImage(url) {
  const img = new Image();
  const loadPromise = new Promise((resolve, reject) => {
    img.onload = () => {
      resolve();
    };
    img.onerror = () => {
      reject(`Image '${url}' was invalid or not found.`);
    };
  });
  img.src = url;
  await loadPromise;
  return img;
}
var justEntered = false;
var animator = null;
async function run(planText) {
  if (animator === null) {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const outCanvas = document.getElementById("main");
    const drawOut = new Drawing(outCanvas);
    animator = new Animator(loadImage, canvas, () => {
      drawOut.drawImage(canvas);
    });
    outCanvas.addEventListener("mousemove", () => mouse(true));
    outCanvas.addEventListener("mouseleave", () => mouse(false));
    outCanvas.addEventListener("click", canvasClicked);
    document.getElementById("demo").addEventListener("click", async () => run("L5:G7t3E9p2E7r4xG6pE7y3G6p2E7x2"));
    document.addEventListener("keydown", keyDown);
    document.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    document.addEventListener("drop", onDrop);
  }
  if (planText !== null) {
    document.getElementById("main").style.display = "";
    document.getElementById("help-container").style.display = "none";
    await animator.parsePlan(planText, document.imageFormat);
    animator.paused = false;
    animator.start();
    animate();
    const params = new URLSearchParams(window.location.search);
    if (params.get("p") !== planText) {
      params.set("p", animator.planParser.toShortText(animator.plan));
      window.history.replaceState(null, null, `?${params.toString()}`);
    }
  }
}
function canvasClicked(e) {
  e.stopPropagation();
  const r = e.target.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  if (!justEntered) {
    if (x < 0.25) {
      if (y < 0.67) {
        animator.prev();
      } else {
        animator.start();
      }
    } else if (x > 0.75) {
      if (y < 0.67) {
        animator.next();
      } else {
        animator.end();
      }
    } else {
      togglePause();
    }
  }
}
var hideControlsTimer = null;
function mouse(enter) {
  if (animator.showControls !== enter) {
    animator.showControls = enter;
    animator.drawWorld();
    justEntered = true;
    setTimeout(() => justEntered = false, 50);
  }
  if (enter) {
    if (hideControlsTimer !== null) {
      clearTimeout(hideControlsTimer);
    }
    hideControlsTimer = setTimeout(() => mouse(false), 2500);
  }
}
function togglePause() {
  animator.paused = !animator.paused;
  if (animator.isDone()) {
    animator.start();
  }
  animate();
}
function animate() {
  if (animator.paused) {
    animator.drawWorld();
    return;
  }
  animator.next();
  if (animator.isDone()) {
    animator.paused = true;
    animator.drawWorld();
  } else {
    setTimeout(animate, 500);
  }
}
function keyDown(e) {
  if (e.keyCode === 36 || e.keyCode === 38) {
    animator.start();
  } else if (e.keyCode === 37) {
    animator.prev();
  } else if (e.keyCode === 32) {
    togglePause();
  } else if (e.keyCode === 39) {
    animator.next();
  } else if (e.keyCode === 35 || e.keyCode === 40) {
    animator.end();
  }
}
async function onDrop(e) {
  e.preventDefault();
  if (e.dataTransfer.items && e.dataTransfer.items.length >= 1) {
    let item = e.dataTransfer.items[0];
    if (item.kind === "file") {
      const file = item.getAsFile();
      const planText = await file.text();
      await run(planText);
    }
  }
}
export {
  run
};

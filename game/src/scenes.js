// Eagle Eye — scenes.js: the three hand-drawn scenes. Every picture is drawn
// procedurally with Canvas 2D — no image files, no network. Each scene is one
// draw function that renders two variants: variant 0 is the left picture,
// variant 1 is the right picture. The differences array lists, for each
// difference, where it lives (x, y, click radius) and what kind it is, so
// hit-testing and the "found" message never guess from pixels.

export const PANEL_W = 600;
export const PANEL_H = 440;

// --- small drawing helpers -------------------------------------------------

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function star(ctx, x, y, rOuter, rInner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x, y, 34 * scale, 20 * scale);
  ellipse(ctx, x - 24 * scale, y + 6 * scale, 24 * scale, 15 * scale);
  ellipse(ctx, x + 26 * scale, y + 6 * scale, 26 * scale, 16 * scale);
  ctx.fillRect(x - 34 * scale, y - 2 * scale, 68 * scale, 12 * scale);
}

// --- Scene 1: City Park ----------------------------------------------------

function drawPark(ctx, variant) {
  // Sky and grass.
  const sky = ctx.createLinearGradient(0, 0, 0, 290);
  sky.addColorStop(0, '#6fbdf2');
  sky.addColorStop(1, '#d6f0fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 292);
  ctx.fillStyle = '#69b84a';
  ctx.fillRect(0, 292, PANEL_W, PANEL_H - 292);
  ctx.fillStyle = '#5da83f';
  ctx.fillRect(0, 292, PANEL_W, 10);
  ctx.fillStyle = '#7cc65a';
  for (const [gx, gy] of [[30, 330], [210, 415], [560, 330], [90, 425], [330, 425]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 5, gy - 12);
    ctx.lineTo(gx + 10, gy);
    ctx.closePath();
    ctx.fill();
  }

  // Sun, top-left. Difference 1: a smiling face in the left picture only.
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 70, 60, 32);
  ctx.strokeStyle = '#f5b800';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(70 + Math.cos(a) * 40, 60 + Math.sin(a) * 40);
    ctx.lineTo(70 + Math.cos(a) * 50, 60 + Math.sin(a) * 50);
    ctx.stroke();
  }
  if (variant === 0) {
    ctx.fillStyle = '#7a5200';
    circle(ctx, 60, 54, 3.5);
    circle(ctx, 80, 54, 3.5);
    ctx.strokeStyle = '#7a5200';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(70, 62, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Clouds. Difference 2: the high cloud on the right is missing in picture B.
  cloud(ctx, 200, 72, 1);
  if (variant === 0) cloud(ctx, 420, 55, 0.85);
  cloud(ctx, 520, 150, 0.7);

  // Kite, upper right. Difference 7: the kite flies in picture A only.
  if (variant === 0) {
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.moveTo(520, 104);
    ctx.lineTo(544, 132);
    ctx.lineTo(520, 160);
    ctx.lineTo(496, 132);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.moveTo(520, 104);
    ctx.lineTo(544, 132);
    ctx.lineTo(520, 132);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(520, 160);
    ctx.quadraticCurveTo(528, 182, 520, 200);
    ctx.stroke();
    ctx.fillStyle = '#e84a4a';
    circle(ctx, 524, 178, 4);
    circle(ctx, 520, 196, 4);
  }

  // Winding path from the bottom to the bench.
  ctx.fillStyle = '#e8d3a1';
  ctx.beginPath();
  ctx.moveTo(300, 440);
  ctx.quadraticCurveTo(330, 380, 400, 340);
  ctx.quadraticCurveTo(430, 325, 440, 330);
  ctx.lineTo(470, 330);
  ctx.quadraticCurveTo(450, 350, 420, 380);
  ctx.quadraticCurveTo(380, 420, 360, 440);
  ctx.closePath();
  ctx.fill();

  // Big tree, left-center. Difference 3: a third apple in picture A only.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(138, 235, 24, 80);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(138, 235, 24, 14);
  ctx.fillStyle = '#3f9e3a';
  circle(ctx, 118, 218, 42);
  circle(ctx, 172, 200, 46);
  circle(ctx, 148, 176, 38);
  ctx.fillStyle = '#2f8a2e';
  circle(ctx, 138, 196, 26);
  ctx.fillStyle = '#e83a3a';
  circle(ctx, 128, 208, 8);
  circle(ctx, 150, 228, 8);
  if (variant === 0) circle(ctx, 168, 196, 8);
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(165, 188, 3, 8);

  // Bench, center-right. Difference 4: the middle back slat in picture A only.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(376, 316, 10, 44);
  ctx.fillRect(438, 316, 10, 44);
  ctx.fillStyle = '#a06a35';
  roundRect(ctx, 368, 306, 88, 12, 5);
  ctx.fillStyle = '#b07a42';
  roundRect(ctx, 370, 282, 84, 10, 5);
  if (variant === 0) roundRect(ctx, 370, 296, 84, 8, 4);
  roundRect(ctx, 370, 268, 84, 10, 5);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(372, 278, 8, 30);
  ctx.fillRect(444, 278, 8, 30);

  // Flower bed, bottom-left. Difference 5: the middle flower is red in A,
  // blue in B.
  const flowerSpots = [[60, 382], [100, 396], [140, 382]];
  flowerSpots.forEach(([fx, fy], i) => {
    ctx.strokeStyle = '#2f8a2e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 8);
    ctx.lineTo(fx, fy + 26);
    ctx.stroke();
    ctx.fillStyle = i === 1 ? (variant === 0 ? '#e83a3a' : '#3a7de8') : '#ff8fb3';
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
      circle(ctx, fx + Math.cos(a) * 9, fy + Math.sin(a) * 9, 6);
    }
    ctx.fillStyle = '#ffd93b';
    circle(ctx, fx, fy, 5);
  });

  // Pond, bottom-right. Difference 6: the duck swims in picture A only.
  ctx.fillStyle = '#4aa3df';
  ellipse(ctx, 480, 382, 72, 26);
  ctx.fillStyle = '#7cc0ec';
  ellipse(ctx, 480, 378, 60, 18);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 384);
  ctx.quadraticCurveTo(455, 378, 480, 384);
  ctx.stroke();
  if (variant === 0) {
    ctx.fillStyle = '#fff6c9';
    ellipse(ctx, 468, 376, 14, 10);
    circle(ctx, 480, 366, 8);
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(487, 364);
    ctx.lineTo(496, 367);
    ctx.lineTo(487, 370);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#222222';
    circle(ctx, 482, 364, 1.6);
  }

  // Dog sitting by the path. Difference 8: its red ball in picture A only.
  ctx.fillStyle = '#b07a42';
  ellipse(ctx, 330, 372, 18, 14);
  circle(ctx, 344, 352, 11);
  ctx.beginPath();
  ctx.moveTo(336, 344);
  ctx.lineTo(338, 334);
  ctx.lineTo(344, 342);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(350, 344);
  ctx.lineTo(352, 334);
  ctx.lineTo(356, 342);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 316, 384, 12, 5);
  if (variant === 0) {
    ctx.fillStyle = '#e83a3a';
    circle(ctx, 302, 388, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(302, 388, 10, -0.6, 0.9);
    ctx.stroke();
  }
}

const PARK_DIFFERENCES = [
  { id: 'sun-face', label: 'Sun face', x: 70, y: 60, r: 42, kind: 'detail' },
  { id: 'high-cloud', label: 'High cloud', x: 420, y: 55, r: 36, kind: 'missing' },
  { id: 'third-apple', label: 'Apple on the tree', x: 168, y: 196, r: 18, kind: 'missing' },
  { id: 'bench-slat', label: 'Bench slat', x: 412, y: 300, r: 26, kind: 'missing' },
  { id: 'flower-colour', label: 'Flower colour', x: 100, y: 396, r: 18, kind: 'colour' },
  { id: 'pond-duck', label: 'Duck on the pond', x: 468, y: 376, r: 24, kind: 'missing' },
  { id: 'kite', label: 'Kite in the sky', x: 520, y: 132, r: 32, kind: 'missing' },
  { id: 'dog-ball', label: 'Dog ball', x: 302, y: 388, r: 16, kind: 'missing' },
];

// --- Scene 2: Kitchen ------------------------------------------------------

function drawKitchen(ctx, variant) {
  // Wall and wooden floor.
  ctx.fillStyle = '#f7ead1';
  ctx.fillRect(0, 0, PANEL_W, 300);
  ctx.fillStyle = '#c89b6a';
  ctx.fillRect(0, 300, PANEL_W, PANEL_H - 300);
  ctx.strokeStyle = '#a87c4e';
  ctx.lineWidth = 2;
  for (const fy of [330, 360, 390, 420]) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(PANEL_W, fy);
    ctx.stroke();
  }
  ctx.fillStyle = '#e8d3a1';
  ctx.fillRect(0, 296, PANEL_W, 6);

  // Window, top-left, with curtains. Difference 1: the sun in the window
  // shines in picture A only.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 36, 36, 150, 124, 6);
  ctx.fillStyle = '#9fd8f2';
  ctx.fillRect(46, 46, 130, 104);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(106, 46, 8, 104);
  ctx.fillRect(46, 92, 130, 8);
  if (variant === 0) {
    ctx.fillStyle = '#ffd93b';
    circle(ctx, 76, 72, 16);
  }
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 140, 130, 22, 10);
  ctx.fillStyle = '#d94f4f';
  ctx.fillRect(28, 30, 22, 136);
  ctx.fillRect(178, 30, 22, 136);
  ctx.fillStyle = '#b03a3a';
  ctx.fillRect(28, 30, 22, 10);
  ctx.fillRect(178, 30, 22, 10);

  // Wall clock, top-center. Difference 2: the hands read 3:00 in A, 6:00 in B.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 300, 70, 32);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 70, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#222222';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    circle(ctx, 300 + Math.cos(a) * 26, 70 + Math.sin(a) * 26, 2);
  }
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 70);
  if (variant === 0) ctx.lineTo(318, 70);
  else ctx.lineTo(300, 88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 70);
  ctx.lineTo(300, 52);
  ctx.stroke();
  circle(ctx, 300, 70, 3);

  // Shelf with jars, left wall. Difference 8: the green jar in picture A only.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(30, 212, 130, 10);
  const jarColors = ['#d94f4f', '#3f9e3a', '#3a7de8'];
  jarColors.forEach((color, i) => {
    if (i === 1 && variant === 1) return;
    const jx = 48 + i * 42;
    ctx.fillStyle = color;
    roundRect(ctx, jx, 178, 28, 34, 6);
    ctx.fillStyle = '#f7ead1';
    ctx.fillRect(jx + 6, 172, 16, 6);
  });

  // Stove, center. Difference 3: the left pot wears its lid in picture A only.
  ctx.fillStyle = '#5a5f6a';
  roundRect(ctx, 220, 230, 170, 86, 8);
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(220, 230, 170, 14);
  ctx.fillStyle = '#22262e';
  circle(ctx, 265, 262, 26);
  circle(ctx, 345, 262, 26);
  ctx.fillStyle = '#c9ced6';
  circle(ctx, 265, 262, 18);
  circle(ctx, 345, 262, 18);
  // Left pot.
  ctx.fillStyle = '#d94f4f';
  roundRect(ctx, 238, 200, 54, 34, 6);
  if (variant === 0) {
    ctx.fillStyle = '#b03a3a';
    ellipse(ctx, 265, 200, 30, 7);
    circle(ctx, 265, 194, 4);
  }
  // Right pot with steam.
  ctx.fillStyle = '#3a7de8';
  roundRect(ctx, 318, 200, 54, 34, 6);
  ctx.strokeStyle = '#c9ced6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(336, 196);
  ctx.quadraticCurveTo(330, 182, 338, 172);
  ctx.moveTo(354, 196);
  ctx.quadraticCurveTo(360, 180, 352, 170);
  ctx.stroke();

  // Fridge, right. Difference 4: the red magnet is red in A, blue in B.
  ctx.fillStyle = '#dfe5ea';
  roundRect(ctx, 450, 88, 112, 214, 8);
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(450, 168);
  ctx.lineTo(562, 168);
  ctx.stroke();
  ctx.fillStyle = '#8a939e';
  roundRect(ctx, 458, 108, 10, 44, 4);
  roundRect(ctx, 458, 188, 10, 44, 4);
  ctx.fillStyle = variant === 0 ? '#e83a3a' : '#3a7de8';
  circle(ctx, 496, 140, 9);
  ctx.fillStyle = '#3f9e3a';
  circle(ctx, 524, 140, 9);
  ctx.fillStyle = '#ffc93c';
  circle(ctx, 510, 200, 9);
  ctx.fillStyle = '#7a8896';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.fillText('FRESH', 490, 250);

  // Kettle on the counter, right of the stove. Difference 7: steam rises
  // in picture A only.
  ctx.fillStyle = '#2b2f36';
  ctx.beginPath();
  ctx.moveTo(408, 296);
  ctx.lineTo(408, 262);
  ctx.quadraticCurveTo(408, 246, 426, 246);
  ctx.quadraticCurveTo(444, 246, 444, 262);
  ctx.lineTo(444, 296);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2f36';
  ctx.beginPath();
  ctx.moveTo(444, 268);
  ctx.lineTo(462, 258);
  ctx.lineTo(462, 272);
  ctx.lineTo(444, 280);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2b2f36';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(408, 262, 12, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
  if (variant === 0) {
    ctx.strokeStyle = '#c9ced6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(426, 242);
    ctx.quadraticCurveTo(420, 230, 428, 220);
    ctx.moveTo(436, 242);
    ctx.quadraticCurveTo(442, 228, 434, 218);
    ctx.stroke();
  }

  // Table with a fruit bowl, bottom-center. Difference 5: three apples in A,
  // two in B.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(212, 340, 176, 14);
  ctx.fillRect(226, 354, 12, 56);
  ctx.fillRect(362, 354, 12, 56);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(206, 330, 188, 12);
  ctx.fillStyle = '#3a7de8';
  ellipse(ctx, 300, 326, 46, 12);
  ctx.fillStyle = '#2f6fc2';
  ellipse(ctx, 300, 322, 40, 8);
  ctx.fillStyle = '#e83a3a';
  circle(ctx, 282, 314, 10);
  circle(ctx, 300, 310, 10);
  if (variant === 0) circle(ctx, 318, 314, 10);
  ctx.fillStyle = '#ff9f1c';
  circle(ctx, 330, 318, 8);

  // Cat asleep on the rug, bottom-left. Difference 6: the cat in picture A only.
  ctx.fillStyle = '#c98a4b';
  ellipse(ctx, 120, 366, 52, 14);
  if (variant === 0) {
    ctx.fillStyle = '#e89a4b';
    ellipse(ctx, 122, 352, 34, 18);
    circle(ctx, 152, 344, 13);
    ctx.beginPath();
    ctx.moveTo(144, 334);
    ctx.lineTo(146, 322);
    ctx.lineTo(152, 332);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(158, 334);
    ctx.lineTo(160, 322);
    ctx.lineTo(164, 332);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c98a4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(92, 356);
    ctx.quadraticCurveTo(76, 350, 80, 338);
    ctx.stroke();
    ctx.fillStyle = '#222222';
    circle(ctx, 156, 342, 1.8);
  }
}

const KITCHEN_DIFFERENCES = [
  { id: 'window-sun', label: 'Sun in the window', x: 76, y: 72, r: 26, kind: 'missing' },
  { id: 'clock-hands', label: 'Clock hands', x: 300, y: 70, r: 35, kind: 'detail' },
  { id: 'pot-lid', label: 'Pot lid', x: 265, y: 198, r: 22, kind: 'missing' },
  { id: 'fridge-magnet', label: 'Fridge magnet colour', x: 496, y: 140, r: 16, kind: 'colour' },
  { id: 'third-fruit', label: 'Apple in the bowl', x: 318, y: 314, r: 16, kind: 'missing' },
  { id: 'sleeping-cat', label: 'Sleeping cat', x: 122, y: 350, r: 32, kind: 'missing' },
  { id: 'kettle-steam', label: 'Kettle steam', x: 430, y: 230, r: 20, kind: 'missing' },
  { id: 'green-jar', label: 'Green jar on the shelf', x: 90, y: 195, r: 18, kind: 'missing' },
];

// --- Scene 3: Beach ---------------------------------------------------------

function drawBeach(ctx, variant) {
  // Sky, sea and sand.
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(1, '#dff6fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 200);
  ctx.fillStyle = '#2f8fd0';
  ctx.fillRect(0, 200, PANEL_W, 100);
  ctx.fillStyle = '#f2d492';
  ctx.fillRect(0, 300, PANEL_W, PANEL_H - 300);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (const wy of [222, 246, 272]) {
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 40) {
      ctx.quadraticCurveTo(x + 20, wy - 8, x + 40, wy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#e0bd6e';
  for (const [sx, sy] of [[60, 340], [180, 330], [420, 420], [540, 330], [300, 425]]) {
    circle(ctx, sx, sy, 3);
  }

  // Sun, top-right. Difference 1: sunglasses in picture A only.
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 520, 60, 34);
  ctx.strokeStyle = '#f5b800';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(520 + Math.cos(a) * 42, 60 + Math.sin(a) * 42);
    ctx.lineTo(520 + Math.cos(a) * 52, 60 + Math.sin(a) * 52);
    ctx.stroke();
  }
  if (variant === 0) {
    ctx.fillStyle = '#222222';
    roundRect(ctx, 498, 52, 18, 12, 5);
    roundRect(ctx, 524, 52, 18, 12, 5);
    ctx.fillRect(516, 56, 8, 3);
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(528, 68, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Clouds. Difference 2: the middle cloud in picture A only.
  cloud(ctx, 140, 62, 1);
  if (variant === 0) cloud(ctx, 350, 42, 0.8);
  cloud(ctx, 250, 120, 0.6);

  // Boat on the sea. Difference 8: the sail is white in A, red in B.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.moveTo(282, 248);
  ctx.lineTo(338, 248);
  ctx.lineTo(326, 262);
  ctx.lineTo(294, 262);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(308, 214, 4, 36);
  ctx.fillStyle = variant === 0 ? '#ffffff' : '#e84a4a';
  ctx.beginPath();
  ctx.moveTo(312, 216);
  ctx.lineTo(312, 246);
  ctx.lineTo(338, 246);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd93c';
  ctx.beginPath();
  ctx.moveTo(312, 224);
  ctx.lineTo(330, 224);
  ctx.lineTo(312, 232);
  ctx.closePath();
  ctx.fill();

  // Palm tree, left. Difference 3: three coconuts in A, two in B.
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(96, 330);
  ctx.quadraticCurveTo(84, 260, 70, 190);
  ctx.stroke();
  ctx.strokeStyle = '#3f9e3a';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  const fronds = [
    [70, 190, 20, 150], [70, 190, 120, 148], [70, 190, 70, 132],
    [70, 190, 30, 210], [70, 190, 112, 208],
  ];
  for (const [fx, fy, tx, ty] of fronds) {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo((fx + tx) / 2, fy - 18, tx, ty);
    ctx.stroke();
  }
  ctx.fillStyle = '#6b3a14';
  circle(ctx, 84, 192, 8);
  circle(ctx, 96, 200, 8);
  if (variant === 0) circle(ctx, 100, 186, 8);

  // Beach umbrella, center-right. Difference 4: red stripes in A, blue in B.
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(400, 330);
  ctx.lineTo(400, 250);
  ctx.stroke();
  const stripeColor = variant === 0 ? '#e84a4a' : '#3a7de8';
  ctx.fillStyle = stripeColor;
  ctx.beginPath();
  ctx.moveTo(400, 232);
  ctx.arc(400, 250, 62, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (const wedge of [[-46, -24], [-8, 14]]) {
    ctx.beginPath();
    ctx.moveTo(400, 232);
    ctx.arc(400, 250, 62, Math.PI + (wedge[0] / 62) * 1.35, Math.PI + (wedge[1] / 62) * 1.35);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = stripeColor;
  circle(ctx, 400, 230, 7);

  // Beach ball, left of the umbrella. Difference 5: the ball in picture A only.
  if (variant === 0) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, 250, 382, 26);
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.moveTo(250, 382);
    ctx.arc(250, 382, 26, -Math.PI / 2, Math.PI / 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a7de8';
    ctx.beginPath();
    ctx.moveTo(250, 382);
    ctx.arc(250, 382, 26, Math.PI / 6, Math.PI * 0.83);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd93c';
    ctx.beginPath();
    ctx.moveTo(250, 382);
    ctx.arc(250, 382, 26, Math.PI * 0.83, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 382, 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Starfish, bottom-left. Difference 7: the starfish in picture A only.
  if (variant === 0) {
    ctx.fillStyle = '#ff8c42';
    star(ctx, 180, 412, 20, 9, 5);
    ctx.fillStyle = '#e86a1e';
    circle(ctx, 180, 412, 4);
  }

  // Red bucket. Same in both pictures — a landmark, not a difference.
  ctx.fillStyle = '#e84a4a';
  ctx.beginPath();
  ctx.moveTo(322, 392);
  ctx.lineTo(358, 392);
  ctx.lineTo(352, 420);
  ctx.lineTo(328, 420);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b03a3a';
  ctx.fillRect(318, 388, 44, 7);
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(322, 392);
  ctx.quadraticCurveTo(340, 378, 358, 392);
  ctx.stroke();

  // Crab, bottom-right. Difference 6: the crab in picture A only.
  if (variant === 0) {
    ctx.fillStyle = '#e84a4a';
    ellipse(ctx, 520, 392, 20, 13);
    circle(ctx, 508, 380, 7);
    circle(ctx, 532, 380, 7);
    ctx.fillStyle = '#222222';
    circle(ctx, 508, 378, 2);
    circle(ctx, 532, 378, 2);
    ctx.strokeStyle = '#e84a4a';
    ctx.lineWidth = 4;
    for (const [lx, ly] of [[500, 396], [504, 404], [540, 396], [536, 404]]) {
      ctx.beginPath();
      ctx.moveTo(520, 394);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    }
    ctx.fillStyle = '#e84a4a';
    circle(ctx, 496, 384, 6);
    circle(ctx, 544, 384, 6);
  }
}

const BEACH_DIFFERENCES = [
  { id: 'sun-glasses', label: 'Sun sunglasses', x: 520, y: 60, r: 42, kind: 'detail' },
  { id: 'middle-cloud', label: 'Middle cloud', x: 350, y: 42, r: 32, kind: 'missing' },
  { id: 'third-coconut', label: 'Coconut on the palm', x: 100, y: 186, r: 15, kind: 'missing' },
  { id: 'umbrella-stripes', label: 'Umbrella stripes', x: 400, y: 262, r: 36, kind: 'colour' },
  { id: 'beach-ball', label: 'Beach ball', x: 250, y: 382, r: 28, kind: 'missing' },
  { id: 'crab', label: 'Crab on the sand', x: 520, y: 392, r: 26, kind: 'missing' },
  { id: 'starfish', label: 'Starfish on the sand', x: 180, y: 412, r: 20, kind: 'missing' },
  { id: 'boat-sail', label: 'Boat sail colour', x: 322, y: 232, r: 28, kind: 'colour' },
];

// --- The three scenes, in play order ----------------------------------------

export const SCENES = [
  {
    id: 'city-park',
    name: 'City Park',
    tagline: 'A sunny afternoon in the park',
    timeLimitSeconds: 180,
    differences: PARK_DIFFERENCES,
    draw: drawPark,
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    tagline: 'Something is cooking',
    timeLimitSeconds: 180,
    differences: KITCHEN_DIFFERENCES,
    draw: drawKitchen,
  },
  {
    id: 'beach',
    name: 'Beach',
    tagline: 'A day by the sea',
    timeLimitSeconds: 180,
    differences: BEACH_DIFFERENCES,
    draw: drawBeach,
  },
];

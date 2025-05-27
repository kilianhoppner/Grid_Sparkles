// === Constants ===
const SPACING = 30;
const WAVE_SPEED = 0.25;
const NOISE_AMOUNT = 120;
const MIN_SIZE = 1;
const MAX_SIZE = 28;
const SHIMMER_SPEED = 0.02;
const SHIMMER_MIN_OPACITY = 100;
const SHIMMER_MAX_OPACITY = 255;

// === Colors ===
let bgColor = '#040066';
let plusColor = '#0000FF';
let selectedColorBg = bgColor;
let selectedColorPlus = plusColor;

const colors = [
  '#040066', '#0000FF', '#00D4FF', '#00C167',
  '#D3BEEC', '#FFD81D', '#FF872A', '#FFFFFF'
];

let swatchButtonBg, swatchButtonPlus;
let swatchMenuBg, swatchMenuPlus;
let swatchElementsBg = [], swatchElementsPlus = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);

  createColorSwatch('bg', 20, 20);
  createColorSwatch('plus', 20, 70);
}

function draw() {
  background(bgColor);

  let cols = Math.floor(width / SPACING);
  let rows = Math.floor(height / SPACING);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      let x = col * SPACING;
      let y = row * SPACING;

      let yWaveCenter = height / 2
        + sin((col + frameCount * WAVE_SPEED) * 0.05) * 250
        + noise(col * 0.1, row * 0.1, frameCount * 0.01) * NOISE_AMOUNT - (NOISE_AMOUNT / 2);

      let distToWave = abs(y - yWaveCenter);
      let size = map(distToWave, 0, height, MAX_SIZE, MIN_SIZE);
      size = constrain(size, MIN_SIZE, MAX_SIZE);

      let alpha = map(
        sin(frameCount * SHIMMER_SPEED + row * 0.05 + col * 0.05),
        -1, 1,
        SHIMMER_MIN_OPACITY, SHIMMER_MAX_OPACITY
      );

      drawPlus(x, y, size, alpha);
    }
  }
}

function drawPlus(x, y, s, a) {
  let unit = s / 5;
  fill(red(plusColor), green(plusColor), blue(plusColor), a);

  beginShape();
  vertex(x - 2.5 * unit, y - 0.5 * unit);
  vertex(x - 0.5 * unit, y - 0.5 * unit);
  vertex(x - 0.5 * unit, y - 2.5 * unit);
  vertex(x + 0.5 * unit, y - 2.5 * unit);
  vertex(x + 0.5 * unit, y - 0.5 * unit);
  vertex(x + 2.5 * unit, y - 0.5 * unit);
  vertex(x + 2.5 * unit, y + 0.5 * unit);
  vertex(x + 0.5 * unit, y + 0.5 * unit);
  vertex(x + 0.5 * unit, y + 2.5 * unit);
  vertex(x - 0.5 * unit, y + 2.5 * unit);
  vertex(x - 0.5 * unit, y + 0.5 * unit);
  vertex(x - 2.5 * unit, y + 0.5 * unit);
  endShape(CLOSE);
}

function keyPressed() {
  if (key === 'e' || key === 'E') {
    exportToSVG();
  }
}

function exportToSVG() {
  let svg = [];
  let cols = Math.floor(width / SPACING);
  let rows = Math.floor(height / SPACING);

  svg.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${width}" height="${height}">`);
  svg.push(`<rect width="${width}" height="${height}" fill="${bgColor}" />`);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      let x = col * SPACING;
      let y = row * SPACING;

      let yWaveCenter = height / 2
        + sin((col + frameCount * WAVE_SPEED) * 0.05) * 250
        + noise(col * 0.1, row * 0.1, frameCount * 0.01) * NOISE_AMOUNT - (NOISE_AMOUNT / 2);

      let distToWave = abs(y - yWaveCenter);
      let size = map(distToWave, 0, height, MAX_SIZE, MIN_SIZE);
      size = constrain(size, MIN_SIZE, MAX_SIZE);

      let alpha = map(
        sin(frameCount * SHIMMER_SPEED + row * 0.05 + col * 0.05),
        -1, 1,
        SHIMMER_MIN_OPACITY, SHIMMER_MAX_OPACITY
      );
      let fillOpacity = (alpha / 255).toFixed(3);
      let unit = size / 5;

      let d = `
        M ${x - 2.5 * unit} ${y - 0.5 * unit}
        L ${x - 0.5 * unit} ${y - 0.5 * unit}
        L ${x - 0.5 * unit} ${y - 2.5 * unit}
        L ${x + 0.5 * unit} ${y - 2.5 * unit}
        L ${x + 0.5 * unit} ${y - 0.5 * unit}
        L ${x + 2.5 * unit} ${y - 0.5 * unit}
        L ${x + 2.5 * unit} ${y + 0.5 * unit}
        L ${x + 0.5 * unit} ${y + 0.5 * unit}
        L ${x + 0.5 * unit} ${y + 2.5 * unit}
        L ${x - 0.5 * unit} ${y + 2.5 * unit}
        L ${x - 0.5 * unit} ${y + 0.5 * unit}
        L ${x - 2.5 * unit} ${y + 0.5 * unit}
        Z
      `.trim();

      svg.push(`<path d="${d}" fill="${plusColor}" fill-opacity="${fillOpacity}" />`);
    }
  }

  svg.push('</svg>');

  let blob = new Blob([svg.join('\n')], { type: "image/svg+xml" });
  let url = URL.createObjectURL(blob);

  let link = document.createElement('a');
  link.href = url;
  link.download = 'grid_wave_export.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function createColorSwatch(type, posX, posY) {
  let selectedColor = type === 'bg' ? selectedColorBg : selectedColorPlus;
  let zIndex = type === 'bg' ? '10' : '5';

  let swatchButton = createDiv('')
    .style('width', '30px')
    .style('height', '30px')
    .style('border-radius', '50%')
    .style('background-color', selectedColor)
    .style('border', '2px solid #333')
    .style('cursor', 'pointer')
    .position(posX, posY);

  let swatchMenu = createDiv('')
    .style('position', 'absolute')
    .style('top', (posY + 40) + 'px')
    .style('left', posX + 'px')
    .style('background', '#eee')
    .style('padding', '8px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.2)')
    .style('grid-template-columns', 'repeat(4, 30px)')
    .style('gap', '8px')
    .style('z-index', zIndex)
    .style('display', 'none');

  let swatchElements = [];

  for (let col of colors) {
    let swatch = createDiv('')
      .style('width', '30px')
      .style('height', '30px')
      .style('border-radius', '50%')
      .style('background-color', col)
      .style('cursor', 'pointer')
      .style('border', col === selectedColor ? '2px solid red' : '2px solid #333');

    swatch.mousePressed(() => {
      if (type === 'bg') {
        bgColor = col;
        selectedColorBg = col;
        swatchButton.style('background-color', col);
        updateSwatchBorders(swatchElements, selectedColorBg);
      } else {
        plusColor = col;
        selectedColorPlus = col;
        swatchButton.style('background-color', col);
        updateSwatchBorders(swatchElements, selectedColorPlus);
      }
    });

    swatchMenu.child(swatch);
    swatchElements.push(swatch);
  }

  swatchButton.mousePressed(() => {
    if (type === 'bg') {
      swatchMenuPlus?.style('display', 'none');
    } else {
      swatchMenuBg?.style('display', 'none');
    }

    const isVisible = swatchMenu.style('display') !== 'none';
    swatchMenu.style('display', isVisible ? 'none' : 'grid');
  });

  swatchMenu.parent(document.body);

  if (type === 'bg') {
    swatchButtonBg = swatchButton;
    swatchMenuBg = swatchMenu;
    swatchElementsBg = swatchElements;
  } else {
    swatchButtonPlus = swatchButton;
    swatchMenuPlus = swatchMenu;
    swatchElementsPlus = swatchElements;
  }
}

function updateSwatchBorders(swatchList, selectedColor) {
  for (let swatch of swatchList) {
    const color = swatch.style('background-color');
    if (color === colorString(selectedColor)) {
      swatch.style('border', '2px solid red');
    } else {
      swatch.style('border', '2px solid #333');
    }
  }
}

function colorString(hex) {
  const c = color(hex);
  return `rgb(${red(c)}, ${green(c)}, ${blue(c)})`;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
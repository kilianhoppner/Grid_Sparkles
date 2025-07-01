// === Constants ===
const BASE_SPACING = 30;
const WAVE_SPEED = 0;
const NOISE_AMOUNT = 5.0;
const MIN_SIZE = 7;
const MAX_SIZE = 29;
const SHIMMER_MIN_OPACITY = 200;
const SHIMMER_MAX_OPACITY = 255;

// === Global grid wave parameters ===
const LARGE_WAVE_AMPLITUDE = 4;
const LARGE_WAVE_FREQUENCY = 500;
const LARGE_WAVE_RIPPLE_DENSITY = 0.000015; // Controls how many ripples span across the grid
const LARGE_WAVE_SPEED = 0.03;


// === Colors ===
let bgColor = '#0000FF';
let plusColor = '#FFFFFF';
let selectedColorBg = bgColor;
let selectedColorPlus = plusColor;

const colors = [
  '#040066', '#0000FF', '#00D4FF', '#00C167',
  '#D3BEEC', '#FFD81D', '#FF872A', '#FFFFFF'
];

let swatchButtonBg, swatchButtonPlus, svgButton;
let swatchMenuBg, swatchMenuPlus;
let swatchElementsBg = [], swatchElementsPlus = [];

let cols, rows, SPACING;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  calculateGrid();

  createColorSwatch('bg', 20, 20);
  createColorSwatch('plus', 70, 20);

  svgButton = createButton('SVG');
  svgButton.position(120, 20);
  svgButton.style('padding', '6px 12px');
  svgButton.style('background', '#fff');
  svgButton.style('border', '2px solid #333');
  svgButton.style('border-radius', '40px');
  svgButton.style('cursor', 'pointer');
  svgButton.style('font-size', '14px');
  svgButton.style('display', 'flex');
  svgButton.style('align-items', 'center');
  svgButton.style('justify-content', 'center');
  svgButton.mousePressed(exportToSVG);
  svgButton.mouseOver(() => svgButton.style('border', '2px solid red'));
  svgButton.mouseOut(() => svgButton.style('border', '2px solid #333'));
}

function calculateGrid() {
  cols = Math.floor(width / BASE_SPACING);
  rows = Math.floor(height / BASE_SPACING);
  SPACING = min(width / cols, height / rows); // Maintain equal spacing
}

function draw() {
  background(bgColor);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      let x = col * SPACING + SPACING / 2;
      let y = row * SPACING + SPACING / 2;

      // === Multi-directional wave phase ===
      let wavePhase = (x * 0.8 + y * 1.2 + sin(x * 0.002 + y * 0.002) * 100)
                    * LARGE_WAVE_FREQUENCY * LARGE_WAVE_RIPPLE_DENSITY
                    + frameCount * LARGE_WAVE_SPEED;
      let crest = sin(wavePhase);

      // === Apply y offset from crest ===
      let globalWaveOffset = crest * LARGE_WAVE_AMPLITUDE;
      y += globalWaveOffset;

      // === Optional: add vertical wiggle for natural motion
      let yWaveCenter = height / 2
        + sin((col + frameCount * WAVE_SPEED) * 0.05) * 250
        + noise(col * 0.1, row * 0.1, frameCount * 0.01) * NOISE_AMOUNT - (NOISE_AMOUNT / 2);

      let distToWave = abs(y - yWaveCenter);

      // === Size based on crest value
      let sizeFactor = map(crest, -1, 1, 0.85, 1.15);
      let size = map(distToWave, 0, height, MAX_SIZE, MIN_SIZE) * sizeFactor;
      size = constrain(size, MIN_SIZE, MAX_SIZE);

      // === Shimmer based on crest
      const SHIMMER_PHASE_OFFSET = PI / 4;
      let shimmerCrest = sin(wavePhase + SHIMMER_PHASE_OFFSET);
      let shimmerValue = pow(max(0, shimmerCrest), 2);
      let alpha = map(shimmerValue, 0, 1, SHIMMER_MIN_OPACITY, SHIMMER_MAX_OPACITY);

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
  svg.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
  svg.push(`<rect width="100%" height="100%" fill="${bgColor}" />`);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      let x = col * SPACING + SPACING / 2;
      let y = row * SPACING + SPACING / 2;

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

      svg.push(`<path d="M ${x - 2.5 * unit} ${y - 0.5 * unit} L ${x - 0.5 * unit} ${y - 0.5 * unit} L ${x - 0.5 * unit} ${y - 2.5 * unit} L ${x + 0.5 * unit} ${y - 2.5 * unit} L ${x + 0.5 * unit} ${y - 0.5 * unit} L ${x + 2.5 * unit} ${y - 0.5 * unit} L ${x + 2.5 * unit} ${y + 0.5 * unit} L ${x + 0.5 * unit} ${y + 0.5 * unit} L ${x + 0.5 * unit} ${y + 2.5 * unit} L ${x - 0.5 * unit} ${y + 2.5 * unit} L ${x - 0.5 * unit} ${y + 0.5 * unit} L ${x - 2.5 * unit} ${y + 0.5 * unit} Z" fill="${plusColor}" fill-opacity="${fillOpacity}" />`);
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

  swatchButton.mouseOver(() => swatchButton.style('border', '2px solid red'));
  swatchButton.mouseOut(() => swatchButton.style('border', '2px solid #333'));

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

    swatch.mouseOver(() => swatch.style('border', '2px solid red'));
    swatch.mouseOut(() => {
      const color = swatch.style('background-color');
      swatch.style('border', color === colorString(selectedColor) ? '2px solid red' : '2px solid #333');
    });

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
    if (type === 'bg') swatchMenuPlus?.style('display', 'none');
    else swatchMenuBg?.style('display', 'none');

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
    swatch.style('border', color === colorString(selectedColor) ? '2px solid red' : '2px solid #333');
  }
}

function colorString(hex) {
  const c = color(hex);
  return `rgb(${red(c)}, ${green(c)}, ${blue(c)})`;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateGrid();
}
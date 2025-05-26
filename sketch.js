let spacing = 30;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
}

function draw() {
  background(4, 15, 40); // dark background for glowing effect
  fill(0, 0, 255); // bright blue plus signs

  let cols = Math.floor(width / spacing);
  let rows = Math.floor(height / spacing);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      let x = col * spacing;
      let y = row * spacing;

      // Distance from horizontal wave center
      let yWaveCenter = height / 2
      + sin((col + frameCount * 0.25) * 0.05) * 250
      + noise(col * 0.1, row * 0.1, frameCount * 0.01) * 120 - 60;

      // Distance falloff — max size at center, smaller away from it
      let distToWave = abs(y - yWaveCenter);
      let size = map(distToWave, 0, height / 1, 25.3, 1);
      size = constrain(size,0.5, 50);

      drawPlus(x, y, size);
    }
  }
}

function drawPlus(x, y, s) {
  let barThickness = s / 4;
  let barLength = s;

  rect(x, y, barThickness, barLength);
  rect(x, y, barLength, barThickness);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
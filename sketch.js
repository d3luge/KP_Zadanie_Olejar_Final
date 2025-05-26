let cellSize = 15;
let cols, rows;
let speed = 5;
let grid = [];
let nextGrid = [];
let isRunning = false;
let aliveCount = [];
let initialGrid = [];
let initialAliveCount = [];
let topMargin = 0; // Will be set dynamically
let savedPattern = [];
let savedAliveCount = [];
let buttons = [];
let cellSizeSlider;
let bottomMargin = 45;
let sliderLabel;
let hueSlider;
let gridHue = 0;
let hueLabel;
let blurSlider;
let blurLabel;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Place pattern buttons after the main control buttons
  const buttonConfigs = [
    { label: 'Reset to Initial State', callback: resetToInitialState },
    { label: 'Start/Stop', callback: toggleSimulation },
    { label: 'Clear Board', callback: clearBoard },
    { label: 'Show +100 Generations', callback: showFutureGrid },
    { label: 'Save Current Pattern', callback: saveCurrentPattern },
    { label: 'Generate Saved Pattern', callback: generateSavedPattern },
    // Pattern buttons below
    { label: 'Add Glider', callback: addGliderPattern },
    { label: 'Add Fish', callback: addFishPattern },
    { label: 'Add Flower', callback: addFlowerPattern },
    { label: 'Add Goblin', callback: generateGoblin },
    { label: 'Add Spoon', callback: generateSpoon }
  ];

  cellSizeSlider = createSlider(5, 25, cellSize, 1);
  cellSizeSlider.position(windowWidth / 2 - windowWidth / 4, windowHeight - 40); // Place it below the buttons
  cellSizeSlider.style('width', '120px');

  sliderLabel = createP('Grid size:'); // assign to global
  sliderLabel.position(cellSizeSlider.x, cellSizeSlider.y - 30);
  sliderLabel.style('color', '#fff');
  sliderLabel.style('font-size', '16px');

  colorMode(HSB, 360, 100, 100); // Use HSB for easy hue changes

  hueSlider = createSlider(0, 360, gridHue, 1);
  hueSlider.position(windowWidth / 2 + windowWidth / 10, windowHeight - 40); // Top right corner
  hueSlider.style('width', '120px');

  hueLabel = createP('Grid hue:');
  hueLabel.position(hueSlider.x, hueSlider.y - 30);
  hueLabel.style('color', '#fff');
  hueLabel.style('font-size', '16px');

  blurSlider = createSlider(0, 8, 0, 1); // 0=no blur, up to 8=strong blur
  blurSlider.position(windowWidth / 2 - 60, windowHeight - 40);
  blurSlider.style('width', '120px');

  blurLabel = createP('Blur/Edge:');
  blurLabel.position(blurSlider.x, blurSlider.y - 30);
  blurLabel.style('color', '#fff');
  blurLabel.style('font-size', '16px');

  // Remove any previously created buttons (for hot reloads)
  for (let btn of buttons) btn.remove();
  buttons = [];

  // Create and store buttons
  for (let i = 0; i < buttonConfigs.length; i++) {
    let btn = createButton(buttonConfigs[i].label);
    btn.mousePressed(buttonConfigs[i].callback);
    buttons.push(btn);
  }

  positionButtons();
  updateGridSize();
  frameRate(speed);
}

function positionButtons() {
  // Responsive layout: buttons in rows, wrapping as needed
  const buttonWidth = 170;
  const buttonHeight = 32;
  const margin = 10;
  const patternButtonCount = 6; // Number of pattern buttons at the top
  const extraGap = 24; // Extra vertical gap after pattern buttons

  let x = margin;
  let y = margin;
  let maxY = 0;

  for (let i = 0; i < buttons.length; i++) {
    // Insert extra vertical gap after pattern buttons
    if (i === patternButtonCount) {
      x = margin;
      y += buttonHeight + margin + extraGap;
    }

    buttons[i].size(buttonWidth, buttonHeight);
    if (x + buttonWidth + margin > windowWidth) {
      x = margin;
      y += buttonHeight + margin;
    }
    buttons[i].position(x, y);
    x += buttonWidth + margin;
    maxY = y + buttonHeight;
  }
  topMargin = maxY + margin +10; // Set topMargin based on button area
}

function updateGridSize() {
  cols = floor(width / cellSize);
  rows = floor((height - topMargin - bottomMargin) / cellSize);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButtons();
  updateGridSize();
  cellSizeSlider.position(windowWidth / 2 - windowWidth / 4, windowHeight - 40);
  sliderLabel.position(cellSizeSlider.x, cellSizeSlider.y - 30);

  hueSlider.position(windowWidth / 2 + windowWidth / 10, windowHeight - 40);
  hueLabel.position(hueSlider.x, hueSlider.y - 30);

  blurSlider.position(windowWidth / 2 -60 , windowHeight - 40);
  blurLabel.position(blurSlider.x, blurSlider.y - 30);
  // Optionally, you can reinitialize grid here if you want to clear on resize
}

function draw() {
  
  gridHue = hueSlider.value();

  let newCellSize = cellSizeSlider.value();
  if (newCellSize !== cellSize) {
    cellSize = newCellSize;
    updateGridSize();
  }
  // Create the grid if it doesn't exist
  if (grid.length !== cols || grid[0]?.length !== rows) {
    grid = [];
    nextGrid = [];
    aliveCount = [];
    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      nextGrid[i] = [];
      aliveCount[i] = [];
      for (let j = 0; j < rows; j++) {
        grid[i][j] = 0;
        nextGrid[i][j] = 0;
        aliveCount[i][j] = 0;
      }
    }
  }

  background(220);

  // Draw black background for the top margin
  noStroke();
  fill(20);
  rect(0, 0, width, topMargin);

  noStroke();
  fill(20);
  rect(0, height - bottomMargin, width, bottomMargin);

  // Draw the grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        let intensity = map(aliveCount[i][j], 0, 10, 180, 40);
        fill(gridHue, 80, intensity);
      } else {
        let intensity = map(aliveCount[i][j], 0, 10, 30, 200);
        fill(intensity, gridHue, intensity);
      }
      stroke(0, 40, 80);
      rect(i * cellSize, j * cellSize + topMargin, cellSize, cellSize);
    }
  }

  let blurAmount = blurSlider.value();
  if (blurAmount > 0) {
    filter(BLUR, blurAmount);
    filter(POSTERIZE, 4);
  }

  if (isRunning) {
    nextGeneration();
  }
}

function mousePressed() {
  let x = floor(mouseX / cellSize);
  let y = floor((mouseY - topMargin) / cellSize);
  if (
    x >= 0 && x < cols &&
    y >= 0 && y < rows &&
    mouseY > topMargin
  ) {
    grid[x][y] = (grid[x][y] + 1) % 2;
  }
}

function nextGeneration() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(i, j);
      if (state === 0 && neighbors === 3) {
        nextGrid[i][j] = 1;
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[i][j] = 0;
      } else {
        nextGrid[i][j] = state;
      }

      if (nextGrid[i][j] === 1) {
        aliveCount[i][j]++;
      } else {
        aliveCount[i][j] = max(0, aliveCount[i][j] - 0.1);
      }
    }
  }

  // Copy nextGrid to grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = nextGrid[i][j];
    }
  }
}

function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}

function simulateGenerations(numGenerations) {
  let tempGrid = JSON.parse(JSON.stringify(grid));
  let tempNextGrid = JSON.parse(JSON.stringify(nextGrid));
  let tempAliveCount = JSON.parse(JSON.stringify(aliveCount));

  for (let gen = 0; gen < numGenerations; gen++) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = tempGrid[i][j];
        let neighbors = countNeighborsTemp(tempGrid, i, j);
        if (state === 0 && neighbors === 3) {
          tempNextGrid[i][j] = 1;
        } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
          tempNextGrid[i][j] = 0;
        } else {
          tempNextGrid[i][j] = state;
        }

        if (tempNextGrid[i][j] === 1) {
          tempAliveCount[i][j]++;
        } else {
          tempAliveCount[i][j] = max(0, tempAliveCount[i][j] - 0.1);
        }
      }
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        tempGrid[i][j] = tempNextGrid[i][j];
      }
    }
  }

  aliveCount = tempAliveCount;
  return tempGrid;
}

function countNeighborsTemp(tempGrid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += tempGrid[col][row];
    }
  }
  return sum;
}

// Pattern functions
function addGliderPattern() {
  let x = floor(cols / 2) - 1;
  let y = floor(rows / 2) - 1;
  if (x + 2 < cols && y + 2 < rows && x >= 0 && y >= 0) {
    grid[x][y + 1] = 1;
    grid[x + 1][y + 2] = 1;
    grid[x + 2][y] = 1;
    grid[x + 2][y + 1] = 1;
    grid[x + 2][y + 2] = 1;
  }
}

function addFlowerPattern() {
  let x = floor(cols / 2) - 1;
  let y = floor(rows / 2) - 1;
  if (x + 2 < cols && y + 2 < rows && x >= 0 && y >= 0) {
    grid[x][y + 1] = 1;
    grid[x][y - 1] = 1;
    grid[x][y + 2] = 1;
    grid[x][y - 2] = 1;
    grid[x+1][y + 3] = 1;
    grid[x+1][y - 3] = 1;
    grid[x-1][y + 3] = 1;
    grid[x-1][y - 3] = 1;
    grid[x+2][y] = 1;
    grid[x-2][y] = 1;
    grid[x+1][y+1] = 1;
    grid[x+1][y-1] = 1;
    grid[x-1][y-1] = 1;
    grid[x-1][y+1] = 1;
  }
}

function addFishPattern() {
  let x = floor(cols / 2) - 1;
  let y = floor(rows / 2) - 1;
  if (x + 2 < cols && y + 2 < rows && x >= 0 && y >= 0) {
    grid[x][y - 2] = 1;
    grid[x][y - 4] = 1;
    grid[x+1][y - 3] = 1;
    grid[x-1][y - 3] = 1;
    grid[x+2][y-2] = 1;
    grid[x-2][y-2] = 1;
    grid[x+2][y-1] = 1;
    grid[x-2][y-1] = 1;
    grid[x+1][y+2] = 1;
    grid[x+1][y-1] = 1;
    grid[x-1][y-1] = 1;
    grid[x-1][y+2] = 1;
    grid[x+1][y+1] = 1;
    grid[x-1][y+1] = 1;
    grid[x+2][y+2] = 1;
    grid[x-2][y+2] = 1;
    grid[x][y] = 1;
  }
}

function generateGoblin() {
  let x = floor(cols / 2) - 1;
  let y = floor(rows / 2) - 1;
  if (x + 2 < cols && y + 2 < rows && x >= 0 && y >= 0) {
    grid[x][y] = 1;
    grid[x+1][y+1] = 1;
    grid[x-1][y+1] = 1;
    grid[x+1][y+2] = 1;
    grid[x-1][y+2] = 1;
    grid[x+1][y+6] = 1;
    grid[x-1][y+6] = 1;
    grid[x][y+5] = 1;
    grid[x+2][y+5] = 1;
    grid[x-2][y+5] = 1;
    grid[x+4][y+1] = 1;
    grid[x-4][y+1] = 1;
    grid[x+4][y+2] = 1;
    grid[x-4][y+2] = 1;
    grid[x+3][y+1] = 1;
    grid[x-3][y+1] = 1;
    grid[x+3][y+2] = 1;
    grid[x-3][y+2] = 1;
    grid[x+1][y-2] = 1;
    grid[x-1][y-2] = 1;
    grid[x][y-2] = 1;
    grid[x+2][y-1] = 1;
    grid[x-2][y-1] = 1;
    grid[x+3][y-3] = 1;
    grid[x-3][y-3] = 1;
    grid[x+3][y-4] = 1;
    grid[x-3][y-4] = 1;
    grid[x+3][y-5] = 1;
    grid[x-3][y-5] = 1;
    grid[x+4][y-3] = 1;
    grid[x-4][y-3] = 1;
    grid[x+4][y-2] = 1;
    grid[x-4][y-2] = 1;
    grid[x+5][y-2] = 1;
    grid[x-5][y-2] = 1;
    grid[x+5][y-1] = 1;
    grid[x-5][y-1] = 1;
  }
}

function resetToInitialState() {
  if (initialGrid.length > 0) {
    grid = JSON.parse(JSON.stringify(initialGrid));
    aliveCount = JSON.parse(JSON.stringify(initialAliveCount));
    isRunning = false;
    console.log('Grid reset to initial state.');
  }
}

function toggleSimulation() {
  isRunning = !isRunning;
  console.log('Running:', isRunning);
  if (isRunning) {
    initialGrid = JSON.parse(JSON.stringify(grid));
    initialAliveCount = JSON.parse(JSON.stringify(aliveCount));
  }
}

function clearBoard() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
      aliveCount[i][j] = 0;
    }
  }
  isRunning = false;
  console.log('Board cleared.');
}

function showFutureGrid() {
  isRunning = false;
  let futureGrid = simulateGenerations(100);
  grid = futureGrid;
  console.log('Displayed grid after 100 generations');
}

function saveCurrentPattern() {
  savedPattern = JSON.parse(JSON.stringify(grid));
  savedAliveCount = JSON.parse(JSON.stringify(aliveCount));
  console.log('Current pattern saved!');
}

function generateSavedPattern() {
  if (savedPattern.length > 0) {
    grid = JSON.parse(JSON.stringify(savedPattern));
    aliveCount = JSON.parse(JSON.stringify(savedAliveCount));
    isRunning = false;
    console.log('Saved pattern generated!');
  } else {
    console.log('No pattern saved yet.');
  }
}

function generateSpoon() {
  let x = floor(cols / 2) - 1;
  let y = floor(rows / 2) - 1;
  if (x + 2 < cols && y + 2 < rows && x >= 0 && y >= 0) {
    grid[x][y] = 1;
    grid[x+1][y+1] = 1;
    grid[x-1][y] = 1;
    grid[x-2][y+1] = 1;
    grid[x-2][y] = 1;
    grid[x-3][y+2] = 1;
    grid[x-3][y+3] = 1;
    grid[x+2][y+2] = 1;
    grid[x+2][y+3] = 1;
  }
}

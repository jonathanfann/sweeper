const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const game = document.getElementById('game');
const newGameBtn = document.getElementById('new-game-btn');
const messageDisplay = document.getElementById('message');
const timerDisplay = document.getElementById('time-count');
const bombCounter = document.getElementById('bomb-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const infoButton = document.getElementById('info-button');
const modal = document.getElementById('instructions-modal');
const closeButton = modal.querySelector('.close');
const deviceInstructions = document.getElementById('device-specific-instructions');

const rows = 9;
const cols = 9;
const mines = 10;
let minePositions = [];
let cells = [];
let longPressTimer;
const longPressDuration = 500; // milliseconds
let isLongPress = false;
let touchStartTime;
let gameTimer;
let gameTime = 0;
let flaggedCount = 0;

function createBoard() {
    game.innerHTML = '';
    cells = [];
    minePositions = [];
    messageDisplay.textContent = '';
    newGameBtn.style.display = 'none';
    gameTime = 0;
    flaggedCount = 0;
    updateTimer();
    updateBombCounter();
    startTimer();

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('touchstart', handleTouchStart, { passive: false });
        cell.addEventListener('touchend', handleTouchEnd, { passive: false });
        cell.addEventListener('touchmove', handleTouchMove, { passive: false });
        cell.addEventListener('contextmenu', handleRightClick);
        cell.addEventListener('click', handleCellClick);
        game.appendChild(cell);
        cells.push(cell);
    }
    placeMines();
}

function placeMines() {
    while (minePositions.length < mines) {
        const position = Math.floor(Math.random() * (rows * cols));
        if (!minePositions.includes(position)) {
            minePositions.push(position);
        }
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    const cell = event.target.closest('.cell');
    isLongPress = false;
    touchStartTime = new Date().getTime();
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        toggleFlag(cell);
    }, longPressDuration);
}

function handleTouchEnd(event) {
    event.preventDefault();
    clearTimeout(longPressTimer);
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;
    
    if (touchDuration < longPressDuration && !isLongPress) {
        handleCellClick(event);
    }
}

function handleTouchMove(event) {
    clearTimeout(longPressTimer);
    isLongPress = false;
}

function handleRightClick(event) {
    event.preventDefault();
    const cell = event.target.closest('.cell');
    toggleFlag(cell);
}

function toggleFlag(cell) {
    if (!cell.classList.contains('revealed')) {
        cell.classList.toggle('flagged');
        if (cell.classList.contains('flagged')) {
            cell.innerHTML = '<i class="bx bxs-flag-alt"></i>';
            flaggedCount++;
        } else {
            cell.innerHTML = '';
            flaggedCount--;
        }
        updateBombCounter();
    }
}

function handleCellClick(event) {
    const cell = event.target.closest('.cell');
    const index = parseInt(cell.dataset.index);

    if (cell.classList.contains('revealed')) {
        return;
    }

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        cell.innerHTML = '';
        flaggedCount--;
        updateBombCounter();
    }

    if (minePositions.includes(index)) {
        revealMine(cell);
        endGame(false);
    } else {
        revealCell(index);
        if (checkWin()) {
            endGame(true);
        }
    }
}

function revealCell(index) {
    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;

    cell.classList.remove('flagged');
    cell.classList.add('revealed');
    const count = countAdjacentMines(index);

    if (count > 0) {
        cell.textContent = count;
    } else {
        cell.innerHTML = '';
        const adjacentCells = getAdjacentCells(index);
        adjacentCells.forEach(adjIndex => revealCell(adjIndex));
    }
}

function revealMine(cell) {
    cell.classList.remove('flagged');
    cell.classList.add('mine');
    cell.innerHTML = '<i class="bx bxs-bomb"></i>';
}

function countAdjacentMines(index) {
    const adjacentCells = getAdjacentCells(index);
    return adjacentCells.filter(adjIndex => minePositions.includes(adjIndex)).length;
}

function getAdjacentCells(index) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    let adjacentCells = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                const newIndex = newRow * cols + newCol;
                if (newIndex !== index) {
                    adjacentCells.push(newIndex);
                }
            }
        }
    }

    return adjacentCells;
}

function checkWin() {
    const revealedCells = document.querySelectorAll('.revealed');
    return revealedCells.length === rows * cols - mines;
}

function endGame(isWin) {
    cells.forEach(cell => {
        cell.removeEventListener('touchstart', handleTouchStart);
        cell.removeEventListener('touchend', handleTouchEnd);
        cell.removeEventListener('touchmove', handleTouchMove);
        cell.removeEventListener('click', handleCellClick);
    });

    stopTimer();

    if (isWin) {
        messageDisplay.textContent = `Congratulations! Time: ${gameTime} `;
    } else {
        messageDisplay.textContent = 'Game over! ';
        minePositions.forEach(position => revealMine(cells[position]));
    }

    newGameBtn.style.display = 'block';
}

function startTimer() {
    gameTimer = setInterval(() => {
        gameTime++;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(gameTimer);
}

function updateTimer() {
    timerDisplay.textContent = gameTime;
}

function updateBombCounter() {
    bombCounter.textContent = mines - flaggedCount;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function showInstructions() {
    modal.style.display = "block";
    modal.offsetHeight; // Trigger reflow
    modal.classList.add('show');
    if (isMobileDevice()) {
        deviceInstructions.textContent = "Long press on a cell to mark or unmark a flag.";
    } else {
        deviceInstructions.textContent = "Right-click on a cell to mark or unmark a flag.";
    }
}

function closeInstructions() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

newGameBtn.addEventListener('click', createBoard);
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Set initial state based on user preference
    if (prefersDark) {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
} else {
    console.error('Dark mode toggle not found in the DOM');
}

infoButton.addEventListener('click', showInstructions);
closeButton.addEventListener('click', closeInstructions);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeInstructions();
    }
});

// Initialize the game
createBoard();
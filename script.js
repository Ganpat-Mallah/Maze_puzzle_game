// Initialize Game Variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const cellSize = 30;
let rows = 15;
let cols = 15;
let maze = generateMaze(rows, cols);
let player = { x: 1, y: 1 };
const goal = { x: cols - 2, y: rows - 2 };
let level = 1;
let timer = 0;
let timerInterval;

// Graphics (Replace these with your own image URLs if available)
const wallColor = "#8B4513"; // Brown wall
const pathColor = "#D3D3D3"; // Light gray path
const playerColor = "blue";
const goalColor = "green";

// Generate Maze
function generateMaze(rows, cols) {
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [];
    const directions = [
        { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    function isValidMove(x, y) {
        return x > 0 && y > 0 && x < cols - 1 && y < rows - 1 && maze[y][x] === 1;
    }

    function carvePath(x, y) {
        maze[y][x] = 0;
        stack.push({ x, y });

        while (stack.length) {
            const current = stack.pop();
            shuffleArray(directions);
            for (const { x: dx, y: dy } of directions) {
                const nx = current.x + dx * 2;
                const ny = current.y + dy * 2;

                if (isValidMove(nx, ny)) {
                    maze[current.y + dy][current.x + dx] = 0;
                    maze[ny][nx] = 0;
                    stack.push({ x: nx, y: ny });
                }
            }
        }
    }

    carvePath(1, 1);
    return maze;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render Maze
function drawMaze() {
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? wallColor : pathColor;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(
        player.x * cellSize + cellSize / 2,
        player.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawGoal() {
    ctx.fillStyle = goalColor;
    ctx.beginPath();
    ctx.arc(
        goal.x * cellSize + cellSize / 2,
        goal.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Timer Logic
function startTimer() {
    timer = 0;
    document.getElementById("timer").textContent = `Time: ${timer}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `Time: ${timer}s`;
    }, 1000);
}


function toggleMazeVisibility() {
    mazeVisible = true;
    render();
    hideMaze();
}

// Player Movement with Animation
let targetX = player.x;
let targetY = player.y;
function movePlayer(dx, dy) {
    targetX = player.x + dx;
    targetY = player.y + dy;

    if (maze[targetY]?.[targetX] === 0) {
        animatePlayer(targetX, targetY);
    }
}

function animatePlayer(newX, newY) {
    const startX = player.x * cellSize + cellSize / 2;
    const startY = player.y * cellSize + cellSize / 2;
    const endX = newX * cellSize + cellSize / 2;
    const endY = newY * cellSize + cellSize / 2;

    let progress = 0;
    function step() {
        if (progress < 1) {
            progress += 0.1;
            const currentX = startX + progress * (endX - startX);
            const currentY = startY + progress * (endY - startY);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (mazeVisible) drawMaze();
            drawGoal();
            ctx.fillStyle = playerColor;
            ctx.beginPath();
            ctx.arc(currentX, currentY, cellSize / 3, 0, Math.PI * 2);
            ctx.fill();
            requestAnimationFrame(step);
        } else {
            player.x = newX;
            player.y = newY;
            if (player.x === goal.x && player.y === goal.y) {
                levelUp();
            }
        }
    }
    step();
}

// Level Up Logic
function levelUp() {
    clearInterval(timerInterval);
    document.getElementById("congratsMessage").style.display = "block";
    document.getElementById("nextLevel").onclick = () => {
        document.getElementById("congratsMessage").style.display = "none";
        level++;
        rows += 2;
        cols += 2;
        maze = generateMaze(rows, cols);
        player = { x: 1, y: 1 };
        toggleMazeVisibility();
        startTimer();
        render();
    };
}

// Keypress Handling
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
});

// Initial Render
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mazeVisible) drawMaze();
    drawPlayer();
    drawGoal();
}

startTimer();
toggleMazeVisibility();

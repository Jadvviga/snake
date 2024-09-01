document.addEventListener("keyup", keyUpHandler);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const subMessage = document.getElementById("sub_message");
const scoreTxt = document.getElementById("score");
const highScoreTxt = document.getElementById("high_score");

const SNAKE_WIDTH = 15, WIDTH = canvas.width;
const ROW = WIDTH / SNAKE_WIDTH;

const PAUSE = 0, GAME = 1, END = 2;
const UP = "ArrowUp", RIGHT = "ArrowRight", DOWN = "ArrowDown", LEFT = "ArrowLeft";

let state = PAUSE;
let direction = RIGHT;
let newDirection = null;
let score = 0;
let highScore = 0;
const INIT_SNAKE = [[WIDTH / 2, WIDTH / 2], [WIDTH / 2 - SNAKE_WIDTH, WIDTH / 2]]
const snake = [];
const apple = [0, 0];


let drawAll;
let snakeMovement;
initGame();
draw();

function initGame() {
    score = -1;
    updateScore();
    checkHighScore();
    spawnApple();
    snake.length = 0;
    snake.push(INIT_SNAKE[0]);
    snake.push(INIT_SNAKE[1]);
}


function setState(_state) {
    if (_state === PAUSE) {
        clearInterval(drawAll);
        clearInterval(snakeMovement);
        setMessage("PAUSED", "Press anything to unpause");
    } else if (_state === END) {
        clearInterval(drawAll);
        clearInterval(snakeMovement);
        setMessage("GAME OVER", "Press anything to restart");
    } else {
        score = 0;
        drawAll = setInterval(draw, 1000 / 60);
        snakeMovement = setInterval(moveSnake, 1000 / (5 + score));
        hideMessage();
        if (state === END) {
            initGame();
        }
    }
    state = _state;
}


function isHorizontalDirection(dir) {
    return dir === LEFT || dir === RIGHT;
}

function switchDirection(newDirection) {
    if (isHorizontalDirection(direction) === isHorizontalDirection(newDirection)) {
        return;
    }
    direction = newDirection;
}

function hideMessage() {
    message.classList.add("hidden");
    subMessage.classList.add("hidden");
}

function setMessage(text, text2 = "") {
    message.textContent = text;
    subMessage.textContent = text2;
    message.classList.remove("hidden");
    subMessage.classList.remove("hidden");
}

function isMovementKey(key) {
    return key === UP || key === RIGHT || key === DOWN || key === LEFT;
}



function keyUpHandler(event) {
    if (state !== GAME) {
        setState(GAME)
        return;
    }

    const key = event.key;
    if (key === "Escape" || key === "P") {
        setState(PAUSE);
        return;
    }

    if (isMovementKey(key)) {
        if (newDirection === null) {
            newDirection = key;
        }
    }

}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw bg
    ctx.fillStyle = "#2b2b2b";
    for (let i = 0; i < canvas.width; i += SNAKE_WIDTH) {
        ctx.fillRect(0, i, canvas.width, 1);
        ctx.fillRect(i, 0, 1, canvas.width);

    }

    //draw apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple[0], apple[1], SNAKE_WIDTH + 1, SNAKE_WIDTH + 1);

    //draw snake
    ctx.fillStyle = "white";
    snake.forEach(snakePos => {
        ctx.fillRect(snakePos[0], snakePos[1], SNAKE_WIDTH + 1, SNAKE_WIDTH + 1);
    })


}

function spawnApple() {
    const randomX = Math.floor(Math.random() * ROW);
    const randomY = Math.floor(Math.random() * ROW);
    apple.pop();
    apple.pop();
    apple.push(randomX * SNAKE_WIDTH);
    apple.push(randomY * SNAKE_WIDTH);
}

function updateScore() {
    score += 1;
    scoreTxt.textContent = score;
}

function checkCollection() {
    const head = snake[0];
    if (apple[0] === head[0] && apple[1] === head[1]) {
        updateScore();
        spawnApple();
    } else {
        snake.pop();
    }

}

function gameOver() {
    setState(END);
    saveScore();
}

function checkSnakeCollision() {
    const head = snake[0];
    let collision = false;
    snake.forEach((part, index) => {
        if (index === 0 || collision) return;
        if (part[0] === head[0] && part[1] === head[1]) {
            collision = true;
        }
    });

    if (collision) {
        gameOver();
    }
}

function checkHighScore() {
    const check = localStorage.getItem("highScore");
    highScore = check ? Number(check) : 0;
    highScoreTxt.textContent = highScore;
}

function saveScore() {
    if (score <= highScore) {
        return;
    }
    localStorage.setItem("highScore", `${score}`);
    highScoreTxt.textContent = highScore;
}

function checkDirection() {
    if (newDirection !== null) {
        switchDirection(newDirection);
        newDirection = null;
    }
}

function moveSnake() {
    if (state !== GAME) {
        return;
    }
    checkDirection();
    const head = snake[0];
    const step = SNAKE_WIDTH * (direction === UP || direction === LEFT ? -1 : 1);
    const newHead = [...head];
    const index = direction === LEFT || direction === RIGHT ? 0 : 1;
    newHead[index] += step;
    if (newHead[index] >= WIDTH) {
        newHead[index] = 0;
    }
    if (newHead[index] < 0) {
        newHead[index] = WIDTH - SNAKE_WIDTH;
    }
    snake.unshift(newHead);
    checkCollection();
    checkSnakeCollision();
}


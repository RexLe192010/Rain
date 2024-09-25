const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const scoreElement = document.getElementById('score');
const bgm = document.getElementById('bgm');
const startButton = document.getElementById('startButton');
let isJumping = false;
let jumpHeight = 150;
let moveSpeed = 5;
let gravity = 0.5;
let jumpSpeed = 10;
let velocityY = 0;
let moveDirection = null;
let jumpCount = 0;
const maxJumps = 2;
let score = 0;
let enemyBulletSpeed = 10;
let enemyBulletInterval = 400;
let gameOver = false;
const musicList = [
    'musics/ヨルシカ+-+又三郎.mp3',
    'musics/Clear Sky - Call of Silence (Clear Sky remix_Remix).mp3',
    'musics/Fleurie - Breathe.mp3'];
let currentMusicIndex = 0;

// Initialize the game as well as the background music
startButton.addEventListener('click', () => {
    startButton.remove();
    bgm.src = musicList[currentMusicIndex];
    bgm.play();
    startEnemyBulletRain();
    requestAnimationFrame(move);
});


const keysPressed = {};

document.addEventListener('keydown', function (event) {
    if (gameOver) return;
    keysPressed[event.key] = true;

    switch (event.key) {
        case 'ArrowLeft':
            moveDirection = 'left';
            break;
        case 'ArrowRight':
            moveDirection = 'right';
            break;
        case ' ':
            if (jumpCount < maxJumps) jump();
            break;
        case 'z':
            shoot();
            break;
    }
});

document.addEventListener('keyup', function (event) {
    keysPressed[event.key] = false;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (keysPressed['ArrowLeft']) {
            moveDirection = 'left';
        } else if (keysPressed['ArrowRight']) {
            moveDirection = 'right';
        } else {
            moveDirection = null;
        }
    }
});

function move() {
    if (moveDirection === 'left') {
        let left = parseInt(window.getComputedStyle(player).left);
        player.style.left = Math.max(0, left - moveSpeed) + 'px';
    }
    if (moveDirection === 'right') {
        let left = parseInt(window.getComputedStyle(player).left);
        player.style.left = Math.min(gameArea.clientWidth - player.clientWidth, left + moveSpeed) + 'px';
    }
    if (!gameOver) {
        requestAnimationFrame(move);
    }
}

function jump() {
    isJumping = true;
    velocityY = -jumpSpeed;
    jumpCount++;

    function applyGravity() {
        let bottom = parseInt(window.getComputedStyle(player).bottom);
        velocityY += gravity;
        bottom -= velocityY;
        if (bottom <= 0) {
            bottom = 0;
            isJumping = false;
            velocityY = 0;
            jumpCount = 0; // Reset jump count when player lands
        }
        player.style.bottom = bottom + 'px';
        if (isJumping && !gameOver) {
            requestAnimationFrame(applyGravity);
        }
    }

    requestAnimationFrame(applyGravity);
}

function shoot() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = (parseInt(window.getComputedStyle(player).left) + player.clientWidth / 2 - 5) + 'px';
    bullet.style.bottom = (parseInt(window.getComputedStyle(player).bottom) + player.clientHeight) + 'px';
    gameArea.appendChild(bullet);

    function moveBullet() {
        let bottom = parseInt(window.getComputedStyle(bullet).bottom);
        bottom += 5;
        bullet.style.bottom = bottom + 'px';
        if (bottom < gameArea.clientHeight) {
            requestAnimationFrame(moveBullet);
        } else {
            bullet.remove();
        }
    }

    requestAnimationFrame(moveBullet);
}

function spawnEnemyBullet() {
    const enemyBullet = document.createElement('div');
    enemyBullet.classList.add('enemyBullet');
    enemyBullet.style.left = Math.random() * (gameArea.clientWidth - 10) + 'px';
    enemyBullet.style.top = '0px';
    gameArea.appendChild(enemyBullet);

    function moveEnemyBullet() {
        let top = parseInt(window.getComputedStyle(enemyBullet).top);
        top += enemyBulletSpeed; // Use a variable for enemy bullet speed
        enemyBullet.style.top = top + 'px';
        if (top < gameArea.clientHeight) {
            if (checkCollision(player, enemyBullet)) {
                endGame();
            } else {
                requestAnimationFrame(moveEnemyBullet);
            }
        } else {
            enemyBullet.remove();
            updateScore(); // Update score when enemy bullet is removed
        }
    }

    requestAnimationFrame(moveEnemyBullet);
}

function checkCollision(player, bullet) {
    const playerRect = player.getBoundingClientRect();
    const bulletRect = bullet.getBoundingClientRect();

    return !(
        playerRect.top > bulletRect.bottom ||
        playerRect.bottom < bulletRect.top ||
        playerRect.left > bulletRect.right ||
        playerRect.right < bulletRect.left
    );
}

function updateScore() {
    score += 10;
    scoreElement.textContent = `Score: ${score}`;
}

function endGame() {
    gameOver = true;
    alert('Game Over! Your score: ' + score);
    // Optionally, you can reset the game here
    location.reload();
}

bgm.addEventListener('ended', () => {
    currentMusicIndex++;
    if (currentMusicIndex < musicList.length) {
        enemyBulletSpeed += 2;
        enemyBulletInterval -= 10;
        bgm.src = musicList[currentMusicIndex];
        bgm.play();
    } else {
        alert('Clear!');
        gameOver = true;
        location.reload();
    }
});

function startEnemyBulletRain() {
    setInterval(spawnEnemyBullet, enemyBulletInterval);
}
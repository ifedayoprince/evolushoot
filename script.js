// load canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// input setup
var keyState = [];
keyState.length = 256;
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// key setup
// var keyUp = 87;
// var keyDown = 83;
var keyLeft = 37;
var keyRight = 39;
var keyShoot = 32;
var keyStart = 13;

// fps
var FPS = 30;

// game start?
var start = false;

// score
var score = 0;

// create player object
var player = new Player();

// storing in-game objects
var pBullets = [];
var enemies = [];
var bParticles = [];
let enemyPopulation = []

let minKilledEnemies = 0.3;
let actionCount = 0;

// weapon delay
var w_delay = 0;

// player hit delay
var hit_delay = 0;

// keydown functions
function onKeyDown(event) {
    keyState[event.keyCode] = true;
}

function onKeyUp(event) {
    keyState[event.keyCode] = false;
}



///////////////////////////////////////////////////
// Player Class
function Player() {
    // private variables
    var HP = 150;
    var dmg = 1;
    var w_type = 1;
    var cd_factor = 10;

    // private methods
    this.getHP = function () {
        return HP;
    };
    this.getHit = function () {
        HP -= 50;
        hit_delay = 100;
    };
    this.getWtype = function () {
        return w_type;
    };
    this.getCD = function () {
        return cd_factor;
    };

    // public properties
    this.active = true;
    this.color = "white";
    this.width = 35;
    this.xVel = 10;
    this.height = 35;
    this.yOffset = 30
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - this.yOffset;
}

Player.prototype.draw = function () {
    if (hit_delay > 0) {
        if (Math.sin(hit_delay) > 0) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = this.color;
        }
    } else {
        ctx.fillStyle = this.color;
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Player.prototype.shoot = function () {
    if (w_delay === 0) {
        pBullets.push(new Bullet({
            vel: 7,
            x: this.x + this.width / 2,
            y: this.y
        }));
        w_delay = 100;
    }
};
///////////////////////////////////////////////////



///////////////////////////////////////////////////
// Bullet Class
function Bullet(bullet) {
    this.active = true;
    this.color = "yellow";
    this.yVel = -bullet.vel;
    this.width = 2;
    this.height = 4;
    this.x = bullet.x;
    this.y = bullet.y;
}

Bullet.prototype.inBounds = function () {
    return this.x >= 0 && this.x <= canvas.width &&
        this.y >= 0 && this.y <= canvas.height;
};

Bullet.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Bullet.prototype.update = function () {
    this.y += this.yVel;
    this.active = this.inBounds() && this.active;
};

Bullet.prototype.die = function () {
    this.active = false;
};
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// Enemy Class
function Enemy(movementMap, color, i, addedAt) {
    let enemyYOffset = 50;
    let enemyGap = 10;
    
    this.addedAt = addedAt
    this.active = true;
    this.color = color;
    this.x = canvas.width * Math.random();
    this.xVel = 2;
    this.movementMap = movementMap
    this.yVel = 4;
    this.width = 30;
    this.height = 30;
    this.y = enemyYOffset + (i * this.height) + enemyGap;
}

Enemy.prototype.inBounds = function () {
    return this.x >= 0 && this.x <= canvas.width &&
        this.y >= 0 && this.y <= canvas.height;
};

Enemy.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Enemy.prototype.update = function () {
    if (Math.abs(player.y - this.y) < 200) {
        if ((player.x - this.x) > 0) {
            this.xVel = 2;
        } else if ((player.x - this.x) < 0) {
            this.xVel = -2;
        } else {
            this.xVel = 0;
        }
    }
    // this.x += this.xVel;
    if (this.movementMap[actionCount % ACTION_LENGTH] == 1)
        this.x += this.xVel
    else if (this.movementMap[actionCount % ACTION_LENGTH] == 0)
        this.x -= this.xVel

    //   this.y += this.yVel;
    this.active = this.active && this.inBounds();
};

Enemy.prototype.die = function () {
    this.active = false;
    score += 10;
};
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// Background particle class
function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.xVel = 0;
    this.yVel = 1;
    this.width = 1;
    this.height = 1;
    this.color = "#F2F5A9";
    this.active = true;
}

Particle.prototype.inBounds = function () {
    return this.x >= 0 && this.x <= canvas.width &&
        this.y >= 0 && this.y <= canvas.height;
};

Particle.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Particle.prototype.update = function () {
    this.y += this.yVel;
    this.active = this.active && this.inBounds();
};
///////////////////////////////////////////////////


///////////////////////////////////////////////////
// collision check & handling
function collisionCheck(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function collisionOccurs() {
    pBullets.forEach(function (bullet) {
        enemies.forEach(function (enemy) {
            if (collisionCheck(bullet, enemy)) {
                bullet.die();
                enemy.die();
            }
        });
    });

    enemies.forEach(function (enemy) {
        if (collisionCheck(enemy, player)) {
            if (hit_delay === 0) {
                enemy.die();
                player.getHit();
            }
        }
    });
}
///////////////////////////////////////////////////



///////////////////////////////////////////////////
// interval functions
setInterval(function () {
    canvas.focus();
    startGame();
    if (start) {
        if (player.getHP() > 0)
            update();
        draw();
    }
}, 1000 / FPS);
setInterval(()=>{actionCount++}, (SEQUENCE_DURATION / ACTION_LENGTH) * 1000)

function startGame() {
    if (!start) {
        ctx.font = "30pt Calibri";
        ctx.fillStyle = "white";
        ctx.fillText("Press Enter to Start", 47, 180);
        ctx.font = "20pt Calibri";
        ctx.fillText("Space - shoot", 47, 240);
    }
    if (keyState[keyStart]) {
        enemyPopulation = generateMovementMaps();
        enemies = enemyPopulation.map(([movementMap, color], i) => new Enemy(movementMap, color, i, 0))
        start = true;
    }
}

function update() {
    // movements
    if (keyState[keyLeft] && player.x > 0)
        player.x -= player.xVel;
    if (keyState[keyRight] && player.x < canvas.width - player.width)
        player.x += player.xVel;

    // background particles
    if (Math.random() < 0.04)
        bParticles.push(new Particle());

    bParticles.forEach(function (particle) {
        particle.update();
    });

    bParticles = bParticles.filter(function (particle) {
        return particle.active;
    });

    // shooting
    if (keyState[keyShoot])
        player.shoot();

    pBullets.forEach(function (bullet) {
        bullet.update();
    });

    pBullets = pBullets.filter(function (bullet) {
        return bullet.active;
    });

    if (w_delay > 0)
        w_delay -= player.getCD();

    enemies.forEach(function (enemy) {
        enemy.update();
    });

    enemies = enemies.filter(function (enemy) {
        return enemy.active;
    });
    for (let i = enemies.length-1; i < POP_SIZE; i++) {
        let nextBest = getNextBest(enemies, actionCount);
        enemies.push(new Enemy(nextBest[0], nextBest[1], Math.round(Math.random() * i), actionCount))
    }

    // collision
    collisionOccurs();

    if (hit_delay > 0)
        hit_delay -= 1;

}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bParticles.forEach(function (particle) {
        particle.draw();
    });

    player.draw();

    pBullets.forEach(function (bullet) {
        bullet.draw();
    });

    enemies.forEach(function (enemy) {
        enemy.draw();
    });

    // game over
    if (player.getHP() <= 0) {
        ctx.font = "20pt Calibri";
        ctx.fillStyle = "white";
        ctx.fillText("Game Over", 170, 220);
    }

    // keeping score
    ctx.font = "8pt Calibri";
    ctx.fillStyle = "white";
    ctx.fillText(score, 5, 15);
}
///////////////////////////////////////////////////

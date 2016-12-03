// Game class which initializes the game and handles events

var Game = function() {

    // setting minimum speed of enemy
    this.minEnemySpeed = 100;

    // enemy max speed
    this.maxEnemySpeed = 300;

    // Game starts with score of 0
    this.score = 0;

    // Each user will start with 3 lives
    this.life = 3;

    // Variable for knowing game event (i.e game complete by time running out or 0 lives).
    this.stop = false;

    // enemy array, where enemies will be added too
    this.allEnemies = [];

    // Initializes enimies and add them to allEnemies array
    this.initEnemies();

    // Initialize a new player.
    this.player = new Player();

    // Initialize player helpers.
    this.playerItem = new PlayerItem();

    var that = this;

    // This listens for key presses and sends the keys to Player.handleInput()
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        that.player.handleInput(allowedKeys[e.keyCode]);
    });
};

// Method to initialize enemies and put in the allEnemies array
Game.prototype.initEnemies = function() {
    // Initialize 3 enemies on each row.
    // Loop through 3 enemy rows.
    for (var i = 0; i < 3; i++) {
        var enemy = new Enemy();
        // Return random numbers between minEnemySpeed and maxEnemySpeed.
        enemy.speed = Math.floor(Math.random() * (this.maxEnemySpeed + this.minEnemySpeed));
        // Push each enemy to allEnemies array.
        this.allEnemies.push(enemy);
    }
};

// Method to check for collisions
Game.prototype.checkCollisions = function() {
    for (var i = 0; i < this.allEnemies.length; i++) {

        if (Math.abs(this.player.x - this.allEnemies[i].x) < 40 && Math.abs(this.player.y - this.allEnemies[i].y) < 40) {

            // If player has collided then reset player position.
            this.player.reset();

            // Check how many lives player has. If more than 0 then -1
            if (this.life > 0) {
                this.life--;
                // Update life.
                document.getElementById('life').innerHTML = 'Life: ' + this.life;
            }
        }
    }
};

// Method to check player helpers (gems, hearts, rock). If they have been collected then either change enemy behaviour or current stat
Game.prototype.checkPlayerItems = function() {
    // Check if player has collected a helper item
    if (Math.abs(this.player.x - this.playerItem.x) < 40 && Math.abs(this.player.y - this.playerItem.y) < 40) {

        // If heart collected, +1 life
        if (this.playerItem.sprite == 'images/Heart.png') {
            this.life++;
            document.getElementById('life').innerHTML = 'Life: ' + this.life;
        }

        // If green gem collected, slow down enemies for 3 seconds
        else if (this.playerItem.sprite == 'images/Gem Green.png') {
            // keep enemy orginal speeds
            var originalEnemySpeeds = new Array(2);
            var allEnemies = this.allEnemies;
            // Slow down each enemy speed.
            for (var i = 0; i < allEnemies.length; i++) {
                originalEnemySpeeds[i] = allEnemies[i].speed;
                allEnemies[i].speed = allEnemies[i].speed / 3;
            }
            // Change speeds back after 3 seconds
            setTimeout(function() {
                for (var i = 0; i < originalEnemySpeeds.length; i++) {
                    allEnemies[i].speed = originalEnemySpeeds[i];
                }
            }, 3000);
        }

        // If Blue gem, then add 5 points
        else if (this.playerItem.sprite == 'images/Gem Blue.png') {
            this.score += 5;
            document.getElementById('score').innerHTML = 'Score: ' + this.score;
        }

        // If rock then -1 point
        else if (this.playerItem.sprite == 'images/Rock.png') {
            this.life--;
            document.getElementById('life').innerHTML = 'Life: ' + this.life;
        }
        // Once collision with objects, move them off the canvas window
        this.playerItem.x = -100;
        this.playerItem.y = -100;
    }
};

// Method to check if player has reach destination or not. If water then reset (-1 point) else reach destination (+1 point)
Game.prototype.checkDestination = function() {
    if (this.player.y < 0) {
        if (this.player.x === 200) {
            this.player.reset();
            this.score++;
            document.getElementById('score').innerHTML = 'Score: ' + this.score;
        } else {
            this.player.reset();
            this.life--;
            document.getElementById('life').innerHTML = 'Life: ' + this.life;
        }
    }
};

// Method to check if game is to be ended
Game.prototype.render = function() {
    if (this.life === 0) {
        this.stop = true;
        this.gameOver();
    }
};

// Method to show Game Over.
Game.prototype.gameOver = function() {
    var gameBoard = document.getElementById('game-board');
    gameBoard.parentNode.removeChild(gameBoard);
    var gameOverMessage = document.getElementById('gameOverMessage');
    var lifeMessage = 'Ooops, you have no more lives... ' + '<br>';
    var scoreMessage = 'Your final score: ' + this.score;

    // Check how the game ended and show appropriate message
    if (this.life === 0) {
        gameOverMessage.innerHTML = lifeMessage + scoreMessage;
    } else {
        gameOverMessage.innerHTML = scoreMessage;
    }
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Set starting y positions for enemies
    this.enemyY = [60, 145, 230];
    // Set starting position for enemy on x-axis
    this.x = -100;

    // Set randomized enemy y position
    this.y = this.enemyY[Math.round(Math.random() * 2)];

    this.speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Move enemy
    this.x += this.speed * dt;

    // If enemy goes off screen, restart from starting x position
    if (this.x > 500) {
        this.x = -100;
        // Randomnize enemy y value every time enemy moves off screen
        this.y = this.enemyY[Math.round(Math.random() * 2)];
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Item class for constructing items that player can collect
var Item = function() {

    // Item positions
    this.itemX = [0, 100, 200, 300, 400];
    this.itemY = [80, 160, 240, 320];

    this.x = this.startPosX();
    this.y = this.startPosY();
};

// Method to set Item x position
Item.prototype.startPosX = function() {
    var startX = this.itemX[Math.round(Math.random() * this.itemX.length)];
    return startX;
};

// Method to set Item y position
Item.prototype.startPosY = function() {
    var startY = this.itemY[Math.round(Math.random() * this.itemY.length)];
    return startY;
};

// Method to update item position
Item.prototype.update = function(dt) {
    this.x * dt;
    this.y * dt;
};

// Method to restart Item position
Item.prototype.reset = function() {
    this.x = this.startPosX();
    this.y = this.startPosY();
};

// Method to draw item on canvas
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Class to construct the items player can collect
var PlayerItem = function() {
    Item.call(this);
    this.loadNewItem();
    this.reset();
};

// PlayerItem inherites from Item Class.
PlayerItem.prototype = Object.create(Item.prototype);

// Set PlayerItem constructor.
PlayerItem.prototype.constructor = PlayerItem;

// Method to load random Item
PlayerItem.prototype.loadNewItem = function() {
    this.spriteOptions = ['images/Rock.png', 'images/Rock.png', 'images/Rock.png', 'images/Heart.png', 'images/Gem Blue.png', 'images/Gem Green.png'];
    this.sprite = this.spriteOptions[Math.floor(Math.random() * this.spriteOptions.length)];
};

// Method to draw Item on canvas
PlayerItem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Method to reset Item position every 5 seconds
PlayerItem.prototype.reset = function() {
    var that = this;
    // Move the item off the screen.
    that.x = -100;
    that.y = -100;
    setInterval(function() {
        that.loadNewItem();
        Item.prototype.reset.call(that);
    }, 5000);
};


/* Player Class */
var Player = function() {
    this.sprite = 'images/char-princess-girl.png';
    this.x = 200;
    this.y = 400;
};

// Update players position
Player.prototype.update = function(dt) {
    this.x * dt;
    this.y * dt;
};

// Render player
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset player position
Player.prototype.reset = function() {
    this.x = 200;
    this.y = 400;
};

// Handling keyboard events for the player
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            if (this.x > 0)
                this.x -= 100;
            break;
        case 'up':
            if (this.y > 0)
                this.y -= 85;
            break;
        case 'right':
            if (this.x < 400)
                this.x += 100;
            break;
        case 'down':
            if (this.y < 375)
                this.y += 85;
            break;
        default:
            return;
    }
};

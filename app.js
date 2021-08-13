'use strict'



/* ---------------------------------------------- VARIABLE NAMES ---------------------------------------------- */

// GET DOM ELEMENTS
const gameCover = document.querySelector('.cover');
const board = document.querySelector('.board');
const status = document.querySelector('.game-status');
const tryAgain = document.querySelector('.try-again');
const startBtn = document.querySelector('.start-game');
const restartBtn = document.querySelector('.restart-game');
const score = document.querySelector('.score');
const highscore = document.querySelector('.highscore');
const leaderboard = document.querySelector('#leaderboard');

// GAMECLOCK INDEPENDENT VARIABLES
let lastRenderTime = 0;
let isGameOver = false;
let currentDirection = '';
const boardSize = 35;
const scoreValue = new RegExp(/(?<=^SCORE: )\d+(?= -.*$)/, 'g');

// CREATE SNAKE ELEMENT
const snakeBody = document.createElement('SPAN');
snakeBody.classList.add('snake');
board.appendChild(snakeBody);

// CREATE FOOD ELEMENT
const snakeFood = document.createElement('SPAN');
snakeFood.setAttribute('id', 'food');
board.appendChild(snakeFood);



/* ---------------------------------------------- INITIAL GAME SETUP ---------------------------------------------- */

// GET SCORES FROM LOCAL STORAGE
if (localStorage.getItem('previousScores')) {

   // EXTRACT SORTED ARRAY OF SCORES FROM DATA STRING
   let scoresArray = JSON.parse(localStorage.getItem('previousScores')).sort((a, b) => {

      return b.match(scoreValue)[0] - a.match(scoreValue)[0];

   })

   // DISPLAY AND FORMAT SCORES ON LEADERBOARD
   leaderboard.textContent = JSON.stringify(scoresArray).replace(/[\[\]"]/g,'').replace(/,/g,'\n');

}

// GET CURRENT HIGHSCORE FROM LOCAL STORAGE
if (localStorage.getItem('highscore')) highscore.textContent = `HIGHSCORE: ${localStorage.getItem('highscore')}`;



// CREATES A TIMEKEEPING FUNCTION FOR GAME ANIMATIONS
function gameClock(currentTime) {

   if (isGameOver) {

      tryAgain.classList.remove('hidden');
      status.textContent = 'GAME OVER!';

      let currentScore = +score.textContent.match(/(?<=YOUR SCORE: )\d+$/)[0];
      let currentHighscore = +highscore.textContent.match(/(?<=HIGHSCORE: )\d+$/)[0];      
      let scores = (JSON.parse(localStorage.getItem('previousScores'))) || [];

      scores.push(`SCORE: ${currentScore} - ${getTime()}`);
      localStorage.setItem('previousScores', JSON.stringify(scores));
      
      let scoresArray = JSON.parse(localStorage.getItem('previousScores')).sort((a, b) => {

         return b.match(scoreValue)[0] - a.match(scoreValue)[0];

      })

      leaderboard.textContent = JSON.stringify(scoresArray).replace(/[\[\]"]/g,'').replace(/,/g,'\n');

      if (currentScore > currentHighscore) {

         highscore.textContent = `HIGHSCORE: ${currentScore}`;
         localStorage.setItem('highscore', currentScore);

      }
      
      return;

   }

   window.requestAnimationFrame(gameClock);
   const t = currentTime - lastRenderTime;
   if (t < snake.speed) return;

   lastRenderTime = currentTime;

   snake.moveSnake();
   if (currentDirection) {

      snake.changeDirection = currentDirection;
      currentDirection = '';

   }

}



/* ---------------------------------------------- CREATING SNAKE AND FOOD CLASSES ---------------------------------------------- */

class Food {
   
   constructor(_pos) {
      this.element = document.querySelector('#food');
      this.position = _pos;
   }

   placeFood() {

      this.element.style.gridRowStart = this.position.y;
      this.element.style.gridColumnStart = this.position.x;

   }

   generateRandomPosition() {

      do {
         this.position = {
            x: Math.floor(Math.random() * boardSize) + 1,
            y: Math.floor(Math.random() * boardSize) + 1
         }
      } while (snake.bodyPosition.has(`${this.position.y}, ${this.position.x}`));

      this.placeFood();

   }

}

class Snake {
   
   constructor(_speed, _direction, _position) {
      this.length = 1;
      this.speed = _speed;
      this.direction = _direction;
      this.headPosition = _position;
      this.bodyPosition = new Set();
      this.element = [...document.querySelectorAll('.snake')];
   }

   moveSnake() {

      // RECORD POSITION OF EACH BODY SEGMENT
      this.bodyPosition = new Set(this.element.map((elem) => `${elem.style.gridRowStart}, ${elem.style.gridColumnStart}`));

      this.element[0].style.gridRowStart = this.headPosition.y;
      this.element[0].style.gridColumnStart = this.headPosition.x;

      // GET NEXT POSITION OF SNAKE HEAD
      if (this.direction === 'R') this.headPosition.x++;
      if (this.direction === 'L') this.headPosition.x--;
      if (this.direction === 'D') this.headPosition.y++;
      if (this.direction === 'U') this.headPosition.y--;

      // CHECK FOR SNAKE COLLISION WITH OWN BODY
      if (this.bodyPosition.has(`${this.headPosition.y}, ${this.headPosition.x}`)) {

         isGameOver = true;
         return;

      }

      // PUT LAST BODY SEGMENT AS NEW HEAD
      this.element.unshift(this.element.pop());

      // CHECK FOR SNAKE COLLISION WITH WALLS
      if (this.headPosition.x > boardSize || this.headPosition.y > boardSize || this.headPosition.x < 1 || this.headPosition.y < 1) {

         isGameOver = true;
         return;

      }

      // UPDATE SNAKE POSITION
      this.element[0].style.gridRowStart = this.headPosition.y;
      this.element[0].style.gridColumnStart = this.headPosition.x;
      
      // EXPAND IF FOOD IS EATEN
      this.expandSnake()

   }

   expandSnake() {

      // CHECK IF FOOD IS EATEN
      if (food.position.x === this.headPosition.x && food.position.y === this.headPosition.y) {
         
         this.length++;

         // INCREASE SNAKE SPEED
         if (this.speed > 60 && this.length % 3 === 0) {

            this.speed -= 5;

         } else if (this.speed <= 60 && this.length % 4 === 0 && this.speed > 30) {

            this.speed -= 2;

         } else if (this.speed <= 30 && this.length % 5 === 0 && this.speed > 10) {

            this.speed -= 1;

         }

         // CREATE NEW BODY SEGMENT
         const snakeBody = document.createElement('SPAN');
         snakeBody.classList.add('snake');
         snakeBody.style.gridRowStart = food.position.y;
         snakeBody.style.gridColumnStart = food.position.x;
         board.appendChild(snakeBody);
         
         this.element.push(snakeBody);

         // PLACE FOOD IN NEW POSITION
         food.generateRandomPosition();

         // UPDATE CURRENT SCORE
         score.textContent = `YOUR SCORE: ${this.length - 2}`;

      }

   }

   // CHANGE THE DIRECTION OF THE SNAKE
   set changeDirection(key) {

      this.direction = key;

   }

}

// INSTANTIATE CLASSES
const snake = new Snake(120, 'R', { x: 1, y: 1 });
const food = new Food({ x: 2, y: 1 });



/* ---------------------------------------------- EVENT LISTENERS ---------------------------------------------- */

// CHANGE SNAKE DIRECTION ACCORDING TO ARROWKEYS PRESSED
document.addEventListener('keydown', (e) => {

   if (e.key === 'ArrowRight' && snake.direction !== 'L' && !isGameOver) currentDirection = 'R';
   if (e.key === 'ArrowLeft' && snake.direction !== 'R' && !isGameOver) currentDirection = 'L';
   if (e.key === 'ArrowDown' && snake.direction !== 'U' && !isGameOver) currentDirection = 'D';
   if (e.key === 'ArrowUp' && snake.direction !== 'D' && !isGameOver) currentDirection = 'U';

});

// START GAME
startBtn.addEventListener('click', () => {

   document.removeEventListener('mouseover', hoverEvent);

   gameCover.classList.add('hidden');

   food.placeFood();
   window.requestAnimationFrame(gameClock);

})

// RESTART GAME
restartBtn.addEventListener('click', () => {
   
   isGameOver = false;

   snake.length = 1;
   snake.speed = 120;
   snake.direction = 'R';
   snake.headPosition = { x: 1, y: 1 };
   snake.bodyPosition = new Set();
   snake.element.forEach((elem, ind) => { if (ind !== 0) elem.remove() });
   snake.element = [...document.querySelectorAll('.snake')];
   food.position = { x: 2, y: 1 };

   food.placeFood();
   window.requestAnimationFrame(gameClock);

   tryAgain.classList.add('hidden');
   status.textContent = `LET'S PLAY`;
   score.textContent = `YOUR SCORE: 0`;

})

// SOME RANDOM BULLSHIT
document.addEventListener('mouseover', hoverEvent)



/* ---------------------------------------------- MISC FUNCTIONS ---------------------------------------------- */

// FORMATS TIME FOR LEADERBOARD
function getTime() {

   let now = new Date();
   let month = now.getMonth();
   let date = now.getDate();
   let year = now.getFullYear();
   let hr = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
   let mins = now.getMinutes().toString().padStart(2, '0');
   let ampm = now.getHours() > 12 ? 'PM' : 'AM';
   return `${month}/${date}/${year} (${hr}:${mins} ${ampm})`;
   
}

// SOME RANDOM BULLSHIT
function hoverEvent(e) {
   if (e.target === startBtn) {

      startBtn.textContent = '8===D~';

   } else {

      startBtn.textContent = 'LARUIN';

   }
}
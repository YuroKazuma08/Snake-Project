'use strict'



let lastRenderTime = 0;
let isGameOver = false;
let currentDirection = '';

function gameClock(currentTime) {

   if (isGameOver) {
      console.log('Game Over!');
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



const board = document.querySelector('.board');

const snakeFood = document.createElement('SPAN');
snakeFood.setAttribute('id', 'food');
board.appendChild(snakeFood);

const snakeBody = document.createElement('SPAN');
snakeBody.classList.add('snake');
board.appendChild(snakeBody);



class Food {
   
   constructor(_pos) {
      this.element = document.querySelector('#food');
      this.position = _pos;
   }

   placeFood() {

      this.element.style = `top: ${this.position.y * 12}px; left: ${this.position.x * 12}px;`;

   }

   generateRandomPosition() {

      do {
         this.position = {
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 50)
         }
      } while (snake.bodyPosition.has(`${this.position.y * 12}px, ${this.position.x * 12}px`));

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

      this.bodyPosition = new Set(this.element.map((elem) => `${elem.style.top}, ${elem.style.left}`));

      this.element[0].style = `top: ${this.headPosition.y * 12}px; left: ${this.headPosition.x * 12}px;`;

      if (this.direction === 'R') this.headPosition.x++;
      if (this.direction === 'L') this.headPosition.x--;
      if (this.direction === 'D') this.headPosition.y++;
      if (this.direction === 'U') this.headPosition.y--;

      if (this.bodyPosition.has(`${this.headPosition.y * 12}px, ${this.headPosition.x * 12}px`)) {
         isGameOver = true;
         return;
      }

      this.element.unshift(this.element.pop());

      if (this.headPosition.x > 49 || this.headPosition.y > 49
         || this.headPosition.x < 0 || this.headPosition.y < 0) {
         isGameOver = true;
         return;
      }

      this.element[0].style = `top: ${this.headPosition.y * 12}px; left: ${this.headPosition.x * 12}px;`;
      
      this.expandSnake()

   }

   expandSnake() {

      if (food.position.x === this.headPosition.x && food.position.y === this.headPosition.y) {
         
         this.length++;
         if (this.speed > 10 && this.length % 3 === 0) this.speed -= 5;
         const snakeBody = document.createElement('SPAN');
         snakeBody.classList.add('snake');
         snakeBody.style = `top: -12px; left: -12px;`;
         board.appendChild(snakeBody);
         
         this.element.push(snakeBody);

         food.generateRandomPosition();

      }

   }

   set changeDirection(key) {
      this.direction = key;
   }

}



document.addEventListener('keydown', (e) => {

   if (e.key === 'ArrowRight' && snake.direction !== 'L') currentDirection = 'R';
   if (e.key === 'ArrowLeft' && snake.direction !== 'R') currentDirection = 'L';
   if (e.key === 'ArrowDown' && snake.direction !== 'U') currentDirection = 'D';
   if (e.key === 'ArrowUp' && snake.direction !== 'D') currentDirection = 'U';

});



const snake = new Snake(120, 'R', { x: 0, y: 0 });
const food = new Food({ x: 25, y: 25 });



food.placeFood();
window.requestAnimationFrame(gameClock);
console.log('Game has started!');
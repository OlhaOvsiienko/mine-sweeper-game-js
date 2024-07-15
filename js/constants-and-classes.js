// Изображения (бомбы, флаги)
const bombImage = document.createElement('img');
bombImage.src = 'img/bomb.png';
const flagImage = document.createElement('img');
flagImage.src = 'img/flag.png';
flagImage.classList.add('flag-image');

// Игровое поле: размер, количество бомб, цвета цифр в ячейках возле бомб
const sizeLookup = {
  '9': {totalBombs: 5},
  '16': {totalBombs: 6},
  '30': {totalBombs: 7}
};

const bombColors = {
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'purple',
    5: 'orange',
    6: 'black',
    7: 'grey',
    8: 'yellow',
};

// Таймер
let milliseconds = 0;
let seconds = 0;
let minutes = 0;
let hours = 0;

// Определение текущего уровеня сложности
let currentDifficulty = 9;
let totalBombs = sizeLookup[currentDifficulty].totalBombs;
const buttons = document.querySelectorAll('[id^="size-"]');
let row = currentDifficulty;
let col = currentDifficulty;

let board = null; // Создаем пустой двухмерный массив для игрового поля

// Игровые переменные
let gameOver = false;
let remainCells = row * col; 
let timerRunning = false;
let timerInterval;

// Данные игрока
let playerName = "Anonymous"; // Устанавливаем значение по умолчанию
let time = 0;
let bestPlayer = null;
let players = [];    

let localStorageBestPlayer = {};

// Всплывающие сообщения
const playerResultContainer = document.querySelector('.player-result');
const whoIsPlaying = document.getElementById('whoIsPlaying');

//********************************** Classes **************************

// Класс Ячейки

class BoardCell {
  hasBomb = false;
  revealed = false;
  cellImage;
  rowIndex;
  colIndex;
  htmlCell;
  
  constructor(rowIndex, colIndex) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.htmlCell = document.createElement("td");
    this.htmlCell.className = "game-cell"; // Добавляем класс для стилизации
  
    this.cellImage = document.createElement("img"); // Создаем элемент изображения для ячейки
    this.cellImage.src = ""; // По умолчанию не показываем изображение
    this.htmlCell.appendChild(this.cellImage); // Добавляем изображение в ячейку
  
    this.htmlCell.addEventListener("contextmenu", (event) =>
    // Предотвращаем стандартное контекстное меню браузера
    this.handleCellRightClick(event)
    );
  
    this.htmlCell.addEventListener("click", (event) => this.handleClick());
  }
  
  handleCellRightClick(event) {
    event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
    
    if (gameOver || this.revealed) {
      return; // Если игра завершена или ячейка уже открыта, игнорируем клик правой кнопкой
    }
  
    showWhoIsPlaying(playerName);

    if (!this.flagged) {
      // Если ячейка не была отмечена флагом, устанавливаем флаг
      this.flagged = true;
      this.cellImage.src = flagImage.src; // Установливаем изображение флага
    } else {
      // Если ячейка уже была отмечена флагом, удаляем флаг
      this.flagged = false;
      this.cellImage.src = ""; // Очищаем изображение (удаляем флаг)
    }
    
    if (isFirstClick) {
      isFirstClick = false;
      timerRunning = true; // Устанавливаем флаг, что таймер запущен
      timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую мск
    }

    winGame(remainCells);
  }
  
  handleClick() {
    if (gameOver) {
      return;
    }
    
    showWhoIsPlaying(playerName);
  
    if (this.hasBomb) {
      openAllBombs();    
      showLoseMessage(playerName); // Показываем сообщение о проигрыше
      gameOver = true; // Устанавливаем состояние игры "проиграно"
      updateSmile();
    } else {
      // Если ячейка не имеет бомбы, открываем её
      openCell(this.rowIndex, this.colIndex);
    }
    
    // Проверяем условие победы после каждого клика
    winGame(remainCells);

    // Если это первый клик, запускаем таймер
    if (isFirstClick) {
      isFirstClick = false;
      timerRunning = true; // Устанавливаем флаг, что таймер запущен
      timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую мск 
    }
  }
}

// Класс Игрок
class Player {
  constructor(playerName, time, currentDifficulty) {
      this._playerName = playerName; // Приватное поле
      this._bestTime = time; // Приватное поле
      this._currentDifficulty = currentDifficulty; // Приватное поле
  }

  // Геттеры
  get playerName() {
    console.log(`Запрос имени игрока: ${this._playerName}`);
      return this._playerName;
  }

  get bestTime() {
    console.log(`Запрос имени игрока: ${this._bestTime}`);
      return this._bestTime;
  }

  get currentDifficulty() {
    console.log(`Запрос имени игрока: ${this._currentDifficulty}`);
      return this._currentDifficulty;
  }

  // Сеттеры
  set bestTime(newTime) {
      if (newTime < this._bestTime) {
          this._bestTime = newTime;
      }
  }

  set currentDifficulty(newDifficulty) {
      this._currentDifficulty = newDifficulty;
  }

  static addPlayer(players, playerName, time, currentDifficulty) {
      if (!Array.isArray(players)) {
          console.error("players is not an array.");
          return;
      }

      if (gameOver === true && remainCells === totalBombs) {
        let existingPlayer = players.find(player => player.playerName === playerName);
        let newTime = time; // Инициализируем newTime значением time

        if (!existingPlayer) {
            // Если игрока нет, создаем нового игрока и добавляем его
            const player = new Player(playerName, newTime, currentDifficulty);
            players.push(player);
        } else {
            if (newTime < existingPlayer.bestTime) {
                existingPlayer.bestTime = newTime;
            }

            // Обновляем уровень сложности
            existingPlayer.currentDifficulty = currentDifficulty;
        }
        console.log(players);
    }
  }
    

  static findBestPlayer(players, currentDifficulty) {
      if (players.length === 0) {
          console.log("Нет игроков.");
          return;
      }
console.log(currentDifficulty);
      let bestPlayer = null;

      for (const player of players) {
          if (player.currentDifficulty === currentDifficulty) {
              if (!bestPlayer || player.bestTime < bestPlayer.bestTime) {
                  bestPlayer = player;
              }
          }
      }

      return bestPlayer;
      
  }
}


// При первом вызове игры автоматически загружается поле уровня Easy
document.addEventListener('DOMContentLoaded', function () {
    startGame(currentDifficulty, currentDifficulty, totalBombs);  
}); 

// Обработчик клика на верхний смайл
document.getElementById('smileBeginPlay').addEventListener('click', function() {
    startGame(currentDifficulty, currentDifficulty, totalBombs); 
});

// Обработчик события клика на кнопке выбора сложности
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        
        let idValue = parseInt(button.id.replace('size-', '')); // Получаем число из id кнопки
        currentDifficulty = idValue; // Устанавливаем значение currentDifficulty
        totalBombs = sizeLookup[currentDifficulty].totalBombs;
        row = currentDifficulty; // Обновляем значения row и col
        col = currentDifficulty;

        startGame(currentDifficulty, currentDifficulty, totalBombs); 
        console.log(`Current difficulty: ${currentDifficulty}`);
        console.log(`Total bombs: ${totalBombs}`);
    });
});

// Обработчик клика на InputName
document.addEventListener("DOMContentLoaded", () => {
    const playerNameInput = document.getElementById("playerName");
  
    playerNameInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const inputText = playerNameInput.value.trim();
        playerName = inputText || "Anonymous"; // Если inputText пустая строка, устанавливаем "Anonymous"
        console.log(`Who is playing: ${playerName}`);
        showWhoIsPlaying(playerName);
      } 
      
    });
});

// Начало игры
function startGame(rows, cols, totalBombs) {    
        
    playerResultContainer.style.display = 'block';
    whoIsPlaying.style.display = 'none';
    
        board = createGameBoard(rows, cols);
        addBombs(board, totalBombs);
        document.getElementById('lose-message').style.display = 'none';
        document.getElementById('win-message').style.display = 'none';
        document.getElementById(`record-message`).style.display =`none`;
        remainCells = row * col;
        gameOver = false;
    
    // Получаем все изображения в группе
    const faceImages = document.querySelectorAll('.face-img');
    
    // Устанавливаем атрибут src для каждого изображения на "./img/smile-face.png"
    faceImages.forEach(function(img) {
        img.src = "./img/smile-face.png";
    });
        
    // Перезапуск таймера
    isFirstClick = true;
    resetTimer();
    
    // Очищаем интервал таймера, если он был запущен
     if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    }
    
    calculateAdjBombs(board);
}

// Создание игрового поля
    
function createGameBoard(rows, cols) {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = ''; // Очистить контейнер, если уже есть игровое поле

    board = [];
    // Создание игрового поля без бомб
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        const rowArray = []; // Создаем пустой массив для строки игрового поля
        for (let j = 0; j < cols; j++) {
            const cell = new BoardCell(i, j);
            row.appendChild(cell.htmlCell);
            rowArray.push(cell);
        }
        board.push(rowArray); // Добавляем массив строки в массив игрового поля
        boardContainer.appendChild(row);
    }
    return board; // Вернуть игровое поле для размещения бомб
}

// Размещение бомб на поле
function addBombs(board, totalBombs) {
    const size = board.length;
    const availableCells = [];

    // Заполняем массив доступных ячеек
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            availableCells.push({ row, col });
        }
    }

    // Размещаем бомбы случайным образом из доступных ячеек
    for (let i = 0; i < totalBombs; i++) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const { row, col } = availableCells.splice(randomIndex, 1)[0]; // Удаляем из массива ячейку с бомбой, чтобы повторно там ничего не размещать
        board[row][col].hasBomb = true;
    }

    return board;
}

// Функция для вычисления и установки adjBombs для каждой ячейки
function calculateAdjBombs(board) {
    const numRows = board.length;
    const numCols = board[0].length;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (!board[row][col].hasBomb) {
                let bombCount = 0;

                // Проверяем восемь соседних ячеек
                const neighbors = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];

                for (const [dr, dc] of neighbors) {
                    const newRow = row + dr;
                    const newCol = col + dc;

                    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
                        if (board[newRow][newCol].hasBomb) {
                            bombCount++;
                        }
                    }
                }

                // Устанавливаем adjBombs для ячейки
                board[row][col].adjBombs = bombCount;
            }
        }
    }
}

// Открываем пустые ячейки (проверка: пустые ли они)
function openCell(row, col) {
    const cell = board[row][col];
    
    if (cell.revealed) {
        return;
    }

    cell.revealed = true;
    const clickedCell = document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
    
    
// Добавляем класс для подсветки открытой ячейки
    clickedCell.classList.add('revealed');

    if (cell.adjBombs === 0) {
        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];


        for (const [dr, dc] of neighbors) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
                const newCell = board[newRow][newCol];

                if (!newCell.revealed) {
                    openCell(newRow, newCol); // Рекурсивный вызов для соседних ячеек
                }
            }
        }
    } else {
        clickedCell.textContent = cell.adjBombs;
        
        const color = bombColors[cell.adjBombs]; // Берем цвет из объекта
        
        if (color) {
            clickedCell.style.color = color; // Подсвечиваем
    }
    }

    remainCells--;
    
    //Снятие флага с ячеек, оказавшихся на пустом поле
    if (cell.flagged) {
        cell.flagged = false;
        cell.cellImage.src = ''; // Очищаем изображение (удаляем флаг)
    }

}

// Открываем все бомбы
function openAllBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                board[i][j].cellImage.src = 'img/bomb.png';
                board[i][j].cellImage.classList.add('bomb-image');
            }
        }
    }
}

// Изменение смайла: радостный или грустный
function updateSmile() {
    const smileFaceImg = document.getElementById("smileBeginPlay");

    if (gameOver && remainCells === totalBombs) {
        smileFaceImg.src = "./img/cool-face.png"; // Изображение смайлика при победе

    } else {
        smileFaceImg.src = "./img/sad-face.png"; // Изображение смайлика при поражении
    }
}   

// Установка таймера
    
function updateTime() {
    if (!gameOver) {
        milliseconds++; 

        if (milliseconds == 1000) {
            milliseconds = 0;
            seconds++;
        }

        if (seconds == 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes == 60) {
            minutes = 0;
            hours++;
        }
        if (hours == 24) {
            seconds = 0;
            minutes = 0;
            hours = 0;
        }
        
        const timerElement = document.getElementById("timer");
        timerElement.textContent =
        (hours < 10 ? "0" : "") +
        hours + 
        ":" +
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds +
        ":" +
        (milliseconds < 10 ? "00" : (milliseconds < 100 ? "0" : "")) +
        milliseconds;
    }

    if (gameOver) {
        clearInterval(timerInterval); // Останавливаем таймер
    }

}

// Сброс таймера и обнуление
function resetTimer() {
    milliseconds = 0;
    seconds = 0;
    minutes = 0;
    hours = 0;
    const timerElement = document.getElementById("timer");
    timerElement.textContent = "00:00:00:00";
}

// Действия в случае победы
function winGame(remainCells) {
    if (remainCells === totalBombs) {
        openAllBombs();
        showWinMessage(playerName);
    
        gameOver = true;
        updateSmile();
        time = milliseconds + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
        
        console.log(`Time in msec: ${time}`);
    
        console.log(`Time of the game: ${hours}:${minutes}:${seconds}:${milliseconds}`);
        Player.addPlayer(players, playerName, time, currentDifficulty);
        console.log(players);
        bestPlayer = Player.findBestPlayer(players, currentDifficulty);
        console.log(`Player ${bestPlayer.playerName} has the best time: ${bestPlayer.bestTime} msec in level ${currentDifficulty}`);

        // Получите лучшего игрока для текущего уровня сложности из локального хранилища
        const localBestPlayer = getBestPlayerForDifficulty(currentDifficulty);

        // Проверяем, улучшил ли игрок результат
        if (bestPlayer) {
            console.log(`Player ${bestPlayer.playerName} has the best time: ${bestPlayer.bestTime} msec in level ${currentDifficulty}`);
        } else {
            console.log(`No best player found for level ${currentDifficulty}.`);
        }
        
        // Проверяем, улучшил ли игрок результат
        if (!localBestPlayer || time <= localBestPlayer.bestTime) {
            saveBestPlayerForDifficulty(currentDifficulty, playerName, time);
            localStorageBestPlayer = getBestPlayerForDifficulty(currentDifficulty);
            showRecordMessage(bestPlayer, playerName, localStorageBestPlayer, currentDifficulty);
        }
    }
}
// ***************** Результаты ************

// Сообщение о рекорде
function showRecordMessage(bestPlayer, playerName, localStorageBestPlayer, currentDifficulty) {
            
    if (bestPlayer !== null &&  time <= localStorageBestPlayer.bestTime) {
        const messageRecordDiv = document.getElementById('record-message');
        
        console.log(currentDifficulty);
        
        let difficultyMessage;
        
        // Используем условный оператор для определения соответствующего сообщения
        if (currentDifficulty === 9) {
            difficultyMessage = "among Beginners!";
        } else if (currentDifficulty === 16) {
            difficultyMessage = "among Professionals!";
        } else if (currentDifficulty === 30) {
            difficultyMessage = "among Masters!";
        } else {
            difficultyMessage = "unknown difficulty level";
        }

        const messageRecord = `${playerName}, you've got a new record for this level - ${time} msec! You're the best player ${difficultyMessage}`;
        messageRecordDiv.textContent = messageRecord;
        messageRecordDiv.style.display = 'block';
        console.log(`${playerName} has got a record - ${bestPlayer.bestTime}`);    
    }
}

// ****************************** Локальное хранилище **************
function saveBestPlayerForDifficulty(currentDifficulty, playerName, bestTime) {
    const bestPlayers = JSON.parse(localStorage.getItem('bestPlayers')) || {};
    bestPlayers[currentDifficulty] = { playerName, bestTime };
    localStorage.setItem('bestPlayers', JSON.stringify(bestPlayers));
}

// Получаем данные о лучшем игроке из локального хранилища
function getBestPlayerForDifficulty(currentDifficulty) {
    const bestPlayers = JSON.parse(localStorage.getItem('bestPlayers')) || {};
    return bestPlayers[currentDifficulty];
}

// ********************* Появление / исчезание надписей на экране **********
function showWhoIsPlaying(playerName) {
    playerResultContainer.style.display = 'none';        
      whoIsPlaying.innerHTML = `${playerName} is playing...`; 
      whoIsPlaying.style.display = 'block';
}

function showWinMessage(playerName) {
    const messageWinDiv = document.getElementById('win-message');
        const messageWin = `${playerName}, congratulations! You win! You found all the bombs in ${hours}:${minutes}:${seconds}:${milliseconds}`;
        messageWinDiv.textContent = messageWin;
        messageWinDiv.style.display = 'block'; // Сделать сообщение о победе видимым
        whoIsPlaying.style.display = 'none';
}

function showLoseMessage(playerName) {
    const messageLoseDiv = document.getElementById('lose-message');
        const messageLose = `${playerName}, sorry, you lost the game!`;
        messageLoseDiv.textContent = messageLose;
        messageLoseDiv.style.display = 'block'; // Сделать сообщение видимым
        whoIsPlaying.style.display = 'none';
}


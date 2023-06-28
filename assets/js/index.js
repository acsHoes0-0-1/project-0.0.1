const myModal = new bootstrap.Modal(document.getElementById("gameOver"));

let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");
let audio = document.getElementById("noise");
let playButton = document.getElementById("playButton");
let playGameButton = document.getElementById("playGameButton");
let stopwatchInterval;
let milliseconds = 0;
let seconds = 0
let minutes = 0;

let playStatus = false;

const startGameFunction = () => {
  playStatus = true;
  main();
};

function main() {
  // Получение ссылки на холст
  let health = 100; // Начальное значение HP
  let armor = 50; // Начальное значение брони
  audio.volume = 0.1; // музыка
  resetStopwatch();
  startStopwatch();
  hideGameOver();
  // playGameButton.setAttribute('disabled', true);

  function showGameOver() {
    myModal.show();
    stopStopwatch();
    return update();
  }

  function hideGameOver() {
    const gameOverElement = document.getElementById("gameOver");
    gameOverElement.style.display = "none";
  }

  // Проверка, сохранено ли состояние плеера в Local Storage
  if (localStorage.getItem("isPlaying") === "true") {
    // Если состояние плеера сохранено как "воспроизводится", начать воспроизведение
    audio.play();
    playButton.innerHTML = "🔉"; // Изменить текст кнопки на "Пауза"
  } else {
    // Если состояние плеера сохранено как "не воспроизводится", остановить воспроизведение
    audio.pause();
    playButton.innerHTML = "🔊"; // Изменить текст кнопки на "Воспроизвести"
  }

  // Обработчик события для кнопки управления
  playButton.addEventListener("click", function () {
    if (audio.paused) {
      // Если аудио остановлено, начать воспроизведение
      audio.play();
      playButton.innerHTML = "🔉"; // Изменить текст кнопки на "Пауза"
      localStorage.setItem("isPlaying", "true"); // Сохранить состояние в Local Storage
    } else {
      // Если аудио воспроизводится, остановить воспроизведение
      audio.pause();
      playButton.innerHTML = "🔊"; // Изменить текст кнопки на "Воспроизвести"
      localStorage.setItem("isPlaying", "false"); // Сохранить состояние в Local Storage
    }
  });

  // Создание объектов изображений модели
  var playerImages = {
    up: new Image(),
    down: new Image(),
    left: new Image(),
    right: new Image(),
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // // Загрузка изображений модели
  // playerImages.up.src = "custom/king-up5.png"; // Замените "custom/skeleton-up2.png" на путь к изображению модели, смотрящей вверх
  // playerImages.down.src = "custom/king-down5.png"; // Замените "custom/skeleton-down2.png" на путь к изображению модели, смотрящей вниз
  // playerImages.left.src = "custom/king-left5.png"; // Замените "custom/skeleton-left2.png" на путь к изображению модели, смотрящей влево
  // playerImages.right.src = "custom/king-right5.png"; // Замените "custom/skeleton-right2.png" на путь к изображению модели, смотрящей вправо

  // Создание объекта анимации стрелы
  var arrowAnimation = new Image();
  // arrowAnimation.src = "custom/2345.gif"; // Замените "custom/re.gif" на путь к анимированному GIF-файлу стрелы

  function updateStats() {
    var healthBar = document.getElementById("healthBar");
    var armorBar = document.getElementById("armorBar");

    healthBar.textContent = `HP: ${health}%`;
    armorBar.textContent = `Armor: ${armor}%`;
  }

  // Начальные координаты и направление игрока
  var playerX = canvas.width / 2;
  var playerY = canvas.height / 2;
  var playerWidth = 50;
  var playerHeight = 50;
  var playerSpeed = 5;
  var playerDirection = "down"; // Начальное направление взгляда модели

  // Массив для хранения текущих нажатых клавиш
  var keys = {};

  // Обработка нажатия и отпускания клавиш
  document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
  });

  document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
  });

  // Определение стенок в игре
  var walls = [
    { x: 0, y: 0, width: 0, height: 750 }, // Левая стенка
    { x: 1, y: 1, width: 1890, height: 1 }, // Верхняя стенка
    { x: 1, y: 730, width: 1, height: 1 }, // Нижняя стенка
    { x: 1870, y: 0, width: 0, height: 750 }, // Правая стенка
  ]; // Пример стенки: x=200, y=100, width=20, height=200

  var arrows = [
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI,
    },
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 2,
    },
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 3,
    },
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 4,
    },
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 5,
    },
  ];

  function resetArrow(arrow) {
    var randomSide = Math.floor(Math.random() * 4);

    switch (randomSide) {
      case 0: // Левая стенка
        arrow.x = 0;
        arrow.y = Math.random() * canvas.height;
        arrow.direction = (Math.random() * Math.PI) / 2 - Math.PI / 4;
        break;
      case 1: // Верхняя стенка
        arrow.x = Math.random() * canvas.width;
        arrow.y = 0;
        arrow.direction = (Math.random() * Math.PI) / 2 + Math.PI / 4;
        break;
      case 2: // Правая стенка
        arrow.x = canvas.width;
        arrow.y = Math.random() * canvas.height;
        arrow.direction =
          (Math.random() * Math.PI) / 2 + Math.PI / 2 + Math.PI / 4;
        break;
      case 3: // Нижняя стенка
        arrow.x = Math.random() * canvas.width;
        arrow.y = canvas.height;
        arrow.direction = (Math.random() * Math.PI) / 2 + Math.PI + Math.PI / 4;
        break;
    }
  }

  // Использование функции resetArrow для установки начальных значений каждой стрелы
  arrows.forEach(resetArrow);
  // Функция для обновления положения стрел
  function updateArrows() {
    arrows.forEach((arrow) => {
      arrow.x += Math.cos(arrow.direction) * arrow.speed;
      arrow.y += Math.sin(arrow.direction) * arrow.speed;

      if (
        arrow.x < 0 ||
        arrow.x > canvas.width ||
        arrow.y < 0 ||
        arrow.y > canvas.height
      ) {
        resetArrow(arrow);
      }
    });
  }
  // Функция для проверки столкновения игрока с каждой стенкой
  function checkCollisionWithWalls() {
    for (var i = 0; i < walls.length; i++) {
      var wall = walls[i];

      playerX < wall.x + wall.width &&
        playerX + playerWidth > wall.x &&
        playerY < wall.y + wall.height &&
        playerY + playerHeight > wall.y;
    }
  }

  // Функция для проверки столкновения игрока со стрелой
  function checkCollisionWithPlayer() {
    arrows.forEach((arrow) => {
      if (
        arrow.x < playerX + playerWidth &&
        arrow.x + arrow.width > playerX &&
        arrow.y < playerY + playerHeight &&
        arrow.y + arrow.height > playerY
      ) {
        if (armor <= 0) {health -= 50}
        else {armor -= 25}
        resetArrow(arrow);
      }
    });
  }
  // Обновление игры и отрисовка игрока и стрелы
  function update() {
    if (playStatus === true) {
      playGameButton.setAttribute("disabled", true);
    } else {
      return playGameButton.removeAttribute("disabled");
    }

    if (health <= 0) {
      playStatus = false;
      clearInterval(test);
      return showGameOver();
    }
    // Проверка нажатых клавиш и изменение координат игрока
    if (keys["ArrowUp"]) {
      playerY -= playerSpeed;
      if (playerY < 0) {
        playerY = 0;
      }
      playerDirection = "up";
    }

    if (keys["ArrowDown"]) {
      playerY += playerSpeed;
      if (playerY > canvas.height - playerHeight) {
        playerY = canvas.height - playerHeight;
      }
      playerDirection = "down";
    }

    if (keys["ArrowLeft"]) {
      playerX -= playerSpeed;
      if (playerX < 0) {
        playerX = 0;
      }
      playerDirection = "left";
    }

    if (keys["ArrowRight"]) {
      playerX += playerSpeed;
      if (playerX > canvas.width - playerWidth) {
        playerX = canvas.width - playerWidth;
      }
      playerDirection = "right";
    }


    // Проверка столкновений со стенками
    checkCollisionWithWalls();

    // Проверка столкновения с стрелой
    checkCollisionWithPlayer();

    // Очистка холста
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игрока в зависимости от направления взгляда
    switch (playerDirection) {
      case "up":
        context.drawImage(
          playerImages.up,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
        break;
      case "down":
        context.drawImage(
          playerImages.down,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
        break;
      case "left":
        context.drawImage(
          playerImages.left,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
        break;
      case "right":
        context.drawImage(
          playerImages.right,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
        break;
    }

    if (seconds === 5 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 6,
    },
    {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 7,
    },)}

    if (seconds === 10 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 8,
    },)}

    if (seconds === 15 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 9,
    },)}

    if (seconds === 20 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 6,
    },)}

    if (seconds === 40 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 6,
    },)}

    if (seconds === 50 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 6,
    },)}

    if (seconds === 59 && milliseconds === 0) {arrows.push({
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      speed: 5,
      direction: Math.PI / 6,
    },)}


    for (var i = 0; i < arrows.length; i++) {
      var arrow = arrows[i];
      context.drawImage(
        arrowAnimation,
        arrow.x,
        arrow.y,
        arrow.width,
        arrow.height
      );
    }

    // Обновление координат стрелы
    updateArrows();

    // Повторный вызов функции обновления для создания анимации
    // requestAnimationFrame(update);
    updateStats();
  }

  update();

  // Настройка setInterval для вызова функции update каждые 1000/60 миллисекунд (примерно 60 кадров в секунду)

  
  let test = setInterval(update, 1000 / 60);

  Promise.all([
    loadImage("custom/king-down5.png"),
    loadImage("custom/ghost.png"),
  ]).then(([skin, arrow]) => {
    playerImages.up = skin;
    playerImages.down = skin;
    playerImages.left = skin;
    playerImages.right = skin;
    arrowAnimation = arrow;
    update();
  });
}
// window.onload = main;

function startStopwatch() {
  stopwatchInterval = setInterval(function() {
    milliseconds++;
    if (milliseconds === 100) {
      milliseconds = 0;
      seconds++;
    }
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }

    displayTime();
  }, 10);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  milliseconds = 0;
  seconds = 0;
  minutes = 0;
  displayTime();
}

function displayTime() {
  var displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  var displaySeconds = seconds < 10 ? "0" + seconds : seconds;
  var displayMilliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds;

  document.querySelector('#minutes').textContent = displayMinutes;
  document.querySelector('#seconds').textContent = displaySeconds;
  document.querySelector('#milliseconds').textContent = displayMilliseconds;
}
// ─── Core modules ───
import { GameLoop } from './core/game-loop.js';
import { TypingEngine } from './core/typing-engine.js';
import { ScoreManager } from './core/score-manager.js';
import { InputHandler } from './core/input-handler.js';

// ─── Data modules ───
import { CONFIG } from '../assets/config.js';
import { LevelLoader } from './loader/level-loader.js';
import { DifficultyLoader } from './loader/difficulty-loader.js';
import { ImagePreloader } from './core/image-preloader.js';

// ─── Audio modules ───
import { AudioManager } from './audio/audio-manager.js';

// ─── UI modules ───
import { MatrixRain } from './ui/matrix-rain.js';
import { TitleScreen } from './ui/title-screen.js';
import { DifficultyScreen } from './ui/difficulty-screen.js';
import { GameScreen } from './ui/game-screen.js';
import { ResultScreen } from './ui/result-screen.js';
import { SettingsScreen } from './ui/settings-screen.js';
import { GameMenu } from './ui/game-menu.js';

// ─── Game State ───
const State = {
  TITLE: 'title',
  DIFFICULTY: 'difficulty',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  RESULT: 'result',
  SETTINGS: 'settings'
};

let currentState = State.TITLE;
let questions = [];
let difficulties = [];
let selectedDifficulty = null;
let currentQuestionIndex = 0;
let audioInitialized = false;

// ─── Core Instances ───
const gameLoop = new GameLoop(CONFIG.timeLimit);
const typingEngine = new TypingEngine();
const scoreManager = new ScoreManager();
const inputHandler = new InputHandler();
const levelLoader = new LevelLoader();
const difficultyLoader = new DifficultyLoader();
const imagePreloader = new ImagePreloader();
const audioManager = new AudioManager();

// ─── UI Instances ───
const canvas = document.getElementById('matrix-canvas');
const matrixRain = new MatrixRain(canvas);

const titleScreen = new TitleScreen(document.getElementById('title-screen'));
const difficultyScreen = new DifficultyScreen(document.getElementById('difficulty-screen'));
const gameScreen = new GameScreen(document.getElementById('game-screen'));
const resultScreen = new ResultScreen(document.getElementById('result-screen'));
const settingsScreen = new SettingsScreen(document.getElementById('settings-screen'));
const gameMenu = new GameMenu();
gameScreen.setImagePreloader(imagePreloader);

// Connect AudioManager to screens
settingsScreen.setAudioManager(audioManager);
gameMenu.setAudioManager(audioManager);
gameMenu.attach(document.getElementById('game-screen'));

const difficultyLoadPromise = difficultyLoader.loadDifficulties().then((loaded) => {
  difficulties = loaded;
  if (!selectedDifficulty && difficulties.length > 0) {
    selectedDifficulty = difficulties[0];
  }
  return difficulties;
});

// ─── Matrix Rain ───
function resizeCanvas() {
  matrixRain.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
matrixRain.start();

// ─── Screen Management ───
function hideAllScreens() {
  titleScreen.hide();
  difficultyScreen.hide();
  gameScreen.hide();
  resultScreen.hide();
  settingsScreen.hide();
  gameMenu.hideAll();
  document.body.classList.remove('title-active', 'difficulty-active');
}

function showTitle() {
  currentState = State.TITLE;
  hideAllScreens();
  document.body.classList.add('title-active');
  document.body.classList.remove('difficulty-active');
  titleScreen.show(onStartClicked);
}

function showDifficulty() {
  currentState = State.DIFFICULTY;
  hideAllScreens();
  document.body.classList.add('difficulty-active');
  document.body.classList.remove('title-active');
  difficultyScreen.show(difficulties, async (difficulty) => {
    selectedDifficulty = difficulty;
    await startGameForDifficulty(difficulty);
  });
}

// ─── Audio Init (user gesture required) ───
function ensureAudioInit() {
  if (!audioInitialized) {
    audioManager.init();
    audioInitialized = true;
  }
}

// ─── Load Questions ───
async function loadQuestions(csvPath = CONFIG.defaultCSVPath) {
  try {
    const rawQuestions = await levelLoader.loadLevel(csvPath);
    const sourceQuestions = rawQuestions.length > 0
      ? rawQuestions
      : [
          { textDisplay: 'さくら', textKana: 'さくら', imagePath: '' },
          { textDisplay: 'にほん', textKana: 'にほん', imagePath: '' },
          { textDisplay: 'たいぴんぐ', textKana: 'たいぴんぐ', imagePath: '' }
        ];
    questions = sourceQuestions.map(q => ({
      display: q.textDisplay,
      kana: q.textKana,
      imagePath: q.imagePath || ''
    }));
    shuffleArray(questions);
    await imagePreloader.loadAll(questions);
  } catch (e) {
    console.error('Failed to load questions:', e);
    questions = [
      { display: 'さくら', kana: 'さくら', imagePath: '' },
      { display: 'にほん', kana: 'にほん', imagePath: '' },
      { display: 'たいぴんぐ', kana: 'たいぴんぐ', imagePath: '' }
    ];
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ─── Question Flow ───
function nextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
    shuffleArray(questions);
  }
  const q = questions[currentQuestionIndex];
  typingEngine.loadQuestion(q.display, q.kana);
  currentQuestionIndex++;
  updateGameDisplay();
}

function updateGameDisplay() {
  const display = typingEngine.getCurrentDisplay();
  const q = questions[currentQuestionIndex - 1];
  gameScreen.updateQuestion(display.original, q?.imagePath || '');
  gameScreen.updateTyping(display.typed, display.remaining);
  gameScreen.updateScore(scoreManager.getScore());
}

// ─── Countdown ───
function startCountdown() {
  currentState = State.COUNTDOWN;
  hideAllScreens();
  gameScreen.resetState();
  typingEngine.reset();
  gameScreen.show();

  ensureAudioInit();

  let count = CONFIG.countdownDuration;
  gameScreen.showCountdown(count);
  audioManager.playSE('countdown', 'pip');

  const timer = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(timer);
      gameScreen.hideCountdown();
      audioManager.playSE('countdown', 'go');
      startGame();
    } else {
      gameScreen.showCountdown(count);
      audioManager.playSE('countdown', 'pip');
    }
  }, 1000);
}

// ─── Game Start ───
function startGame() {
  currentState = State.PLAYING;
  scoreManager.reset();
  currentQuestionIndex = 0;
  shuffleArray(questions);
  nextQuestion();

  audioManager.playSE('start');
  gameMenu.showButton();

  inputHandler.onKeyDown((key) => {
    if (currentState !== State.PLAYING) return;
    if (key.length !== 1) return;

    const result = typingEngine.handleKeyPress(key);

    if (result.correct) {
      scoreManager.addCorrect();
      audioManager.playSE('type');
    } else {
      scoreManager.addMiss();
      audioManager.playSE('miss');
    }

    if (result.completed) {
      const currentQ = questions[currentQuestionIndex - 1];
      scoreManager.addQuestionComplete(currentQ?.kana.length ?? 0);
      audioManager.playSE('correct');
      nextQuestion();
    } else {
      updateGameDisplay();
    }
  });
  inputHandler.enable();

  gameLoop.start(
    (remaining) => {
      gameScreen.updateTimer(remaining);
    },
    () => {
      endGame();
    }
  );
}

// ─── Game End ───
function endGame() {
  currentState = State.RESULT;
  gameLoop.stop();
  inputHandler.disable();
  inputHandler.destroy();

  audioManager.playSE('end');

  hideAllScreens();
  resultScreen.show({
    score: scoreManager.getScore(),
    accuracy: scoreManager.getAccuracy(),
    correctCount: scoreManager.getCorrectCount(),
    missCount: scoreManager.getMissCount(),
    totalKeystrokes: scoreManager.getTotalKeystrokes()
  });
}

// ─── Button Callbacks ───
async function onStartClicked() {
  await difficultyLoadPromise;
  showDifficulty();
}

function getSelectedCSVPath() {
  return selectedDifficulty?.csv || CONFIG.defaultCSVPath;
}

async function startGameForDifficulty(difficulty) {
  difficultyScreen.hide();
  await loadQuestions(difficulty?.csv || CONFIG.defaultCSVPath);
  startCountdown();
}

titleScreen.onSettings(() => {
  ensureAudioInit();
  currentState = State.SETTINGS;
  hideAllScreens();
  settingsScreen.show();
});

resultScreen.onRestart(async () => {
  await loadQuestions(getSelectedCSVPath());
  startCountdown();
});

resultScreen.onTitle(() => {
  showTitle();
});

settingsScreen.onBack(() => {
  audioManager.saveSettings();
  showTitle();
});

difficultyScreen.onBack(() => {
  showTitle();
});

// ─── Game Menu Callbacks ───
gameMenu.onOpen(() => {
  gameLoop.pause();
  inputHandler.disable();
});

gameMenu.onClose(() => {
  if (currentState === State.PLAYING) {
    gameLoop.resume();
    inputHandler.enable();
  }
});

gameMenu.onRestart(async () => {
  gameLoop.stop();
  inputHandler.disable();
  inputHandler.destroy();
  await loadQuestions(getSelectedCSVPath());
  startCountdown();
});

gameMenu.onBackToTitle(() => {
  gameLoop.stop();
  inputHandler.disable();
  inputHandler.destroy();
  showTitle();
});

// ─── Init ───
showTitle();

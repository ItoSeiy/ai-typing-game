// ─── Core modules ───
import { GameLoop } from './core/game-loop.js';
import { TypingEngine } from './core/typing-engine.js';
import { ScoreManager } from './core/score-manager.js';
import { InputHandler } from './core/input-handler.js';
import { QuestionDeck } from './core/question-deck.js';

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
let difficulties = [];
let selectedDifficulty = null;
let audioInitialized = false;

const questionDeck = new QuestionDeck();

const FALLBACK_QUESTIONS = [
  { display: 'さくら', kana: 'さくら', imagePath: '' },
  { display: 'にほん', kana: 'にほん', imagePath: '' },
  { display: 'たいぴんぐ', kana: 'たいぴんぐ', imagePath: '' }
];

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

// title 画面到達時に全難易度 CSV + 画像を並列 preload（バックグラウンド）。
// cache hit で難易度選択後の startCountdown 直前 loadQuestions が即返る。
const preloadAssetsPromise = difficultyLoadPromise
  .then(async (loadedDifficulties) => {
    const questionArrays = await Promise.all(
      (loadedDifficulties ?? []).map((d) =>
        levelLoader.loadLevel(d.csv).catch(() => [])
      )
    );
    const allQuestions = questionArrays.flat();
    await imagePreloader.loadAll(allQuestions).catch(() => null);
  })
  .catch(() => null);

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
      ? rawQuestions.map(q => ({
          display: q.textDisplay,
          kana: q.textKana,
          imagePath: q.imagePath || ''
        }))
      : FALLBACK_QUESTIONS;
    const changed = questionDeck.setQuestions(sourceQuestions, csvPath);
    if (changed) {
      await imagePreloader.loadAll(questionDeck.snapshot());
    }
  } catch (e) {
    console.error('Failed to load questions:', e);
    questionDeck.setQuestions(FALLBACK_QUESTIONS, '__fallback__');
  }
}

// ─── Question Flow ───
function nextQuestion() {
  const q = questionDeck.next();
  if (!q) return;
  typingEngine.loadQuestion(q.display, q.kana);
  updateGameDisplay();
}

function updateGameDisplay() {
  const display = typingEngine.getCurrentDisplay();
  const q = questionDeck.current();
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
      const currentQ = questionDeck.current();
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
  scoreManager.setScoring(difficulty?.scoring ?? CONFIG.scoring);
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

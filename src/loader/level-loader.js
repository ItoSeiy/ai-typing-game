import { parseCSV } from './csv-parser.js';

function toNumber(value, fieldName) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new TypeError(`Invalid numeric value for ${fieldName}: ${value}`);
  }

  return parsed;
}

export function shuffleQuestions(questions) {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

const levelCache = new Map();
const levelInflight = new Map();

export function _resetLevelCache() {
  levelCache.clear();
  levelInflight.clear();
}

async function fetchAndParse(csvPath) {
  const response = await fetch(csvPath);

  if (!response.ok) {
    throw new Error(`Failed to load level CSV: ${csvPath} (${response.status})`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);

  return rows.map((row) => ({
    id: toNumber(row.id, 'id'),
    textDisplay: row.text_display ?? '',
    textKana: row.text_kana ?? '',
    imagePath: row.image_path ?? ''
  }));
}

export class LevelLoader {
  async loadLevel(csvPath) {
    if (levelCache.has(csvPath)) {
      return levelCache.get(csvPath);
    }

    if (levelInflight.has(csvPath)) {
      return levelInflight.get(csvPath);
    }

    const promise = fetchAndParse(csvPath).then(
      (questions) => {
        levelCache.set(csvPath, questions);
        levelInflight.delete(csvPath);
        return questions;
      },
      (err) => {
        levelInflight.delete(csvPath);
        throw err;
      }
    );

    levelInflight.set(csvPath, promise);
    return promise;
  }

  shuffleQuestions(questions) {
    return shuffleQuestions(questions);
  }
}

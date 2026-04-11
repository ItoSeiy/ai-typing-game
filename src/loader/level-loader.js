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

export class LevelLoader {
  async loadLevel(csvPath) {
    const response = await fetch(csvPath);

    if (!response.ok) {
      throw new Error(`Failed to load level CSV: ${csvPath} (${response.status})`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    return rows.map((row) => ({
      id: toNumber(row.id, 'id'),
      textJa: row.text_ja ?? '',
      textRomaji: row.text_romaji ?? '',
      imagePath: row.image_path ?? '',
      category: row.category ?? '',
      difficultyWeight: toNumber(row.difficulty_weight, 'difficulty_weight')
    }));
  }

  shuffleQuestions(questions) {
    return shuffleQuestions(questions);
  }
}

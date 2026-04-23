import { CONFIG } from '../../assets/config.js';

function normalizeScoring(rawScoring) {
  const fallback = {
    pointPerChar: CONFIG.scoring.pointPerChar,
    missPoint: CONFIG.scoring.missPoint
  };

  if (!rawScoring || typeof rawScoring !== 'object') {
    return fallback;
  }

  const pointPerChar = Number.isFinite(rawScoring.pointPerChar)
    ? rawScoring.pointPerChar
    : fallback.pointPerChar;
  const missPoint = Number.isFinite(rawScoring.missPoint)
    ? rawScoring.missPoint
    : fallback.missPoint;

  return { pointPerChar, missPoint };
}

const FALLBACK_DIFFICULTY = [
  {
    id: 'normal',
    label: 'ふつう',
    description: '標準難易度。まずはここから始めよう。',
    csv: CONFIG.defaultCSVPath,
    scoring: {
      pointPerChar: CONFIG.scoring.pointPerChar,
      missPoint: CONFIG.scoring.missPoint
    }
  }
];

function normalizeDifficulty(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = String(entry.id ?? '').trim();
  if (!id) {
    return null;
  }

  return {
    id,
    label: String(entry.label ?? id).trim() || id,
    description: String(entry.description ?? '').trim(),
    csv: String(entry.csv ?? CONFIG.defaultCSVPath).trim() || CONFIG.defaultCSVPath,
    scoring: normalizeScoring(entry.scoring)
  };
}

export class DifficultyLoader {
  async loadDifficulties() {
    try {
      const response = await fetch('assets/levels/levels.json');

      if (!response.ok) {
        return FALLBACK_DIFFICULTY.map((entry) => ({ ...entry, scoring: { ...entry.scoring } }));
      }

      const text = await response.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return FALLBACK_DIFFICULTY.map((entry) => ({ ...entry, scoring: { ...entry.scoring } }));
      }

      const difficulties = parsed
        .map(normalizeDifficulty)
        .filter((entry) => entry !== null);

      return difficulties.length > 0
        ? difficulties
        : FALLBACK_DIFFICULTY.map((entry) => ({ ...entry, scoring: { ...entry.scoring } }));
    } catch (error) {
      console.error('Failed to load difficulty registry:', error);
      return FALLBACK_DIFFICULTY.map((entry) => ({ ...entry, scoring: { ...entry.scoring } }));
    }
  }
}

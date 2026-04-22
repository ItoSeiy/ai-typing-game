import { CONFIG } from '../../assets/config.js';

const FALLBACK_DIFFICULTY = [
  {
    id: 'normal',
    label: 'ふつう',
    description: '標準難易度。まずはここから始めよう。',
    csv: CONFIG.defaultCSVPath
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
    csv: String(entry.csv ?? CONFIG.defaultCSVPath).trim() || CONFIG.defaultCSVPath
  };
}

export class DifficultyLoader {
  async loadDifficulties() {
    try {
      const response = await fetch('assets/levels/levels.json');

      if (!response.ok) {
        return [...FALLBACK_DIFFICULTY];
      }

      const text = await response.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [...FALLBACK_DIFFICULTY];
      }

      const difficulties = parsed
        .map(normalizeDifficulty)
        .filter((entry) => entry !== null);

      return difficulties.length > 0 ? difficulties : [...FALLBACK_DIFFICULTY];
    } catch (error) {
      console.error('Failed to load difficulty registry:', error);
      return [...FALLBACK_DIFFICULTY];
    }
  }
}

import { starterMeals } from './utils/starterMeals';

export const LS_KEY = 'meal_dice.meals';

export function loadMeals() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      localStorage.setItem(LS_KEY, JSON.stringify(starterMeals));
      return starterMeals;
    }
    const parsed = JSON.parse(raw);

    // If array missing/empty → seed examples
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(starterMeals));
      return starterMeals;
    }
    return parsed;
  } catch {
    // any parse error → seed examples
    localStorage.setItem(LS_KEY, JSON.stringify(starterMeals));
    return starterMeals;
  }
}

export function saveMeals(meals) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(meals)); } catch {}
}

// Explicit controls
export function resetToExamples() {
  localStorage.setItem(LS_KEY, JSON.stringify(starterMeals));
  return starterMeals;
}
export function deleteExamplesOnly(current) {
  return current.filter(m => !m.isExample);
}

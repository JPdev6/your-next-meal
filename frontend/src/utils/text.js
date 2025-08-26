export function normalizeMealName(raw) {
  if (!raw) return '';
  let txt = raw.toLowerCase();

  // μόνο ελληνικά γράμματα + space
  txt = txt.replace(/[^α-ωάέήίόύώ\s]/g, '');

  // κόψε στα 4 words max
  const words = txt.trim().split(/\s+/).slice(0, 4);
  return words.join(' ');
}

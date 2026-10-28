/** Age in whole years on `today` for a birth date, or null if the date isn't real. */
export function ageFrom(y: number, m: number, d: number, today = new Date()): number | null {
  const b = new Date(Date.UTC(y, m - 1, d));
  if (!y || b.getUTCFullYear() !== y || b.getUTCMonth() !== m - 1 || b.getUTCDate() !== d) return null;
  if (y < 1900 || b > today) return null;
  let age = today.getUTCFullYear() - y;
  if (today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d)) age--;
  return age;
}

export const MIN_AGE = 18;

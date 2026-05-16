export function frequencyTier(freq: number): { label: string; color: string } {
  if (freq >= 500) return { label: 'Very common (top 1k)', color: 'bg-emerald-50 text-emerald-700' };
  if (freq >= 100) return { label: 'Common (1k–5k)', color: 'bg-blue/10 text-blue' };
  if (freq >= 20)  return { label: 'Moderate (5k–20k)', color: 'bg-amber-50 text-amber-700' };
  return { label: 'Rare', color: 'bg-red-50 text-red-700' };
}

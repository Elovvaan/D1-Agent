export function selectAdapter(adapters, context) {
  const scored = adapters
    .map((adapter) => ({ adapter, score: adapter.matches(context) }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score >= 0.5 ? scored[0] : null;
}

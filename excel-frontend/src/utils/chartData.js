export const aggregateData = (rows, xKey, yKey, mode = 'sum') => {
  const map = new Map();

  rows.forEach((row) => {
    const rawX = row[xKey];
    const y = Number(row[yKey]);

    if (rawX === null || rawX === undefined || rawX === '' || isNaN(y)) return;

    const key = String(rawX);
    const prev = map.get(key) || { total: 0, count: 0 };
    prev.total += y;
    prev.count += 1;
    map.set(key, prev);
  });

  return [...map.entries()].map(([x, { total, count }]) => ({
    [xKey]: x,
    [yKey]: mode === 'avg' ? total / count : total,
  }));
};

export const topN = (data, xKey, yKey, n = 8) => {
  const sorted = [...data].sort((a, b) => b[yKey] - a[yKey]);
  if (sorted.length <= n) return sorted;

  const top = sorted.slice(0, n);
  const restSum = sorted.slice(n).reduce((sum, d) => sum + d[yKey], 0);
  return [...top, { [xKey]: 'Others', [yKey]: restSum }];
};

export const compactNumber = (v) => {
  if (typeof v !== 'number') return v;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v;
};
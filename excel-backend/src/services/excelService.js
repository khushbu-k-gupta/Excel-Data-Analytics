import XLSX from 'xlsx';

export const parseWorkbook = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const raw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

  const headers = (raw[0] || []).map((h) => String(h));
  const rows = raw.slice(1);

  // Column type detect — Analytics page pe auto chart suggestions ke liye! 🎯
  const detectType = (colIndex) => {
    const sample = rows
      .slice(0, 100)
      .map((r) => r[colIndex])
      .filter((v) => v !== null && v !== undefined && v !== '');
    if (!sample.length) return 'unknown';

    const allNumbers = sample.every(
      (v) => typeof v === 'number' || (!isNaN(parseFloat(v)) && isFinite(v))
    );
    if (allNumbers) return 'number';

    const allDates = sample.every((v) => v instanceof Date);
    if (allDates) return 'date';

    return 'string';
  };

  const columns = headers.map((name, i) => ({ name, type: detectType(i) }));

  return { headers, rows, columns, sheetName, totalRows: rows.length };
};

// Saved config se mini chart data banao — top points only, light payload
export const buildChartSummary = (filePath, { x, y, chartType }) => {
  const { headers, rows } = parseWorkbook(filePath);
  const rowObjects = rows.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i]]))
  );

  const map = new Map();
  rowObjects.forEach((row) => {
    const rawX = row[x];
    const val = Number(row[y]);
    if (rawX == null || rawX === '' || isNaN(val)) return;
    map.set(String(rawX), (map.get(String(rawX)) || 0) + val);
  });

  let data = [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return chartType === 'pie' ? data.slice(0, 6) : data.slice(0, 25);
};
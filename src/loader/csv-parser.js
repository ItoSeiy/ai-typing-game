function splitCSVRows(csvString) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvString.length; i += 1) {
    const char = csvString[i];

    if (inQuotes) {
      if (char === '"') {
        if (csvString[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n' || char === '\r') {
      row.push(field);
      field = '';

      if (char === '\r' && csvString[i + 1] === '\n') {
        i += 1;
      }

      if (row.some((value) => value !== '')) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value !== '')) {
    rows.push(row);
  }

  return rows;
}

export function parseCSV(csvString) {
  if (typeof csvString !== 'string' || csvString.length === 0) {
    return [];
  }

  const normalized = csvString.replace(/^\uFEFF/, '');
  const rows = splitCSVRows(normalized);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];

  return rows.slice(1).map((row) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });

    return record;
  });
}


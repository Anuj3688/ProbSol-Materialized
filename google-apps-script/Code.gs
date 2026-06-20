const SHEET_NAME = 'Entries';

const HEADERS = ['ID', 'Type', 'Status', 'Title', 'Description', 'Tags', 'Timestamp'];

function doGet(e) {
  return getEntries();
}

function doPost(e) {
  return addEntry(e);
}

function addEntry(e) {
  try {
    const body = parseRequestBody(e);
    const type = normalizeType(body.type);
    const status = normalizeStatus(body.status, type);
    const title = normalizeText(body.title);
    const description = normalizeText(body.description);
    const tags = normalizeTags(body.tags);
    const validationError = validateEntry({ type, status, title });

    if (validationError) {
      return jsonResponse({
        success: false,
        error: validationError,
      });
    }

    const sheet = getOrCreateEntriesSheet();
    const entry = {
      id: Utilities.getUuid(),
      type,
      status,
      title,
      description,
      tags,
      timestamp: new Date().toISOString(),
    };

    sheet.appendRow([
      entry.id,
      entry.type,
      entry.status,
      entry.title,
      entry.description,
      entry.tags.join(', '),
      entry.timestamp,
    ]);

    return jsonResponse({
      success: true,
      data: entry,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message,
    });
  }
}

function getEntries() {
  try {
    const sheet = getOrCreateEntriesSheet();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return jsonResponse({
        success: true,
        data: [],
      });
    }

    const entries = values
      .slice(1)
      .filter((row) => row[0])
      .map((row) => ({
        id: row[0],
        type: row[1],
        status: row[2] || defaultStatusForType(row[1]),
        title: row[3],
        description: row[4],
        tags: parseTagsFromCell(row[5]),
        timestamp: row[6],
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return jsonResponse({
      success: true,
      data: entries,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message,
    });
  }
}

function getOrCreateEntriesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

function validateEntry(entry) {
  if (!entry.type) {
    return 'Type is required';
  }

  if (!['Problem', 'Solution'].includes(entry.type)) {
    return 'Type must be Problem or Solution';
  }

  if (!['OPEN', 'SOLVED'].includes(entry.status)) {
    return 'Status must be OPEN or SOLVED';
  }

  if (!entry.title) {
    return 'Title is required';
  }

  return null;
}

function normalizeType(value) {
  const text = normalizeText(value).toLowerCase();

  if (text === 'solution') {
    return 'Solution';
  }

  if (text === 'problem') {
    return 'Problem';
  }

  return normalizeText(value);
}

function normalizeStatus(value, type) {
  const text = normalizeText(value).toUpperCase();

  if (text === 'OPEN' || text === 'SOLVED') {
    return text;
  }

  return defaultStatusForType(type);
}

function defaultStatusForType(type) {
  return type === 'Solution' ? 'SOLVED' : 'OPEN';
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(normalizeText)
    .filter(Boolean);
}

function parseTagsFromCell(value) {
  return String(value || '')
    .split(',')
    .map(normalizeText)
    .filter(Boolean);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

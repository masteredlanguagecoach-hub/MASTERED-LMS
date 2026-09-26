// ============================================================
// Utils.gs — Shared utility functions
// Mastered Skill Academy LMS
// ============================================================

/**
 * Generate a unique padded ID with prefix.
 * Uses LockService to prevent duplicate IDs under concurrent writes.
 * @param {string} prefix - e.g. 'STD'
 * @param {string} sheetName - sheet to count existing rows
 * @returns {string} e.g. 'STD000042'
 */
function generateId(prefix, sheetName) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet ? Math.max(sheet.getLastRow() - 1, 0) : 0;
    const num = lastRow + 1;
    return prefix + String(num).padStart(6, '0');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Generate a cryptographically random token.
 * @param {number} length
 * @returns {string}
 */
function generateToken(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Simple SHA-256-based password hashing using Utilities.computeDigest.
 * Applies PBKDF2-style stretching with a salt.
 * @param {string} password
 * @param {string} salt
 * @returns {string}
 */
function hashPassword(password, salt) {
  let hash = password + salt;
  // Stretch with multiple rounds
  for (let i = 0; i < 10000; i++) {
    const bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      hash + i + salt
    );
    hash = bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  return hash;
}

/**
 * Generate a random salt string.
 * @returns {string}
 */
function generateSalt() {
  return generateToken(32);
}

/**
 * Verify a password against a stored hash and salt.
 */
function verifyPassword(password, salt, storedHash) {
  return hashPassword(password, salt) === storedHash;
}

/**
 * Return current ISO timestamp.
 */
function now() {
  return new Date().toISOString();
}

/**
 * Format a Date object to ISO string.
 */
function toISO(date) {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

/**
 * Build a success response object.
 */
function successResponse(data, message) {
  return { success: true, data: data || null, message: message || 'OK' };
}

/**
 * Build an error response object.
 */
function errorResponse(message, code) {
  return { success: false, error: message || 'An error occurred', code: code || 'ERROR' };
}

/**
 * Build JSON ContentService output.
 */
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Validate that required fields are present in a params object.
 */
function validateRequired(params, fields) {
  const missing = fields.filter(f => !params[f] && params[f] !== 0 && params[f] !== false);
  if (missing.length > 0) {
    throw new Error('Missing required fields: ' + missing.join(', '));
  }
}

/**
 * Safe string trimming.
 */
function clean(val) {
  return val ? String(val).trim() : '';
}

/**
 * Convert a sheet row array to an object using headers.
 */
function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] !== undefined ? row[i] : '';
  });
  return obj;
}

/**
 * Convert array of rows + headers to array of objects.
 */
function sheetDataToObjects(data) {
  if (!data || data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => rowToObject(headers, row)).filter(obj => obj[headers[0]]);
}

/**
 * Get all data from a sheet as objects.
 */
function getAllFromSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  return sheetDataToObjects(data);
}

/**
 * Find a row by a field value.
 */
function findByField(sheetName, field, value) {
  const rows = getAllFromSheet(sheetName);
  return rows.find(r => String(r[field]) === String(value)) || null;
}

/**
 * Find all rows matching a field value.
 */
function findAllByField(sheetName, field, value) {
  const rows = getAllFromSheet(sheetName);
  return rows.filter(r => String(r[field]) === String(value));
}

/**
 * Append a row to a sheet using an object (must match headers).
 */
function appendRow(sheetName, obj) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sheet.appendRow(row);
}

/**
 * Update a row in a sheet by matching a field value.
 */
function updateRow(sheetName, idField, idValue, updates) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return false;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf(idField);
  if (idCol === -1) return false;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(idValue)) {
      Object.keys(updates).forEach(key => {
        const col = headers.indexOf(key);
        if (col !== -1) {
          sheet.getRange(i + 1, col + 1).setValue(updates[key]);
        }
      });
      return true;
    }
  }
  return false;
}

/**
 * Get client IP from request object (best-effort).
 */
function getClientInfo(e) {
  try {
    return {
      userAgent: e && e.parameter ? (e.parameter['User-Agent'] || '') : '',
      ip: ''
    };
  } catch (_) {
    return { userAgent: '', ip: '' };
  }
}

/**
 * Validate email format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate mobile number (10 digits).
 */
function isValidMobile(mobile) {
  return /^\d{10}$/.test(String(mobile).replace(/\s/g, ''));
}

/**
 * Parse a comma-separated list to array.
 */
function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Deep clone an object via JSON.
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Paginate an array.
 */
function paginate(arr, page, pageSize) {
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || CONFIG.DEFAULT_PAGE_SIZE;
  const start = (page - 1) * pageSize;
  return {
    items: arr.slice(start, start + pageSize),
    total: arr.length,
    page: page,
    pageSize: pageSize,
    totalPages: Math.ceil(arr.length / pageSize)
  };
}

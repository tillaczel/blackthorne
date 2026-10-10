// Receives check-ins from the invitation site and writes them to this spreadsheet.
// Setup: see README "Google Sheet setup". After editing this code, publish a new version:
// Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.

const SHEET_NAME = 'Admissions';
const HEADERS = ['Name', 'Party size', 'Patient number', 'Reason for admission', 'Language', 'First checked in', 'Last updated'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const entry = parseCheckin(JSON.parse(e.postData.contents));
    if (!entry) return reply({ ok: false, error: 'invalid' });
    const sheet = admissionsSheet();
    const now = new Date();
    const values = [plainText(entry.name), entry.additional + 1, entry.number, plainText(entry.diagnosis), entry.language];
    // One row per guest: checking in again with the same name updates that row.
    const lastRow = sheet.getLastRow();
    const names = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().map(row => normalize(row[0]).toLowerCase()) : [];
    const index = names.indexOf(entry.name.toLowerCase());
    if (index === -1) {
      sheet.appendRow(values.concat([now, now]));
    } else {
      const row = index + 2;
      sheet.getRange(row, 1, 1, 5).setValues([values]);
      sheet.getRange(row, 7).setValue(now);
    }
    return reply({ ok: true });
  } catch (error) {
    console.error(error);
    return reply({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

function parseCheckin(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const name = normalize(payload.name);
  const diagnosis = normalize(payload.diagnosis);
  const additional = payload.additionalPatients;
  const number = String(payload.number || '');
  const language = payload.language;
  if (name.length < 1 || name.length > 80 || diagnosis.length < 1 || diagnosis.length > 80) return null;
  if (!Number.isInteger(additional) || additional < 0 || additional > 20) return null;
  if (!/^\d{3}$/.test(number) || (language !== 'en' && language !== 'de')) return null;
  return { name, additional, number, diagnosis, language };
}

function admissionsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

const normalize = value => String(value == null ? '' : value).split(/\s+/).filter(Boolean).join(' ');
// A name like "=SUM(...)" would otherwise be stored as a formula.
const plainText = value => (/^[=+\-@]/.test(value) ? "'" + value : value);
const reply = payload => ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);

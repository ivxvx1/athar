/* ==========================================================
   ATHAR | Shared logic for every page
   ----------------------------------------------------------
   The rule that governs this entire file:
   there is no fetch, no XMLHttpRequest and no WebSocket that
   carries the user's file anywhere. The only network request in
   the project reads legal-om.json from this same site, and that
   is a static content file carrying no user data at all.

   SECURITY NOTES FOR REVIEWERS
   - No SQL, no database, no backend: SQL injection is not
     reachable because there is nothing to inject into.
   - No accounts, no sessions, no passwords: authentication and
     access-control flaws have no surface here.
   - Every value that reaches HTML goes through escapeHtml(),
     including EXIF strings read out of the user's own file,
     which are the only attacker-influenced input in the system.
   - No eval, no new Function, no document.write.
   - Uploaded files are read locally and never transmitted.

   Section index:
    1. General helpers
    2. SHA-256 fingerprint
    3. Formatting: sizes, dates and intervals
    4. The 8x8 fingerprint grid
    5. Descriptive technical inspection of images
    6. Chain-of-custody log
    7. Building report.html
   7.b Building START-HERE.html
   7.c Opening the print dialog to save the report as PDF
    8. Building manifest.txt
    9. Building chain-of-custody.txt
   10. Assembling the evidence package
   11. Home page
   12. Verify page
   13. First-hour page
   14. Visual motion
   15. Entry point
   ========================================================== */


/* ==========================================================
   1. General helpers
   ========================================================== */

/** Look up a string by key in a specific language. Used by the report, which always carries both. */
function tl(lang, key) {
  const table = STRINGS[lang] || STRINGS.ar;
  return (key in table) ? table[key] : key;
}

/**
 * Escape any value before it is placed inside HTML.
 * This is the single defence against XSS in this project. Every dynamic
 * value passes through here: what the user types, the file name, and the
 * EXIF strings read out of the file itself, which an attacker can control.
 */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Always two digits: 7 becomes 07 */
function pad2(n) { return String(n).padStart(2, '0'); }

/** Local ISO timestamp without a time zone: 2026-08-09T22:49:00 */
function localISO(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
       + 'T' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());
}

/** The device time-zone offset, formatted as UTC+04:00 */
function tzOffset(date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  return 'UTC' + sign + pad2(Math.floor(abs / 60)) + ':' + pad2(abs % 60);
}

/** YYYYMMDD, used for file names and case references */
function stampDay(date) {
  return String(date.getFullYear()) + pad2(date.getMonth() + 1) + pad2(date.getDate());
}

/** Save any content as a file, entirely inside the browser, with no server involved */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Release the memory once the browser has picked up the request
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Sanitise a file name before it goes into the ZIP.
 * Guards against path traversal: a file called "../../evil.jpg" must not be
 * able to escape the evidence/ folder when the archive is extracted.
 */
function safeFileName(name) {
  // Build the name character by character, dropping invisible control codes (below 32, and 127)
  const clean = Array.from(String(name || 'file'))
    .map(ch => (ch === '/' || ch === '\\') ? '_' : ch)                        // path separators
    .filter(ch => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127)         // control characters
    .join('')
    .replace(/^\.+/, '_')                                                     // leading dots
    .trim();
  return clean || 'file';
}


/* ==========================================================
   2. SHA-256 fingerprint
   ----------------------------------------------------------
   crypto.subtle is built into the browser itself. It takes the raw
   bytes of the file and returns 32 bytes, which we render as 64
   hexadecimal characters.

   Important wording: this is a HASH FUNCTION, not encryption.
   Encryption can be reversed with a key; a hash cannot, and the
   file can never be recovered from it.
   ========================================================== */

/** Can this browser, in this mode, compute the fingerprint? (fails on file:// in some browsers) */
function cryptoAvailable() {
  return !!(window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function');
}

async function computeSha256(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Strict input validation: is the pasted text a well-formed SHA-256 fingerprint? */
function isValidHash(text) {
  return /^[0-9a-f]{64}$/.test(text);
}

/** Normalise a fingerprint before comparing: lower case, no whitespace, no 'SHA-256:' prefix */
function normalizeHash(text) {
  return String(text || '')
    .replace(/^\s*sha[-\s]?256\s*[:=]?\s*/i, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}


/* ==========================================================
   3. Formatting: sizes, dates and intervals
   ========================================================== */

/** A number formatted for the current language, in Latin digits in both, because the report is official */
function fmtNumber(n, lang) {
  return new Intl.NumberFormat((lang || CURRENT_LANG) + '-u-nu-latn').format(n);
}

/** File size in a human-readable unit */
function formatSize(bytes, lang) {
  const L = lang || CURRENT_LANG;
  if (bytes < 1024)          return fmtNumber(bytes, L) + ' ' + tl(L, 'u.bytes');
  if (bytes < 1048576)       return fmtNumber(+(bytes / 1024).toFixed(1), L) + ' ' + tl(L, 'u.kb');
  if (bytes < 1073741824)    return fmtNumber(+(bytes / 1048576).toFixed(2), L) + ' ' + tl(L, 'u.mb');
  return fmtNumber(+(bytes / 1073741824).toFixed(2), L) + ' ' + tl(L, 'u.gb');
}

/** A full timestamp, Gregorian calendar and Latin digits, so any authority can read it */
function formatMoment(date, lang) {
  const L = lang || CURRENT_LANG;
  return date.toLocaleString(L, {
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

/**
 * Correct Arabic pluralisation of a count and its unit:
 * one hour, two hours, 3 hours, 11 hours each take a different form.
 * Note that the singular and dual are not preceded by a numeral,
 * because the word form itself already carries the count.
 */
function arCount(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return fmtNumber(n, 'ar') + ' ' + few;
  return fmtNumber(n, 'ar') + ' ' + many;
}

/**
 * The interval between the file date and the moment of documentation.
 * Presented in readable form rather than as a raw number of seconds.
 */
function formatGap(ms, lang) {
  const L = lang || CURRENT_LANG;
  if (ms < 0) return tl(L, 'u.future');

  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return tl(L, 'u.lessMin');

  const days    = Math.floor(totalMinutes / 1440);
  const hours   = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (L === 'en') {
    const parts = [];
    if (days)    parts.push(days + (days === 1 ? ' day' : ' days'));
    if (hours)   parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
    if (minutes && !days) parts.push(minutes + (minutes === 1 ? ' minute' : ' minutes'));
    return parts.join(' and ');
  }

  const parts = [];
  if (days)    parts.push(arCount(days,    'يوم',   'يومان',   'أيام',  'يومًا'));
  if (hours)   parts.push(arCount(hours,   'ساعة',  'ساعتان',  'ساعات', 'ساعة'));
  if (minutes && !days) parts.push(arCount(minutes, 'دقيقة', 'دقيقتان', 'دقائق', 'دقيقة'));
  // In Arabic the conjunction attaches to the following word: '3 hours and20 minutes'
  return parts.join(' ' + tl(L, 'u.and'));
}

/** A compact English form of the interval, used in the plain-text manifest.txt */
function elapsedPlain(ms) {
  if (ms < 0) return 'negative (device file date is later than documentation time)';
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return 'less than 1 minute';
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(days + (days === 1 ? ' day' : ' days'));
  if (hours) parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
  if (minutes) parts.push(minutes + (minutes === 1 ? ' minute' : ' minutes'));
  return parts.join(' ');
}


/* ==========================================================
   4. The 8x8 fingerprint grid
   ----------------------------------------------------------
   Why a grid rather than a line? Because a 64-character string does
   not read as a number to the human eye; it reads as noise. The grid
   makes the number 64 tangible, and echoes the project's logo, which
   is built from dissolving squares.
   ========================================================== */
function renderHashGrid(container, hex) {
  container.textContent = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < hex.length; i++) {
    const cell = document.createElement('span');
    cell.className = 'hash-cell';
    cell.textContent = hex[i];
    cell.style.animationDelay = (i * 6) + 'ms';   // staggered reveal
    frag.appendChild(cell);
  }
  container.appendChild(frag);
}


/* ==========================================================
   5. Descriptive technical inspection of images
   ----------------------------------------------------------
   The boundary of this section is explicit: we read what is written
   inside the file and display it as it is. We pass no judgement on
   whether an image is genuine, generated or edited. Description only.

   SECURITY NOTE: everything parsed here comes from a file supplied by
   whoever sent it to the victim, so it is untrusted input. The parser
   below never trusts a length field, bounds-checks every read, and
   every extracted string is escaped before it reaches the page.
   ========================================================== */

/** Identify the file type from its leading bytes rather than its extension */
function detectSignature(bytes) {
  const b = bytes;
  const at = (i, arr) => arr.every((v, k) => b[i + k] === v);

  if (b.length >= 3 && at(0, [0xFF, 0xD8, 0xFF]))                       return 'image/jpeg';
  if (b.length >= 8 && at(0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return 'image/png';
  if (b.length >= 4 && at(0, [0x47, 0x49, 0x46, 0x38]))                 return 'image/gif';
  if (b.length >= 12 && at(0, [0x52, 0x49, 0x46, 0x46]) && at(8, [0x57, 0x45, 0x42, 0x50])) return 'image/webp';
  if (b.length >= 12 && at(4, [0x66, 0x74, 0x79, 0x70])) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (/^(heic|heix|hevc|hevx|mif1|msf1)$/.test(brand)) return 'image/heic';
    return 'video/mp4';
  }
  if (b.length >= 2 && at(0, [0x42, 0x4D]))                             return 'image/bmp';
  if (b.length >= 4 && (at(0, [0x49, 0x49, 0x2A, 0x00]) || at(0, [0x4D, 0x4D, 0x00, 0x2A]))) return 'image/tiff';
  return null;
}

/**
 * A compact EXIF reader for JPEG images.
 * EXIF layout: an APP1 segment beginning with FFE1, containing "Exif\0\0"
 * followed by a TIFF header, then directories (IFDs) whose entries are
 * 12 bytes each: tag, type, count, and value or offset.
 */
function readExif(bytes) {
  const out = { present: false, dateTimeOriginal: null, make: null, model: null, gps: false };
  if (bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8) return out;

  // 5.1 Locate the APP1 segment that carries the EXIF block
  let offset = 2, app1 = -1;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xFF) break;
    const marker = bytes[offset + 1];
    if (marker === 0xDA || marker === 0xD9) break;           // start of image data, no further segments
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (size < 2) break;
    if (marker === 0xE1 &&
        bytes[offset + 4] === 0x45 && bytes[offset + 5] === 0x78 &&
        bytes[offset + 6] === 0x69 && bytes[offset + 7] === 0x66) {
      app1 = offset + 10;   // just past "Exif\0\0"
      break;
    }
    offset += 2 + size;
  }
  if (app1 < 0 || app1 + 8 > bytes.length) return out;

  // 5.2 TIFF header: byte order, then the offset of the first directory
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const little = view.getUint16(app1) === 0x4949;
  if (view.getUint16(app1 + 2, little) !== 0x2A) return out;
  const ifd0 = app1 + view.getUint32(app1 + 4, little);
  if (ifd0 < app1 || ifd0 + 2 > bytes.length) return out;

  out.present = true;

  const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

  /** Read an ASCII string from an entry, bounded by the buffer length */
  function readAscii(valueOffset, count) {
    let s = '';
    for (let i = 0; i < count && valueOffset + i < bytes.length; i++) {
      const c = bytes[valueOffset + i];
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  }

  /** Walk one directory and call a visitor for each tag */
  function walkIFD(start, visit) {
    if (start + 2 > bytes.length) return;
    const count = view.getUint16(start, little);
    if (count > 512) return;   // guard against a corrupt or hostile file
    for (let i = 0; i < count; i++) {
      const entry = start + 2 + i * 12;
      if (entry + 12 > bytes.length) return;
      const tag  = view.getUint16(entry, little);
      const type = view.getUint16(entry + 2, little);
      const num  = view.getUint32(entry + 4, little);
      const size = (TYPE_SIZE[type] || 1) * num;
      const valueOffset = size <= 4 ? entry + 8 : app1 + view.getUint32(entry + 8, little);
      visit(tag, type, num, valueOffset);
    }
  }

  let exifIFD = 0;
  walkIFD(ifd0, (tag, type, num, valueOffset) => {
    if (tag === 0x010F && type === 2) out.make  = readAscii(valueOffset, num);
    if (tag === 0x0110 && type === 2) out.model = readAscii(valueOffset, num);
    if (tag === 0x0132 && type === 2) out.dateTimeOriginal = out.dateTimeOriginal || readAscii(valueOffset, num);
    if (tag === 0x8769 && type === 4) exifIFD = app1 + view.getUint32(valueOffset, little);
    if (tag === 0x8825) out.gps = true;   // we record only that coordinates exist; we never extract them
  });

  if (exifIFD && exifIFD + 2 < bytes.length) {
    walkIFD(exifIFD, (tag, type, num, valueOffset) => {
      if (tag === 0x9003 && type === 2) {
        const v = readAscii(valueOffset, num);
        if (v) out.dateTimeOriginal = v;   // the original capture date is more reliable than the modification date
      }
    });
  }

  return out;
}

/** Image dimensions in pixels, with a modern path and a fallback */
async function readDimensions(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      if (bitmap.close) bitmap.close();
      return dims;
    } catch (e) { /* fall through to the fallback */ }
  }
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/**
 * The second layer: a descriptive read, for images only.
 * We read only the first 128 KB, because EXIF always sits at the front of
 * the file, so a large file is never loaded into phone memory twice.
 */
async function inspectImage(file) {
  const head = new Uint8Array(await file.slice(0, 131072).arrayBuffer());
  const result = {
    signature: detectSignature(head),
    exif: readExif(head),
    dimensions: await readDimensions(file)
  };
  result.signatureMatches = !result.signature || !file.type || result.signature === file.type;
  return result;
}


/* ==========================================================
   6. Chain-of-custody log
   ----------------------------------------------------------
   A list of events held in memory only. Reloading the page erases it.
   Nothing here is ever written to disk or sent anywhere.
   ========================================================== */
const custodyLog = [];

function logEvent(code, detail) {
  custodyLog.push({ at: new Date(), code: code, detail: detail || '' });
}


/* ==========================================================
   7. Building report.html
   ----------------------------------------------------------
   Design decision: no PDF library is used. Arabic and right-to-left
   support in PDF libraries is poor and breaks the text. Instead we
   build a self-contained HTML page with all of its styles embedded
   and print rules tuned for A4. The user opens it and prints it to
   PDF from the browser, so the Arabic comes out perfectly.

   The report always carries both languages, regardless of the
   interface language, because it may be handed to an authority.

   Every interpolated value below is escaped. Nothing reaches this
   template raw.
   ========================================================== */

/** A three-column data row: Arabic label, value, English label */
function reportRow(key, value, mono) {
  return `<tr>
      <th class="lb-ar">${escapeHtml(tl('ar', key))}</th>
      <td class="${mono ? 'val mono' : 'val'}">${escapeHtml(value)}</td>
      <th class="lb-en" dir="ltr">${escapeHtml(tl('en', key))}</th>
    </tr>`;
}

/** A bilingual section heading */
function reportHeading(ar, en) {
  return `<h2><span>${escapeHtml(ar)}</span><span class="en" dir="ltr">${escapeHtml(en)}</span></h2>`;
}

function buildReportHtml(state) {
  const f = state.file;
  const docAt = state.documentedAt;
  const fileDate = new Date(f.lastModified);
  const gapMs = docAt - fileDate;
  const ctx = state.context;

  /* --- Fingerprint cells: the same 8x8 grid used on the site --- */
  const cells = state.hash.split('').map(ch => `<span>${ch}</span>`).join('');

  /* --- Incident record; every field is optional --- */
  const ctxRows = [];
  if (ctx.typeKey)     ctxRows.push(reportRow('ctx.type',     tl('ar', ctx.typeKey) + '  ·  ' + tl('en', ctx.typeKey)));
  if (ctx.platformKey) ctxRows.push(reportRow('ctx.platform', tl('ar', ctx.platformKey) + '  ·  ' + tl('en', ctx.platformKey)));
  if (ctx.whenText)    ctxRows.push(reportRow('ctx.when',     ctx.whenText));
  if (ctx.sender)      ctxRows.push(reportRow('ctx.sender',   ctx.sender));

  const ctxSection = (ctxRows.length || ctx.note) ? `
  <section class="block">
    ${reportHeading('توثيق الحادثة كما أدخلته المستخدمة', 'Incident record, as entered by the user')}
    ${ctxRows.length ? `<table class="data">${ctxRows.join('')}</table>` : ''}
    ${ctx.note ? `<div class="quote"><div class="quote-label">ماذا حدث، بكلمات المستخدمة · What happened, in the user’s own words</div><p>${escapeHtml(ctx.note).replace(/\n/g, '<br>')}</p></div>` : ''}
  </section>` : '';

  /* --- Technical indicators: images only, purely descriptive --- */
  let techSection = '';
  if (state.tech) {
    const T = state.tech;
    const rows = [];
    if (T.dimensions) rows.push(reportRow('tech.dims', T.dimensions.width + ' × ' + T.dimensions.height + ' px', true));
    if (T.signature)  rows.push(reportRow('tech.signature', T.signature + (T.signatureMatches ? '' : '  ⚠'), true));
    rows.push(reportRow('tech.exif', T.exif.present
      ? tl('ar', 'tech.exifYes') + '  ·  ' + tl('en', 'tech.exifYes')
      : tl('ar', 'tech.exifNo')  + '  ·  ' + tl('en', 'tech.exifNo')));
    if (T.exif.dateTimeOriginal) rows.push(reportRow('tech.exifDate', T.exif.dateTimeOriginal, true));
    if (T.exif.make || T.exif.model) rows.push(reportRow('tech.camera', [T.exif.make, T.exif.model].filter(Boolean).join(' ')));
    rows.push(reportRow('tech.gps', T.exif.gps
      ? tl('ar', 'tech.gpsYes') + '  ·  ' + tl('en', 'tech.gpsYes')
      : tl('ar', 'tech.gpsNo')  + '  ·  ' + tl('en', 'tech.gpsNo')));

    techSection = `
  <section class="block">
    ${reportHeading(tl('ar', 'tech.label'), tl('en', 'tech.label'))}
    <table class="data">${rows.join('')}</table>
    <div class="bi caution">
      <div><p>${escapeHtml(tl('ar', 'tech.disclaimer'))}</p></div>
      <div dir="ltr" lang="en"><p>${escapeHtml(tl('en', 'tech.disclaimer'))}</p></div>
    </div>
  </section>`;
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Athar Report ${escapeHtml(state.caseRef)}</title>
<style>
/* This report is self-contained: no external fonts, images or scripts.
   It opens and prints on any device, even with no internet connection. */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Geeza Pro', system-ui, sans-serif;
  background: #F5F8FA; color: #22333B; line-height: 1.7; font-size: 14px;
  padding: 28px 16px;
}
.sheet { max-width: 820px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E3EBEE; border-radius: 10px; padding: 34px; }
header { border-bottom: 2px solid #22333B; padding-bottom: 16px; margin-bottom: 8px; }
.brand-row { display: flex; align-items: center; gap: 10px; }
.mark { display: grid; grid-template-columns: repeat(3, 7px); gap: 2px; }
.mark i { display: block; width: 7px; height: 7px; background: #64ADB1; border-radius: 1px; }
.mark i:nth-child(2) { opacity: .5; } .mark i:nth-child(3) { opacity: .25; }
.mark i:nth-child(5) { opacity: .7; } .mark i:nth-child(6) { opacity: .35; }
.mark i:nth-child(8) { opacity: .55; } .mark i:nth-child(9) { opacity: .2; }
h1 { font-size: 21px; font-weight: 600; }
h1 .en { font-size: 13px; color: #6B7A82; font-weight: 400; display: block; direction: ltr; }
.meta { margin-top: 12px; font-size: 12px; color: #6B7A82; display: flex; flex-wrap: wrap; gap: 6px 26px; }
.meta b { color: #22333B; font-weight: 600; font-family: 'Courier New', monospace; }

h2 { font-size: 13px; font-weight: 600; letter-spacing: .06em; color: #3F8A8E; margin: 26px 0 10px;
     display: flex; justify-content: space-between; gap: 12px; align-items: baseline; border-bottom: 1px solid #E3EBEE; padding-bottom: 6px; }
h2 .en { font-size: 11px; color: #6B7A82; font-weight: 500; }

table.data { width: 100%; border-collapse: collapse; }
table.data th, table.data td { border-bottom: 1px solid #EAF5F5; padding: 8px 6px; text-align: start; vertical-align: top; font-size: 13px; }
table.data tr:last-child th, table.data tr:last-child td { border-bottom: 0; }
.lb-ar { width: 26%; color: #6B7A82; font-weight: 500; }
.lb-en { width: 26%; color: #9AA6AC; font-weight: 400; font-size: 11px; text-align: end; }
.val { font-weight: 600; overflow-wrap: anywhere; }
.mono, .hash-line { font-family: 'Courier New', monospace; direction: ltr; unicode-bidi: embed; }

.hash-box { background: #EAF5F5; border-radius: 8px; padding: 12px; text-align: center; }
.hash-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; max-width: 330px; margin: 0 auto; direction: ltr; }
.hash-grid span { background: #FFFFFF; border-radius: 3px; padding: 5px 0; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; }
.hash-line { font-size: 11.5px; word-break: break-all; margin-top: 10px; color: #22333B; font-weight: 700; }
.hash-note { font-size: 11px; color: #6B7A82; margin-top: 8px; }

.bi { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bi > div { background: #F5F8FA; border: 1px solid #E3EBEE; border-radius: 8px; padding: 14px; }
.bi h3 { font-size: 13px; margin-bottom: 6px; }
.bi p { font-size: 12.5px; color: #3B4C55; }
.bi.caution > div { background: #FFFFFF; border-style: dashed; }
.limits .yes h3 { color: #2F7A66; }
.limits .no  h3 { color: #C9484A; }

.quote { background: #F5F8FA; border-inline-start: 3px solid #3F8A8E; border-radius: 6px; padding: 12px 14px; margin-top: 12px; }
.quote-label { font-size: 11px; color: #6B7A82; margin-bottom: 6px; }
.quote p { white-space: pre-wrap; font-size: 13px; }

.verify { background: #22333B; color: #F5F8FA; border-radius: 8px; padding: 14px; margin-top: 12px; }
.verify div { font-family: 'Courier New', monospace; direction: ltr; font-size: 12px; margin-top: 4px; overflow-wrap: anywhere; }
.verify .t { font-family: inherit; direction: rtl; font-size: 12px; margin: 0 0 6px; opacity: .85; }

footer { margin-top: 30px; border-top: 1px solid #E3EBEE; padding-top: 14px; font-size: 11.5px; color: #6B7A82; }
footer p { margin-bottom: 4px; }
footer .en { direction: ltr; }

/* Print bar: visible on screen only, hidden on paper */
.printbar { background: #22333B; color: #F5F8FA; border-radius: 10px; padding: 16px 18px; margin-bottom: 18px; }
.printbar button {
  font: inherit; font-weight: 700; font-size: 14px; cursor: pointer;
  background: #E8A649; color: #22333B; border: 0; border-radius: 8px; padding: 11px 20px;
}
.printbar button:hover { background: #F2B961; }
.printbar p { font-size: 12px; opacity: .85; margin-top: 9px; }
.printbar p.en { direction: ltr; }

/* ---- Print rules: A4 page size, and no section split across pages ---- */
@page { size: A4; margin: 14mm; }
@media print {
  body { background: #fff; padding: 0; font-size: 11.5px; }
  .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; background: #fff; }
  .noprint { display: none !important; }
  .block, section, table, .bi, .hash-box, .verify { break-inside: avoid; page-break-inside: avoid; }
  h2 { break-after: avoid; page-break-after: avoid; }
  .hash-grid span, .bi > div, .quote, .hash-box { background: #f4f4f4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .verify { background: #fff !important; color: #22333B; border: 1px solid #22333B; }
}
@media (max-width: 620px) { .bi { grid-template-columns: 1fr; } .sheet { padding: 18px; } .lb-en { display: none; } }
</style>
</head>
<body>
<div class="sheet">

  <div class="printbar noprint">
    <button type="button" id="printBtn">${escapeHtml(tl('ar', 'sh.printBtn'))} · ${escapeHtml(tl('en', 'sh.printBtn'))}</button>
    <p>${escapeHtml(tl('ar', 'sh.printHint'))}</p>
    <p class="en" lang="en">${escapeHtml(tl('en', 'sh.printHint'))}</p>
  </div>

  <header>
    <div class="brand-row">
      <span class="mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
      <h1>أثر · تقرير حفظ دليل رقمي<span class="en">Athar · Digital Evidence Preservation Report</span></h1>
    </div>
    <div class="meta">
      <span>مرجع الحالة · Case reference: <b>${escapeHtml(state.caseRef)}</b></span>
      <span>تاريخ إصدار التقرير · Issued: <b>${escapeHtml(localISO(state.generatedAt))} (${escapeHtml(tzOffset(state.generatedAt))})</b></span>
    </div>
  </header>

  <section class="block">
    ${reportHeading('تعريف الملف', 'File identification')}
    <table class="data">
      ${reportRow('f.name', f.name, true)}
      ${reportRow('f.size', formatSize(f.size, 'ar') + '  ·  ' + f.size + ' bytes')}
      ${reportRow('f.type', f.type || (tl('ar', 'f.typeUnknown') + ' · ' + tl('en', 'f.typeUnknown')), true)}
    </table>
  </section>

  <section class="block">
    ${reportHeading('البصمة الرقمية · SHA-256', 'Digital fingerprint · SHA-256')}
    <div class="hash-box">
      <div class="hash-grid">${cells}</div>
      <div class="hash-line">${escapeHtml(state.hash)}</div>
      <div class="hash-note">
        ${escapeHtml(tl('ar', 'hash.caption'))}<br>
        <span dir="ltr">${escapeHtml(tl('en', 'hash.caption'))}</span>
      </div>
    </div>
  </section>

  <section class="block">
    ${reportHeading('الخط الزمني', 'Timeline')}
    <table class="data">
      ${reportRow('f.deviceDate',   localISO(fileDate) + '  ·  ' + formatMoment(fileDate, 'ar'), false)}
      ${reportRow('f.documentedAt', localISO(docAt)    + '  ·  ' + formatMoment(docAt, 'ar'), false)}
      ${reportRow('f.gap',          formatGap(gapMs, 'ar') + '  ·  ' + elapsedPlain(gapMs))}
    </table>
    <div class="bi caution">
      <div><p><strong>عن تاريخ الملف:</strong> مأخوذ من نظام التشغيل على جهاز المستخدمة، وهو قابل للتعديل، ويُعرض للاسترشاد لا للإثبات. أما لحظة التوثيق فمسجّلة وقت إنشاء هذا التقرير، بتوقيت الجهاز ${escapeHtml(tzOffset(docAt))}.</p></div>
      <div dir="ltr" lang="en"><p><strong>About the file date:</strong> it is taken from the operating system of the user's device, it can be modified, and it is presented for guidance only, not as proof. The documentation timestamp, by contrast, was recorded when this report was generated, in device time ${escapeHtml(tzOffset(docAt))}.</p></div>
    </div>
  </section>

  ${ctxSection}
  ${techSection}

  <section class="block limits">
    ${reportHeading('حدود هذا التقرير', 'The limits of this report')}
    <div class="bi">
      <div class="yes">
        <h3>${escapeHtml(tl('ar', 'limits.proves'))}</h3>
        <p>${escapeHtml(tl('ar', 'limits.provesText'))}</p>
      </div>
      <div class="yes" dir="ltr" lang="en">
        <h3>${escapeHtml(tl('en', 'limits.proves'))}</h3>
        <p>${escapeHtml(tl('en', 'limits.provesText'))}</p>
      </div>
    </div>
    <div class="bi" style="margin-top:12px">
      <div class="no">
        <h3>${escapeHtml(tl('ar', 'limits.notProves'))}</h3>
        <p>${escapeHtml(tl('ar', 'limits.notProvesText'))}</p>
      </div>
      <div class="no" dir="ltr" lang="en">
        <h3>${escapeHtml(tl('en', 'limits.notProves'))}</h3>
        <p>${escapeHtml(tl('en', 'limits.notProvesText'))}</p>
      </div>
    </div>
  </section>

  <section class="block">
    ${reportHeading('التحقق المستقل', 'Independent verification')}
    <div class="verify">
      <p class="t">لأي جهة تتلقى هذه الحزمة: احسبي بصمة الملف الأصلي بأدوات نظام التشغيل القياسية، وقارنيها بالبصمة أعلاه.</p>
      <p class="t" dir="ltr">To any party receiving this package: recompute the fingerprint of the original file with standard operating-system tools and compare it with the value above.</p>
      <div>sha256sum   evidence/${escapeHtml(safeFileName(f.name))}</div>
      <div>shasum -a 256   evidence/${escapeHtml(safeFileName(f.name))}</div>
      <div>certutil -hashfile   evidence\\${escapeHtml(safeFileName(f.name))}   SHA256</div>
    </div>
  </section>

  <footer>
    <p>${escapeHtml(tl('ar', 'limits.disclaimer'))}</p>
    <p class="en" dir="ltr" lang="en">${escapeHtml(tl('en', 'limits.disclaimer'))}</p>
    <p style="margin-top:8px">تم إنشاء هذا التقرير محليًا داخل متصفح المستخدمة. لم يُرفع أي ملف إلى أي خادم.</p>
    <p class="en" dir="ltr" lang="en">This report was generated locally inside the user's browser. No file was uploaded to any server.</p>
  </footer>

</div>
<script>
  // The print button. This is all the JavaScript in this file, and it contacts nothing.
  document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
</script>
</body>
</html>`;
}


/* ==========================================================
   7.b Building START-HERE.html
   ----------------------------------------------------------
   The fifth file inside the package. It is not an official document
   but a guide for the user herself: what is in the package, what to
   do now, and how to produce a PDF.

   It is written in the interface language at the time the package was
   created, because it is her page. report.html, by contrast, always
   carries both languages because that is the document meant for
   hand-over.
   ========================================================== */
function buildStartHere(state) {
  const L = CURRENT_LANG;
  const S = key => escapeHtml(tl(L, key));
  const rtl = L === 'ar';
  const f = state.file;
  const name = safeFileName(f.name);

  /* A ready-made description she can read out when handing the package over */
  const handBody = tl(L, 'sh.handBody')
    .replace('{HASH}', state.hash)
    .replace('{TIME}', localISO(state.documentedAt) + ' (' + tzOffset(state.documentedAt) + ')')
    .replace('{REF}', state.caseRef);

  const files = [
    ['START-HERE.html',        'sh.f1'],
    ['evidence/' + name,       'sh.f2'],
    ['report.html',            'sh.f3'],
    ['manifest.txt',           'sh.f4'],
    ['chain-of-custody.txt',   'sh.f5']
  ].map(([n, k]) => `<tr><td class="mono">${escapeHtml(n)}</td><td>${S(k)}</td></tr>`).join('');

  const steps = ['sh.n1', 'sh.n2', 'sh.n3', 'sh.n4', 'sh.n5']
    .map(k => `<li>${S(k)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="${L}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${S('sh.title')} · ${escapeHtml(state.caseRef)}</title>
<style>
/* A self-contained page: no external fonts, images or companion files. */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Geeza Pro', system-ui, sans-serif;
  background: #F5F8FA; color: #22333B; line-height: 1.85; font-size: 15px; padding: 26px 16px;
}
.sheet { max-width: 760px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E3EBEE; border-radius: 12px; padding: 32px; }
h1 { font-size: 25px; font-weight: 700; }
.sub { color: #6B7A82; margin-top: 6px; }
.meta { margin-top: 14px; font-size: 12px; color: #6B7A82; display: flex; flex-wrap: wrap; gap: 4px 22px; }
.meta b { color: #22333B; font-family: 'Courier New', monospace; }
h2 { font-size: 17px; font-weight: 700; color: #3F8A8E; margin: 30px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #E3EBEE; }

/* Print bar; hidden in the printed output itself */
.printbar { background: #22333B; border-radius: 10px; padding: 16px 18px; margin-top: 20px; color: #F5F8FA; }
.printbar button {
  font: inherit; font-weight: 700; font-size: 15px; cursor: pointer;
  background: #E8A649; color: #22333B; border: 0; border-radius: 8px; padding: 12px 22px;
}
.printbar button:hover { background: #F2B961; }
.printbar p { font-size: 12.5px; opacity: .85; margin-top: 10px; }

table { width: 100%; border-collapse: collapse; margin-top: 6px; }
td { border-bottom: 1px solid #EAF5F5; padding: 10px 6px; vertical-align: top; font-size: 14px; text-align: start; overflow-wrap: anywhere; }
tr:last-child td { border-bottom: 0; }
td:first-child { width: 38%; font-weight: 700; }
.mono { font-family: 'Courier New', monospace; direction: ltr; unicode-bidi: embed; overflow-wrap: anywhere; }

ol { padding-inline-start: 22px; }
ol li { margin-bottom: 11px; }

.quote { background: #EAF5F5; border-inline-start: 4px solid #3F8A8E; border-radius: 8px; padding: 16px 18px; margin-top: 10px; }
/* The fingerprint is one unbroken 64-character word; without this it would push the page off a phone screen */
.quote .say { background: #FFFFFF; border-radius: 6px; padding: 14px; margin-top: 10px; font-size: 14px; overflow-wrap: anywhere; }
.hint { font-size: 12.5px; color: #6B7A82; }

.hashbox { background: #EAF5F5; border-radius: 8px; padding: 14px; text-align: center; margin-top: 10px; }
.hashbox .v { font-family: 'Courier New', monospace; font-weight: 700; font-size: 12.5px; word-break: break-all; direction: ltr; }

.limits { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; }
.limits > div { background: #F5F8FA; border: 1px solid #E3EBEE; border-radius: 8px; padding: 14px; }
.limits h3 { font-size: 14px; margin-bottom: 5px; }
.limits .yes h3 { color: #2F7A66; }
.limits .no h3 { color: #C9484A; }
.limits p { font-size: 13px; color: #3B4C55; }

footer { margin-top: 28px; border-top: 1px solid #E3EBEE; padding-top: 14px; font-size: 12px; color: #6B7A82; }
footer p { margin-bottom: 6px; }

@page { size: A4; margin: 15mm; }
@media print {
  body { background: #fff; padding: 0; font-size: 11.5px; }
  .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; background: #fff; }
  .noprint { display: none !important; }
  section, table, .quote, .limits, .hashbox { break-inside: avoid; page-break-inside: avoid; }
  h2 { break-after: avoid; page-break-after: avoid; }
  .quote, .hashbox, .limits > div { background: #f4f4f4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
@media (max-width: 620px) { .limits { grid-template-columns: 1fr; } .sheet { padding: 18px; } td:first-child { width: 44%; } }
</style>
</head>
<body>
<div class="sheet">

  <h1>${S('sh.title')}</h1>
  <p class="sub">${S('sh.sub')}</p>
  <div class="meta">
    <span>${S('f.ref')}: <b>${escapeHtml(state.caseRef)}</b></span>
    <span>${S('f.documentedAt')}: <b>${escapeHtml(localISO(state.documentedAt))}</b></span>
  </div>

  <div class="printbar noprint">
    <button type="button" id="printBtn">${S('sh.printBtn')}</button>
    <p>${S('sh.printHow')}</p>
  </div>

  <section>
    <h2>${S('sh.contents')}</h2>
    <table><tbody>${files}</tbody></table>
  </section>

  <section>
    <h2>${S('sh.now')}</h2>
    <ol>${steps}</ol>
  </section>

  <section>
    <h2>${S('sh.hand')}</h2>
    <div class="quote">
      <p class="hint">${S('sh.handText')}</p>
      <div class="say">${escapeHtml(handBody)}</div>
    </div>
  </section>

  <section>
    <h2>${S('sh.summary')}</h2>
    <table><tbody>
      <tr><td>${S('f.name')}</td><td class="mono">${escapeHtml(f.name)}</td></tr>
      <tr><td>${S('f.size')}</td><td>${escapeHtml(formatSize(f.size, L))}</td></tr>
      <tr><td>${S('f.documentedAt')}</td><td>${escapeHtml(formatMoment(state.documentedAt, L))}</td></tr>
    </tbody></table>
    <div class="hashbox">
      <div class="hint">${S('hash.label')}</div>
      <div class="v">${escapeHtml(state.hash)}</div>
    </div>
    <div class="limits">
      <div class="yes"><h3>${S('limits.proves')}</h3><p>${S('limits.provesText')}</p></div>
      <div class="no"><h3>${S('limits.notProves')}</h3><p>${S('limits.notProvesText')}</p></div>
    </div>
  </section>

  <footer>
    <p><strong>${S('sh.reminder')}</strong></p>
    <p>${S('limits.disclaimer')}</p>
    <p class="hint">${S('sh.langNote')}</p>
  </footer>

</div>
<script>
  // The print button. This is all the JavaScript in this file, and it contacts nothing.
  document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
</script>
</body>
</html>`;
}


/* ==========================================================
   7.c Opening the print dialog to save the report as PDF
   ----------------------------------------------------------
   Again, no PDF library, because they break Arabic and right-to-left
   text. Instead the report is built into a hidden iframe inside the
   page and the browser is asked to print it. The user chooses
   "Save as PDF" in the print dialog and the Arabic comes out intact.

   NOTE: this iframe inherits the page's Content-Security-Policy, which
   is why style-src must allow 'unsafe-inline' in _headers. Without it
   the printed report comes out with no styling at all.
   ========================================================== */
function printReport(state, onDone) {
  const html = buildReportHtml(state);
  const finish = () => { if (typeof onDone === 'function') onDone(); };

  /* Fallback: open the report in its own tab so the user can print it
     herself. Used when the browser refuses to print from inside an
     iframe, which happens in some mobile browsers. */
  function openInTab() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // even the tab was blocked, so download the report as a file instead
      downloadBlob(blob, 'athar-report-' + state.caseRef + '.html');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    finish();
  }

  const frame = document.createElement('iframe');
  // Hidden off-screen rather than with display:none, because a fully hidden iframe will not print
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', 'report');
  frame.style.cssText = 'position:fixed;inset-inline-start:-10000px;top:0;width:794px;height:1123px;border:0;';

  let settled = false;
  frame.addEventListener('load', () => {
    if (settled) return;
    settled = true;
    // a short delay so the browser finishes laying out the page before the dialog opens
    setTimeout(() => {
      let ok = false;
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        ok = true;
      } catch (e) { ok = false; }
      finish();
      setTimeout(() => frame.remove(), 1500);
      if (!ok) openInTab();
    }, 450);
  });

  // Safety net: if the iframe has not loaded within three seconds, take the fallback path
  setTimeout(() => {
    if (settled) return;
    settled = true;
    frame.remove();
    openInTab();
  }, 3000);

  document.body.appendChild(frame);
  frame.srcdoc = html;
}


/* ==========================================================
   8. Building manifest.txt
   ----------------------------------------------------------
   Plain unformatted text, in English, so that any party can read it
   with any tool and verify the evidence entirely independently of
   Athar. The verification commands at the end are the point: an
   examiner never has to trust this platform.
   ========================================================== */
function buildManifest(state) {
  const f = state.file;
  const fileDate = new Date(f.lastModified);
  const docAt = state.documentedAt;
  const name = safeFileName(f.name);
  const L = [];

  L.push('ATHAR EVIDENCE MANIFEST');
  L.push('Generated: ' + state.generatedAt.toISOString());
  L.push('Case reference: ' + state.caseRef);
  L.push('');
  L.push('FILE:        ' + f.name);
  L.push('SIZE:        ' + f.size + ' bytes');
  L.push('TYPE:        ' + (f.type || 'not specified'));
  L.push('SHA-256:     ' + state.hash);
  L.push('');
  L.push('FILE MODIFIED (device, unverified): ' + localISO(fileDate));
  L.push('DOCUMENTED AT (system):             ' + localISO(docAt));
  L.push('ELAPSED:                            ' + elapsedPlain(docAt - fileDate));
  L.push('DEVICE TIME ZONE:                   ' + tzOffset(docAt));
  L.push('');
  L.push('PACKAGE CONTENTS');
  L.push('  START-HERE.html         Plain-language guide for the person who created this package.');
  L.push('  evidence/' + name);
  L.push('                          The original file, byte for byte, stored without re-compression.');
  L.push('  report.html             Official bilingual report (Arabic and English). Printable to PDF.');
  L.push('  manifest.txt            This file.');
  L.push('  chain-of-custody.txt    Timestamped log of the documentation session.');
  L.push('');
  L.push('Verify with:  sha256sum evidence/' + name);
  L.push('              shasum -a 256 evidence/' + name + '            (macOS)');
  L.push('              certutil -hashfile evidence\\' + name + ' SHA256   (Windows)');
  L.push('');
  L.push('The value printed by any of those commands must be identical to the');
  L.push('SHA-256 line above. If it differs, the file has been altered since');
  L.push('documentation.');
  L.push('');
  L.push('NOTE: The file modification date is read from the operating system of');
  L.push('the documenting device. It is user-modifiable and is recorded for');
  L.push('guidance, not as proof. The documentation timestamp was recorded by');
  L.push('this tool at the moment the fingerprint was computed.');
  L.push('');
  L.push('This manifest was produced entirely inside the user\'s browser.');
  L.push('No file was transmitted to any server.');
  L.push('');

  return L.join('\r\n');   // Windows line endings, so Notepad shows it correctly
}


/* ==========================================================
   9. Building chain-of-custody.txt
   ========================================================== */
function buildCustody(state) {
  const L = [];
  L.push('ATHAR CHAIN OF CUSTODY');
  L.push('Case reference: ' + state.caseRef);
  L.push('Device time zone: ' + tzOffset(state.generatedAt));
  L.push('All timestamps are taken from the system clock of the documenting device.');
  L.push('');
  L.push('TIMESTAMP (UTC)           EVENT                 DETAIL');
  L.push('------------------------  --------------------  ------------------------------');
  custodyLog.forEach(e => {
    L.push(e.at.toISOString() + '  ' + e.code.padEnd(20, ' ') + '  ' + e.detail);
  });
  L.push('');
  L.push('This log lives only in the memory of the page that produced it.');
  L.push('Nothing was written to the device beyond this package, and nothing');
  L.push('was sent anywhere.');
  L.push('');
  return L.join('\r\n');
}


/* ==========================================================
   10. Assembling the evidence package
   ========================================================== */
async function buildPackage(state) {
  if (typeof JSZip === 'undefined') {
    const err = new Error('jszip-missing');
    err.i18n = 'error.zipLib';
    throw err;
  }

  const zip = new JSZip();
  const name = safeFileName(state.file.name);

  // The original file byte for byte, stored with no re-compression, so its fingerprint stays identical
  zip.folder('evidence').file(name, state.file, { compression: 'STORE' });

  zip.file('START-HERE.html',      buildStartHere(state));   // the user's guide, the first thing she opens
  zip.file('report.html',          buildReportHtml(state));  // the official document for hand-over
  zip.file('manifest.txt',         buildManifest(state));
  zip.file('chain-of-custody.txt', buildCustody(state));

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}


/* ==========================================================
   11. Home page
   ========================================================== */
function initHome() {
  const el = id => document.getElementById(id);

  const dropzone   = el('dropzone');
  const filepicker = el('filepicker');
  const results    = el('results');
  const errorCard  = el('errorCard');
  const errorText  = el('errorText');
  const busyText   = el('busyText');

  /* All state lives here, in memory. None of it is ever written to disk. */
  const state = {
    file: null,
    hash: null,
    tech: null,
    documentedAt: null,
    generatedAt: null,
    caseRef: null,
    context: {}
  };

  /* ---------- Show a comprehensible error (never a raw exception) ---------- */
  function showError(key) {
    errorText.dataset.i18n = key;
    errorText.textContent = t(key);
    errorCard.classList.remove('hidden');
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearError() {
    errorCard.classList.add('hidden');
    delete errorText.dataset.i18n;
  }

  /* ---------- Render the results; called again when the language changes ---------- */
  function renderResults() {
    if (!state.file) return;
    const f = state.file;
    const fileDate = new Date(f.lastModified);

    el('fRef').textContent   = state.caseRef;
    el('fName').textContent  = f.name;
    el('fSize').textContent  = formatSize(f.size);
    el('fType').textContent  = f.type || t('f.typeUnknown');
    el('fDate').textContent  = formatMoment(fileDate);
    el('fNow').textContent   = formatMoment(state.documentedAt);
    el('fGap').textContent   = formatGap(state.documentedAt - fileDate);

    const isImage = f.type.startsWith('image/');
    el('layerNote').classList.toggle('hidden', isImage);

    /* Descriptive technical indicators, images only. Every value is escaped. */
    const techCard = el('techCard');
    if (state.tech) {
      const T = state.tech;
      const rows = [];
      const add = (labelKey, value, mono) => rows.push(
        `<tr><th>${escapeHtml(t(labelKey))}</th><td class="${mono ? 'mono' : ''}">${escapeHtml(value)}</td></tr>`
      );

      if (T.dimensions) add('tech.dims', T.dimensions.width + ' × ' + T.dimensions.height + ' ' + t('tech.px'), true);
      if (T.signature)  add('tech.signature', T.signature + ' — ' + t(T.signatureMatches ? 'tech.sigMatch' : 'tech.sigDiff'));
      add('tech.exif', t(T.exif.present ? 'tech.exifYes' : 'tech.exifNo'));
      if (T.exif.dateTimeOriginal) add('tech.exifDate', T.exif.dateTimeOriginal, true);
      if (T.exif.make || T.exif.model) add('tech.camera', [T.exif.make, T.exif.model].filter(Boolean).join(' '));
      add('tech.gps', t(T.exif.gps ? 'tech.gpsYes' : 'tech.gpsNo'));

      el('techRows').innerHTML = rows.join('');
      techCard.classList.remove('hidden');
    } else {
      techCard.classList.add('hidden');
    }
  }

  /* ---------- Process the dropped file ---------- */
  async function handleFile(file) {
    clearError();

    if (!cryptoAvailable()) { showError('error.noCrypto'); return; }
    if (file.size === 0)    { showError('error.empty');    return; }

    // For large files, say that the wait is expected, so she does not think the page has frozen
    busyText.dataset.i18n = file.size > 50 * 1024 * 1024 ? 'drop.busyBig' : 'drop.busy';
    busyText.textContent = t(busyText.dataset.i18n);
    dropzone.classList.add('is-busy');
    dropzone.setAttribute('aria-busy', 'true');

    // a short delay so the spinner paints before the main thread starts hashing
    await new Promise(r => setTimeout(r, 30));

    try {
      custodyLog.length = 0;   // new file, new custody log
      logEvent('FILE_SELECTED', file.name + ' (' + file.size + ' bytes, ' + (file.type || 'unknown type') + ')');

      const hex = await computeSha256(file);
      const now = new Date();
      logEvent('HASH_COMPUTED', 'SHA-256 ' + hex);

      state.file = file;
      state.hash = hex;
      state.documentedAt = now;
      state.caseRef = 'ATHAR-' + stampDay(now) + '-' + hex.slice(0, 6).toUpperCase();
      state.tech = null;

      if (file.type.startsWith('image/')) {
        try {
          state.tech = await inspectImage(file);
          logEvent('IMAGE_INSPECTED', 'descriptive indicators read from file header');
        } catch (e) {
          // a failed descriptive read does not invalidate the documentation; layer one is what matters
          logEvent('IMAGE_INSPECT_FAILED', 'descriptive layer unavailable for this file');
        }
      }

      renderHashGrid(el('hashGrid'), hex);
      el('hashLine').textContent = hex;
      renderResults();

      results.classList.remove('hidden');
      el('hashCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError('error.read');
    } finally {
      dropzone.classList.remove('is-busy');
      dropzone.removeAttribute('aria-busy');
    }
  }

  /* ---------- Wire up the drop zone ---------- */
  dropzone.addEventListener('click', () => filepicker.click());
  dropzone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filepicker.click(); }
  });
  filepicker.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
    filepicker.value = '';   // so choosing the same file again still fires a change event
  });

  ['dragenter', 'dragover'].forEach(evt =>
    dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add('is-over'); })
  );
  ['dragleave', 'drop'].forEach(evt =>
    dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove('is-over'); })
  );
  dropzone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // Stop the browser from navigating away if a file is dropped outside the zone
  ['dragover', 'drop'].forEach(evt =>
    window.addEventListener(evt, e => { if (e.target !== dropzone) e.preventDefault(); })
  );

  /* ---------- Copy the fingerprint ---------- */
  el('copyBtn').addEventListener('click', async function () {
    const hex = el('hashLine').textContent;
    if (!hex) return;
    const say = key => {
      this.dataset.i18n = key;
      this.textContent = t(key);
      setTimeout(() => { this.dataset.i18n = 'btn.copy'; this.textContent = t('btn.copy'); }, 2200);
    };
    try {
      await navigator.clipboard.writeText(hex);
      say('btn.copied');
      showToast(t('toast.copied'), 'success');
    } catch (e) {
      // Fallback when the browser blocks clipboard access: select the line so she can copy it herself
      const range = document.createRange();
      range.selectNodeContents(el('hashLine'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      say('btn.copyFail');
    }
  });

  /* ---------- Collect what the user typed; shared by the package and print buttons ---------- */
  function collectContext() {
    state.context = {
      typeKey:     el('evType').value || '',
      platformKey: el('evPlatform').value || '',
      whenText:    el('evWhen').value ? el('evWhen').value.replace('T', ' ') : '',
      sender:      el('evSender').value.trim(),
      note:        el('evNote').value.trim()
    };
    if (Object.values(state.context).some(Boolean)) {
      logEvent('CONTEXT_RECORDED', 'incident details entered by the user');
    }
  }

  /* ---------- The save-as-PDF button ---------- */
  const pdfBtn = el('pdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      if (!state.file) return;
      clearError();
      collectContext();
      state.generatedAt = new Date();
      logEvent('REPORT_PRINTED', 'report opened in the browser print dialog');

      // immediate feedback, so she does not think the button ignored her
      pdfBtn.disabled = true;
      const label = pdfBtn.querySelector('span');
      label.dataset.i18n = 'btn.pdfBusy';
      label.textContent = t('btn.pdfBusy');

      printReport(state, () => {
        pdfBtn.disabled = false;
        label.dataset.i18n = 'btn.pdf';
        label.textContent = t('btn.pdf');
      });
    });
  }

  /* ---------- Generate the evidence package ---------- */
  const reportBtn = el('reportBtn');
  reportBtn.addEventListener('click', async () => {
    if (!state.file) return;
    clearError();

    // read the form at the moment of the click, not before
    collectContext();

    state.generatedAt = new Date();
    const zipName = 'athar-' + stampDay(state.generatedAt) + '-'
                  + pad2(state.generatedAt.getHours()) + pad2(state.generatedAt.getMinutes()) + '.zip';
    logEvent('PACKAGE_GENERATED', zipName);

    reportBtn.disabled = true;
    reportBtn.dataset.i18n = 'btn.reportBusy';
    reportBtn.textContent = t('btn.reportBusy');

    try {
      const blob = await buildPackage(state);
      downloadBlob(blob, zipName);
      el('pkgDone').classList.remove('hidden');
      showToast(t('toast.pkg'), 'success');
      reportBtn.dataset.i18n = 'btn.reportDone';
      reportBtn.textContent = t('btn.reportDone');
      setTimeout(() => {
        reportBtn.dataset.i18n = 'btn.report';
        reportBtn.textContent = t('btn.report');
      }, 3000);
    } catch (err) {
      showError(err.i18n || 'error.zipMake');
      reportBtn.dataset.i18n = 'btn.report';
      reportBtn.textContent = t('btn.report');
    } finally {
      reportBtn.disabled = false;
    }
  });

  /* ---------- Erase everything ---------- */
  el('clearBtn').addEventListener('click', () => {
    if (!confirm(t('clear.confirm'))) return;
    location.reload();   // the fastest and cleanest way to wipe every trace from memory
  });

  /* ---------- Re-render when the language changes ---------- */
  document.addEventListener('athar:langchange', renderResults);
}


/* ==========================================================
   12. Verify page
   ========================================================== */
function initVerify() {
  const el = id => document.getElementById(id);

  const dropzone   = el('vDropzone');
  const filepicker = el('vPicker');
  const verdict    = el('verdict');
  const errorCard  = el('vErrorCard');
  const errorText  = el('vErrorText');

  const state = { file: null, hash: null, expected: null, result: null };

  function showError(key) {
    errorText.dataset.i18n = key;
    errorText.textContent = t(key);
    errorCard.classList.remove('hidden');
  }

  function renderVerdict() {
    if (!state.result) return;

    verdict.className = 'verdict is-shown verdict--' + state.result;
    const titleKey = state.result === 'match' ? 'vf.matchH' : state.result === 'nomatch' ? 'vf.noMatchH' : 'vf.infoH';
    const bodyKey  = state.result === 'match' ? 'vf.matchP' : state.result === 'nomatch' ? 'vf.noMatchP' : 'vf.infoP';

    el('verdictTitle').dataset.i18n = titleKey;
    el('verdictTitle').textContent  = t(titleKey);
    el('verdictBody').dataset.i18n  = bodyKey;
    el('verdictBody').textContent   = t(bodyKey);

    el('vIconMatch').classList.toggle('hidden', state.result !== 'match');
    el('vIconNo').classList.toggle('hidden',   state.result !== 'nomatch');
    el('vIconInfo').classList.toggle('hidden', state.result !== 'info');

    el('vFileName').textContent = state.file.name + ' — ' + formatSize(state.file.size);
    el('vActual').textContent   = state.hash;
    el('vExpectedRow').classList.toggle('hidden', !state.expected);
    if (state.expected) el('vExpected').textContent = state.expected;

    renderHashGrid(el('vHashGrid'), state.hash);
    el('vDetails').classList.remove('hidden');
  }

  async function handleFile(file) {
    errorCard.classList.add('hidden');
    verdict.classList.remove('is-shown');

    if (!cryptoAvailable()) { showError('error.noCrypto'); return; }
    if (file.size === 0)    { showError('error.empty');    return; }

    const raw = el('knownHash').value;
    const expected = normalizeHash(raw);
    if (raw.trim() && !isValidHash(expected)) { showError('vf.badHash'); return; }

    dropzone.classList.add('is-busy');
    dropzone.setAttribute('aria-busy', 'true');
    await new Promise(r => setTimeout(r, 30));

    try {
      const hex = await computeSha256(file);
      state.file = file;
      state.hash = hex;
      state.expected = expected || null;
      state.result = !expected ? 'info' : (expected === hex ? 'match' : 'nomatch');
      renderVerdict();
      verdict.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      showError('error.read');
    } finally {
      dropzone.classList.remove('is-busy');
      dropzone.removeAttribute('aria-busy');
    }
  }

  dropzone.addEventListener('click', () => filepicker.click());
  dropzone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filepicker.click(); }
  });
  filepicker.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
    filepicker.value = '';
  });
  ['dragenter', 'dragover'].forEach(evt =>
    dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add('is-over'); })
  );
  ['dragleave', 'drop'].forEach(evt =>
    dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove('is-over'); })
  );
  dropzone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  ['dragover', 'drop'].forEach(evt =>
    window.addEventListener(evt, e => { if (e.target !== dropzone) e.preventDefault(); })
  );

  el('vReset').addEventListener('click', () => location.reload());

  document.addEventListener('athar:langchange', () => { if (state.result) renderVerdict(); });
}


/* ==========================================================
   13. First-hour page
   ----------------------------------------------------------
   The legal content is read from a separate data file so that other
   countries can be added later by editing a text file, without
   touching a single line of code.
   ========================================================== */
function initFirstHour() {
  const holder      = document.getElementById('legalHolder');
  const placeholder = document.getElementById('legalPlaceholder');
  if (!holder) return;

  let legalData = null;

  function renderLegal() {
    if (!legalData) return;
    const sections = Array.isArray(legalData.sections) ? legalData.sections : [];

    // While the content is unverified or empty, the placeholder stays visible
    if (legalData.status !== 'verified' || sections.length === 0) {
      placeholder.classList.remove('hidden');
      holder.textContent = '';
      return;
    }

    placeholder.classList.add('hidden');
    holder.textContent = '';

    sections.forEach(sec => {
      const box = document.createElement('div');
      box.className = 'card legal-card';

      const h = document.createElement('h3');
      h.textContent = (sec.title && sec.title[CURRENT_LANG]) || '';
      box.appendChild(h);

      const body = (sec.body && sec.body[CURRENT_LANG]) || '';
      if (body) {
        const p = document.createElement('p');
        p.textContent = body;
        box.appendChild(p);
      }

      /* Contact numbers, built as links that are tappable from a phone.
         Only tel:, mailto: and https: are permitted. Any other scheme in
         the data file is rendered as inert text, so a tampered JSON cannot
         inject a javascript: URL. */
      if (Array.isArray(sec.contacts) && sec.contacts.length) {
        const row = document.createElement('div');
        row.className = 'contact-row';

        sec.contacts.forEach(c => {
          const value = String(c.value || '').trim();
          if (!value) return;

          let href = null;
          if (c.type === 'tel')         href = 'tel:' + value.replace(/[^\d+]/g, '');
          else if (c.type === 'mailto') href = 'mailto:' + value;
          else if (c.type === 'url' && /^https:\/\//.test(value)) href = value;

          const node = document.createElement(href ? 'a' : 'span');
          node.className = 'contact' + (c.primary ? ' is-primary' : '');
          if (href) {
            node.href = href;
            if (c.type === 'url') { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
          }

          const label = document.createElement('span');
          label.className = 'contact-label';
          label.textContent = (c.label && c.label[CURRENT_LANG]) || '';
          node.appendChild(label);

          const val = document.createElement('span');
          val.className = 'contact-value';
          val.setAttribute('dir', 'ltr');
          val.textContent = value;
          node.appendChild(val);

          row.appendChild(node);
        });

        if (row.children.length) box.appendChild(row);
      }

      holder.appendChild(box);
    });

    /* The official sources this information came from, so anyone can verify it */
    const sources = Array.isArray(legalData.sources) ? legalData.sources : [];
    if (sources.length) {
      const box = document.createElement('p');
      box.className = 'actions-note';
      box.textContent = t('fh.legalSrc') + ': ';
      sources.forEach((s, i) => {
        if (!/^https:\/\//.test(s.url || '')) return;
        if (i) box.appendChild(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = (s.label && s.label[CURRENT_LANG]) || s.url;
        box.appendChild(a);
      });
      holder.appendChild(box);
    }

    if (legalData.lastReviewed) {
      const note = document.createElement('p');
      note.className = 'actions-note';
      note.textContent = t('fh.legalUpd') + ': ' + legalData.lastReviewed;
      holder.appendChild(note);
    }
  }

  // The content file name lives in the data-legal attribute on the element
  // itself, so adding another country means adding a JSON file and changing
  // that attribute, with no code change at all.
  const source = holder.dataset.legal || 'legal-om.json';

  // This is the only network request in the project. It reads a content file
  // from this same origin, carries no user data, and sends nothing.
  fetch(source, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)))
    .then(data => { legalData = data; renderLegal(); })
    .catch(() => {
      // Opening the site as a local file blocks this read. Say so plainly rather than failing silently.
      const p = document.getElementById('legalFallback');
      if (p) p.classList.remove('hidden');
    });

  document.addEventListener('athar:langchange', renderLegal);
}


/* ==========================================================
   14. Visual motion
   ----------------------------------------------------------
   Everything in this section is purely decorative. If it were disabled
   entirely the tool would still work exactly as before. The user's
   reduced-motion preference is always respected.
   ========================================================== */

/** Has the user asked her system to reduce motion? */
function reducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A short floating notice, a friendlier alternative to alert() */
function showToast(message, kind) {
  const box = document.getElementById('toast');
  if (!box) return;
  box.textContent = message;
  box.className = 'toast show' + (kind ? ' ' + kind : '');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { box.className = 'toast'; }, 3200);
}

function initMotion() {
  /* 14.1 Reveal elements gradually as they scroll into view */
  const targets = document.querySelectorAll('.reveal');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);   // once only, so the page is not kept busy
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* 14.2 Header shadow once the page is scrolled */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 14.3 Number counters that climb to their value */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = el => {
    const target = parseInt(el.dataset.count, 10);
    if (reducedMotion() || !target) { el.textContent = fmtNumber(target, CURRENT_LANG); return; }
    const started = performance.now();
    const step = now => {
      const p = Math.min((now - started) / 900, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNumber(Math.round(target * eased), CURRENT_LANG);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => io2.observe(el));
  } else {
    counters.forEach(runCounter);
  }
}


/* ==========================================================
   15. Entry point
   ----------------------------------------------------------
   One file serves all four pages. We detect which page we are on by
   the presence of its elements, so no per-page script is needed.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dropzone'))    initHome();
  if (document.getElementById('vDropzone'))   initVerify();
  if (document.getElementById('legalHolder')) initFirstHour();
  initMotion();
});

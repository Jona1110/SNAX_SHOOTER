/**
 * S.N.A.X. ARCADE: SAUCE BLASTER 3D
 * Backend en Google Apps Script (code.gs) con actualización por jugador (1 fila por usuario),
 * conservación de récord máximo y jerarquía automática de cupones.
 */

const SHEET_NAME = 'Jugadores_Sauce_Blaster_3D';

const COUPON_RANK = {
  'NINGUNO': 0,
  'SNAX10': 1,
  'PAPAS8BIT': 2,
  '3EXTRAS': 3,
  'ALITASGRATIS': 4
};

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Última Actividad',
      'Nombre del Jugador',
      'Partidas Jugadas',
      'Récord Máximo',
      'Última Puntuación',
      'Precisión (%)',
      'Detalle Partida',
      'Racha Máxima',
      'Rango Alcanzado',
      'Mejor Cupón',
      'Último Cupón',
      'Todos los Cupones'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#dc2626')
      .setFontColor('#facc15')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getBestCoupon_(existingCoupon, newCoupon) {
  const current = String(existingCoupon || 'NINGUNO').trim().toUpperCase();
  const incoming = String(newCoupon || 'NINGUNO').trim().toUpperCase();
  const currentRank = COUPON_RANK[current] !== undefined ? COUPON_RANK[current] : (current !== 'NINGUNO' ? 1 : 0);
  const incomingRank = COUPON_RANK[incoming] !== undefined ? COUPON_RANK[incoming] : (incoming !== 'NINGUNO' ? 1 : 0);
  return incomingRank >= currentRank ? incoming : current;
}

function mergeCouponHistory_(existingList, incomingList) {
  const set = new Set();
  const parseList = (str) => {
    String(str || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s && s !== 'NINGUNO')
      .forEach(code => set.add(code));
  };
  parseList(existingList);
  parseList(incomingList);
  return set.size > 0 ? Array.from(set).join(', ') : 'NINGUNO';
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const sheet = getOrCreateSheet_();
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'America/Mexico_City',
      'yyyy-MM-dd HH:mm:ss'
    );

    const playerName = String(data.jugador || 'INVITADO').trim();
    const normalizedName = playerName.toLowerCase();

    const newScore = Number(data.puntuacion || 0);
    const newAccuracy = String(data.precision || '0%');
    const newDetail = String(data.detalle || '-');
    const newStreak = Number(data.comboMax || 0);
    const newRank = String(data.rango || 'APRENDIZ');
    const newCoupon = String(data.cupon || 'NINGUNO').trim().toUpperCase();
    const incomingAllCoupons = String(data.cuponesPartida || newCoupon || 'NINGUNO').trim().toUpperCase();

    const lastRow = sheet.getLastRow();
    let targetRow = -1;

    if (lastRow >= 2) {
      const namesRange = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (let i = 0; i < namesRange.length; i++) {
        if (String(namesRange[i][0] || '').trim().toLowerCase() === normalizedName) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow !== -1) {
      const rowValues = sheet.getRange(targetRow, 1, 1, 12).getValues()[0];
      const totalGames = Number(rowValues[2] || 0) + 1;
      const bestScore = Math.max(Number(rowValues[3] || 0), newScore);
      const bestStreak = Math.max(Number(rowValues[7] || 0), newStreak);
      const bestCoupon = getBestCoupon_(rowValues[9], newCoupon);
      const allCoupons = mergeCouponHistory_(rowValues[11], incomingAllCoupons);

      sheet.getRange(targetRow, 1, 1, 12).setValues([[
        timestamp,
        playerName,
        totalGames,
        bestScore,
        newScore,
        newAccuracy,
        newDetail,
        bestStreak,
        newRank,
        bestCoupon,
        newCoupon,
        allCoupons
      ]]);
    } else {
      const initialAllCoupons = mergeCouponHistory_('', incomingAllCoupons);
      sheet.appendRow([
        timestamp,
        playerName,
        1,
        newScore,
        newScore,
        newAccuracy,
        newDetail,
        newStreak,
        newRank,
        newCoupon,
        newCoupon,
        initialAllCoupons
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Jugador actualizado en Sauce Blaster 3D Sheets' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      app: 'S.N.A.X. Arcade: Sauce Blaster 3D',
      sheet: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
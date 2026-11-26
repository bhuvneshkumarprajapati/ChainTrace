function matchesProductQr(productId, qrCode, scannedValue) {
  const normalize = value => String(value ?? '').trim().toUpperCase();
  const scanned = normalize(scannedValue);
  return !scanned || scanned === (normalize(qrCode) || normalize(productId));
}
module.exports = { matchesProductQr };


const assert = require("node:assert/strict");

function getVerificationStatus({
  hashMatches,
  qrMatches = true,
  blockchainVerified = true,
  ownershipValid = true,
  manufacturerValid = true,
}) {
  let verificationResult = "AUTHENTIC";
  let riskLevel = "LOW";

  if (!hashMatches || !qrMatches) {
    verificationResult = "WARNING";
    riskLevel = "HIGH";
  }

  if (!blockchainVerified || !ownershipValid || !manufacturerValid) {
    verificationResult = "WARNING";

    if (riskLevel !== "HIGH") {
      riskLevel = "MEDIUM";
    }
  }

  return { verificationResult, riskLevel };
}

assert.deepEqual(
  getVerificationStatus({ hashMatches: true }),
  { verificationResult: "AUTHENTIC", riskLevel: "LOW" }
);

assert.deepEqual(
  getVerificationStatus({ hashMatches: false }),
  { verificationResult: "WARNING", riskLevel: "HIGH" }
);

assert.deepEqual(
  getVerificationStatus({ hashMatches: true, qrMatches: false }),
  { verificationResult: "WARNING", riskLevel: "HIGH" }
);

assert.deepEqual(
  getVerificationStatus({
    hashMatches: true,
    blockchainVerified: false,
  }),
  { verificationResult: "WARNING", riskLevel: "MEDIUM" }
);

console.log("PASS: All 4 verification logic tests passed.");

const { matchesProductQr } = require('../src/services/qrVerification');
assert.equal(matchesProductQr('CT-001', 'CT-001', 'WRONG'), false);
assert.equal(matchesProductQr('CT-001', 'CT-001', 'ct-001'), true);
assert.equal(matchesProductQr('CT-001', 'CT-001', ''), true);
assert.equal(matchesProductQr('CT-001', '', 'WRONG'), false);
assert.equal(matchesProductQr('CT-001', '', 'CT-001'), true);
console.log('PASS: QR regression tests');

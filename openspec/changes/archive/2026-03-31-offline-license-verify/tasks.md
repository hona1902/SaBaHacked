# Tasks: offline-license-verify

## 1. Rewrite `license.js` — offline HMAC verify
- [ ] 1.1 Add SECRET_KEY constant and `getMachineCode()` (8 char from fingerprint)
- [ ] 1.2 Add `generateLicenseKey(machineCode)` using HMAC-SHA256 + Web Crypto
- [ ] 1.3 Replace `verifyLicense()` with `verifyOffline(key)` — compare HMAC output
- [ ] 1.4 Update `checkLicense()` to use offline verify (remove API calls, cache logic)

## 2. Update Settings UI — show machine code
- [ ] 2.1 Add "Mã máy" display field with copy button in `options.html`
- [ ] 2.2 Update `options.js` to populate machine code on load and use offline verify

## 3. Create `keygen.html` — admin tool
- [ ] 3.1 Create standalone HTML with input, generate button, and result display
- [ ] 3.2 Embed same SECRET_KEY and HMAC logic

## 4. Verification
- [ ] 4.1 End-to-end test: generate machine code → keygen → activate → AI unlocked

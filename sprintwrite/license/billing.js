/* global LicenseVerifier, Storage */
(async function() {
  const keyInput = document.getElementById('key');
  const saveBtn  = document.getElementById('save');
  const statusEl = document.getElementById('status');
  const buyOnce  = document.getElementById('buy-once');
  const subMonth = document.getElementById('sub-month');

  const lic = await Storage.getLicense();
  keyInput.value = lic?.key || '';

  saveBtn.onclick = async () => {
    statusEl.textContent = 'Verifying…';
    const res = await LicenseVerifier.submitKey(keyInput.value.trim());
    statusEl.textContent = `Plan: ${res.status}`;
  };

  buyOnce.onclick = async () => {
    keyInput.value = 'SWLIFE-TEST-PAID-ONCE';
  };
  subMonth.onclick = async () => {
    keyInput.value = 'SWLIFE-TEST-SUB-MONTH';
  };

  statusEl.textContent = `Current: ${lic?.status || 'FREE'}`;
})();

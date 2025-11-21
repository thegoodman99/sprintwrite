/* global Storage, MockVerifier */
const LicenseVerifier = {
  async getPlanStatus(current) {
    // current: {status, key}
    const lic = current || (await Storage.getLicense());
    if (!lic?.key) return 'FREE';
    if (lic.status && lic.status !== 'FREE') return lic.status;
    // Try validate
    const res = await MockVerifier.verify(lic.key);
    if (res.ok) {
      const final = { key: lic.key, status: res.status, token: res.token };
      await Storage.setLicense(final);
      // Mirror into settings.plan for convenience
      const s = await Storage.getSettings();
      s.plan = res.status;
      await Storage.setSettings(s);
      return res.status;
    }
    return 'FREE';
  },
  async submitKey(key) {
    const res = await MockVerifier.verify(key);
    const lic = res.ok ? { key, status: res.status, token: res.token } : { key, status: 'FREE' };
    await Storage.setLicense(lic);
    const s = await Storage.getSettings();
    s.plan = lic.status;
    await Storage.setSettings(s);
    return lic;
  }
};

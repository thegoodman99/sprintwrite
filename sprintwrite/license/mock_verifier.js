// Mock local verifier emulating a remote license service.
// Accepts:
//  - SWLIFE-TEST-PAID-ONCE  => PRO_LIFETIME
//  - SWLIFE-TEST-SUB-MONTH  => PRO_SUB
const MockVerifier = {
  async verify(key) {
    await new Promise(r => setTimeout(r, 250));
    if (key === 'SWLIFE-TEST-PAID-ONCE') {
      return { ok: true, status: 'PRO_LIFETIME', token: 'jwt.mock.lifetime' };
    }
    if (key === 'SWLIFE-TEST-SUB-MONTH') {
      return { ok: true, status: 'PRO_SUB', token: 'jwt.mock.sub' };
    }
    return { ok: false, status: 'FREE' };
  }
};

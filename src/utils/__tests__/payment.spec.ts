import { describe, it, expect } from 'vitest';
import { sandboxPaymentUrl } from '../payment';
describe('sandbox cashier redirects', () => {
  it('accepts the signed Alipay sandbox gateway URL', () =>
    expect(
      sandboxPaymentUrl('https://openapi-sandbox.dl.alipaydev.com/gateway.do?sign=test')
    ).toContain('sign=test'));
  it.each([
    'http://openapi-sandbox.dl.alipaydev.com/gateway.do',
    'https://openapi.alipay.com/gateway.do',
    'https://openapi-sandbox.dl.alipaydev.com.evil.example/gateway.do',
    'https://user:password@openapi-sandbox.dl.alipaydev.com/gateway.do',
    'https://openapi-sandbox.dl.alipaydev.com:8443/gateway.do',
    'https://openapi-sandbox.dl.alipaydev.com/redirect',
    'javascript:alert(1)',
  ])('rejects untrusted or live payment redirects: %s', (value) =>
    expect(() => sandboxPaymentUrl(value)).toThrow()
  );
});

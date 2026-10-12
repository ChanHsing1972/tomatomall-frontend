/** Only the project's Alipay sandbox cashier may receive a payment redirect. */
export function sandboxPaymentUrl(value: string | undefined): string {
  if (!value) throw new Error('支付宝沙箱未返回收银台地址。');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('支付宝沙箱返回了无效地址。');
  }
  if (
    url.protocol !== 'https:' ||
    !['openapi-sandbox.dl.alipaydev.com', 'openapi.alipaydev.com'].includes(url.hostname) ||
    url.pathname !== '/gateway.do' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443')
  ) {
    throw new Error('支付地址不属于支付宝沙箱。');
  }
  return url.href;
}

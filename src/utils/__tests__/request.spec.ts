import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { axios } from '../request';

describe('same-origin API', () => {
  beforeEach(() => sessionStorage.clear());
  it('uses the website origin and attaches authenticated tokens', async () => {
    const mock = new MockAdapter(axios);
    sessionStorage.setItem('token', 'test-token');
    mock.onGet('/api/products').reply((config) => {
      expect(config.headers?.token).toBe('test-token');
      expect(config.baseURL).toBe('/');
      return [200, { code: '200', data: [] }];
    });
    await axios.get('/api/products');
    mock.restore();
  });
  it('rejects failed business requests even when HTTP status is 200', async () => {
    const mock = new MockAdapter(axios);
    mock.onPost('/api/cart').reply(200, { code: '401', msg: '库存不足' });
    await expect(axios.post('/api/cart')).rejects.toThrow('库存不足');
    mock.restore();
  });
});

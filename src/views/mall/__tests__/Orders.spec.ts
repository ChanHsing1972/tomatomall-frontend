import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Orders from '../Orders.vue';
import { getOrders } from '../../../api/order';
vi.mock('../../../api/order', () => ({
  getOrders: vi.fn(),
  payOrder: vi.fn(),
  deleteOrder: vi.fn(),
}));
vi.mock('../../../api/coupon', () => ({
  getUserCoupons: vi.fn(),
  applyCouponToOrder: vi.fn(),
  removeCouponFromOrder: vi.fn(),
}));
vi.mock('../../../components/Header.vue', () => ({ default: { template: '<header/>' } }));
vi.mock('../../../components/Footer.vue', () => ({ default: { template: '<footer/>' } }));
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/booklist', component: { template: '<div/>' } },
  ],
});
let wrapper: ReturnType<typeof mount>;
afterEach(() => {
  wrapper?.unmount();
  vi.clearAllMocks();
});
describe('orders storefront', () => {
  it('shows structured loading, then uses the actual discounted amount and filters by order number', async () => {
    let resolve!: (value: any) => void;
    vi.mocked(getOrders).mockReturnValue(new Promise((r) => (resolve = r)));
    wrapper = mount(Orders, {
      global: { plugins: [router], stubs: { ElDialog: { template: '<div/>' } } },
    });
    expect(wrapper.get('[aria-busy="true"]').attributes('role')).toBe('status');
    resolve({
      code: '200',
      data: [
        {
          orderId: '101',
          createTime: '2026-10-13T01:00:00',
          expireTime: '2099-10-13T01:00:00',
          status: 'TRADE_SUCCESS',
          totalAmount: '45.00',
          payAmount: '39.00',
          discountAmount: '6.00',
          shippingAddress: { name: 'Test' },
          orderItems: [
            { productId: '1', cartItemId: '1', title: 'Test Book', price: '45.00', quantity: 1 },
          ],
        },
      ],
    });
    await flushPromises();
    expect(wrapper.get('.order-amount').text()).toBe('RMB 39.00');
    await wrapper.get('[aria-label="搜索订单"]').setValue('101');
    expect(wrapper.findAll('.order-record')).toHaveLength(1);
    await wrapper.get('[aria-label="搜索订单"]').setValue('missing');
    expect(wrapper.text()).toContain('没有找到匹配的订单');
  });
  it('shows retry after a load failure instead of pretending the account has no orders', async () => {
    vi.mocked(getOrders).mockRejectedValue(new Error('连接失败'));
    wrapper = mount(Orders, {
      global: { plugins: [router], stubs: { ElDialog: { template: '<div/>' } } },
    });
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('重新加载');
    expect(wrapper.find('.store-empty').exists()).toBe(false);
  });
});

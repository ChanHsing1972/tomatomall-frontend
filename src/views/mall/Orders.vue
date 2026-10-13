<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, ArrowRight, Document } from '@element-plus/icons-vue';
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import { getOrders, deleteOrder, payOrder, type OrderVO } from '../../api/order';
import {
  getUserCoupons,
  applyCouponToOrder,
  removeCouponFromOrder,
  type UserCouponVO,
} from '../../api/coupon';
import { coverFallback } from '../../utils';
import { sandboxPaymentUrl } from '../../utils/payment';
import '../../styles/store.css';
const orders = ref<OrderVO[]>([]);
const loading = ref(true);
const loadError = ref('');
const search = ref('');
const filter = ref('all');
const busy = ref<string | null>(null);
const expanded = ref(new Set<string>());
const coupons = ref<UserCouponVO[]>([]);
const couponOrder = ref<OrderVO | null>(null);
const couponLoading = ref(false);
const now = ref(Date.now());
let timer: number;
const filters = [
  { id: 'all', label: '全部订单' },
  { id: 'PENDING', label: '待支付' },
  { id: 'TRADE_SUCCESS', label: '已完成' },
  { id: 'EXPIRED', label: '已过期' },
];
const filteredOrders = computed(() =>
  orders.value.filter(
    (o) =>
      (filter.value === 'all' || o.status === filter.value) &&
      [o.orderId, ...o.orderItems.map((i) => i.title)]
        .join(' ')
        .toLowerCase()
        .includes(search.value.trim().toLowerCase())
  )
);
const money = (n: string | number | undefined) => `RMB ${Number(n ?? 0).toFixed(2)}`;
const instant = (value: string) =>
  new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : value.replace(' ', 'T') + '+08:00');
const date = (value: string | undefined) =>
  value
    ? instant(value).toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';
const remaining = (order: OrderVO) =>
  Math.max(0, Math.floor((instant(order.expireTime).getTime() - now.value) / 1000));
const countdown = (order: OrderVO) => {
  const n = remaining(order);
  return `${Math.floor(n / 60)}分${String(n % 60).padStart(2, '0')}秒`;
};
const pending = (order: OrderVO) => order.status === 'PENDING' && remaining(order) > 0;
const status = (order: OrderVO) =>
  order.status === 'TRADE_SUCCESS'
    ? '你的图书，已准备就绪。'
    : pending(order)
      ? '等待完成付款。'
      : '订单已过期。';
const toggle = (id: string) =>
  expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id);
async function fetchOrders() {
  loadError.value = '';
  loading.value = true;
  try {
    const res = await getOrders();
    orders.value = (res.data || []).sort(
      (a: OrderVO, b: OrderVO) =>
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '订单暂时无法加载。';
  } finally {
    loading.value = false;
  }
}
async function pay(order: OrderVO) {
  if (busy.value) return;
  busy.value = order.orderId;
  try {
    const res = await payOrder(Number(order.orderId));
    const url = sandboxPaymentUrl(res.data.paymentUrl || res.data.paymentForm);
    window.location.assign(url);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '暂时无法打开支付宝沙箱，请稍后再试。');
  } finally {
    busy.value = null;
  }
}
async function cancel(order: OrderVO) {
  try {
    await ElMessageBox.confirm(
      pending(order) ? '取消订单后将释放预留库存。' : '确定删除这条订单记录？',
      '确认操作',
      { confirmButtonText: '确认', cancelButtonText: '保留订单' }
    );
    busy.value = order.orderId;
    await deleteOrder(order.orderId);
    await fetchOrders();
  } catch (e) {
    if (e !== 'cancel' && e !== 'close')
      ElMessage.error(e instanceof Error ? e.message : '订单操作失败。');
  } finally {
    busy.value = null;
  }
}
async function chooseCoupon(order: OrderVO) {
  couponOrder.value = order;
  couponLoading.value = true;
  try {
    coupons.value = (await getUserCoupons('UNUSED')).data || [];
  } catch (e) {
    ElMessage.error('优惠券暂时无法加载。');
  } finally {
    couponLoading.value = false;
  }
}
async function applyCoupon(id: number | null) {
  if (!couponOrder.value || busy.value) return;
  busy.value = couponOrder.value.orderId;
  try {
    const orderId = Number(couponOrder.value.orderId);
    if (id) await applyCouponToOrder(orderId, id);
    else await removeCouponFromOrder(orderId);
    couponOrder.value = null;
    await fetchOrders();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '优惠券操作失败。');
  } finally {
    busy.value = null;
  }
}
onMounted(() => {
  fetchOrders();
  timer = window.setInterval(() => (now.value = Date.now()), 1000);
});
onUnmounted(() => window.clearInterval(timer));
</script>
<template>
  <Header />
  <main class="store-page orders-page">
    <div class="store-shell">
      <header class="store-heading">
        <div>
          <h1>你订购的图书。</h1>
        </div>
        <router-link to="/booklist" class="store-link browse-link"
          >继续选书 <el-icon><ArrowRight /></el-icon
        ></router-link>
      </header>
      <div class="order-toolbar">
        <div class="order-filters" role="tablist" aria-label="订单状态">
          <button
            v-for="tab in filters"
            :key="tab.id"
            role="tab"
            :aria-selected="filter === tab.id"
            :class="{ selected: filter === tab.id }"
            @click="filter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <label class="order-search"
          ><el-icon><Search /></el-icon
          ><input v-model="search" aria-label="搜索订单" placeholder="搜索书名或订单号"
        /></label>
      </div>
      <section
        v-if="loading"
        class="order-skeleton"
        role="status"
        aria-label="正在加载订单"
        aria-busy="true"
      >
        <span class="sr-only">正在加载订单</span>
        <div v-for="n in 2" :key="n" class="skeleton-order">
          <div class="sk-block skeleton-cover"></div>
          <div class="skeleton-copy">
            <div class="sk-line short"></div>
            <div class="sk-line"></div>
            <div class="sk-line price-line"></div>
          </div>
        </div>
      </section>
      <div v-else-if="loadError" class="store-error" role="alert">
        <p>{{ loadError }}</p>
        <button class="store-link" @click="fetchOrders">重新加载</button>
      </div>
      <section v-else-if="!filteredOrders.length" class="store-empty">
        <el-icon :size="48"><Document /></el-icon>
        <h2>{{ orders.length ? '没有找到匹配的订单。' : '下一次阅读，从这里开始。' }}</h2>
        <p>
          {{
            orders.length
              ? '试试其他书名、订单号或状态。'
              : '挑选一本喜欢的书，你的订单将会显示在这里。'
          }}
        </p>
        <router-link v-if="!orders.length" to="/booklist" class="store-button">探索书库</router-link
        ><button
          v-else
          class="store-link"
          @click="
            search = '';
            filter = 'all';
          "
        >
          查看全部订单
        </button>
      </section>
      <section v-else aria-label="订单列表">
        <article v-for="order in filteredOrders" :key="order.orderId" class="order-record">
          <div class="order-meta">
            <div>
              <span class="order-label">订单号</span><strong>{{ order.orderId }}</strong>
            </div>
            <div>
              <span class="order-label">下单日期</span><span>{{ date(order.createTime) }}</span>
            </div>
          </div>
          <div class="order-overview">
            <div class="order-covers">
              <router-link
                v-for="item in order.orderItems"
                :key="item.productId"
                :to="`/bookdetail/${item.productId}`"
                ><img
                  :src="item.cover"
                  :alt="item.title"
                  @error="coverFallback($event, item.title)"
              /></router-link>
            </div>
            <div class="order-progress">
              <span class="order-label">{{ order.orderItems.map((i) => i.title).join('、') }}</span>
              <h2>{{ status(order) }}</h2>
              <div
                class="progress-track"
                :class="{ expired: !pending(order) && order.status !== 'TRADE_SUCCESS' }"
              >
                <span :style="{ width: order.status === 'TRADE_SUCCESS' ? '100%' : '33%' }"></span>
              </div>
              <ol class="progress-labels">
                <li>订单已创建</li>
                <li :class="{ current: pending(order) }">
                  {{ order.status === 'TRADE_SUCCESS' ? '付款已完成' : '等待付款' }}
                </li>
                <li>{{ order.status === 'TRADE_SUCCESS' ? '可以阅读' : '开启阅读' }}</li>
              </ol>
              <p class="progress-description">
                {{
                  order.status === 'TRADE_SUCCESS'
                    ? '付款完成。进入图书详情，即可查看可用阅读章节。'
                    : pending(order)
                      ? `请在 ${countdown(order)} 内完成支付宝沙箱付款。`
                      : '预留库存已释放，你可以重新下单。'
                }}
              </p>
            </div>
          </div>
          <div class="order-item" v-for="item in order.orderItems" :key="item.cartItemId">
            <router-link :to="`/bookdetail/${item.productId}`">{{ item.title }}</router-link
            ><span>数量 {{ item.quantity }}</span
            ><strong>{{ money(Number(item.price) * item.quantity) }}</strong>
          </div>
          <div class="order-footer">
            <div>
              <span class="order-label">订单金额</span
              ><strong class="order-amount">{{
                money(order.payAmount ?? order.totalAmount)
              }}</strong
              ><span v-if="Number(order.discountAmount) > 0" class="discount"
                >已优惠 {{ money(order.discountAmount) }}</span
              >
            </div>
            <div class="order-actions">
              <button
                class="store-link"
                :aria-expanded="expanded.has(order.orderId)"
                @click="toggle(order.orderId)"
              >
                {{ expanded.has(order.orderId) ? '收起详情' : '查看详情' }}</button
              ><button
                v-if="pending(order)"
                class="store-link"
                :disabled="!!busy"
                @click="chooseCoupon(order)"
              >
                优惠券</button
              ><button
                v-if="pending(order)"
                class="store-button"
                :disabled="!!busy"
                @click="pay(order)"
              >
                {{ busy === order.orderId ? '正在打开…' : '支付宝沙箱支付' }}</button
              ><router-link
                v-else-if="order.status === 'TRADE_SUCCESS' && order.orderItems[0]"
                :to="`/bookdetail/${order.orderItems[0].productId}`"
                class="store-link"
                >查看图书 <el-icon><ArrowRight /></el-icon
              ></router-link>
            </div>
          </div>
          <div v-if="expanded.has(order.orderId)" class="order-details">
            <div>
              <h3>订单信息</h3>
              <p>{{ order.shippingAddress.name }}</p>
              <p>{{ order.shippingAddress.address }}</p>
              <p>{{ order.shippingAddress.telephone }}</p>
            </div>
            <div>
              <h3>付款信息</h3>
              <p>{{ order.paymentMethod === 'DEMO' ? '历史模拟支付记录' : '支付宝沙箱' }}</p>
              <p v-if="order.paymentTime">付款日期：{{ date(order.paymentTime) }}</p>
              <p v-if="order.userCouponId">已使用优惠券，优惠 {{ money(order.discountAmount) }}</p>
            </div>
            <div>
              <h3>管理订单</h3>
              <button class="store-link" :disabled="!!busy" @click="cancel(order)">
                {{ pending(order) ? '取消这笔订单' : '删除订单记录' }}
              </button>
            </div>
          </div>
        </article>
      </section>
      <section class="order-help">
        <h2>需要帮助？</h2>
        <p>订单付款完成后通常会自动更新。若你已在沙箱完成付款，请刷新查看最新状态。</p>
        <button class="store-link" :disabled="loading" @click="fetchOrders">刷新订单状态</button
        ><router-link to="/about/help" class="store-link"
          >查看购买帮助 <el-icon><ArrowRight /></el-icon
        ></router-link>
      </section>
    </div>
  </main>
  <Footer />
  <el-dialog
    :model-value="!!couponOrder"
    @update:model-value="!$event && (couponOrder = null)"
    class="store-dialog"
    title="选择优惠券"
    width="540px"
  >
    <div v-if="couponLoading" role="status" aria-label="正在加载优惠券">
      <div class="sk-line"></div>
      <div class="sk-line short"></div>
    </div>
    <template v-else
      ><p v-if="!coupons.length">你目前没有可用优惠券。</p>
      <button
        v-for="coupon in coupons"
        :key="coupon.id"
        class="coupon-row"
        :disabled="!!busy || Number(couponOrder?.totalAmount) < coupon.minimumSpend"
        @click="applyCoupon(coupon.id)"
      >
        <span
          ><strong>{{ coupon.name }}</strong
          ><small>满 {{ money(coupon.minimumSpend) }} 可用</small></span
        ><span>{{
          coupon.type === 'DISCOUNT' ? `${coupon.value} 折` : money(coupon.value)
        }}</span></button
      ><button
        v-if="couponOrder?.userCouponId"
        class="store-link"
        :disabled="!!busy"
        @click="applyCoupon(null)"
      >
        移除已选优惠券
      </button></template
    >
  </el-dialog>
</template>
<style scoped>
.browse-link {
  margin-top: 27px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.order-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--store-line);
  padding-bottom: 24px;
}
.order-filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.order-filters button {
  border: 0;
  background: none;
  color: var(--store-muted);
  padding: 10px 15px;
  border-radius: 22px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 14px;
}
.order-filters button.selected {
  color: var(--store-ink);
  background: var(--store-soft);
  font-weight: 600;
}
.order-search {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--store-muted);
  max-width: 230px;
}
.order-search input {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
  color: var(--store-ink);
}
.order-record {
  padding: 36px 0 48px;
  border-bottom: 1px solid var(--store-line);
}
.order-meta {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  font-size: 14px;
}
.order-meta > div {
  display: flex;
  gap: 8px;
}
.order-label {
  color: var(--store-muted);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.order-overview {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: center;
  gap: 56px;
  margin: 44px 0;
}
.order-covers {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.order-covers img {
  width: 128px;
  height: 180px;
  object-fit: contain;
  display: block;
}
.order-covers:has(a:only-child) img {
  width: 180px;
  height: 245px;
}
.order-progress h2 {
  font-size: 32px;
  letter-spacing: -0.03em;
  line-height: 1.15;
  font-weight: 600;
  margin: 13px 0 26px;
}
.progress-track {
  height: 6px;
  background: #d2d2d7;
  border-radius: 6px;
  overflow: hidden;
}
.progress-track > span {
  display: block;
  height: 100%;
  background: #34852b;
  border-radius: 6px;
}
.progress-track.expired > span {
  background: #86868b;
}
.progress-labels {
  padding: 0;
  margin: 12px 0 24px;
  display: flex;
  justify-content: space-between;
  list-style: none;
  gap: 12px;
  color: var(--store-muted);
  font-size: 13px;
}
.progress-labels .current {
  color: var(--store-ink);
  font-weight: 600;
}
.progress-description {
  font-size: 17px;
  line-height: 1.65;
  margin: 0;
}
.order-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px 130px;
  gap: 20px;
  font-size: 15px;
  padding: 16px 0;
  border-top: 1px solid #e8e8ed;
}
.order-item a {
  color: var(--store-ink);
  text-decoration: none;
  font-weight: 600;
}
.order-item span {
  color: var(--store-muted);
}
.order-item strong {
  text-align: right;
  font-weight: 500;
  white-space: nowrap;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding-top: 24px;
}
.order-footer > div:first-child {
  display: grid;
  gap: 4px;
}
.order-amount {
  font-size: 24px;
  letter-spacing: -0.02em;
}
.order-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.discount {
  font-size: 13px;
  color: var(--store-muted);
}
.order-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  padding-top: 32px;
  margin-top: 28px;
  border-top: 1px solid #e8e8ed;
  overflow-wrap: anywhere;
}
.order-details h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 14px;
}
.order-details p {
  font-size: 14px;
  margin: 6px 0;
  color: var(--store-muted);
}
.order-help {
  padding-top: 52px;
}
.order-help h2 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.order-help p {
  color: var(--store-muted);
  line-height: 1.7;
  max-width: 670px;
}
.order-help a {
  margin-left: 24px;
}
.skeleton-order {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 56px;
  align-items: center;
  padding: 52px 0;
  border-bottom: 1px solid #d2d2d7;
}
.skeleton-cover {
  width: 180px;
  height: 245px;
  margin: auto;
}
.skeleton-copy .sk-line:nth-child(2) {
  height: 30px;
  margin: 25px 0;
}
.coupon-row {
  border: 0;
  border-bottom: 1px solid #d2d2d7;
  background: white;
  padding: 22px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: #1d1d1f;
  font-size: 16px;
}
.coupon-row:disabled {
  opacity: 0.4;
  cursor: default;
}
.coupon-row small {
  display: block;
  margin-top: 6px;
  color: #6e6e73;
}
.coupon-row + .store-link {
  margin-top: 24px;
}
@media (max-width: 700px) {
  .order-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .order-search {
    max-width: none;
  }
  .order-filters {
    gap: 0;
  }
  .order-filters button {
    padding: 10px 12px;
  }
  .order-meta {
    flex-direction: column;
    gap: 8px;
  }
  .order-overview {
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 24px;
    margin: 32px 0;
  }
  .order-covers img,
  .order-covers:has(a:only-child) img {
    width: 100px;
    height: 144px;
  }
  .order-progress h2 {
    font-size: 25px;
    margin: 10px 0 20px;
  }
  .progress-labels {
    font-size: 11px;
    gap: 6px;
  }
  .progress-description {
    font-size: 14px;
  }
  .order-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }
  .order-actions {
    width: 100%;
    justify-content: flex-start;
    gap: 22px;
  }
  .order-actions .store-button {
    margin-left: auto;
  }
  .order-details {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .order-item {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }
  .order-item span {
    grid-column: 1;
    font-size: 13px;
  }
  .order-item strong {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
  }
  .skeleton-order {
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 24px;
    padding: 40px 0;
  }
  .skeleton-cover {
    width: 100px;
    height: 144px;
  }
  .order-help a {
    display: block;
    margin: 14px 0 0;
  }
}
@media (max-width: 380px) {
  .order-overview {
    grid-template-columns: 1fr;
  }
  .order-covers {
    justify-content: flex-start;
  }
  .order-details {
    grid-template-columns: 1fr;
  }
}
</style>

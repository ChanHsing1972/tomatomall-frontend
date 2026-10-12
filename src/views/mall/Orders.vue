<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { deleteOrder, getOrders, type OrderItem, type OrderStatus, type OrderVO, payOrder } from "../../api/order";
import { Calendar, Document, Location, Picture, Search, ShoppingCart } from '@element-plus/icons-vue';
import { applyCouponToOrder, getUserCoupons, removeCouponFromOrder, type UserCouponVO } from "../../api/coupon";
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";

// 添加优惠券接口定义
interface EnhancedOrderVO extends OrderVO {
  unformattedDate: string; // 原始时间戳
  formattedDate: string;
  statusText: string;
  items: OrderItem[]; // 增强后的商品项
  countdown: number; // 倒计时
  expireTime: string; // 过期时间
  timeline?: { icon: string, title: string, time: string }[]; // 订单时间线
  selectedCouponId?: number; // 选中的优惠券ID
  showCouponDialog?: boolean; // 是否显示优惠券选择对话框
  appliedDiscount?: number; // 应用的优惠金额
}

const orders = ref<EnhancedOrderVO[]>([]);
const loading = ref(false);
const payingOrderIds = ref<Set<string>>(new Set());
const activeTab = ref('all');
const searchQuery = ref('');
// 添加优惠券相关状态
const userCoupons = ref<UserCouponVO[]>([]);
const loadingCoupons = ref(false);

// 筛选后的订单列表
const filteredOrders = computed(() => {
  let result = [...orders.value];

  // 按状态筛选
  if (activeTab.value !== 'all') {
    result = result.filter(order => order.status === activeTab.value);
  }

  // 按搜索内容筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(order =>
      order.unformattedDate.includes(query) ||
      order.items.some(item => item.title.toLowerCase().includes(query))
    );
  }

  return result;
});

// 订单统计数据
const orderStats = computed(() => {
  const total = orders.value.length;
  const pending = orders.value.filter(o => o.status === 'PENDING').length;
  const completed = orders.value.filter(o => o.status === 'TRADE_SUCCESS').length;
  const cancelled = orders.value.filter(o => o.status === 'EXPIRED').length;

  let totalSpent = 0;
  orders.value.forEach(order => {
    if (order.status === 'TRADE_SUCCESS') {
      totalSpent += parseFloat(order.totalAmount);
    }
  });

  return { total, pending, completed, cancelled, totalSpent };
});

// 状态映射
const statusMap: Record<OrderStatus, { text: string; type: "" | "success" | "warning" | "info" | "danger" }> = {
  PENDING: { text: "待支付", type: "warning" },
  TRADE_SUCCESS: { text: "已完成", type: "success" },
  EXPIRED: { text: "已过期", type: "info" }
};

// 格式化日期
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-');
  } catch (e) {
    return '未知日期';
  }
};

// 生成订单时间线数据
const generateTimeline = (order: OrderVO) => {
  const timeline = [
    {
      icon: "ShoppingCart",
      title: "订单创建",
      time: formatDate(order.createTime)
    }
  ];

  if (order.status === 'TRADE_SUCCESS') {
    timeline.push({
      icon: "Check",
      title: "支付完成",
      time: formatDate(order.createTime)
    });
  } else if (order.status === 'EXPIRED') {
    timeline.push({
      icon: "Warning",
      title: "订单过期",
      time: formatDate(order.createTime)
    });
  }

  return timeline;
};

function convertTimestamp(dateString: string): string {
  const dt = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
}

const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// 计算剩余倒计时，无论是否刷新，都基于 expireTime 与当前时间相减得到
const calcCountdown = (expireTime: string): number => {
  const diff = Math.floor((new Date(expireTime).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

// 获取用户优惠券列表
const fetchUserCoupons = async () => {
  loadingCoupons.value = true;
  try {
    const response = await getUserCoupons("UNUSED"); // 只获取可用的优惠券
    if (response.code === "200") {
      userCoupons.value = response.data || [];
      console.log(userCoupons.value);
    } else {
      ElMessage.error(response.message || "获取优惠券失败");
    }
  } catch (error) {
    console.error("获取优惠券失败:", error);
    ElMessage.error("获取优惠券数据失败");
  } finally {
    loadingCoupons.value = false;
  }
};

// 获取订单可用的优惠券
const getAvailableCoupons = (orderAmount: number) => {
  // 只返回满足最低消费金额的优惠券
  console.log(userCoupons.value);
  return userCoupons.value.filter(coupon => orderAmount >= coupon.minimumSpend);
};

// 根据ID获取优惠券信息
const getCouponById = (id: number): UserCouponVO | undefined => {
  console.log("usercoupon=", userCoupons.value.find(coupon => coupon.id === id));
  return userCoupons.value.find(coupon => coupon.id === id);
};

// 应用优惠券到订单
const applyCoupon = async (order: EnhancedOrderVO, couponId: number | null) => {
  if (!couponId) {
    // 如果之前有选中的优惠券，需要从订单中移除
    if (order.selectedCouponId) {
      try {
        await removeCouponFromOrder(Number(order.orderId));
        order.selectedCouponId = undefined;
        order.appliedDiscount = 0;
        ElMessage.success("优惠券已移除");
      } catch (error) {
        console.error("移除优惠券失败:", error);
        ElMessage.error("移除优惠券失败");
      }
    }
    order.showCouponDialog = false;
    return;
  }

  const coupon = getCouponById(couponId);
  if (!coupon) {
    ElMessage.error("优惠券不存在");
    return;
  }

  try {
    const result = await applyCouponToOrder(Number(order.orderId), coupon.id);
    if (result.code === "200") {
      order.selectedCouponId = coupon.id;
      order.appliedDiscount = result.data; // 后端返回的实际优惠金额
      ElMessage.success("优惠券应用成功");
      order.showCouponDialog = false;
    } else {
      ElMessage.error(result.message || "应用优惠券失败");
    }
  } catch (error) {
    console.error("应用优惠券失败:", error);
    ElMessage.error("应用优惠券失败");
  }
};

// 计算应用优惠券后的最终价格
const calculateFinalPrice = (order: EnhancedOrderVO) => {
  const originalPrice = parseFloat(order.totalAmount);
  if (!order.selectedCouponId || !order.appliedDiscount) return originalPrice.toFixed(2);

  // 使用后端返回的实际优惠金额
  return Math.max(0, originalPrice - order.appliedDiscount).toFixed(2);
};

// 显示优惠券选择对话框
const showCouponSelector = (order: EnhancedOrderVO) => {
  order.showCouponDialog = true;
};

// 移除已选择的优惠券
const removeCoupon = async (order: EnhancedOrderVO) => {
  try {
    await removeCouponFromOrder(Number(order.orderId));
    order.selectedCouponId = undefined;
    order.appliedDiscount = 0;
    ElMessage.success("优惠券已移除");
  } catch (error) {
    console.error("移除优惠券失败:", error);
    ElMessage.error("移除优惠券失败");
  }
};

// 处理支付订单
const handlePayOrder = async (orderId: string) => {
  try {
    payingOrderIds.value.add(orderId);

    const { code, data, message } = await payOrder(Number(orderId));

    if (code.toString() === "200") {
      // 处理支付返回结果
      if (data.demo) {
        ElMessage.success('演示支付成功，本次操作不会扣款');
        await fetchOrders();
        return;
      }
      if (data.paymentForm) {
        // 直接跳转到支付URL
        window.location.href = data.paymentForm.trim();
        return;
      }

      ElNotification.success({
        title: "支付发起成功",
        message: `订单 ${orderId} 支付处理中`,
        duration: 3000
      });

      // 3秒后刷新订单状态
      setTimeout(fetchOrders, 3000);
    } else {
      ElMessage.error(message || "支付请求失败");
    }
  } catch (error) {
    console.error("支付失败:", error);
    ElMessage.error("支付过程中发生错误");
  } finally {
    payingOrderIds.value.delete(orderId);
  }
};

const handleDeleteOrder = async (orderId: string) => {
  try {
    const { code, message } = await deleteOrder(orderId);
    if (code.toString() === "200") {
      ElMessage({
        message: "订单已删除",
        type: "success",
        duration: 1000,
        grouping: true,
      })
      await fetchOrders();
    } else {
      ElMessage.error(message || "删除订单失败");
    }
  } catch (error) {
    console.error("删除订单失败:", error);
    ElMessage.error("取消订单过程中发生错误");
  }
}

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrders();
    if (res.code === "200" && res.data) {
      orders.value = await Promise.all(
        res.data.map(async (order: OrderVO) => {
          // 获取所有商品详情
          const items = order.orderItems;
          return {
            ...order,
            expireTime: (order as any).expireTime,
            unformattedDate: convertTimestamp(order.createTime),
            formattedDate: formatDate(order.createTime),
            statusText: statusMap[order.status].text,
            items,
            timeline: generateTimeline(order),
            selectedCouponId: (order as any).userCouponId ? Number((order as any).userCouponId) : undefined,
            appliedDiscount: Number((order as any).discountAmount || 0),
            countdown: calcCountdown((order as any).expireTime),
            showCouponDialog: false
          };
        })
      );
    } else {
      ElMessage.error(res.message || "获取订单失败");
    }
  } catch (error: unknown) {
    console.error("获取订单失败:", error);
    let errorMessage = "获取订单失败";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取订单数据
let countdownTimer: number;
onUnmounted(() => window.clearInterval(countdownTimer));
onMounted(() => {
  fetchOrders();
  fetchUserCoupons(); // 获取用户优惠券列表
  countdownTimer = window.setInterval(() => {
    orders.value.forEach(order => {
      order.countdown = calcCountdown(order.expireTime);
    });
  }, 1000);
});
// 确保页面滚动到顶部
window.scrollTo(0, 0);
</script>

<template>
  <Header />
  <div class="page-wrapper">
    <div class="orders-content">

      <!-- 订单统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <el-icon>
              <ShoppingCart />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ orderStats.total }}</div>
            <div class="stat-label">全部订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending-icon">
            <el-icon>
              <Document />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ orderStats.pending }}</div>
            <div class="stat-label">待支付</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed-icon">
            <el-icon>
              <Location />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ orderStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon spent-icon">
            <el-icon>
              <Calendar />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ orderStats.totalSpent.toFixed(2) }}</div>
            <div class="stat-label">已消费</div>
          </div>
        </div>
      </div>

      <!-- 搜索与筛选 -->
      <div class="filter-section">
        <div class="search-wrapper">
          <el-input v-model="searchQuery" placeholder="搜索订单号或商品名称" :prefix-icon="Search" clearable
            class="custom-search" />
        </div>
        <div class="tabs-wrapper">
          <button class="tab-btn" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部</button>
          <button class="tab-btn" :class="{ active: activeTab === 'PENDING' }"
            @click="activeTab = 'PENDING'">待支付</button>
          <button class="tab-btn" :class="{ active: activeTab === 'TRADE_SUCCESS' }"
            @click="activeTab = 'TRADE_SUCCESS'">已完成</button>
          <button class="tab-btn" :class="{ active: activeTab === 'EXPIRED' }"
            @click="activeTab = 'EXPIRED'">已过期</button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <el-empty description="暂无订单">
          <el-button type="primary" class="primary-btn" @click="$router.push('/booklist')">去逛逛</el-button>
        </el-empty>
      </div>

      <div v-else class="order-list">
        <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
          <div class="order-header">
            <div class="header-left">
              <span class="order-date">{{ order.formattedDate }}</span>
              <span class="order-id">订单号 {{ order.unformattedDate }}</span>
            </div>
            <div class="header-right">
              <span class="status-badge" :class="order.status.toLowerCase()">{{ order.statusText }}</span>
            </div>
          </div>

          <!-- 倒计时进度条(待支付订单) -->
          <div v-if="order.status === 'PENDING'" class="countdown-section">
            <div class="countdown-text">
              <el-icon>
                <Calendar />
              </el-icon>
              <span>剩余支付时间：{{ formatCountdown(order.countdown) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${(order.countdown / 600) * 100}%` }"></div>
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <div class="item-image">
                <img v-if="item.cover" :src="item.cover" alt="商品图片" />
                <div v-else class="placeholder-image"><el-icon>
                    <Picture />
                  </el-icon></div>
              </div>
              <div class="item-details">
                <h3 class="item-title">{{ item.title }}</h3>
                <div class="item-meta">
                  <span>数量: {{ item.quantity }}</span>
                  <span>单价: ¥{{ item.price }}</span>
                </div>
              </div>
              <div class="item-total">
                ¥{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="footer-info">
              <div class="shipping-info">
                <span class="label">收货人:</span> {{ order.shippingAddress.name }}
                <span class="divider">|</span>
                {{ order.shippingAddress.telephone }}
              </div>

              <!-- 优惠券展示 -->
              <div v-if="order.status === 'PENDING' && order.selectedCouponId" class="coupon-tag">
                <el-tag closable size="small" type="success" @close="removeCoupon(order)">
                  已优惠: ¥{{ order.appliedDiscount || getCouponById(order.selectedCouponId)?.value }}
                </el-tag>
              </div>
            </div>

            <div class="footer-actions">
              <div class="total-amount">
                <span class="label">总计</span>
                <span class="amount">
                  ¥{{ order.selectedCouponId ? calculateFinalPrice(order) :
                    Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
                <span v-if="order.selectedCouponId" class="original-amount">
                  <s>¥{{ Number(order.totalAmount).toFixed(2) }}</s>
                </span>
              </div>

              <div class="action-buttons">
                <template v-if="order.status === 'PENDING'">
                  <button class="secondary-btn" @click="showCouponSelector(order)">
                    {{ order.selectedCouponId ? '更换优惠券' : '使用优惠券' }}
                  </button>
                  <button class="primary-btn" :disabled="payingOrderIds.has(order.orderId)"
                    @click="handlePayOrder(order.orderId)">
                    {{ payingOrderIds.has(order.orderId) ? '处理中...' : '演示支付（不会扣款）' }}
                  </button>
                </template>
                <button class="text-btn" @click="handleDeleteOrder(order.orderId)">移除订单</button>
              </div>
            </div>
          </div>

          <!-- 优惠券选择对话框 -->
          <el-dialog v-model="order.showCouponDialog" title="选择优惠券" width="500px" destroy-on-close center>
            <div class="coupon-dialog-content">
              <el-empty v-if="getAvailableCoupons(parseFloat(order.totalAmount)).length === 0" description="暂无可用优惠券" />
              <div v-else class="coupon-list">
                <div v-for="coupon in getAvailableCoupons(parseFloat(order.totalAmount))" :key="coupon.id"
                  class="coupon-option" :class="{ selected: order.selectedCouponId === coupon.id }"
                  @click="applyCoupon(order, coupon.id)">
                  <div class="coupon-left">
                    <div class="coupon-value">
                      <span v-if="coupon.type === 'DISCOUNT'">{{ coupon.value }}折</span>
                      <span v-else>¥{{ coupon.value }}</span>
                    </div>
                    <div class="coupon-cond">满{{ coupon.minimumSpend }}可用</div>
                  </div>
                  <div class="coupon-right">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-desc">{{ coupon.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.page-wrapper {
  background-color: #f5f5f7;
  min-height: 100vh;
  padding-top: 60px;
  font-family: "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.orders-content {
  max-width: 980px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 40px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.total-icon {
  background: #e8f2ff;
  color: #0071e3;
}

.pending-icon {
  background: #fff5e5;
  color: #ff9500;
}

.completed-icon {
  background: #e6fffa;
  color: #00c7be;
}

.spent-icon {
  background: #f5f5f7;
  color: #1d1d1f;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
}

/* Filter Section */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.search-wrapper {
  flex: 1;
  max-width: 300px;
}

.custom-search :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #d2d2d7 inset;
  padding: 4px 12px;
}

.custom-search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0071e3 inset;
}

.tabs-wrapper {
  display: flex;
  background: #e8e8ed;
  padding: 4px;
  border-radius: 12px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #fff;
  color: #1d1d1f;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Order List */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: #fff;
  border-radius: 18px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f7;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-date {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.order-id {
  font-size: 13px;
  color: #86868b;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff5e5;
  color: #ff9500;
}

.status-badge.trade_success {
  background: #e6fffa;
  color: #00c7be;
}

.status-badge.expired {
  background: #f5f5f7;
  color: #86868b;
}

/* Countdown */
.countdown-section {
  background: #fff9f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.countdown-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff9500;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 149, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff9500;
  transition: width 1s linear;
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f7;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
}

.item-details {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 8px;
}

.item-meta {
  font-size: 14px;
  color: #86868b;
  display: flex;
  gap: 16px;
}

.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Footer */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f5f5f7;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shipping-info {
  font-size: 14px;
  color: #86868b;
}

.shipping-info .label {
  color: #1d1d1f;
  font-weight: 500;
}

.divider {
  margin: 0 8px;
  color: #d2d2d7;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.total-amount {
  font-size: 14px;
  color: #86868b;
}

.total-amount .amount {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-left: 8px;
}

.original-amount {
  margin-left: 8px;
  text-decoration: line-through;
  color: #86868b;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.primary-btn {
  background: #2D6FE3;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #0077ed;
}

.primary-btn:disabled {
  background: #e5e5e5;
  cursor: not-allowed;
}

.secondary-btn {
  background: #f5f5f7;
  color: #1d1d1f;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.secondary-btn:hover {
  background: #e8e8ed;
}

.text-btn {
  background: none;
  border: none;
  color: #86868b;
  font-size: 14px;
  cursor: pointer;
  padding: 0 8px;
}

.text-btn:hover {
  color: #ff3b30;
}

/* Coupon Dialog */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.coupon-option {
  display: flex;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-option:hover {
  border-color: #0071e3;
}

.coupon-option.selected {
  border-color: #0071e3;
  background: #f5f9ff;
}

.coupon-left {
  background: #f5f5f7;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.coupon-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.coupon-cond {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.coupon-right {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-name {
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 13px;
  color: #86868b;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 12px;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .footer-actions {
    width: 100%;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: flex-end;
  }
}
</style>
<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import Header from "../../components/Header.vue";
import {deleteOrder, getOrders, type OrderItem, type OrderStatus, type OrderVO, payOrder} from "../../api/order";
import {ElMessage, ElNotification} from "element-plus";
import {Search, Calendar, Location, Document, ShoppingCart} from '@element-plus/icons-vue';

interface EnhancedOrderVO extends OrderVO {
  unformattedDate: string; // 原始时间戳
  formattedDate: string;
  statusText: string;
  items: OrderItem[]; // 增强后的商品项
  countdown: number; // 倒计时
  expireTime: string; // 过期时间
  timeline?: { icon: string, title: string, time: string }[]; // 订单时间线
}

const orders = ref<EnhancedOrderVO[]>([]);
const loading = ref(false);
const payingOrderIds = ref<Set<string>>(new Set());
const activeTab = ref('all');
const searchQuery = ref('');

// 状态映射
const statusMap: Record<OrderStatus, { text: string; type: string }> = {
  PENDING: {text: "待支付", type: "warning"},
  TRADE_SUCCESS: {text: "已完成", type: "success"},
  EXPIRED: {text: "已过期", type: "info"}
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
              timeline: generateTimeline(order)
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

  return {total, pending, completed, cancelled, totalSpent};
});

// 处理支付订单
const handlePayOrder = async (orderId: string) => {
  try {
    payingOrderIds.value.add(orderId);
    const {code, data, message} = await payOrder(Number(orderId));

    if (code.toString() === "200") {
      // 处理支付返回结果
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
    const {code, message} = await deleteOrder(orderId);
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

// 组件挂载时获取订单数据
onMounted(() => {
  fetchOrders();
  window.setInterval(() => {
    orders.value.forEach(order => {
      order.countdown = calcCountdown(order.expireTime);
    });
  }, 1000);
});
</script>

<template>
  <Header/>
  <el-main class="orders-container">
    <!-- 订单统计卡片 -->
    <div class="order-stats">
      <div class="stat-card">
        <div class="stat-icon total-icon">
          <el-icon>
            <ShoppingCart/>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.total }}</div>
          <div class="stat-label">全部订单</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending-icon">
          <el-icon>
            <Document/>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.pending }}</div>
          <div class="stat-label">待支付</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed-icon">
          <el-icon>
            <Location/>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon spent-icon">
          <el-icon>
            <Calendar/>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ orderStats.totalSpent.toFixed(2) }}</div>
          <div class="stat-label">已消费</div>
        </div>
      </div>
    </div>

    <!-- 搜索与筛选 -->
    <div class="search-filter-container">
      <el-input v-model="searchQuery" placeholder="搜索订单号或商品名称" class="search-input" :prefix-icon="Search"
                clearable/>
      <el-tabs v-model="activeTab" class="order-tabs">
        <el-tab-pane label="全部订单" name="all"></el-tab-pane>
        <el-tab-pane label="待支付" name="PENDING"></el-tab-pane>
        <el-tab-pane label="已完成" name="TRADE_SUCCESS"></el-tab-pane>
        <el-tab-pane label="已过期" name="EXPIRED"></el-tab-pane>
      </el-tabs>
    </div>

    <el-skeleton :loading="loading" animated>
      <template #default>
        <el-card shadow="hover" class="order-card" v-for="order in filteredOrders" :key="order.orderId">
          <div class="order-header">
            <div class="order-info">

              <span v-if="order.status === 'PENDING'" class="countdown-time">过期时间&nbsp;&nbsp;{{
                  formatCountdown(order.countdown)
                }}</span>
              <el-collapse class="shipping-address">
                <el-collapse-item title="收货信息" name="1">
                  <p>订单编号：{{ order.unformattedDate }}</p>
                  <p>下单时间：{{ order.formattedDate }}</p>
                  <p v-if="order.paymentMethod">支付方式：支付宝</p>
                  <p>姓名：{{ order.shippingAddress.name }}</p>
                  <p>电话：{{ order.shippingAddress.telephone }}</p>
                  <p v-if="order.shippingAddress.postalCode">邮编：{{ order.shippingAddress.postalCode }}</p>
                  <p>地址：{{ order.shippingAddress.address }}</p>
                </el-collapse-item>
              </el-collapse>
            </div>
            <el-tag :type="statusMap[order.status].type" effect="dark" size="default" class="status-tag">
              {{ order.statusText }}
            </el-tag>
          </div>

          <!-- 倒计时进度条(待支付订单) -->
          <div v-if="order.status === 'PENDING'" class="countdown-wrapper">
            <div class="countdown-progress">
              <div class="countdown-bar" :style="{ width: `${(order.countdown / 600) * 100}%` }"></div>
            </div>
            <div class="countdown-text">
              <el-icon class="countdown-icon">
                <Calendar/>
              </el-icon>
              <span>剩余支付时间：{{ formatCountdown(order.countdown) }}</span>
            </div>
          </div>

          <el-divider></el-divider>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <img v-if="item.cover" :src="item.cover" alt="商品图片" class="item-cover"/>
              <div v-else class="item-cover-placeholder">
                <el-icon :size="30">
                  <Picture/>
                </el-icon>
              </div>
              <div class="item-info">
                <p class="item-title">{{ item.title }}</p>
                <p class="item-meta">
                  <span>单价: ￥{{ item.price }}</span>
                  <span>数量: {{ item.quantity }}</span>
                  <span>小计: ￥{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
                </p>
              </div>
            </div>
          </div>

          <el-divider></el-divider>
          <div class="order-footer">
            <div class="detail-footer">
              <span>共 {{ order.orderItems.length }} 件商品</span>
              <span class="total-price">总计&nbsp;&nbsp;<strong>RMB {{
                  Number(order.totalAmount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }}</strong></span>
            </div>
            <div class="button-footer">
              <el-button v-if="order.status === 'PENDING'" type="primary" size="default" class="pay-btn"
                         :loading="payingOrderIds.has(order.orderId)" @click="handlePayOrder(order.orderId)">
                立即支付
              </el-button>
              <el-button plain size="default" class="delete-btn" style="color: rgb(0, 113, 227)"
                         @click="handleDeleteOrder(order.orderId)">
                移除
              </el-button>
            </div>
          </div>
        </el-card>

        <el-empty v-if="!loading && filteredOrders.length === 0" description="暂无订单" class="empty-state">
          <el-button type="primary" @click="$router.push('/booklist')">
            去逛逛
          </el-button>
        </el-empty>
      </template>
    </el-skeleton>
  </el-main>
</template>

<style>
.orders-container {
  font-family: "sf pro display", sans-serif;
  width: 65%;
  margin: 60px auto 0;
  padding: 40px;
  border-radius: 20px;
}

/* 订单统计卡片样式 */
.order-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.total-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.completed-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.spent-icon {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}

/* 搜索和筛选样式 */
.search-filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
}

.search-input {
  max-width: 300px;
}

.search-input .el-input__inner {
  border-radius: 20px;
  height: 40px;
}

.order-tabs {
  flex: 1;
}

.order-tabs .el-tabs__nav {
  border: none;
}

.order-tabs .el-tabs__item {
  font-size: 15px;
  height: 40px;
  line-height: 40px;
}

.order-card {
  border-radius: 25px;
  margin: 20px auto;
  padding: 20px 30px;
  background-color: #fafafa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: -25px;
  padding-bottom: 10px;
}

.order-number {
  margin-bottom: 8px;
}

.order-number-label {
  font-size: 13px;
  color: #888;
  margin-right: 8px;
}

.order-number-value {
  font-size: 15px;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-tag {
  padding: 6px 14px;
  font-size: 14px;
  border-radius: 20px;
}

.countdown-time {
  font-size: 14px;
  color: #555;
}

/* 倒计时进度条样式 */
.countdown-wrapper {
  padding: 12px 0;
  margin: 15px 0 -15px;
}

.countdown-progress {
  background: #eee;
  height: 4px;
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.countdown-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd04b, #ff9d00);
  border-radius: 2px;
  transition: width 1s linear;
}

.countdown-text {
  display: flex;
  align-items: center;
  color: #d48806;
  font-size: 14px;
}

.countdown-icon {
  margin-right: 6px;
}

.shipping-address {
  font-size: 14px;
  color: #555;
  border: none;
  background: none;
  box-shadow: none;
  padding: 0;
}

/* 移除默认上下间距 */
.shipping-address .el-collapse-item__header {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin-top: -13px !important;
  font-size: 14px;
  color: #555;
  width: 85px;
}

/* 调整内容区的上下内边距 */
.shipping-address .el-collapse-item__wrap {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  margin-left: 15px !important;
  font-size: 14px;
  color: #555;
}

.shipping-address p {
  font-size: 14px;
  color: #555;
  margin: 0;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  border-radius: 10px;
  transition: background-color 0.3s;
}

.order-item:hover {
  background-color: #f5faff;
}

.item-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-cover-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 6px;
  color: #999;
}

.item-info {
  flex: 1;
  margin-left: 5px;
}

.item-info .item-title {
  font-weight: 600;
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.item-info .item-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #777;
}

/* 订单时间线样式 */
.order-timeline {
  padding: 20px 0;
}

.timeline-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #555;
  font-size: 15px;
  font-weight: 600;
}

.timeline-title .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.el-timeline {
  padding-left: 10px;
}

.el-timeline-item__content h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 4px;
}

.el-timeline-item__content p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.detail-footer {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 2px;
  margin-top: -5px;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
}

.total-price {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 0;
}

.empty-description {
  font-size: 14px;
  color: #888;
  margin: 10px 0 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .orders-container {
    width: 90%;
    padding: 20px;
  }

  .order-stats {
    gap: 15px;
  }

  .stat-card {
    min-width: calc(50% - 15px);
  }

  .search-filter-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }
}
</style>
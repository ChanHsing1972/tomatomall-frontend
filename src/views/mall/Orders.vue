<script setup lang="ts">
import { ref, onMounted } from "vue";
import Header from "../../components/Header.vue";
import { getOrders, type OrderVO, type OrderStatus, type OrderItem, payOrder } from "../../api/order";
import { ElMessage, ElNotification } from "element-plus";

interface EnhancedOrderVO extends OrderVO {
  formattedDate: string;
  statusText: string;
  items: OrderItem[]; // 增强后的商品项
}

const orders = ref<EnhancedOrderVO[]>([]);
const loading = ref(false);
const payingOrderIds = ref<Set<string>>(new Set());

// 状态映射
const statusMap: Record<OrderStatus, { text: string; type: string }> = {
  PENDING: { text: "待支付", type: "warning" },
  TRADE_SUCCESS: { text: "已完成", type: "success" },
  CANCELLED: { text: "已取消", type: "danger" }
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
    console.error('日期格式错误:', e);
    return '未知日期';
  }
};

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrders();
    if (res.code === "200" && res.data) {
      // 处理每个订单的商品项
      const enhancedOrders = await Promise.all(
          res.data.map(async (order: OrderVO) => {
            // 获取所有商品详情
            const items = order.orderItems;
            return {
              ...order,
              formattedDate: formatDate(order.createTime),
              statusText: statusMap[order.status].text,
              items
            };
          })
      );

      orders.value = enhancedOrders;
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

// 查看订单详情
function viewOrder(orderId: string) {
  const order = orders.value.find((o) => o.orderId === orderId);
  if (order) {
    alert(`查看订单详情：
订单编号: ${order.orderId}
下单时间: ${order.formattedDate}
支付方式: ${order.paymentMethod || '未选择'}
订单状态: ${order.statusText}
总金额: ￥${order.totalAmount}

收货信息:
姓名: ${order.shippingAddress.name}
电话: ${order.shippingAddress.telephone}
地址: ${order.shippingAddress.address}`);
  }
}

// 处理支付订单
const handlePayOrder = async (orderId: string) => {
  try {
    payingOrderIds.value.add(orderId);
    const { code, data, message } = await payOrder(Number(orderId));

    if (code === "200") {
      // 处理支付返回结果
      if (data.paymentForm) {
        // 直接跳转到支付URL
        const paymentUrl = data.paymentForm.trim(); // 移除可能的空白字符
        window.location.href = paymentUrl;
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

// 组件挂载时获取订单数据
onMounted(() => {
  fetchOrders();
});
</script>
<template>
  <Header />
  <el-main class="orders-container">
    <el-skeleton :loading="loading" animated>
      <template #default>
        <el-card
            shadow="hover"
            class="order-card"
            v-for="order in orders"
            :key="order.orderId"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单编号：{{ order.orderId }}</span>
              <span class="order-date">下单时间：{{ order.formattedDate }}</span>
              <span class="payment-method" v-if="order.paymentMethod">支付方式：{{ order.paymentMethod }}</span>
            </div>
            <el-tag
                :type="statusMap[order.status].type"
                effect="dark"
            >
              {{ order.statusText }}
            </el-tag>
          </div>
          <el-divider></el-divider>
          <div class="shipping-address">
            <p><strong>收货信息</strong></p>
            <p>姓名：{{ order.shippingAddress.name }}</p>
            <p>电话：{{ order.shippingAddress.telephone }}</p>
            <p v-if="order.shippingAddress.postalCode">邮编：{{ order.shippingAddress.postalCode }}</p>
            <p>地址：{{ order.shippingAddress.address }}</p>
          </div>
          <el-divider></el-divider>
          <div class="order-items">
            <div class="items-title"><strong>商品清单</strong></div>
            <div
                v-for="item in order.items"
                :key="item.productId"
                class="order-item"
            >
              <img
                  v-if="item.cover"
                  :src="item.cover"
                  alt="商品图片"
                  class="item-cover"
              />
              <div v-else class="item-cover-placeholder">
                <el-icon :size="30"><Picture /></el-icon>
              </div>
              <div class="item-info">
                <p class="item-title">《{{ item.title }}》</p>
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
            <span class="total-price">总价：<strong>￥{{ order.totalAmount }}</strong></span>
            <el-button type="primary" size="small" @click="viewOrder(order.orderId)">
              查看详情
            </el-button>
            <el-button
                v-if="order.status === 'PENDING'"
                type="success"
                size="small"
                :loading="payingOrderIds.has(order.orderId)"
                @click="handlePayOrder(order.orderId)"
            >
              立即支付
            </el-button>
          </div>
        </el-card>

        <el-empty
            v-if="!loading && orders.length === 0"
            description="暂无订单"
        >
          <el-button type="primary" @click="$router.push('/')">
            去逛逛
          </el-button>
        </el-empty>
      </template>
    </el-skeleton>
  </el-main>
</template>

<style scoped>
.orders-container {
  width: 80%;
  margin: 60px auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
}

.order-card {
  border-radius: 20px;
  margin-bottom: 15px;
  margin-left: 100px;
  margin-right: 100px;
  padding-bottom: 20px;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number,
.order-date,
.payment-method {
  font-size: 14px;
  color: #777;
}

.shipping-address {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.shipping-address p {
  margin: 5px 0;
}

.items-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
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
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.item-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-cover-placeholder {
  width: 60px;
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

  .item-title {
    font-weight: 500;
    margin-bottom: 8px;
    @include text-ellipsis(2);
  }

  .item-meta {
    display: flex;
    gap: 15px;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    span:last-child {
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}

.item-title {
  font-weight: 500;
  margin-bottom: 4px;
}


.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
}

.total-price {
  font-size: 16px;
  color: #333;
}


</style>
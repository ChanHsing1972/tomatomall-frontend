<script setup lang="ts">
import { ref } from 'vue';
import Header from "../../components/Header.vue";

const orders = ref([
  {
    id: 1,
    orderNumber: "202503310001",
    date: "2025-03-31",
    items: [
      {
        title: "番茄的世界",
        cover: "https://tse4-mm.cn.bing.net/th/id/OIP-C.McBhzHbp8QPvU4tcNJOjXQHaHa?rs=1&pid=ImgDetMain",
        price: 50,
        quantity: 2,
      },
      {
        title: "Vue 3快速上手",
        cover: "https://pic1.zhimg.com/v2-fba95424ef89a32125bba5daa2937795_720w.jpg?source=172ae18b",
        price: 80,
        quantity: 1,
      },
    ],
    totalPrice: 180,
    status: "已完成",
  },
  {
    id: 2,
    orderNumber: "202503310002",
    date: "2025-03-30",
    items: [
      {
        title: "全球摄影集锦",
        cover: "https://ts1.tc.mm.bing.net/th/id/R-C.a43573113890e0977723190d1d0bd7e2?rik=fQTkY7Bh25bb1w&riu=http%3a%2f%2fcpnodata.oss-cn-shenzhen.aliyuncs.com%2fportal%2f202001%2f07%2f095044xnmm2mm31vhxa161.jpg&ehk=2FeSdbV%2bKyclRsSJ1a9Aj797nkhkEmi3awQcZdbBa1s%3d&risl=&pid=ImgRaw&r=0",
        price: 120,
        quantity: 1,
      },
    ],
    totalPrice: 120,
    status: "待发货",
  },
]);

function viewOrder(orderId: number) {
  const order = orders.value.find((o) => o.id === orderId);
  if (order) {
    alert(`查看订单详情：订单编号 ${order.orderNumber}`);
  }
}
</script>

<template>
  <Header />
  <el-main class="orders-container">
    <el-card shadow="hover" class="order-card" v-for="order in orders" :key="order.id">
      <div class="order-header">
        <div class="order-info">
          <span class="order-number">订单编号：{{ order.orderNumber }}</span>
          <span class="order-date">下单日期：{{ order.date }}</span>
        </div>
        <el-tag
          :type="order.status === '已完成' ? 'success' : 'warning'"
          effect="dark"
        >
          {{ order.status }}
        </el-tag>
      </div>
      <el-divider></el-divider>
      <div class="order-items">
        <div
          v-for="item in order.items"
          :key="item.title"
          class="order-item"
        >
          <img :src="item.cover" alt="book cover" class="item-cover" />
          <div class="item-detail">
            <p class="item-title">{{ item.title }}</p>
            <p class="item-price">￥{{ item.price }} × {{ item.quantity }}</p>
          </div>
        </div>
      </div>
      <el-divider></el-divider>
      <div class="order-footer">
        <span class="total-price">总价：￥{{ order.totalPrice }}</span>
        <el-button type="primary" @click="viewOrder(order.id)">查看详情</el-button>
      </div>
    </el-card>
  </el-main>
</template>

<style scoped>
/* 采用系统字体，模仿 Apple 设计风格 */
* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.orders-container {
  width: 80%;
  margin: 60px auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
}

/* 卡片采用极简风格，不用多余的边框，只在底部添加一条细线分隔 */
.order-card {
  border-radius: 20px;
  margin-bottom: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
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
.order-date {
  font-size: 14px;
  color: #777;
}

.el-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 1px;
}
.el-tag[style*="已完成"] {
  background-color: #34c759; /* 成功绿色 */
}
.el-tag[style*="待发货"] {
  background-color: #ff9500; /* 暖色调 */
}

/* 隐藏 Element Plus 默认的 divider 样式，采用细线 */
.el-divider {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #eee;
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.item-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-detail {
  font-size: 14px;
  color: #555;
}

.item-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-price {
  color: #999;
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
  font-weight: 500;
}

/* 优化按钮样式，保持简洁 */
.el-button {
  background-color: #0070c9;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  transition: background-color 0.3s ease;
}
.el-button:hover {
  background-color: #005da0;
}
</style>
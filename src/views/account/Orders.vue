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
    <h1>我的订单</h1>
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
.orders-container {
  width: 90%;
  margin: 0 auto;
  padding: 20px 0;
}

.order-card {
  margin-bottom: 20px;
  padding: 10px;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.order-number,
.order-date {
  color: #666;
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
}

.item-cover {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}

.item-detail {
  font-size: 14px;
}

.item-title {
  font-weight: bold;
}

.item-price {
  color: #999;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.total-price {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}
</style>
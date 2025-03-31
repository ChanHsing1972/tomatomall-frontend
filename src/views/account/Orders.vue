<script setup lang="ts">
import { ref } from 'vue';
import Header from "../../components/Header.vue";
import { ElTable, ElTableColumn, ElButton } from 'element-plus';

// 模拟订单数据
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

// 查看订单详情
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
    <el-table :data="orders" border style="width: 100%">
      <el-table-column prop="orderNumber" label="订单编号" />
      <el-table-column prop="date" label="下单日期" />
      <el-table-column label="商品列表">
        <template #default="{ row }">
          <div class="order-items">
            <div v-for="item in row.items" :key="item.title" class="order-item">
              <img :src="item.cover" alt="book cover" class="item-cover" />
              <div class="item-info">
                <p>{{ item.title }}</p>
                <p>单价：￥{{ item.price }}</p>
                <p>数量：{{ item.quantity }}</p>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalPrice" label="总价">
        <template #default="{ row }">
          ￥{{ row.totalPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" @click="viewOrder(row.id)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-main>
</template>

<style scoped>
.orders-container {
  padding: 20px;
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-cover {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  font-size: 0.9em;
}
</style>
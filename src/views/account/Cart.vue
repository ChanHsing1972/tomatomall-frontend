<script setup lang="ts">
import { ref } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElInputNumber } from 'element-plus';
import { computed } from 'vue';
import Header from "../../components/Header.vue";

// 模拟购物车数据
const cartItems = ref([
  {
    id: 1,
    title: "番茄的世界",
    cover: "https://tse4-mm.cn.bing.net/th/id/OIP-C.McBhzHbp8QPvU4tcNJOjXQHaHa?rs=1&pid=ImgDetMain",
    price: 50,
    quantity: 2,
  },
  {
    id: 2,
    title: "Vue 3快速上手",
    cover: "https://pic1.zhimg.com/v2-fba95424ef89a32125bba5daa2937795_720w.jpg?source=172ae18b",
    price: 80,
    quantity: 1,
  },
]);

// 计算总价
const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// 删除购物车中的商品
function removeItem(id: number) {
  cartItems.value = cartItems.value.filter((item) => item.id !== id);
}

// 更新商品数量
function updateQuantity(id: number, quantity: number) {
  const item = cartItems.value.find((item) => item.id === id);
  if (item) {
    item.quantity = quantity;
  }
}

// 结算
function checkout() {
  alert("结算成功！");
}

</script>

<template>
  <Header/>
  <el-main class="cart-container">
    <h1>购物车</h1>
    <el-table :data="cartItems" border style="width: 100%">
      <el-table-column prop="cover" label="封面" width="120">
        <template #default="{ row }">
          <img :src="row.cover" alt="book cover" class="book-cover" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="书名" />
      <el-table-column prop="price" label="单价">
        <template #default="{ row }">
          ￥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column label="数量">
        <template #default="{ row }">
          <el-input-number
              v-model="row.quantity"
              :min="1"
              @change="updateQuantity(row.id, row.quantity)"
          />
        </template>
      </el-table-column>
      <el-table-column label="小计">
        <template #default="{ row }">
          ￥{{ row.price * row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="danger" @click="removeItem(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="cart-footer">
      <div class="total-price">总价：￥{{ totalPrice }}</div>
      <el-button type="primary" size="large" @click="checkout">结算</el-button>
    </div>
  </el-main>
</template>

<style scoped>
.cart-container {
  padding: 20px;
}

.book-cover {
  width: 100px;
  height: 150px;
  object-fit: cover;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total-price {
  font-size: 1.5em;
  font-weight: bold;
}
</style>
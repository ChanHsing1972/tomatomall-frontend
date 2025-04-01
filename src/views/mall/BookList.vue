<template>
  <Header />

  <el-main class="main-container">
    <!-- 商品列表 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="product in products" :key="product.id">
        <el-card :body-style="{ padding: '0px' }" class="product-card" shadow="hover">
          <img :src="product.cover" class="product-image" @click="openDetailDialog(product)" />
          <div style="padding: 14px;">
            <div class="product-title" @click="openDetailDialog(product)">{{ product.title }}</div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-rate">
              <el-rate v-model="product.rate" disabled show-score :score-template="`${product.rate}分`" />
            </div>
            <div class="product-actions">
              <el-button type="primary" size="small" @click="openDetailDialog(product)">查看详情</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="currentProduct.title" width="70%" top="5vh">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-image :src="currentProduct.cover" fit="contain" style="width: 100%; height: 400px;" />
        </el-col>
        <el-col :span="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品名称">{{ currentProduct.title }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">¥{{ currentProduct.price }}</el-descriptions-item>
            <el-descriptions-item label="商品评分">
              <el-rate v-model="currentProduct.rate" disabled show-score :score-template="`${currentProduct.rate}分`" />
            </el-descriptions-item>
            <el-descriptions-item label="库存数量">{{ currentProduct.stock || 0 }}件</el-descriptions-item>
            <el-descriptions-item label="商品描述">{{ currentProduct.description }}</el-descriptions-item>
          </el-descriptions>

          <div class="product-detail" v-html="currentProduct.detail"></div>
        </el-col>
      </el-row>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="addToCart">加入购物车</el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getProductList,
  getProductDetail,
  getStockpile
} from '../../api/product.ts';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  rate: number;
  cover: string;
  detail: string;
  stock?: number;
}

const products = ref<Product[]>([]);
const currentProduct = ref<Product>({
  id: '',
  title: '',
  description: '',
  price: '',
  rate: 0,
  cover: '',
  detail: '',
  stock: 0
});
const detailDialogVisible = ref(false);

onMounted(() => {
  fetchProducts();
});

const fetchProducts = async () => {
  try {
    const response = await getProductList();
    products.value = response.data;

    // 获取每个商品的库存信息
    for (const product of products.value) {
      const stockResponse = await getStockpile(product.id);
      product.stock = stockResponse.data.amount || 0;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
    console.error(error);
  }
};

const openDetailDialog = async (product: Product) => {
  try {
    // 获取商品详情
    const detailResponse = await getProductDetail(product.id);
    currentProduct.value = { ...detailResponse.data };

    // 获取库存信息
    const stockResponse = await getStockpile(product.id);
    currentProduct.value.stock = stockResponse.data.amount || 0;

    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取商品详情失败');
    console.error(error);
  }
};

const addToCart = () => {
  ElMessage.success('已添加到购物车');
  // 这里可以添加实际的购物车逻辑
  detailDialogVisible.value = false;
};
</script>

<style scoped>
.main-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.product-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  height: 44px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
}

.product-rate {
  margin: 8px 0;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.product-detail {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}
</style>
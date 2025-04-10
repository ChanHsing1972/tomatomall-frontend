<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import Header from "../../components/Header.vue";
import { getProductList, getProductDetail } from "../../api/product.ts";
import {addToCart} from "../../api/cart.ts";

interface Product {
  id: string;
  title: string;
  price: string;
  rate: number;
  description: string;
  cover: string;
  detail: string;
  specifications: Spec[];
}

interface Spec {
  id: string;
  item: string;
  value: string;
  productId: string;
}

const productList = ref<Product[]>([]);
const currentProduct = ref<Product>({
  id: "",
  title: "",
  description: "",
  price: "",
  rate: 0,
  cover: "",
  detail: "",
  specifications: [],
});
const detailDialogVisible = ref(false);

onMounted(() => {
  fetchProducts();
});

const fetchProducts = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data.result;
    console.log("商品列表:", productList.value);
  } catch (error) {
    ElMessage.error("获取商品列表失败");
    console.error(error);
  }
};

const openDetailDialog = async (product: Product) => {
  try {
    const detailResponse = await getProductDetail(product.id);
    currentProduct.value = detailResponse.data.result;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取商品详情失败");
    console.error(error);
  }
};

const addToCartHandle = (productId:string) => {
  addToCart(productId);
  ElMessage.success("已添加到购物车");
  setTimeout(() => {
    ElMessage.closeAll();
  }, 1500);
  // 此处可添加将商品加入购物车的逻辑
};
</script>

<template>
  <Header />
  <div class="booklist-container">
  <el-main class="main-container">
    <div class="product-grid">
      <el-card class="product-card" shadow="hover" v-for="product in productList" :key="product.id"
        @click="openDetailDialog(product)">
        <div class="card-image-wrapper">
          <img :src="product.cover" alt="封面" class="product-image" />
        </div>
        <div class="card-info">
          <h2 class="product-title" :title="product.title">{{ product.title }}</h2>
          <p class="product-description">{{ product.description }}</p>
          <div class="price-rate">
            <span class="product-price">RMB {{ product.price }}</span>
            <el-rate class="product-rate" v-model="product.rate" disabled show-score
              :score-template="`${product.rate} 分`" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 修改后的详情对话框 -->
    <el-dialog v-model="detailDialogVisible" width="60%" top="10vh" class="detail-dialog">
      <div class="dialog-content">
        <!-- 左侧大图区域 -->
        <div class="dialog-image">
          <el-image :src="currentProduct.cover" fit="cover" class="detail-cover" />
        </div>
        <!-- 右侧信息区域：所有信息分两行排列 -->
        <div class="dialog-info">
          <div class="info-section">
            <div class="info-row">
              <div class="info-label">名称</div>
              <div class="info-value">{{ currentProduct.title }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">价格</div>
              <div class="info-value">RMB {{ currentProduct.price }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">评分</div>
              <div class="info-value">{{ currentProduct.rate }} 分</div>
            </div>
            <div class="info-row">
              <div class="info-label">描述</div>
              <div class="info-value">{{ currentProduct.description }}</div>
            </div>
            <div class="info-row" v-for="spec in currentProduct.specifications" :key="spec.id">
              <div class="info-label">{{ spec.item }}</div>
              <div class="info-value">{{ spec.value }}</div>
            </div>
          </div>
          <div class="product-detail" v-html="currentProduct.detail"></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="addToCartHandle(currentProduct.id)">加入购物车</el-button>
      </template>
    </el-dialog>
  </el-main>
  </div>
</template>

<style>
.booklist-container {
  /* 全局基础样式 */

  * {
    font-family: "", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    box-sizing: border-box;
  }

  /* 主体容器 */

  .main-container {
    padding: 100px 40px 40px;
    max-width: 2560px;
    margin: 0 auto;
  }

  /* 产品网格布局 */

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    gap: 10px;
    padding: 0 250px;
  }

  /* 产品卡片 */

  .product-card {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    background-color: #f5f5f7;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }

  /* 卡片图片区域 */

  .card-image-wrapper {
    width: 100%;
    height: 280px;
    overflow: hidden;
    border-radius: 14px;
    /* 将圆角放到容器上 */
  }

  .product-image {
    width: 100%;
    height: 100%;
    /* 移除图片本身的 border-radius */
    object-fit: cover;
    transition: transform 0.3s ease;
    margin-bottom: 0;
  }

  .product-card:hover .product-image {
    transform: scale(1.07);
  }

  /* 卡片信息 */

  .product-title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    overflow: hidden;
    margin-bottom: 0px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-description {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
    height: 20px;
    overflow: hidden;
    flex-grow: 0;
    /* 不让第一项继续扩展 */
    white-space: nowrap;
    /* 防止内容换行 */
    overflow: hidden;
    /* 隐藏超出部分 */
    text-overflow: ellipsis;
    /* 显示省略号 */
  }

  .price-rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .product-price {
    font-size: 14px;
    color: #000;
  }

  .product-rate {
    font-size: 12px;
  }

  /* 详情对话框整体样式 */

  .detail-dialog {
    padding: 20px 30px;
    border-radius: 30px;
    /* 圆角处理 */
  }

  .detail-dialog .el-dialog__header {
    background-color: #fff;
    border-bottom: none;
    color: #333;
  }

  .detail-dialog .el-dialog__body {
    padding: 30px;
  }

  /* 对话框内容布局 */

  .dialog-content {
    display: flex;
    gap: 50px;
  }

  /* 左侧大图区域 */

  .dialog-image {
    flex: 0 0 35%;
    display: flex;
    justify-content: center;
    align-items: left;
  }

  .detail-cover {
    width: 100%;
    height: 450px;
    object-fit: cover;
    border-radius: 15px;
  }

  /* 右侧信息区域 */

  .dialog-info {
    flex: 1 1 45%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 信息分为两列：左侧为标题，右侧为内容 */

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    align-items: center;
  }

  .info-label {
    font-size: 12px;
    color: #999;
    width: 80px;
    /* 固定宽度 */
    text-align: left;
  }

  .info-value {
    font-size: 15px;
    color: #333;
    font-weight: 400;
    flex: 1;
    text-align: left;
  }

  /* 产品详细描述区域 */

  .product-detail {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
    padding: 20px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    background-color: #fff;
  }

  /* 底部按钮 */

  .footer-btn {
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 14px;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .dialog-content {
      flex-direction: column;
    }

    .dialog-image,
    .dialog-info {
      flex: 1 1 100%;
    }
  }
}
</style>

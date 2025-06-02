<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElDrawer, ElMessage} from "element-plus";
import Header from "../../components/Header.vue";
import {getOrders, type OrderVO} from "../../api/order.ts";
import {getProductList, searchProductsByKeyword} from "../../api/product.ts";
import Footer from "../../components/Footer.vue";
import {getLikeList} from "../../api/product_like.ts";

const showLikedOnly = ref(false);
const likedBookIds = ref<string[]>([]);
const route = useRoute();
const router = useRouter();
const searchKeyword = ref("");
const isSearching = ref(false);
const showPurchasedOnly = ref(false); // 勾选框状态
const purchasedBooks = ref<string[]>([]); // 已购买书籍的书名列表
const drawerVisible = ref(false);
// 搜索产品
const searchProducts = async (keyword: string) => {
  try {
    const response = await searchProductsByKeyword(keyword);
    productList.value = response.data.data;
  } catch (error) {
    ElMessage.error("搜索书籍失败");
    console.error(error);
  }
};
const categories = [
  "全部",
  "文学小说",
  "散文随笔",
  "自传他传",
  "诗歌戏剧",
  "哲学心理",
  "历史文化",
  "生活健康",
  "科技探索",
  "经济管理",
  "科普读物"
];

interface Product {
  id: string;
  title: string;
  price: string;
  rate: number;
  description: string;
  cover: string;
  detail: string;
  likeCount: string;
  specifications: Spec[];
}

interface Spec {
  id: string;
  item: string;
  value: string;
  productId: string;
}

const productList = ref<Product[]>([]);

// 添加分页相关变量
const currentPage = ref(1);
const pageSize = ref(16);
// 更新总数计算，使用过滤后的列表长度
const total = computed(() => filteredProductList.value.length);

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 改变页码时滚动到顶部
  window.scrollTo(0, 0);
};


// 添加变量来记录滚动位置
const savedScrollPosition = ref(0);
onMounted(() => {
  fetchProducts();

  // 从 sessionStorage 中获取之前保存的滚动位置
  const savedPosition = sessionStorage.getItem('booklistScrollPosition');
  if (savedPosition) {
    // 使用 setTimeout 确保 DOM 完全渲染后再滚动
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedPosition));

      // 计算应该在哪一页
      if (productList.value.length > 0) {
        const itemHeight = 280 + 100; // 估计每个书籍卡片的高度加间距
        const itemsPerRow = window.innerWidth > 768 ? 4 : 2;
        const viewportPosition = parseInt(savedPosition);
        const rowIndex = Math.floor(viewportPosition / itemHeight);
        const estimatedIndex = rowIndex * itemsPerRow;
        currentPage.value = Math.floor(estimatedIndex / pageSize.value) + 1 || 1;
      }
    }, 100);
  }
});
// 获取已完成订单的书籍数据
const fetchPurchasedBooks = async () => {
  try {
    const response = await getOrders();
    if (response.code === "200" && response.data) {
      const completedOrders = response.data.filter((order: OrderVO) => order.status === "TRADE_SUCCESS");
      const bookTitles = completedOrders.flatMap((order: OrderVO) =>
          order.orderItems.map((item: any) => item.title)
      );
      purchasedBooks.value = Array.from(new Set(bookTitles)); // 去重
    }
  } catch (error) {
    console.error("获取已购买书籍失败:", error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data.data;
    console.log("商品列表:", productList.value);
  } catch (error) {
    ElMessage.error("获取商品列表失败");
    console.error(error);
  }
};

interface Product {
  id: string;
  title: string;
  price: string;
  rate: number;
  description: string;
  cover: string;
}

const fetchLikedBooks = async () => {
  const username = sessionStorage.getItem("username") || "";
  if (!username) return;
  try {
    const response = await getLikeList();
    if (response?.data?.code === "200") {
      likedBookIds.value = (response.data.data || []).map((item: any) => item.product?.id?.toString());
    }
  } catch (e) {
    console.error("获取收藏书籍失败", e);
  }
};
const filteredProductList = computed(() => {
  let list = processedProductList.value;
  if (showPurchasedOnly.value) {
    list = list.filter(product => purchasedBooks.value.includes(product.title));
  }
  if (showLikedOnly.value) {
    list = list.filter(product => likedBookIds.value.includes(product.id));
  }
  if (selectedCategory.value !== "全部") {
    list = list.filter(product =>
        product.categories && product.categories.includes(selectedCategory.value)
    );
  }
  return list;
});
const selectedCategory = ref("全部");

// 提取类别
const processedProductList = computed(() => {
  return productList.value.map(product => {
    const categorySpec = product.specifications?.find(spec => spec.item === "类别");
    // 拆分类别，去除空格
    const categoriesArr = categorySpec && categorySpec.value
        ? categorySpec.value.split('/').map(s => s.trim())
        : [];
    return {
      ...product,
      categories: categoriesArr // 用数组存储
    };
  });
});

// 添加一个新的计算属性，根据当前页码裁剪商品列表
const paginatedProductList = computed<Product[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProductList.value.slice(start, end);
});

// 初始化数据
onMounted(() => {
  fetchProducts();
  fetchPurchasedBooks();
  fetchLikedBooks();
});

// 修改打开详情的方法，改为导航到新页面
const openDetailDialog = (product: Product) => {
  // 保存当前滚动位置
  savedScrollPosition.value = window.scrollY;
  // 将滚动位置保存到 sessionStorage
  sessionStorage.setItem('booklistScrollPosition', savedScrollPosition.value.toString());
  // 保存当前页码到 sessionStorage
  sessionStorage.setItem('booklistCurrentPage', currentPage.value.toString());

  router.push(`/bookdetail/${product.id}`);
};

// 监听路由参数变化
watch(
    () => route.query.keyword,
    (newKeyword) => {
      if (newKeyword) {
        searchKeyword.value = newKeyword as string;
        isSearching.value = true;
        searchProducts(searchKeyword.value);
        currentPage.value = 1; // 搜索时重置页码
      } else {
        searchKeyword.value = "";
        isSearching.value = false;
        fetchProducts(); // 恢复显示所有产品

        // 从 sessionStorage 恢复页码
        const savedPage = sessionStorage.getItem('booklistCurrentPage');
        if (savedPage) {
          currentPage.value = parseInt(savedPage);
        } else {
          currentPage.value = 1;
        }
      }
    },
    {immediate: true}
);
</script>

<template>
  <Header/>
  <div class="booklist-container">
    <el-main class="main-container">
      <div class="filter-button-container">
        <el-button class="filter-button" @click="drawerVisible = true">
          <i class="el-icon-menu"></i> 筛选
        </el-button>
      </div>

      <!-- 整合后的侧边栏 -->
      <el-drawer v-model="drawerVisible" :with-header="true" direction="ltr" size="280px" title="筛选选项">
        <div class="sidebar-section">
          <h3 class="sidebar-title">分类</h3>
          <el-radio-group v-model="selectedCategory"
                          style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;">
            <el-radio v-for="cat in categories" :key="cat" :label="cat">{{ cat }}</el-radio>
          </el-radio-group>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">筛选条件</h3>
          <div class="filter-option">
            <el-checkbox v-model="showPurchasedOnly">已购买</el-checkbox>
          </div>
          <div class="filter-option">
            <el-checkbox v-model="showLikedOnly">已收藏</el-checkbox>
          </div>
        </div>

        <div class="sidebar-footer">
          <el-button type="primary" @click="drawerVisible = false">应用筛选</el-button>
        </div>
      </el-drawer>

      <!-- 书籍列表 -->
      <div v-if="filteredProductList.length" class="product-grid">
        <el-card v-for="product in paginatedProductList" :key="product.id" class="product-card" shadow="hover"
                 @click="openDetailDialog(product)">
          <div class="card-image-wrapper">
            <img :src="product.cover" alt="封面" class="product-image"/>
          </div>
          <div class="card-info">
            <h2 class="product-title" :title="product.title">{{ product.title }}</h2>
            <p class="product-description">{{ product.description }}</p>
            <div class="price-rate">
              <span class="product-price">RMB {{ product.price }}</span>
              <el-rate v-model="product.rate" allow-half class="product-rate" disabled/>
              <span class="product-score">{{ product.rate.toFixed(1) }}</span>
            </div>
          </div>
        </el-card>
      </div>
      <div v-else>
        <el-empty description="暂无数据"></el-empty>
      </div>

      <!-- 分页组件 -->
      <div v-if="total > pageSize" class="pagination-container">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" background
                       layout="prev, pager, next, jumper" @current-change="handleCurrentChange"/>
      </div>
    </el-main>

    <Footer/>
  </div>

  <el-backtop :bottom="50" :right="30"/>
</template>

<style>
.booklist-container {

  /* 全局基础样式 */

  * {
    font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
    margin: 0 auto;
    max-width: 1100px;
    width: 100%;
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
    position: relative;
  }

  .product-image {
    width: 100%;
    height: 100%;
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
    margin-bottom: 0;
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
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .price-rate {
    display: flex;
    font-size: 14px;
    justify-content: space-between;
    align-items: center;
  }

  .product-rate .el-rate__icon {
    margin-right: 0px;
  }

  .product-price {
    width: 100px;
    flex-grow: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .product-rate {
    margin-left: auto;
    width: auto;
    --el-rate-disabled-void-color: #ddd;
  }

  .product-score {
    color: #ff9900;
    margin-left: 6px;
  }

  /* 详情对话框 - 完全重新设计 */

  .detail-dialog {
    border-radius: 20px;
  }

  .detail-dialog .el-dialog__header {
    display: none;
  }

  .detail-dialog .el-dialog__body {
    padding: 0;
    overflow: hidden;
    border-radius: 20px;
  }

  .detail-dialog .el-dialog__footer {
    display: none;
  }

  .dialog-content {
    display: flex;
    min-height: 85vh;
  }

  /* 左侧图片区域 */

  .dialog-image {
    flex: 0 0 40%;
    background-color: #f5f5f7;
    display: flex;
    flex-direction: column;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 60px;
    position: relative;
  }

  .detail-cover {
    width: 100%;
    height: 50%;
    object-fit: cover;
    border-radius: 12px;
  }

  .product-actions {
    display: flex;
    gap: 12px;
    margin-top: 30px;
    width: 100%;
  }

  .action-button {
    flex: 1;
    height: 50px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
  }

  .read-button {
    background-color: #f5f5f7;
    color: #1d1d1f;
    border: 1px solid #d2d2d7;
  }

  .read-button:hover {
    background-color: #e8e8ed;
  }

  .cart-button {
    background: linear-gradient(135deg, #06c, #0091ff);
    color: white;
  }

  .cart-button:hover {
    box-shadow: 0 5px 15px rgba(0, 102, 204, 0.3);
  }

  /* 右侧信息区域 */

  .dialog-info {
    flex: 0 0 60%;
    padding: 60px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .product-header {
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .product-header h1 {
    font-size: 32px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 15px 0;
    line-height: 1.2;
  }

  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -15px;
  }

  .meta-price {
    margin-top: 0;
    font-size: 24px;
    font-weight: 400;
    color: #1d1d1f;
  }

  .meta-rating {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .meta-rating .el-rate__icon {
    margin-right: 0;
  }

  .meta-rating span {
    font-size: 16px;
    font-weight: 500;
    color: #ff9500;
  }

  /* 产品规格 */

  .product-specs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
    margin-bottom: 5px;
  }

  .spec-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .spec-label {
    font-size: 13px;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .spec-value {
    font-size: 17px;
    color: #1d1d1f;
    font-weight: 400;
  }

  .spec-value.description {
    font-size: 17px;
    line-height: 1.5;
    grid-column: span 2;
  }

  /* 产品详情内容 */

  .product-detail-content {
    background-color: #f5f5f7;
    border-radius: 16px;
    padding: 25px;
    font-size: 15px;
    line-height: 1.6;
    color: #333;
    margin-bottom: 10px;
  }

  /* 评论部分 - 完全重新设计 */

  .comments-section {
    background-color: #fff;
    border-radius: 16px;
    padding: 0;
    margin-top: 10px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-header h3 {
    font-size: 22px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
  }

  .comment-count {
    font-size: 14px;
    color: #86868b;
  }

  /* 评论列表 */

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .comment-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comment-main {
    display: flex;
    gap: 15px;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0091ff, #06c);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .comment-avatar.small {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .comment-body {
    flex: 1;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .comment-user {
    font-weight: 600;
    color: #1d1d1f;
    font-size: 15px;
  }

  .comment-time {
    font-size: 12px;
    color: #86868b;
  }

  .comment-content {
    font-size: 15px;
    line-height: 1.5;
    color: #424245;
    margin-bottom: 12px;
  }

  .comment-actions {
    display: flex;
    gap: 16px;
  }

  .action-like,
  .action-reply,
  .action-delete {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #86868b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-like:hover,
  .action-reply:hover {
    color: #06c;
  }

  .action-delete:hover {
    color: #ff3b30;
  }

  .action-like.active {
    color: #ff9500;
  }

  /* 子评论 */

  .child-comments {
    margin-left: 55px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 5px;
  }

  .child-comment {
    display: flex;
    gap: 12px;
    background-color: #f5f5f7;
    border-radius: 12px;
    padding: 16px;
  }

  /* 无评论状态 */

  .no-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #86868b;
    text-align: center;
  }

  .no-comments i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #c7c7cc;
  }

  .no-comments p {
    font-size: 16px;
    margin: 0;
  }

  /* 添加评论区域 */

  .add-comment-section {
    margin-top: 30px;
    background-color: #f5f5f7;
    border-radius: 16px;
    padding: 20px;
    position: relative;
  }

  .replying-to {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    color: #06c;
  }

  .cancel-reply {
    color: #86868b;
    font-size: 13px;
    padding: 0;
  }

  .reply-input .el-textarea__inner {
    border: none !important;
    background-color: white !important;
    border-radius: 10px !important;
    padding: 15px !important;
    font-size: 15px !important;
    transition: box-shadow 0.3s ease !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  }

  .reply-input .el-textarea__inner:focus {
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3) !important;
  }

  .submit-comment {
    display: block;
    margin-left: auto;
    margin-top: 15px;
    background: linear-gradient(135deg, #06c, #0091ff);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .submit-comment:hover {
    box-shadow: 0 5px 15px rgba(0, 102, 204, 0.3);
  }

  /* 添加图标样式 */

  .el-icon-reading:before {
    content: "📖";
  }

  .el-icon-shopping-bag:before {
    content: "🛍️";
  }

  .el-icon-star:before {
    content: "☆";
  }

  .el-icon-star-filled:before {
    content: "★";
  }

  .el-icon-chat-line-round:before {
    content: "💬";
  }

  .el-icon-delete:before {
    content: "🗑️";
  }

  .el-icon-chat-dot-round:before {
    content: "💭";
  }

  .el-icon-s-promotion:before {
    content: "📤";
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .dialog-content {
      flex-direction: column;
    }

    .dialog-image,
    .dialog-info {
      flex: none;
      width: 100%;
      max-width: none;
      padding: 20px;
    }

    .product-specs {
      grid-template-columns: repeat(2, 1fr);
    }

    .dialog-image .detail-cover {
      height: auto;
    }
  }

  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .product-specs {
      grid-template-columns: 1fr;
    }

    .dialog-content {
      min-height: auto;
    }
  }

  /* 添加分页容器样式 */

  .pagination-container {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }

  /* 添加侧边栏样式 */

  .sidebar-section {
    margin-bottom: 30px;
    padding: 0 20px;
  }

  .sidebar-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }

  .filter-option {
    margin-bottom: 12px;
  }

  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
  }

  /* 添加筛选按钮样式 */

  .filter-button-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: -20px;
    padding-right: 20px;
  }

  .filter-button {
    background-color: #f5f5f7;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 500;
  }

  /* 阅读按钮和锁定状态的样式 */

  .card-image-wrapper {
    position: relative;
  }

  .read-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card-image-wrapper:hover .read-overlay {
    opacity: 1;
  }

  .read-now-button {
    background: linear-gradient(135deg, #06c, #0091ff);
    border: none;
  }

  .locked-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 16px;
  }

  .el-icon-lock:before {
    content: "🔒";
  }
}
</style>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import Header from "../../components/Header.vue";
import { getProductList, getProductDetail, searchProductsByKeyword } from "../../api/product.ts";
import { addToCart } from "../../api/cart.ts";
import { getAllCommentsByProductId, isLikeComment, likeOrDislike, addComment, deleteComment } from "../../api/comment.ts";

const route = useRoute();
const searchKeyword = ref("");
const isSearching = ref(false);
const username = sessionStorage.getItem("username") || "";
const isUserAdmin = sessionStorage.getItem("role")==='admin'; // 假设有一个方法来判断用户是否是管理员

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
const currentProduct = ref<Product>({
  id: "",
  title: "",
  description: "",
  price: "",
  rate: 0,
  cover: "",
  detail: "",
  likeCount: "",
  specifications: [],
});
const detailDialogVisible = ref(false);

interface Comment {
  commentId: string;
  content: string;
  userId: string;
  username: string;
  createTime: string;
  parentId: string;
  productId: string;
  likeCount: string;
  isLiked?: boolean;
}

const comments = ref<Comment[]>([]);
const newCommentContent = ref(""); // 新评论内容
const newCommentParentId = ref(""); // 新评论的父评论 ID

onMounted(() => {
  fetchProducts();
});

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

const checkCommentsLikeStatus = async () => {
  if (!username || !comments.value.length) return;
  try {
    const promises = comments.value.map(async (comment) => {
      try {
        const response = await isLikeComment(comment.commentId, username);
        console.log("点赞响应", response);
        comment.isLiked = response.data === true || response.data === 'true' || response.data === '已经点过赞了！';
      } catch (error) {
        console.error(`检查评论点赞状态失败:`, error);
        comment.isLiked = false;
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('检查点赞状态总体失败:', error);
  }
};

const handleLike = async (comment: Comment) => {
  try {
    if (!username) {
      ElMessage.warning('请先登录');
      return;
    }

    const response = await likeOrDislike({
      commentId: comment.commentId,
      username,
      isLike: !comment.isLiked
    });

    if (response.code === '200') {
      comment.isLiked = !comment.isLiked;
      comment.likeCount = comment.isLiked
          ? (parseInt(comment.likeCount) + 1).toString()
          : (parseInt(comment.likeCount) - 1).toString();
    }
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

const openDetailDialog = async (product: Product) => {
  try {
    // 并行获取商品详情和评论
    const [detailResponse, commentsResponse] = await Promise.all([
      getProductDetail(product.id),
      getAllCommentsByProductId(product.id).catch(e => {
        console.error("获取评论失败:", e);
        return { data: [] }; // 确保返回数组结构
      })
    ]);

    currentProduct.value = detailResponse.data.data;
    comments.value = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];

    await checkCommentsLikeStatus();
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("打开商品详情失败:", error);
    ElMessage.error("获取商品详情失败");
    comments.value = [];
    detailDialogVisible.value = false;
  }
};

const addToCartHandle = async (productId: string) => {
  const response = await addToCart({ productId: productId.toString(), quantity: 1 });
  console.log(response);
  if (response.data.code == "200") {
    ElMessage({
      message: '已加入购物袋',
      type: 'success',
      duration: 1000,
      grouping: true,
    });
  } else {
    ElMessage({
      message: "加入购物袋失败：" + response.data.msg,
      type: 'error',
      duration: 1000
    });
  }
};

// 添加评论
const addNewComment = async () => {
  if (!username) {
    ElMessage.warning('请先登录');
    return;
  }

  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  try {
    const response = await addComment({
      productId: currentProduct.value.id,
      username,
      content: newCommentContent.value,
      parentId: newCommentParentId.value
    });

    if (response.code === '200') {
      ElMessage.success('评论成功');
      newCommentContent.value = ""; // 清空输入框
      newCommentParentId.value = ""; // 清空父评论 ID
      await fetchComments(); // 刷新评论列表
    } else {
      ElMessage.error(response.msg || '评论失败');
    }
  } catch (error) {
    ElMessage.error('评论失败');
    console.error(error);
  }
};

// 删除评论
const deleteCommentById = async (commentId: string) => {
  if (!username) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    const response = await deleteComment(commentId);

    if (response.code === '200') {
      ElMessage.success('删除成功');
      await fetchComments(); // 刷新评论列表
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch (error) {
    ElMessage.error('删除失败');
    console.error(error);
  }
};

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await getAllCommentsByProductId(currentProduct.value.id);
    comments.value = Array.isArray(response.data) ? response.data : [];
    await checkCommentsLikeStatus();
  } catch (error) {
    console.error("获取评论失败:", error);
    comments.value = [];
  }
};

// 监听路由参数变化
watch(
    () => route.query.keyword,
    (newKeyword) => {
      if (newKeyword) {
        searchKeyword.value = newKeyword as string;
        isSearching.value = true;
        searchProducts(searchKeyword.value);
      } else {
        searchKeyword.value = "";
        isSearching.value = false;
        fetchProducts(); // 恢复显示所有产品
      }
    },
    { immediate: true }
);
</script>

<template>
  <Header />
  <div class="booklist-container">
    <el-main class="main-container">
      <div v-if="productList.length" class="product-grid">
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
      <div v-else>
        <el-empty description="暂无数据"></el-empty>
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

            <!-- 评论区域 -->
            <div class="comments-section">
              <h3>用户评论</h3>
              <div v-if="Array.isArray(comments) && comments.length">
                <div class="comment-item" v-for="comment in comments" :key="comment.commentId" >
                  <div v-if="!comment.parentId">
                  <div class="comment-header" >
                    <div>
                      <span class="comment-user">{{ comment.username }}</span>
                      <span class="comment-time">{{ new Date(comment.createTime).toLocaleString() }}</span>
                    </div>
                    <div>
                      <span
                          class="comment-likes"
                          :class="{ liked: comment.isLiked }"
                          @click="handleLike(comment)"
                      >
                        {{ comment.isLiked ? '❤️' : '🤍' }} {{ comment.likeCount }}
                      </span>
                      <el-button v-if="comment.username === username || isUserAdmin" type="text" @click="deleteCommentById(comment.commentId)">删除</el-button>
                    </div>
                  </div>
                  <div class="comment-content">{{ comment.content }}</div>
                  <!-- 子评论 -->
                  <div v-for="childComment in comments.filter(c => c.parentId === comment.commentId)" :key="childComment.commentId" class="child-comment">
                    <div class="comment-header">
                      <div>
                        <span class="comment-user">{{ childComment.username }}</span>
                        <span class="comment-time">{{ new Date(childComment.createTime).toLocaleString() }}</span>
                      </div>
                      <div>
                        <span
                            class="comment-likes"
                            :class="{ liked: childComment.isLiked }"
                            @click="handleLike(childComment)"
                        >
                          {{ childComment.isLiked ? '❤️' : '🤍' }} {{ childComment.likeCount }}
                        </span>
                        <el-button v-if="childComment.username === username || isUserAdmin" type="text" @click="deleteCommentById(childComment.commentId)">删除</el-button>
                      </div>
                    </div>
                    <div class="comment-content">{{ childComment.content }}</div>
                  </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-comments">
                暂无评论
              </div>
            </div>

            <!-- 添加评论 -->
            <div class="add-comment-section">
              <el-input
                  v-model="newCommentContent"
                  type="textarea"
                  placeholder="发表评论..."
                  rows="3"
              ></el-input>
              <el-button @click="addNewComment">提交评论</el-button>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="addToCartHandle(currentProduct.id)">加入购物袋</el-button>
        </template>
      </el-dialog>
    </el-main>
  </div>
</template>
<style>
.comment-time {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.comment-likes {
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.comment-likes:hover {
  transform: scale(1.1);
}

.comment-likes.liked {
  color: #f56c6c;
}

.booklist-container {
  /* 全局基础样式 */
  * {
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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

  .product-price {
    width: 100px;
    flex-grow: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .product-rate {
    width: 150px;
    font-size: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 详情对话框整体样式 */
  .detail-dialog {
    padding: 20px 30px;
    border-radius: 30px;
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
    width: 70px;
    text-align: left;
  }

  .info-value {
    flex-grow: 0;
    font-size: 15px;
    color: #333;
    font-weight: 400;
    width: 350px;
    height: 21px;
    overflow-y: auto;
    overflow-wrap: break-word;
    white-space: normal;
    word-break: break-word;
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
    overflow-wrap: break-word;
    white-space: normal;
    word-break: break-word;
  }

  /* 评论区域样式 */
  .comments-section {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .comments-section h3 {
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
  }

  .comment-item {
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }

  .comment-item:last-child {
    border-bottom: none;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .comment-user {
    font-weight: bold;
    color: #1b1a1a;
  }

  .comment-likes {
    color: #f56c6c;
    font-size: 14px;
  }

  .comment-content {
    color: #666;
    line-height: 1.5;
  }

  .child-comment {
    margin-left: 20px;
    border-left: 1px solid #ccc;
    padding-left: 10px;
  }

  .add-comment-section {
    margin-top: 20px;
  }

  .no-comments {
    color: #999;
    text-align: center;
    padding: 20px;
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
  }}
</style>
<script lang="ts" setup>
import { coverFallback } from "../../utils";
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Header from "../../components/Header.vue";
import { getProductDetail } from "../../api/product.ts";
import { addToCart } from "../../api/cart.ts";
import { addComment, deleteComment, getAllCommentsByProductId, isLikeComment, likeOrDislike } from "../../api/comment.ts";
import { addLike, cancelLike, getLikeCount, getLikeList } from "../../api/product_like.ts";
import { getOrders, type OrderVO } from "../../api/order.ts";
import { accountInfo } from "../../api/account.ts";
import Footer from "../../components/Footer.vue";

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
  avatar?: string; // 新增字段：用户头像
}

interface LikedProduct {
  productId: string; // 收藏记录的唯一标识符
  userId: string; // 收藏用户的 ID
}

const route = useRoute();
const router = useRouter();
const username = sessionStorage.getItem("username") || "";
const isUserAdmin = sessionStorage.getItem("role") === 'admin';
const productId = ref(route.params.id as string);
const loading = ref(true);
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
const hasPurchased = ref(false);
const purchasedBooks = ref<string[]>([]);
const comments = ref<Comment[]>([]);
const newCommentContent = ref("");
const newCommentParentId = ref("");
const replyingTo = ref("");
const isLiked = ref(false); // 是否已收藏
const likeCount = ref(0); // 收藏人数
// 添加描述展开/收起状态
// 添加产品详情展开/收起状态
const isDetailExpanded = ref(false);

const checkLikeStatus = async () => {
  if (!username) return;

  try {
    const response = (await getLikeList()).data;
    if (response?.code === '200') {
      const likedProducts = response.data || [];
      isLiked.value = likedProducts.some(
        (item: LikedProduct) => item.productId?.toString() === productId.value
      );
    } else {
      console.error('获取收藏列表失败:', response?.msg);
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    ElMessage.error('获取收藏信息失败，请稍后再试');
  }
};

// 收藏
const handleProductLike = async () => {
  if (!username) {
    ElMessage.warning('请先登录');
    return;
  }
  await checkLikeStatus();
  try {
    if (isLiked.value) {
      // 取消收藏
      await cancelLike(productId.value);
      likeCount.value--;
    } else {
      // 添加收藏
      await addLike(productId.value);
      likeCount.value++;
    }
    isLiked.value = !isLiked.value;
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

// 切换描述展开状态


// 切换产品详情展开状态
const toggleDetail = () => {
  isDetailExpanded.value = !isDetailExpanded.value;
};

// 获取书籍详情
const fetchProductDetail = async () => {
  loading.value = true;
  try {
    const detailResponse = await getProductDetail(productId.value);
    currentProduct.value = detailResponse.data.data;
    document.title = `${currentProduct.value.title} - 枕石书屋`;
    const likeResponse = await getLikeCount(productId.value);
    likeCount.value = likeResponse.data.data;
    await fetchComments();
    await fetchPurchasedStatus(); // 获取书籍购买状态
  } catch (error) {
    console.error("获取书籍详情失败:", error);
    ElMessage.error("获取书籍详情失败");
  } finally {
    loading.value = false;
  }
};

// 获取已购买书籍状态
const fetchPurchasedStatus = async () => {
  if (!username) return;

  try {
    const response = await getOrders();
    if (response.code === "200" && response.data) {
      const completedOrders = response.data.filter((order: OrderVO) => order.status === "TRADE_SUCCESS");
      const bookTitles = completedOrders.flatMap((order: OrderVO) =>
        order.orderItems.map((item: any) => item.title)
      );
      purchasedBooks.value = Array.from(new Set(bookTitles)); // 去重

      // 检查当前书籍是否已购买
      hasPurchased.value = purchasedBooks.value.includes(currentProduct.value.title);
    }
  } catch (error) {
    console.error("获取已购买书籍失败:", error);
  }
};

// 检查评论点赞状态
const checkCommentsLikeStatus = async () => {
  if (!username || !comments.value.length) return;
  try {
    const promises = comments.value.map(async (comment) => {
      try {
        const response = await isLikeComment(comment.commentId, username);
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

// 点赞/取消点赞
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

// 添加到购物车
const addToCartHandle = async () => {
  if (!username) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    const response = await addToCart({ productId: productId.value, quantity: 1 });
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
  } catch (error) {
    console.error('加入购物袋失败:', error);
    ElMessage.error('加入购物袋失败');
  }
};

// 前往阅读器
const goToReader = () => {
  if (!username) {
    ElMessage.warning('请先登录');
    return;
  }

  if (!hasPurchased.value) {
    ElMessage.warning('请先购买此书籍后再阅读');
    return;
  }

  router.push({ path: '/reader', query: { productId: productId.value } });
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await getAllCommentsByProductId(productId.value);
    comments.value = Array.isArray(response.data) ? response.data : [];

    // 获取每个评论者的头像信息
    await Promise.all(comments.value.map(async (comment) => {
      try {
        const userInfoRes = await accountInfo(comment.username);
        if (userInfoRes.data.code === "200" && userInfoRes.data.data) {
          comment.avatar = userInfoRes.data.data.avatar || '';
        }
      } catch (error) {
        console.error("获取评论者信息失败:", error);
      }
    }));

    await checkCommentsLikeStatus();
  } catch (error) {
    console.error("获取评论失败:", error);
    comments.value = [];
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
      productId: productId.value,
      username,
      content: newCommentContent.value,
      parentId: newCommentParentId.value
    });

    if (response.code === '200') {
      ElMessage.success('评论成功');
      newCommentContent.value = "";
      newCommentParentId.value = "";
      replyingTo.value = "";
      await fetchComments();
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
      await fetchComments();
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch (error) {
    ElMessage.error('删除失败');
    console.error(error);
  }
};

// 设置回复
const setReply = (comment: Comment) => {
  newCommentParentId.value = comment.commentId;
  replyingTo.value = comment.username;
  // 自动聚焦到评论框
  setTimeout(() => {
    document.querySelector('.reply-input')?.scrollIntoView({ behavior: 'smooth' });
    const textarea = document.querySelector('.reply-input textarea') as HTMLTextAreaElement;
    if (textarea) textarea.focus();
  }, 100);
};

// 取消回复
const cancelReply = () => {
  newCommentParentId.value = "";
  replyingTo.value = "";
};

onMounted(() => {
  if (!productId.value) {
    ElMessage.error('商品ID不存在');
    router.push('/booklist');
    return;
  }
  fetchProductDetail();
  checkLikeStatus();
  // 确保页面滚动到顶部
  window.scrollTo(0, 0);
});
</script>

<template>
  <Header />
  <div class="book-detail-page-container">
    <div class="book-detail-page">
      <el-skeleton :loading="loading" animated>
        <template #default>
          <div class="detail-container">
            <!-- 主要内容区域 -->
            <div class="product-main-content">
              <!-- 左侧大图区域 -->
              <div class="dialog-image">
                <img alt="图书封面" style="object-fit: cover" :src="currentProduct.cover" @error="coverFallback($event, currentProduct.title)" class="detail-cover" />
                <div class="product-actions">
                  <el-button :disabled="!hasPurchased" class="action-button read-button" @click="goToReader">
                    {{ hasPurchased ? '阅读' : '阅读 - 请先购买' }}
                  </el-button>
                  <el-button class="action-button cart-button" type="primary" @click="addToCartHandle">
                    加入购物袋
                  </el-button>
                </div>
              </div>

              <!-- 右侧信息区域 -->
              <div class="dialog-info">
                <div class="product-header">
                  <div class="title-like-wrapper">
                    <h1 class="product-title">{{ currentProduct.title }}</h1>
                    <div class="like-button" @click="handleProductLike">
                      <span :class="isLiked ? 'el-icon-heart-filled' : 'el-icon-heart-empty'"></span>
                      <span class="like-text">{{ likeCount }} 人收藏</span>
                    </div>
                  </div>

                  <div class="product-meta">
                    <div class="meta-price">¥ {{ currentProduct.price }}</div>

                  </div>
                </div>

                <div class="product-specs">
                  <div v-for="spec in currentProduct.specifications" :key="spec.id" class="spec-item">
                    <div class="spec-label">{{ spec.item }}</div>
                    <div class="spec-value">{{ spec.value }}</div>
                  </div>

                </div>

                <div class="product-detail-container">
                  <div :class="{ 'collapsed': !isDetailExpanded }" class="product-detail-content">
                    <div v-html="currentProduct.detail"></div>
                  </div>
                  <div v-if="currentProduct.detail && currentProduct.detail.length > 100" class="toggle-detail"
                    @click="toggleDetail">
                    {{ isDetailExpanded ? '收起' : '查看更多' }}
                  </div>
                </div>


                <!-- 评论部分 -->
                <div class="section-header">
                  <h3>读者评论</h3>
                  <span class="comment-count">{{ comments.length }} 条评论</span>
                </div>

                <div v-if="Array.isArray(comments) && comments.length" class="comments-list">
                  <div v-for="comment in comments.filter(c => !c.parentId)" :key="comment.commentId"
                    class="comment-card">
                    <!-- 主评论 -->
                    <div class="comment-main">
                      <!-- 修改：优先显示用户头像 -->
                      <div v-if="comment.avatar" class="comment-avatar with-image">
                        <img :src="comment.avatar" alt="用户头像" class="user-avatar-img" />
                      </div>
                      <div v-else class="comment-avatar">
                        {{ comment.username.charAt(0).toUpperCase() }}
                      </div>
                      <div class="comment-body">
                        <div class="comment-header">
                          <span class="comment-user">{{ comment.username }}</span>
                          <span class="comment-time">{{ new Date(comment.createTime).toLocaleString() }}</span>
                        </div>

                        <div class="comment-content">{{ comment.content }}</div>

                        <div class="comment-actions">
                          <div :class="{ active: comment.isLiked }" class="action-like" @click="handleLike(comment)">
                            <span :class="comment.isLiked ? 'el-icon-star-filled' : 'el-icon-star'"></span>
                            <span>{{ comment.likeCount }}</span>
                          </div>
                          <div class="action-reply" @click="setReply(comment)">
                            <span class="el-icon-chat-line-round"></span> 回复
                          </div>
                          <div v-if="comment.username === username || isUserAdmin" class="action-delete"
                            @click="deleteCommentById(comment.commentId)">
                            <span class="el-icon-delete"></span> 删除
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 子评论列表 -->
                    <div v-if="comments.some(c => c.parentId === comment.commentId)" class="child-comments">
                      <div v-for="childComment in comments.filter(c => c.parentId === comment.commentId)"
                        :key="childComment.commentId" class="child-comment">
                        <!-- 修改：优先显示用户头像 -->
                        <div v-if="childComment.avatar" class="comment-avatar small with-image">
                          <img :src="childComment.avatar" alt="用户头像" class="user-avatar-img" />
                        </div>
                        <div v-else class="comment-avatar small">
                          {{ childComment.username.charAt(0).toUpperCase() }}
                        </div>
                        <div class="comment-body">
                          <div class="comment-header">
                            <span class="comment-user">{{ childComment.username }}</span>
                            <span class="comment-time">{{ new Date(childComment.createTime).toLocaleString() }}</span>
                          </div>

                          <div class="comment-content">{{ childComment.content }}</div>

                          <div class="comment-actions">
                            <div :class="{ active: childComment.isLiked }" class="action-like"
                              @click="handleLike(childComment)">
                              <span :class="childComment.isLiked ? 'el-icon-star-filled' : 'el-icon-star'"></span>
                              <span>{{ childComment.likeCount }}</span>
                            </div>
                            <div class="action-reply" @click="setReply(childComment)">
                              <span class="el-icon-chat-line-round"></span> 回复
                            </div>
                            <div v-if="childComment.username === username || isUserAdmin" class="action-delete"
                              @click="deleteCommentById(childComment.commentId)">
                              <span class="el-icon-delete"></span> 删除
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="no-comments">
                  <i class="el-icon-chat-dot-round"></i>
                  <p>还没有评论，快来发表第一条吧！</p>
                </div>

                <!-- 添加评论 - 修改这部分 -->
                <div class="add-comment-section">
                  <div v-if="replyingTo" class="replying-to">
                    <span>回复给：{{ replyingTo }}</span>
                    <el-button class="cancel-reply" type="text" @click="cancelReply">取消回复</el-button>
                  </div>
                  <div class="form-group">
                    <textarea v-model="newCommentContent"
                      :placeholder="replyingTo ? `回复 ${replyingTo}...` : '发表你的想法...'" class="comment-input-field"
                      rows="3">
                    </textarea>
                  </div>
                  <el-button class="submit-comment" @click="addNewComment">
                    <span class="el-icon-s-promotion"></span> 发布评论
                  </el-button>
                </div>

              </div>
            </div>
          </div>
        </template>
        <template #template>
          <div class="skeleton-content">
            <div class="skeleton-header">
              <div class="skeleton-image"></div>
              <div class="skeleton-info">
                <el-skeleton-item style="width: 50%" variant="h1" />
                <el-skeleton-item style="margin: 15px 0; width: 30%" variant="text" />
                <el-skeleton-item style="width: 100%" variant="p" />
                <el-skeleton-item style="width: 100%" variant="p" />
              </div>
            </div>
            <div class="skeleton-body">
              <el-skeleton-item style="width: 30%" variant="h3" />
              <div v-for="i in 3" :key="i">
                <div class="skeleton-comment">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-content">
                    <el-skeleton-item style="width: 20%" variant="text" />
                    <el-skeleton-item style="width: 100%" variant="p" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
  <el-backtop :bottom="50" :right="30" />

  <Footer />
</template>

<style>
/* 标题区域样式 */
.book-detail-page-container {
  .book-detail-page {
    font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin-top: 60px;
    padding: 40px;
    background-color: white;
    min-height: calc(100vh - 60px);
  }

  .detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 20px;
  }

  .product-main-content {
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
  }

  .dialog-image {
    flex: 0 0 30%;
    background-color: #f5f5f7;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    padding: 30px;
    position: sticky;
    top: 80px;
    align-self: flex-start;
    max-height: 600px;
    height: fit-content;
  }

  .dialog-info {
    flex: 0 0 55%;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .like-section {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 5px;
  }

  .title-like-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: -10px;
  }

  .like-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;
    font-size: 24px;
    gap: 5px;
  }

  .like-button .like-text {
    font-size: 12px;
    color: #ff5a5f;
  }

  .like-count {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #86868b;
    margin-bottom: 15px;
  }
}

.title-like-section .like-icon {
  font-size: 18px;
  color: #ff9500;
}

.title-like-section .el-icon-star-filled {
  color: #ff9500;
}

.title-like-section .like-text {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .title-section {
    flex-direction: column;
    gap: 10px;
  }

  .title-like-section {
    align-self: flex-end;
    margin-top: 0;
  }
}

.book-detail-page-container {
  .book-detail-page {
    font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin-top: 60px;
    padding: 40px;
    background-color: white;
    min-height: calc(100vh - 60px);
  }

  .detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 20px;

  }

  .product-main-content {
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
  }

  /* 左侧图片区域 */

  .dialog-image {
    flex: 0 0 30%;
    background-color: #f5f5f7;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    padding: 30px;
    position: sticky;
    top: 80px;
    /* 距离顶部的距离，可根据需要调整 */
    align-self: flex-start;
    max-height: 600px;
    height: fit-content;
  }

  .detail-cover {
    width: 100%;
    height: 100%;
    max-height: 500px;
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
    background: rgb(0, 113, 227);
    color: white;
  }

  .cart-button:hover {
    background: rgb(64, 158, 255);
  }

  /* 右侧信息区域 */

  .dialog-info {
    flex: 0 0 55%;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .product-header {
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .product-title {
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
  }

  .meta-price {
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
    position: relative;
  }

  .toggle-description {
    color: #06c;
    cursor: pointer;
    margin-left: 5px;
    font-weight: 500;
    display: inline-block;
  }

  .toggle-description:hover {
    text-decoration: underline;
  }

  /* 产品详情内容 */

  .product-detail-container {
    position: relative;
    margin-bottom: 10px;
  }

  .product-detail-content {
    background-color: #f5f5f7;
    border-radius: 16px;
    padding: 25px;
    font-size: 15px;
    line-height: 1.6;
    color: #333;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .product-detail-content.collapsed {
    max-height: 150px;
    mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  }

  .toggle-detail {
    margin-top: 10px;
    color: #06c;
    cursor: pointer;
    font-weight: 500;
    text-align: center;
    padding: 5px;
    transition: all 0.2s ease;
  }

  .toggle-detail:hover {
    text-decoration: underline;
  }

  /* 评论部分 */

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
    background: rgb(0, 113, 227);
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

  .comment-avatar.with-image {
    background: none;
    padding: 0;
    overflow: hidden;
  }

  .user-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
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

  /* 添加评论区域 - 修改这部分样式 */

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

  .form-group {
    width: 100%;
    margin-bottom: 15px;
  }

  .comment-input-field {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #d2d2d7;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  .comment-input-field:focus {
    border-color: #06c;
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
  }

  .submit-comment {
    display: block;
    margin-left: auto;
    background: #0071e3;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .submit-comment:hover {
    background: #0086fe;
  }

  /* 骨架屏样式 */

  .skeleton-content {
    padding: 20px;
  }

  .skeleton-header {
    display: flex;
    gap: 30px;
    margin-bottom: 40px;
  }

  .skeleton-image {
    flex: 0 0 40%;
    height: 400px;
    background-color: #f2f2f2;
    border-radius: 12px;
  }

  .skeleton-info {
    flex: 1;
  }

  .skeleton-body {
    padding: 20px 0;
  }

  .skeleton-comment {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }

  .skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f2f2f2;
  }

  .skeleton-content {
    flex: 1;
  }

  /* 添加图标样式 */

  .el-icon-heart-empty:before {
    content: "♡";
    color: #ff5a5f;
  }

  .el-icon-heart-filled:before {
    content: "❤";
    color: #ff5a5f;
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
  @media (max-width: 1024px) {
    .product-main-content {
      flex-direction: column;
    }

    .dialog-image,
    .dialog-info {
      flex: none;
      width: 100%;
    }

    .product-specs {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .book-detail-page {
      padding: 20px 10px;
    }

    .detail-container {
      padding: 15px;
    }

    .dialog-image {
      padding: 15px;
    }

    .dialog-info {
      padding: 15px;
    }

    .product-title {
      font-size: 24px;
    }
  }
}

.action-button:disabled {
  background-color: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>

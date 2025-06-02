<script setup lang="ts">
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import AIAssistantDialog from "../components/AIAssistantDialog.vue";
import {onMounted, ref} from "vue";
import {getAllAds} from "../api/ad.ts";
import {getProductDetail} from "../api/product.ts";
import {ElMessage} from "element-plus";
import {useRouter} from 'vue-router'; // 添加路由导入

// 获取路由实例
const router = useRouter();

// 导航函数
const navigateToLibrary = () => {
  router.push('/booklist');
};

const navigateToBookDetail = (id: string | number) => {
  router.push(`/bookdetail/${id}`);
};

type ad = {
  id: string,
  title: string,
  content: string,
  imgUrl: string,
  productId: string,
};
const adsDialogVisible = ref(false);
const hideAds = ref(false);
const currentAdIndex = ref(0);
const autoPlayTimer = ref<number | null>(null);
const autoPlayInterval = 5000;

const adList = ref<ad[]>([]);
const displayedAds = ref<ad[]>([]);

const handleClose = () => {
  console.log('广告弹窗已关闭');
  stopAutoPlay();
  if (hideAds.value) {
    localStorage.setItem('hideAds', 'true');
    ElMessage.success('已设置为不再显示广告');
  }
};

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
};

const nextAd = () => {
  if (displayedAds.value.length > 1) {
    currentAdIndex.value = (currentAdIndex.value + 1) % displayedAds.value.length;
  }
};

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer.value = window.setInterval(() => {
    nextAd();
  }, autoPlayInterval);
};

const fetchAds = async () => {
  try {
    const response = await getAllAds();
    adList.value = response.data.data;
    console.log("广告列表:", adList.value);
  } catch (error) {
    ElMessage.error("获取广告列表失败");
    console.error(error);
  }
};

interface Product {
  id: "",
  title: "",
  description: "",
  price: "",
  rate: 0,
  cover: "",
  detail: "",
  specifications: Spec[],
}

interface Spec {
  id: string;
  item: string;
  value: string;
}


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

const openDetailDialog = async (productId: string) => {
  try {
    const detailResponse = await getProductDetail(productId);
    currentProduct.value = detailResponse.data.data;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取商品详情失败");
    console.error(error);
  }
};

onMounted(async () => {
  // 确保页面滚动到顶部
  window.scrollTo(0, 0);
});

// 模拟推荐书籍数据
const recommendedBooks = ref<
    { id: number; title: string; cover: string; desc: string; price: number }[]
>([]);

// 新书上架
const newArrivals = ref<
    { id: number; title: string; cover: string; author: string; price: number }[]
>([]);

// 热门分类
const categories = ref<
    { id: number; name: string; icon: string; count: number }[]
>([]);

// 特色书籍
const featuredBook = ref({
  id: 11,
  title: "我与地坛",
  author: "史铁生",
  cover: "https://chanhsing.oss-cn-shanghai.aliyuncs.com/v2-53a8accd00d8f9923ff47a243d691d84_r.jpg",
  desc: "史铁生是当代中国最令人敬佩的作家之一。他的写作与他的生命完全同构在了一起，在自己的“写作之夜”，史铁生用残缺的身体，说出了最为健全而丰满的思想。" +
      "他体验到的是生命的苦难，表达出的却是存在的明朗和欢乐，他睿智的言辞，照亮的反而是我们日益幽暗的内心。 地坛只是一个载体，而文章的本质却是一个绝望的人寻求希望的过程，以及对母亲的思念。",
  price: 99.00
});

// 动画控制
const heroVisible = ref(false);
onMounted(async () => {
  await fetchAds();

  // 检查用户是否选择不再显示广告
  const savedHideAds = localStorage.getItem('hideAds');
  if (savedHideAds === 'true') {
    hideAds.value = true;
  }

  const maxAdsToShow = 5; // 增加展示的广告数量用于轮播
  const availableAds = adList.value.slice();
  const selectedAds = [];

  while (selectedAds.length < maxAdsToShow && availableAds.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableAds.length);
    const randomAd = availableAds.splice(randomIndex, 1)[0];
    selectedAds.push(randomAd);
  }

  displayedAds.value = selectedAds;

  setTimeout(() => {
    if (adList.value.length > 0 && !hideAds.value) {
      adsDialogVisible.value = true;
      // 如果有多个广告，启动自动轮播
      if (displayedAds.value.length > 1) {
        startAutoPlay();
      }
    }
    heroVisible.value = true;

    recommendedBooks.value = [
      {
        id: 1,
        title: "长安的荔枝",
        cover: "//images.weserv.nl/?url=https://img3.doubanio.com/view/subject/s/public/s34327482.jpg",
        desc: "跟随小人物的视角穿越回唐朝",
        price: 45.00
      },
      {
        id: 2,
        title: "太白金星有点烦",
        cover: "//images.weserv.nl/?url=https://img9.doubanio.com/view/subject/s/public/s34544956.jpg",
        desc: "幽默风趣的历史小说",
        price: 45.00
      },
      {
        id: 3,
        title: "食南之徒",
        cover: "//images.weserv.nl/?url=https://img3.doubanio.com/view/subject/s/public/s34823157.jpg",
        desc: "捕捉世界之美，每一瞬间都动人",
        price: 56.00
      },
      {
        id: 4,
        title: "素食者",
        cover: "//images.weserv.nl/?url=https://img3.doubanio.com/view/subject/s/public/s33956462.jpg",
        desc: "亚洲首位国际布克文学奖得主获奖作",
        price: 48.00
      },
    ];

    categories.value = [
      {id: 1, name: "文学小说", icon: "📚", count: 1280},
      {id: 2, name: "科技前沿", icon: "🔬", count: 853},
      {id: 3, name: "艺术设计", icon: "🎨", count: 672},
      {id: 4, name: "生活方式", icon: "☕️", count: 945},
      {id: 5, name: "经济管理", icon: "📊", count: 1056},
      {id: 6, name: "历史文化", icon: "🏛️", count: 789},
      {id: 7, name: "运动健身", icon: "🏋️", count: 900},
      {id: 8, name: "美食烹饪", icon: "🍳", count: 1120},
      {id: 9, name: "旅游攻略", icon: "✈️", count: 730},
      {id: 10, name: "音乐艺术", icon: "🎵", count: 640}
    ];

    newArrivals.value = [
      {
        id: 5,
        title: "恶女的告白",
        author: "[日] 叶真中显",
        cover: "//images.weserv.nl/?url=https://img9.doubanio.com/view/subject/s/public/s34917944.jpg",
        price: 55.00
      },
      {
        id: 6,
        title: "明亮的夜晚",
        author: "[韩] 崔恩荣",
        cover: "//images.weserv.nl/?url=https://img3.doubanio.com/view/subject/s/public/s34577743.jpg",
        price: 52.00
      },
      {
        id: 7,
        title: "猫鱼",
        author: "陈冲",
        cover: "//images.weserv.nl/?url=https://img9.doubanio.com/view/subject/s/public/s34867425.jpg",
        price: 168.00
      },
      {
        id: 8,
        title: "东京八平米",
        author: "[日] 吉井忍",
        cover: "//images.weserv.nl/?url=https://img1.doubanio.com/view/subject/s/public/s34361490.jpg",
        price: 79.00
      }
    ];

  }, 3000);
});

// 格式化价格
const formatPrice = (price: number) => {
  return `RMB ${price.toFixed(2)}`;
};

// AI助手对话框
const aiAssistantVisible = ref(false);

</script>

<template>
  <div class="home">
    <!-- 顶部导航 -->
    <Header/>

    <!-- 美化后的广告弹窗 -->
    <el-dialog v-model="adsDialogVisible" :show-close="false" class="ad-dialog" destroy-on-close width="50%"
               @close="handleClose">
      <template #header>
        <div class="ad-dialog-header">
          <h3>精品推荐</h3>
          <div class="ad-controls">
            <el-checkbox v-model="hideAds" label="不再显示" size="small"/>
            <el-button class="close-btn" type="text" @click="adsDialogVisible = false">
              <i class="el-icon-close">×</i>
            </el-button>
          </div>
        </div>
      </template>

      <div class="ad-carousel">
        <div class="carousel-container">
          <transition-group class="ad-transition-group" name="ad-fade" tag="div">
            <div v-for="(ad, index) in displayedAds" v-show="currentAdIndex === index" :key="ad.id" class="ad-item"
                 @click="openDetailDialog(ad.productId)">
              <div class="ad-image-container">
                <img :src="ad.imgUrl" alt="广告图片" class="ad-image"/>
              </div>
              <div class="ad-content">
                <h3 class="ad-title">{{ ad.title }}</h3>
                <p class="ad-description">{{ ad.content }}</p>
                <el-button class="view-more-btn" round type="primary">查看详情</el-button>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- 广告指示器 -->
        <div v-if="displayedAds.length > 1" class="ad-indicators">
          <span v-for="(_, index) in displayedAds" :key="index"
                :class="['ad-indicator', { 'active': index === currentAdIndex }]"
                @click="currentAdIndex = index"></span>
        </div>
      </div>

      <template #footer>
        <div class="ad-dialog-footer">
          <span class="ad-note">根据您的兴趣推荐</span>
          <el-button type="primary" @click="adsDialogVisible = false">我知道了</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="商品详情" width="50%">
      <div class="product-detail">
        <div class="detail-header">
          <img :src="currentProduct.cover" alt="封面" class="product-cover"/>
          <div class="product-info">
            <h2>{{ currentProduct.title }}</h2>
            <div class="product-price">价格: {{ currentProduct.price }}</div>
            <div class="product-rate">评分: {{ currentProduct.rate }}/10</div>
          </div>
        </div>
        <div class="product-description">
          <h3>商品描述</h3>
          <p>{{ currentProduct.description }}</p>
        </div>
        <div class="product-specs" v-if="currentProduct.specifications.length">
          <h3>详情</h3>
          <ul>
            <li v-for="spec in currentProduct.specifications" :key="spec.id">
              {{ spec.item }}: {{ spec.value }}
            </li>
          </ul>
        </div>
        <div class="product-detail-content" v-html="currentProduct.detail"></div>
      </div>
    </el-dialog>
    <!-- Banner / Hero 区域 -->
    <section class="hero" :class="{ 'visible': heroVisible }">
      <div class="hero-content">
        <div class="hero-text">
          <h1>纯粹阅读<br>非凡生活</h1>
          <p>在番茄书城，发现每一本书的灵魂。</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="navigateToLibrary">立即探索</button>
            <button class="secondary-btn" @click="navigateToLibrary">了解更多</button>
          </div>
        </div>
        <div class="hero-image">
          <img alt="Hero Image"
               src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80">
        </div>
      </div>
      <div class="hero-bg"></div>
    </section>

    <!-- 热门分类 -->
    <section class="categories-section" :class="{ 'visible': heroVisible }">
      <div class="section-title">
        <div class="title-wrapper">
          <span class="subtitle">为您精选</span>
          <h2>探索分类</h2>
        </div>
        <a class="view-all" href="javascript:void(0)" @click="navigateToLibrary">查看全部</a>
      </div>
      <div class="categories">
        <div v-for="category in categories" :key="category.id" class="category-card" @click="navigateToLibrary">
          <div class="category-icon">{{ category.icon }}</div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.count }}+ 本书籍</p>
        </div>
      </div>
    </section>

    <!-- 推荐书籍区域 -->
    <section class="recommended-section" :class="{ 'visible': heroVisible }">
      <div class="section-title">
        <div class="title-wrapper">
          <span class="subtitle">专属推荐</span>
          <h2>今日热门</h2>
        </div>
        <a class="view-all" href="javascript:void(0)" @click="navigateToLibrary">查看全部</a>
      </div>
      <div class="display-books">
        <div v-for="book in recommendedBooks" :key="book.id" class="recommended-book"
             @click="navigateToBookDetail(book.id)">
          <div class="display-book-cover">
            <img :src="book.cover" alt="书籍封面"/>
          </div>
          <div class="display-book-info">
            <h3>{{ book.title }}</h3>
            <p class="book-desc">{{ book.desc }}</p>
            <div class="price">{{ formatPrice(book.price) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新书上架-->
    <section class="new-arrivals-section" :class="{ 'visible': heroVisible }">
      <div class="section-title">
        <div class="title-wrapper">
          <span class="subtitle">书库已更新</span>
          <h2>新书上架</h2>
        </div>
        <a class="view-all" href="javascript:void(0)" @click="navigateToLibrary">查看全部</a>
      </div>
      <div class="display-books">
        <div v-for="book in newArrivals" :key="book.id" class="new-book" @click="navigateToBookDetail(book.id)">
          <div class="display-book-cover">
            <img :src="book.cover" alt="书籍封面"/>
            <div class="new-tag">NEW</div>
          </div>
          <div class="display-book-info">
            <h3>{{ book.title }}</h3>
            <p class="book-desc">{{ book.author }}</p>
            <div class="price">{{ formatPrice(book.price) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色书籍 -->
    <section class="featured-section" :class="{ 'visible': heroVisible }">
      <div class="featured-book">
        <div class="featured-content">
          <div class="featured-info">
            <div class="featured-badge">编辑精选</div>
            <h2>{{ featuredBook.title }}</h2>
            <p class="featured-author">{{ featuredBook.author }}</p>
            <p class="featured-desc">{{ featuredBook.desc }}</p>
            <div class="featured-price">{{ formatPrice(featuredBook.price) }}</div>
            <div class="featured-actions">
              <button class="primary-btn" @click="navigateToBookDetail(featuredBook.id)">立即购买</button>
              <button class="secondary-btn" @click="navigateToBookDetail(featuredBook.id)">了解详情</button>
            </div>
          </div>
          <div class="featured-image" @click="navigateToBookDetail(featuredBook.id)">
            <img :src="featuredBook.cover" alt="特色书籍封面"/>
          </div>
        </div>
      </div>
    </section>


    <!--  用户社区展示-->
    <section class="community-section">
      <h2 class="community-title">加入番茄书城社区</h2>
      <p class="community-subtitle">与全国书友分享阅读体验，参与读书活动，获取专属推荐</p>
      <div class="community-stats">
        <div class="stat-item">
          <span class="stat-number">28.5 万</span>
          <span class="stat-label">活跃书友</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">43.2 万</span>
          <span class="stat-label">书评笔记</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">1274</span>
          <span class="stat-label">读书小组</span>
        </div>
      </div>
      <button class="community-btn">敬请期待</button>
    </section>

    <!-- 订阅区域 -->
    <section class="subscribe-section" :class="{ 'visible': heroVisible }">
      <div class="subscribe-content">
        <h2>订阅获取更新</h2>
        <p>第一时间获取新书资讯和独家优惠</p>
        <div class="subscribe-form">
          <input placeholder="输入您的邮箱地址（功能预览，敬请期待）" type="email"/>
          <button>订阅</button>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer/>

    <!-- AI助手对话框 -->
    <AIAssistantDialog v-model:visible="aiAssistantVisible"/>

    <!-- 页面底部回顶部按钮 -->
    <el-backtop :bottom="50" :right="30"/>
  </div>
</template>

<style scoped>
/* 整体风格 */

.home {
  font-family: "sf pro display medium", Arial, sans-serif;
  background-color: #ffffff;
  color: #1d1d1f;
  overflow-x: hidden;
  margin-top: 60px;
}

/* 通用样式 */
.product-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.product-cover {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-price {
  font-size: 24px;
  color: #f56c6c;
  margin: 10px 0;
}

.product-rate {
  color: #e6a23c;
}

.product-description,
.product-specs {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.product-specs ul {
  padding-left: 20px;
}

.product-specs li {
  margin: 8px 0;
}

/* 广告项添加悬停效果 */
.ad-item {
  cursor: pointer;
  transition: all 0.3s;
}

.ad-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.ad-dialog {
  z-index: 9999;
  border-radius: 12px;
}

.ad-item {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
}

.ad-image {
  width: 100%;
  border-radius: 6px;
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.title-wrapper {
  position: relative;
}

.subtitle {
  display: block;
  font-size: 16px;
  font-weight: 400;
  color: #666;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
  margin-left: 30px;
}

.section-title h2 {
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin: 0 0 0 30px;
  color: #1d1d1f;
  position: relative;
  padding-bottom: 12px;
}


.view-all {
  color: #06c;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  margin-right: 2%;
  transition: color 0.2s ease;
  position: relative;
}

.view-all:hover {
  color: #0077ed;
}

.view-all::after {
  content: "→";
  margin-left: 6px;
  transition: transform 0.2s ease;
  display: inline-block;
}

.view-all:hover::after {
  transform: translateX(3px);
}

/* 按钮样式 */
.primary-btn {
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 980px;
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background-color: #0077ed;
  transform: scale(1.02);
}

.secondary-btn {
  background-color: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
  border: none;
  border-radius: 980px;
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 12px;
}

.secondary-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Hero 区域 */
.hero {
  position: relative;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  background: linear-gradient(135deg, #f5f5f5, #eaeaea);
}

.hero.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 2;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  opacity: 0.3;
  z-index: 1;
}

.hero-text {
  flex: 0 0 50%;
  padding-right: 40px;
}

.hero-text h1 {
  font-size: 54px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.5px;
  margin: 0 0 20px;
  color: #1d1d1f;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.hero-text p {
  font-size: 21px;
  line-height: 1.5;
  color: #1d1d1f;
  margin: 0 0 40px;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.hero-actions {
  animation: fadeIn 0.8s ease-out 0.7s both;
}

.hero-image {
  flex: 0 0 50%;
  height: 500px;
  animation: fadeIn 0.8s ease-out 0.5s both, floatAnimation 6s ease-in-out infinite;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

@keyframes floatAnimation {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分类区域 */
.categories-section {
  padding: 80px 0;
  background-color: #f5f5f7;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  transition-delay: 0.2s;
}

.categories-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 0 20px;
  max-width: 1200px;
  margin: 20px auto 0;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  text-align: center;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.category-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

.category-card h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #1d1d1f;
}

.category-card p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* 推荐书籍区域 */
.recommended-section {
  padding: 80px 0;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  transition-delay: 0.4s;
}

.recommended-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.display-books {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  max-width: 1155px;
  margin: 0 auto;
  scrollbar-width: none;
  padding: 0 20px 20px;
  -webkit-overflow-scrolling: touch;
}

.display-books::-webkit-scrollbar {
  display: none;
}

.recommended-book {
  flex: 0 0 auto;
  width: 24%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

}

.recommended-book:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.display-book-cover {
  position: relative;
  height: 380px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.display-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.5s ease;
  border-radius: inherit;
  cursor: pointer;
}

.display-book-cover:hover img {
  transform: scale(1.07);
}

.display-book-info {
  padding: 15px 20px 25px 20px;
}

.display-book-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-desc {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

}

/* 新书上架区域 */
.new-arrivals-section {
  padding: 80px 0;
  background-color: #f5f5f7;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  transition-delay: 0.6s;
}

.new-arrivals-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.new-book {
  flex: 0 0 auto;
  width: 24%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.new-book:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.new-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.new-book:hover .new-book-cover img {
  transform: scale(1.05);
}

.new-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #fa2c5a;
  color: white;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.new-book-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 16px;
  font-weight: 400;
  color: #1d1d1f;
}

/* 特色书籍区域 */
.featured-section {
  padding: 80px 0;
  max-width: 1200px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  transition-delay: 0.8s;
}

.featured-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.featured-book {
  background: linear-gradient(135deg, #f2f2f2, #ffffff);
  border-radius: 24px;
  overflow: hidden;
  padding: 20px;
  margin: 0 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

.featured-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.featured-info {
  flex: 1;
  padding: 30px;
}

.featured-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #fa2c5a);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.featured-info h2 {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 12px;
  color: #1d1d1f;
}

.featured-author {
  font-size: 18px;
  color: #515154;
  margin: 0 0 20px;
}

.featured-desc {
  font-size: 16px;
  line-height: 1.6;
  color: #6e6e73;
  margin-bottom: 30px;
}

.featured-price {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 30px;
}

.featured-actions {
  display: flex;
}

.featured-image {
  flex: 1;
  height: 500px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

/* 社区展示 */
.community-section {
  margin: 0 auto;
  padding: 80px 0;
  text-align: center;
  background-color: #f5f5f7;
}

.community-title {
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.1;
  text-align: center;
  margin: 0 0 16px 0;
}

.community-subtitle {
  font-size: 18px;
  color: #86868b;
  margin: 0 auto 48px;
  max-width: 700px;
  line-height: 1.4;
  font-weight: 400;
}

.community-stats {
  display: flex;
  justify-content: center;
  gap: 100px;
  margin-bottom: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 44px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.stat-label {
  color: #86868b;
  font-size: 16px;
}

.community-btn {
  background-color: #0071e3;
  border: none;
  color: white;
  padding: 12px 28px;
  border-radius: 980px;
  font-size: 17px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
}

.community-btn:hover {
  background-color: #0077ed;
  transform: scale(1.02);
}

/* 订阅区域 */
.subscribe-section {
  padding: 80px 0;
  background-color: #000000;
  color: white;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
  transition-delay: 1s;
}

.subscribe-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.subscribe-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.subscribe-content h2 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 16px;
}

.subscribe-content p {
  font-size: 17px;
  color: #a1a1a6;
  margin-bottom: 30px;
}

.subscribe-form {
  display: flex;
  gap: 12px;
}

.subscribe-form input {
  flex: 1;
  padding: 16px 24px;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.subscribe-form input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.subscribe-form button {
  background: white;
  color: black;
  border: none;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscribe-form button:hover {
  background: #f5f5f7;
}

.ad-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ad-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.ad-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.close-btn {
  font-size: 20px;
  color: #909399;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #409EFF;
}

.ad-carousel {
  position: relative;
  padding: 10px 0;
}

.carousel-container {
  position: relative;
  min-height: 300px;
}

.ad-transition-group {
  position: relative;
}

.ad-item {
  display: flex;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px;
  border-radius: 12px;
}

.ad-image-container {
  flex: 0 0 250px;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.ad-item:hover .ad-image {
  transform: scale(1.05);
}

.ad-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 10px;
}

.ad-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.ad-description {
  margin-bottom: 20px;
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

.view-more-btn {
  align-self: flex-start;
}

.ad-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.ad-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}


.ad-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ad-note {
  font-size: 14px;
  color: #909399;
}

/* 响应式调整 */
@media (max-width: 768px) {

  .ad-item {
    flex-direction: column;
  }

  .ad-image-container {
    width: 100%;
    flex: 0 0 auto;
    height: 200px;
  }
}

@media (max-width: 1024px) {
  .category-card {
    width: calc(33.33% - 24px);
  }

  .recommended-book {
    width: calc(33.33% - 30px);
  }

  .new-book {
    width: calc(33.33% - 30px);
  }

  .featured-content {
    flex-direction: column;
  }

  .featured-info,
  .featured-image {
    width: 100%;
  }

  .featured-image {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: 60px 0;
    overflow: visible;
  }

  .hero-content {
    flex-direction: column;
  }

  .hero-text {
    padding-right: 0;
    order: 2;
    text-align: center;
  }

  .hero-image {
    order: 1;
    margin-bottom: 40px;
  }

  .hero-text h1 {
    font-size: 42px;
  }

  .hero-text p {
    font-size: 17px;
  }

  .section-title h2 {
    font-size: 28px;
  }

  .category-card {
    width: calc(50% - 24px);
  }
}

@media (max-width: 480px) {
  .hero-text h1 {
    font-size: 36px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .secondary-btn {
    margin-left: 0;
  }

  .category-card {
    width: 100%;
  }

  .subscribe-form {
    flex-direction: column;
  }

}
</style>

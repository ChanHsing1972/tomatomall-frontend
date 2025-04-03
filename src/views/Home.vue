<script setup lang="ts">
import Header from "../components/Header.vue"
import { ref, onMounted } from 'vue'

// 模拟推荐书籍数据
const recommendedBooks = ref<{ id: number; title: string; cover: string; desc: string }[]>([])

onMounted(() => {
  recommendedBooks.value = [
    {
      id: 1,
      title: "番茄的世界",
      cover: "https://tse4-mm.cn.bing.net/th/id/OIP-C.McBhzHbp8QPvU4tcNJOjXQHaHa?rs=1&pid=ImgDetMain",
      desc: "探索番茄生长的奇妙世界"
    },
    {
      id: 2,
      title: "Vue 3快速上手",
      cover: "https://pic1.zhimg.com/v2-fba95424ef89a32125bba5daa2937795_720w.jpg?source=172ae18b",
      desc: "极简前端开发的秘密武器"
    },
    {
      id: 3,
      title: "全球摄影集锦",
      cover: "https://n.sinaimg.cn/sinacn/w960h1440/20171223/d7cd-fypvuqf4642780.png",
      desc: "捕捉世界之美，每一瞬间都动人"
    },
    {
      id: 4,
      title: "快速掌握 TypeScript",
      cover: "https://www.idcspy.com/wp-content/uploads/2022/01/1-164.jpg",
      desc: "现代开发必备的强大技能"
    },
  ]
})
</script>

<template>
  <div class="home">
    <!-- 顶部导航 -->
    <Header />

    <!-- Banner / Hero 区域 -->
    <section class="hero">
      <div class="hero-text">
        <h1>纯粹阅读 非凡生活</h1>
        <p>在番茄书城，发现每一本书的灵魂。</p>
      </div>
      <!-- 背景图或渐变效果 -->
      <div class="hero-bg"></div>
    </section>

    <!-- 推荐书籍区域 -->
    <section class="content">
      <div class="books">
        <div class="book-card" v-for="book in recommendedBooks" :key="book.id">
          <div class="book-cover-wrapper">
            <img :src="book.cover" alt="书籍封面" />
          </div>
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p>{{ book.desc }}</p>
            <button class="buy-btn">立即购买</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 整体风格 */
.home {
  font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #fff;
  color: #333;
}

/* Hero 区域 */
.hero {
  margin-top: 50px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  /* 如果有背景图片，可使用背景图： */
  /* background: url('背景图片地址') center/cover no-repeat, linear-gradient(135deg, #fafafa, #f0f0f0); */
  opacity: 0.3;
  z-index: 1;
}

.hero-text {
  position: relative;
  text-align: center;
  z-index: 2;
  padding: 0 20px;
}

.hero-text h1 {
  font-size: 2.5em;
  margin-bottom: 0;
  font-family: "思源宋体 Heavy", "Source Han Serif SC", serif;
}

.hero-text p {
  font-size: 1.2em;
  color: #666;
  margin-left: 20px;
}

/* 内容区域 */
.content {
  width: 90%;
  max-width: 1200px;
  margin: 40px auto;
}

.content h2 {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 20px;
  font-weight: normal;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

/* 推荐书籍 */
.books {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.book-card {
  margin-top: 20px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  width: calc(25% - 20px);
  min-width: 250px;
  transition: box-shadow 0.3s ease;
  margin-bottom: 660px;
}

.book-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.book-cover-wrapper {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.book-cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  padding: 15px;
  text-align: center;
}

.book-info h3 {
  font-size: 1.3em;
  margin-bottom: -12px;
  color: #333;
  flex-grow: 0; /* 不让第一项继续扩展 */
  white-space: nowrap; /* 防止内容换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.book-info p {
  font-size: 1em;
  color: #666;
  margin-bottom: 15px;
  flex-grow: 0; /* 不让第一项继续扩展 */
  white-space: nowrap; /* 防止内容换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.buy-btn {
  margin-top: 10px;
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 30px;
}

.buy-btn:hover {
  background-color: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 2em;
  }
  .hero-text p {
    font-size: 1em;
  }
  .book-card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 480px) {
  .book-card {
    width: 100%;
  }
}
</style>
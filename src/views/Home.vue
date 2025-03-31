<script setup lang="ts">
import Header from "../components/Header.vue"
import { ref, onMounted } from 'vue'

// 模拟推荐书籍数据
const recommendedBooks = ref<{ id: number; title: string; cover: string; desc: string }[]>([])

// 在组件挂载时请求或模拟加载数据
onMounted(() => {
  recommendedBooks.value = [
    {
      id: 1,
      title: "番茄的世界",
      cover: "https://tse4-mm.cn.bing.net/th/id/OIP-C.McBhzHbp8QPvU4tcNJOjXQHaHa?rs=1&pid=ImgDetMain",
      desc: "探索番茄的生长、品种及文化"
    },
    {
      id: 2,
      title: "Vue 3快速上手",
      cover: "https://pic1.zhimg.com/v2-fba95424ef89a32125bba5daa2937795_720w.jpg?source=172ae18b",
      desc: "价值连城的 Vue 3 前端开发之书"
    },
    {
      id: 3,
      title: "全球摄影集锦",
      cover: "https://ts1.tc.mm.bing.net/th/id/R-C.a43573113890e0977723190d1d0bd7e2?rik=fQTkY7Bh25bb1w&riu=http%3a%2f%2fcpnodata.oss-cn-shenzhen.aliyuncs.com%2fportal%2f202001%2f07%2f095044xnmm2mm31vhxa161.jpg&ehk=2FeSdbV%2bKyclRsSJ1a9Aj797nkhkEmi3awQcZdbBa1s%3d&risl=&pid=ImgRaw&r=0",
      desc: "欣赏世界各地的风采与瞬间"
    },
    {
      id: 4,
      title: "快速掌握 TypeScript",
      cover: "https://www.idcspy.com/wp-content/uploads/2022/01/1-164.jpg",
      desc: "TypeScript 基础与进阶案例"
    },
  ]
})
</script>

<template>
  <!-- 顶部导航 -->
  <Header />

  <!-- 轮播图，可用于展示广告或店铺信息 -->
  <el-carousel
    indicator-position="outside"
    arrow="hover"
    autoplay
    height="300px"
    class="carousel-banner"
  >
    <el-carousel-item v-for="(item, index) in 3" :key="index">
      <div class="banner-content">番茄书城宣传图 {{ index + 1 }}</div>
    </el-carousel-item>
  </el-carousel>

  <!-- 推荐书籍区域 -->
  <div class="home-container">
    <h2>推荐书籍</h2>
    <el-row :gutter="20" class="book-list">
      <el-col :span="6" v-for="book in recommendedBooks" :key="book.id">
        <el-card shadow="hover">
          <img :src="book.cover" class="book-image" alt="book cover" />
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p class="book-desc">{{ book.desc }}</p>
            <el-button type="primary" class="buy-btn">立即购买</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.carousel-banner {
  margin-bottom: 20px;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: white;
  font-size: 2em;
  background: indianred;
}

.home-container {
  width: 90%;
  margin: 0 auto;
}

.book-list {
  margin-top: 20px;
}

.book-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  margin-bottom: 10px;
  border-radius: 6px;
}

.book-info {
  text-align: center;
}

.book-desc {
  color: #666;
  margin: 10px 0;
}

.buy-btn {
  margin-top: 10px;
}
</style>
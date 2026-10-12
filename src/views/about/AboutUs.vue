<script lang="ts" setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import { onMounted, ref } from "vue";

// 数据部分
const milestones = ref([
  {
    year: "2020",
    title: "枕石书屋成立",
    description: "在数字阅读蓬勃发展的时代，我们怀揣让阅读更简单、更美好的愿景，创立了枕石书屋。"
  },
  {
    year: "2021",
    title: "用户突破100万",
    description: "依靠精选的书籍内容和优质的用户体验，枕石书屋在短时间内聚集了大量忠实读者。"
  },
  {
    year: "2022",
    title: "移动端App上线",
    description: "推出iOS和Android应用，让用户随时随地享受阅读的乐趣。"
  },
  {
    year: "2023",
    title: "国际化发展",
    description: "开始提供多语言支持，将优质读物传播到全球各地。"
  },
  {
    year: "2024",
    title: "AI推荐系统升级",
    description: "引入先进的AI技术，为用户提供更精准的阅读推荐。"
  }
]);

const coreValues = ref([
  {
    icon: "📚",
    title: "阅读至上",
    description: "我们相信阅读的力量，致力于打造最佳阅读体验。"
  },
  {
    icon: "🌟",
    title: "品质保证",
    description: "精选全球优质内容，确保每一本书都值得您的时间。"
  },
  {
    icon: "💡",
    title: "创新驱动",
    description: "不断探索技术边界，让数字阅读更加智能和个性化。"
  },
  {
    icon: "🤝",
    title: "用户为本",
    description: "倾听每一位读者的声音，持续优化产品和服务。"
  }
]);

const teamMembers = ref([
  {
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    name: "张明",
    position: "创始人兼首席执行官",
    quote: "阅读不仅仅是获取知识，更是一种生活态度。"
  },
  {
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    name: "李婷",
    position: "首席运营官",
    quote: "让每一个人都能找到自己心爱的书籍。"
  },
  {
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8cHJvZmVzc2lvbmFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    name: "王大卫",
    position: "技术总监",
    quote: "技术让阅读体验更加流畅、自然和沉浸。"
  }
]);

// 滚动到页面顶部
onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="about-page">
    <Header />

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>关于枕石书屋</h1>
        <p>纯粹阅读，非凡生活</p>
      </div>
    </section>

    <!-- 主要内容 -->
    <div class="container">
      <!-- 我们的故事 -->
      <section class="story-section">
        <div class="section-header">
          <span class="section-tag">我们的故事</span>
          <h2>用阅读连接世界</h2>
        </div>

        <div class="content-wrapper">
          <div class="text-content">
            <p>
              枕石书屋源于一个简单而坚定的信念：阅读能够改变生活。在这个信息爆炸的时代，我们希望为读者提供一个安静而丰富的阅读空间。</p>
            <p>
              自2020年成立以来，枕石书屋始终坚持"品质阅读"的理念，精选全球优质书籍，覆盖文学、科技、艺术、生活等多个领域，致力于满足不同读者的阅读需求。</p>
            <p>
              我们不仅是一个图书销售平台，更是一个阅读社区。在这里，知识自由流动，思想碰撞交融，读者与作者、读者与读者之间建立起紧密的联系。</p>
          </div>
          <div class="image-content">
            <img alt="书城图片"
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGlicmFyeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" />
          </div>
        </div>
      </section>

      <!-- 发展历程 -->
      <section class="timeline-section">
        <div class="section-header">
          <span class="section-tag">发展历程</span>
          <h2>我们的成长足迹</h2>
        </div>

        <div class="timeline">
          <div v-for="(milestone, index) in milestones" :key="index" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="year">{{ milestone.year }}</div>
              <h3>{{ milestone.title }}</h3>
              <p>{{ milestone.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 核心价值观 -->
      <section class="values-section">
        <div class="section-header">
          <span class="section-tag">核心价值观</span>
          <h2>我们的信念</h2>
        </div>

        <div class="values-grid">
          <div v-for="(value, index) in coreValues" :key="index" class="value-card">
            <div class="value-icon">{{ value.icon }}</div>
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </section>

      <!-- 团队介绍 -->
      <section class="team-section">
        <div class="section-header">
          <span class="section-tag">核心团队</span>
          <h2>遇见番茄人</h2>
        </div>

        <div class="team-grid">
          <div v-for="(member, index) in teamMembers" :key="index" class="team-card">
            <div class="member-avatar">
              <img :alt="member.name" :src="member.avatar" />
            </div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <span class="position">{{ member.position }}</span>
              <p class="quote">"{{ member.quote }}"</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 愿景 -->
    <div class="vision-section">
      <div class="vision-content">
        <h2>我们的愿景</h2>
        <p>让阅读成为每个人生活中不可或缺的一部分，<br>构建一个知识共享、思想自由的阅读世界。</p>
        <div class="action-buttons">
          <router-link class="primary-btn" to="/booklist">探索书库</router-link>
          <router-link class="secondary-btn" to="/about/join-us">加入我们</router-link>
        </div>
      </div>

    </div>

    <Footer />
  </div>
</template>

<style scoped>
.about-page {
  font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1d1d1f;
  background-color: #fff;
}

/* 英雄区域 */
.hero {
  position: relative;
  height: 300px;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGlicmFyeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 60px;
}

.hero-content {
  color: white;
  z-index: 1;
}

.hero h1 {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.hero p {
  font-size: 24px;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 通用部分样式 */
section {
  padding: 100px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-tag {
  display: inline-block;
  background-color: #f5f5f7;
  color: #06c;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 42px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

/* 我们的故事 */
.content-wrapper {
  display: flex;
  gap: 60px;
  align-items: center;
}

.text-content {
  flex: 1;
}

.text-content p {
  font-size: 18px;
  line-height: 1.6;
  color: #515154;
  margin-bottom: 24px;
}

.image-content {
  flex: 1;
}

.image-content img {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 发展历程 */
.timeline {
  position: relative;
  padding-left: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background: linear-gradient(to bottom, #06c, #0091ff);
}

.timeline-item {
  position: relative;
  margin-bottom: 60px;
}

.timeline-marker {
  position: absolute;
  left: -49px;
  top: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #06c;
  border: 4px solid white;
  box-shadow: 0 0 0 2px #06c;
}

.timeline-content {
  background-color: #f5f5f7;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.year {
  display: inline-block;
  background-color: #06c;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
}

.timeline-content h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #1d1d1f;
}

.timeline-content p {
  font-size: 16px;
  color: #515154;
  margin: 0;
}

/* 核心价值观 */
.values-section {
  background-color: white;
  padding: 100px 0;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.value-card {
  background-color: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 15px;
}

.value-card p {
  font-size: 16px;
  color: #515154;
  margin: 0;
}

/* 团队介绍 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.team-card {
  background-color: #f5f5f7;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  height: 300px;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  padding: 30px;
}

.member-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 5px;
}

.position {
  color: #06c;
  font-size: 16px;
  display: block;
  margin-bottom: 15px;
}

.quote {
  font-style: italic;
  font-size: 16px;
  color: #515154;
  margin: 0;
}

/* 愿景部分 */
.vision-section {
  position: relative;
  padding: 100px 0;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bGlicmFyeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  display: flex;
}

.vision-content {
  max-width: 800px;
  margin: 0 auto;
}

.vision-content h2 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
}

.vision-content p {
  font-size: 24px;
  line-height: 1.6;
  margin-bottom: 40px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.primary-btn,
.secondary-btn {
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.primary-btn {
  background-color: #06c;
  color: white;
}

.primary-btn:hover {
  background-color: #0077ed;
  transform: scale(1.05);
}

.secondary-btn {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .hero {
    height: 400px;
  }

  .hero h1 {
    font-size: 48px;
  }

  .section-header h2 {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 350px;
  }

  .hero h1 {
    font-size: 40px;
  }

  .hero p {
    font-size: 18px;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 40px;
  }

  .text-content p {
    font-size: 16px;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .vision-content h2 {
    font-size: 36px;
  }

  .vision-content p {
    font-size: 18px;
  }

  section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 32px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .vision-content h2 {
    font-size: 28px;
  }
}
</style>

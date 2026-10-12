<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <h2>枕石书屋</h2>
        <p>纯粹阅读，非凡生活</p>
      </div>
      <div class="footer-links">
        <div class="footer-column">
          <h3>关于我们</h3>
          <ul>
            <li>
              <router-link to="/about/aboutus">书城简介</router-link>
            </li>
            <li>
              <router-link to="/about/join-us">加入我们</router-link>
            </li>
            <li>
              <router-link to="/about/contact">联系方式</router-link>
            </li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>帮助中心</h3>
          <ul>
            <li>
              <router-link to="/about/help">常见问题</router-link>
            </li>
            <li>
              <router-link to="/about/help">购买指南</router-link>
            </li>
            <li>
              <router-link to="/about/help">售后服务</router-link>
            </li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>快速链接</h3>
          <ul>
            <li><a href="#">新书上架</a></li>
            <li><a href="#">畅销排行</a></li>
            <li><a href="#">图书分类</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>关注我们</h3>
          <div class="social-icons">
            <a href="#" class="social-icon">📱</a>
            <a href="#" class="social-icon">💬</a>
            <a href="#" class="social-icon">📷</a>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright">
      © 2026 枕石书屋 · 课程项目演示 · 演示支付不会扣款。
    </div>
  </footer>
</template>

<style scoped>
.footer {
  font-family: "sf pro display medium", sans-serif;
  background-color: #f5f5f7;
  padding: 60px 20px 20px;
  color: #515154;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.footer-logo {
  flex: 0 0 260px;
}

.footer-logo h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #1d1d1f;
}

.footer-logo p {
  font-size: 14px;
  color: #86868b;
}

.footer-links {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 80px;
}

.footer-column h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #1d1d1f;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column ul li {
  margin-bottom: 10px;
}

.footer-column ul li a {
  text-decoration: none;
  color: #515154;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-column ul li a:hover {
  color: #06c;
  text-decoration: underline;
}


.social-icons {
  display: flex;
  gap: 16px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  transition: all 0.2s ease;
  text-decoration: none;
}

.social-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.copyright {
  max-width: 1200px;
  margin: 40px auto 0;
  font-size: 12px;
  color: #86868b;
  border-top: 1px solid #d2d2d7;
  padding-top: 20px;
}
</style>
<script lang="ts" setup>
</script>
<script setup lang="ts">
import {useRouter} from 'vue-router'
import {ElMessageBox} from "element-plus";
import {ref} from "vue";
import {User, SwitchButton, Search} from "@element-plus/icons-vue";

const router = useRouter();
const searchQuery = ref("");

function logout() {
  ElMessageBox.confirm("确认退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    sessionStorage.setItem("token", "");
    router.push({path: "/login"});
  });
}

function handleSearch() {

  if (searchQuery.value.trim()) {
    router.push({
      path: "/booklist",
      query: {keyword: searchQuery.value.trim()}
    });
  } else {
    router.push({path: "/booklist"});
  }
}

</script>

<template>
  <el-header class="header">
    <el-row class="nav-row" type="flex" text-align="middle">
      <!-- 左侧：LOGO -->
      <el-col :span="1"></el-col>

      <el-col :span="6" class="logo-col">
        <router-link to="/home" class="logo-link">
          <h1 class="logo-text">番茄书城</h1>
        </router-link>
      </el-col>

      <!-- 中间：导航链接 -->
      <el-col :span="10" class="nav-links">
        <router-link to="/home" class="nav-item">主页</router-link>
        <router-link to="/booklist" class="nav-item">书库</router-link>
        <router-link to="/cart" class="nav-item">购物袋</router-link>
        <router-link to="/orders" class="nav-item">订单</router-link>
      </el-col>

      <!-- 右侧：搜索框及用户操作 -->
      <el-col :span="6" class="right-section">
        <div>
          <el-input v-model="searchQuery" placeholder="搜索" clearable @keyup.enter="handleSearch" class="nav-search">
            <template #prefix>
              <el-icon class="search-icon" @click="handleSearch">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <router-link to="/dashboard" class="user-link">
          <el-icon class="user-icon" :size="24">
            <User/>
          </el-icon>
        </router-link>
        <a @click="logout" class="logout-link">
          <el-icon class="logout-icon" :size="24">
            <SwitchButton/>
          </el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>

<style>
.header {
  position: fixed;
  /* 固定在页面顶部 */
  top: 0;
  /* 距离页面顶部0 */
  left: 0;
  width: 100%;
  /* 占满整个页面宽度 */
  z-index: 100;
  /* 保证位于最上层 */

  /* 半透明背景及毛玻璃效果 */
  background: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
}

.nav-row {
  height: 60px;
}

/* LOGO */
.logo-col {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
}

.logo-text {
  font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 18px;
  color: #333;
  margin: 0;
}

/* 导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  height: 100%;
  /* 占满整个 nav-row 高度 */
}

.nav-item {
  font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1em;
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
  line-height: 60px;
  /* 与 nav-row 高度一致 */
}

.nav-item:hover {
  color: #000;
}

.router-link-active {
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #000;
}

.user-link.router-link-active {
  border-bottom: none;
}

.logo-link.router-link-active {
  border-bottom: none;
}

/* 右侧区域 */
.right-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.nav-search {
  width: 200px;
}

.user-icon,
.logout-icon {
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  /* 为使图标居中，可不设 line-height 或设置与 nav-row 一致 */
  line-height: 60px;
}

.user-icon:hover,
.logout-icon:hover {
  color: #000;
}

/* 链接去除下划线 */
.user-link,
.logout-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整：浏览器窗口较小时减少间距 */
@media (max-width: 768px) {
  .nav-links {
    gap: 15px;
  }

  .nav-search {
    width: 150px;
  }
}
</style>

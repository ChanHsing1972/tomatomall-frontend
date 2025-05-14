<script setup lang="ts">
import {useRouter} from 'vue-router';
import {ElMessageBox} from 'element-plus';
import {onMounted, ref} from 'vue';
import {Search, SwitchButton, User} from '@element-plus/icons-vue';
import {clearSearchHistory, getSearchHistory, saveSearchHistory, SearchHistory} from '../api/search_history.ts';

const router = useRouter();
const searchQuery = ref("");
const searchHistory = ref<SearchHistory[]>([]);
const token = ref(sessionStorage.getItem("token") || "");

function logout() {
  ElMessageBox.confirm("确认退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    sessionStorage.clear();
    router.push({path: "/home"});
  });
}

// 获取搜索历史
async function fetchSearchHistory() {
  try {
    const response = await getSearchHistory();
    searchHistory.value = response.data.data;
    console.log(searchHistory.value);
  } catch (error) {
    console.error('获取搜索历史失败:', error);
  }
}

// 保存搜索历史
async function handleSaveSearchHistory(query: string) {
  if (!query.trim()) return;
  try {
    await saveSearchHistory(query);
    await fetchSearchHistory(); // 更新搜索历史列表
  } catch (error) {
    console.error('保存搜索历史失败:', error);
  }
}

// 初始化搜索历史
onMounted(() => {
  // 只有在用户登录状态下才获取搜索历史
  if (token.value) {
    fetchSearchHistory();
  }
});

function handleSearch() {
  if (!searchQuery.value.trim()) return;

  // 保存搜索历史并导航到搜索结果页
  handleSaveSearchHistory(searchQuery.value);
  router.push({
    path: '/booklist',
    query: {keyword: searchQuery.value}
  });
}

function clearHistory() {
  ElMessageBox.confirm("确认清空所有搜索历史？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await clearSearchHistory();
      searchHistory.value = [];
    } catch (error) {
      console.error('清空搜索历史失败:', error);
    }
  })
}

// 跳转到登录页
function goToLogin() {
  router.push('/login');
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
        <!-- 有历史时，整个输入框都由 el-dropdown 包裹 -->
        <el-dropdown v-if="searchHistory.length" class="search-history-dropdown" trigger="click">
          <!-- Default slot：作为触发器的输入框 -->
          <template #default>
            <el-input v-model="searchQuery" class="nav-search" clearable placeholder="搜索" @keyup.enter="handleSearch">
              <template #prefix>
                <el-icon class="search-icon" @click="handleSearch">
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </template>

          <!-- Dropdown slot：下拉的历史列表 -->
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in searchHistory" :key="item.id"
                                @click="searchQuery = item.query; handleSearch()">
                {{ item.query }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="clearHistory">
                清除历史记录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 无历史时，单独渲染一个普通输入框 -->
        <div v-else>
          <el-input v-model="searchQuery" class="nav-search" clearable placeholder="搜索" @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon class="search-icon" @click="handleSearch">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </div>

        <!-- 根据登录状态显示不同的用户相关操作 -->
        <template v-if="token">
          <!-- 已登录：显示个人中心和退出登录 -->
          <router-link class="user-link" to="/dashboard">
            <el-icon :size="24" class="user-icon">
              <User/>
            </el-icon>
          </router-link>
          <a class="logout-link" @click="logout">
            <el-icon :size="24" class="logout-icon">
              <SwitchButton/>
            </el-icon>
          </a>
        </template>
        <template v-else>
          <!-- 未登录：显示登录入口 -->
          <a class="login-link" @click="goToLogin">
            <span class="login-text">登录</span>
          </a>
        </template>
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

.login-link {
  text-decoration: none;
  cursor: pointer;
}

.login-text {
  color: #666;
  font-size: 14px;
  transition: color 0.3s ease;
  padding: 5px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.login-text:hover {
  color: #000;
  border-color: #c6c6c6;
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

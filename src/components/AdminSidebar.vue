<template>
  <div class="admin-sidebar">
    <el-menu :default-active="$route.path" class="sidebar-menu" router>
      <!-- 其他菜单项 -->

      <el-menu-item index="/admin/coupons">
        <el-icon>
          <Ticket/>
        </el-icon>
        <span>优惠券管理</span>
      </el-menu-item>

      <!-- 其他菜单项 -->
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";

const route = useRoute();

// 这里可以添加其他逻辑
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  background-color: #f5f5f7;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
}

.sidebar-menu {
  border: none;
  width: 100%;
}

.el-menu-item {
  font-size: 16px;
  color: #333;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.el-menu-item:hover {
  background-color: #e6f7ff;
}

.el-icon {
  margin-right: 10px;
  font-size: 18px;
}

.el-menu-item.is-active {
  background-color: #d1e7dd;
  color: #0f5132;
}
</style>
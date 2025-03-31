<script setup lang="ts">
import {router} from '../router'
import {parseRole} from "../utils"
import {User, SwitchButton} from "@element-plus/icons-vue"   //图标

const role = sessionStorage.getItem('role')    //登录的时候插入的

//退出登录
function logout() {
  ElMessageBox.confirm(
      '是否要退出登录？',
      '提示',
      {
        customClass: "customDialog",
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true
      }
  ).then(() => {
    sessionStorage.setItem('token', '')
    router.push({path: "/login"})
  })
}
</script>


<template>
  <el-header class="custom-header" height="20">
    <el-row :gutter="10">
      <el-col :span="3" class="header-icon">
        <router-link to="/home" v-slot="{navigate}" class="no-link">
          <h1 @click="navigate" class="header-text"> 番茄书城</h1>
        </router-link>
      </el-col>

      <el-col :span="2">
        <el-tag class="role-tag" size="large">{{ parseRole(role) }}版</el-tag>
      </el-col>

      <!-- 主页 -->
      <el-col :span="2" class="header-icon">
        <router-link to="/home" class="no-link">
          <h2 class="sub-header-text">主页</h2>
        </router-link>
      </el-col>

      <!-- 购物车 -->
      <el-col :span="2" class="header-icon">
        <router-link to="/cart" class="no-link">
          <h2 class="sub-header-text">购物车</h2>
        </router-link>
      </el-col>

      <!-- 订单 -->
      <el-col :span="2" class="header-icon">
        <router-link to="/orders" class="no-link">
          <h2 class="sub-header-text">订单</h2>
        </router-link>
      </el-col>

      <el-col :span="4">
      </el-col>

      <!-- 搜索框 -->
      <el-col :span="6" class="header-icon">
        <el-input
            prefix-icon="Search"
            style="--el-input-prefix-icon-color: white;"
            placeholder="搜索书籍..."
            class="search-input"
        />
      </el-col>

      <el-col :span="1" class="header-icon">
        <router-link to="/dashboard" v-slot="{navigate}">
          <el-icon @click="navigate" :size="30" color="white" ><User /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="30" color="white" ><SwitchButton /></el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>


<style scoped>
.custom-header {
  background-color: indianred;
  display: flex;
  flex-direction: column;
}

.no-link {
  text-decoration: none;
}

.role-tag {
  color:black;
  margin-top: 15px;
  font-size: 20px;
}

.header-text {
  color:white;
  font-size: x-large;
  min-width: max-content;
  margin-top: 15px;
  margin-bottom: 15px;
}

.sub-header-text {
  color:white;
  font-size: x-large;
  min-width: max-content;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: normal;
}

.header-icon {
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
}
</style>

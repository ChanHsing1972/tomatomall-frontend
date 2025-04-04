<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElInput, ElButton, ElMessage } from "element-plus";
import { accountInfo, accountLogin } from "../../api/account.ts";
import { router } from "../../router";

// 输入框值
const username = ref('');
const password = ref('');

// 输入框验证
const hasUsernameInput = computed(() => username.value.trim() !== '');
const hasPasswordInput = computed(() => password.value.trim() !== '');
const loginDisabled = computed(() => !(hasUsernameInput.value && hasPasswordInput.value));

// 登录操作
function handleLogin() {
  accountLogin({
    username: username.value.trim(),
    password: password.value
  }).then(res => {
    if (res.data.code === '200') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      });
      setTimeout(() => {
        ElMessage.closeAll();
      }, 1500);
      const token = res.data.result;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', username.value);
      accountInfo(username.value.trim()).then(res => {
        sessionStorage.setItem('name', res.data.result.name);
        sessionStorage.setItem('role', res.data.result.role);
        router.push({ path: "/home" });
      });
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      });
      password.value = '';
    }
  });
}
</script>

<template>
  <div class="apple-login-wrapper">
    <div class="login-box">
      <h1 class="title">欢迎登录</h1>
      <p class="subtitle">番茄书城欢迎您</p>
      <div class="form-box" @keyup.enter="handleLogin">
        <div class="input-group">
          <label for="username" class="input-label">用户名</label>
          <el-input id="username" v-model="username" placeholder="请输入用户名" class="input-field" />
        </div>
        <div class="input-group">
          <label for="password" class="input-label">密码</label>
          <el-input id="password" type="password" v-model="password" placeholder="••••••••" class="input-field" />
        </div>
        <div class="button-group">
          <el-button type="primary" @click.prevent="handleLogin" :disabled="loginDisabled" class="login-button">
            登入
          </el-button>
          <router-link to="/register" custom v-slot="{ navigate }">
            <el-button @click="navigate" class="register-button">注册</el-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.apple-login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.login-box {
  background: #fff;
  padding: 90px 60px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.title {
  margin-top: 0px;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 0px;
  color: #333;
}

.subtitle {
  margin-top: 10px;
  font-size: 14px;
  color: #888;
  margin-bottom: 40px;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  text-align: left;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}

/* 自定义输入框样式 */
.input-field>>>.el-input__inner {
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field>>>.el-input__inner:focus {
  border-color: #0071e3;
}

.button-group {
  display: flex;
  flex-direction: column;
  /* 保持垂直排列 */
  gap: 2px;
  margin-top: 30px;
  align-items: center;
  /* 让各个按钮在垂直方向对齐 */
}

.router-link {
  display: inline-block;
  /* 避免 router-link 产生额外的行内空隙 */
}

.login-button,
.register-button {
  border-radius: 6px;
  font-size: 16px;
  height: 42px;
  /* 去掉或改为和 login-button 一致的宽度 */
  /* min-width: 400px; */
  /* 或者统一都为 100% */
  width: 100%;
  margin-bottom: 10px;
}


.login-button {
  background-color: #0071e3;
  color: #fff;
}

.register-button {
  background-color: #eaeaea;
  color: #333;
  margin-right: 10px;
}
</style>
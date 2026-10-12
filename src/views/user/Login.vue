<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElButton, ElMessage } from "element-plus";
import { accountInfo, accountLogin } from "../../api/account.ts";
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
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
        duration: 1000
      });
      const token = res.data.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', username.value);
      accountInfo(username.value.trim()).then(res => {
        sessionStorage.setItem('name', res.data.data.name);
        sessionStorage.setItem('role', res.data.data.role);
        sessionStorage.setItem('telephone', res.data.data.telephone);
        sessionStorage.setItem('location', res.data.data.location);
        sessionStorage.setItem('id', res.data.data.id);
        const target=route.query.redirect;
        router.push(typeof target==='string'&&target.startsWith('/')&&!target.startsWith('//')?target:'/home');
      });
    } else if (res.data.code === '401') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
      });
      password.value = '';
    }
  }).catch((error) => ElMessage.error(error.message || '登录失败，请检查用户名和密码'));
}
</script>

<template>
  <div class="apple-login-wrapper">
    <div class="login-box">
      <h1 class="login-title">欢迎登录</h1>
      <p class="login-subtitle">枕石书屋欢迎您</p>
      <div class="login-form-box" @keyup.enter="handleLogin">
        <div class="login-input-group">
          <label for="username" class="login-input-label">用户名</label>
          <div class="form-group">
            <input id="username" v-model="username" class="input-field" placeholder="请输入用户名" type="text" />
          </div>
        </div>
        <div class="login-input-group">
          <label for="password" class="login-input-label">密码</label>
          <div class="form-group">
            <input id="password" v-model="password" class="input-field" placeholder="••••••••" type="password" />
          </div>
        </div>
        <div class="login-button-group">
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

.login-title {
  margin-top: 0px;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 0px;
  color: #333;
}

.login-subtitle {
  margin-top: 10px;
  font-size: 14px;
  color: #888;
  margin-bottom: 40px;
}

.login-form-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-input-group {
  text-align: left;
}

.login-input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}

.form-group {
  width: 92%;
}

.input-field {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.input-field:focus {
  border-color: #06c;
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
}

.login-button-group {
  display: flex;
  flex-direction: column;
  /* 保持垂直排列 */
  gap: 2px;
  margin-top: 30px;
  align-items: center;
  /* 让各个按钮在垂直方向对齐 */
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
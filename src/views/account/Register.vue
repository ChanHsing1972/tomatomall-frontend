<script setup lang="ts">
import {ref, computed} from 'vue';
import {ElInput, ElButton, ElMessage} from "element-plus";
import {accountRegister} from "../../api/account.ts";
import {useRouter} from 'vue-router';

const router = useRouter();

// 输入框值
const username = ref('');
const name = ref('');
const telephone = ref('');
const location = ref('');
const password = ref('');
const confirmPassword = ref('');
const email = ref('');
const role = ref('CUSTOMER');
const avatar = ref('');

// 校验逻辑
const hasUsernameInput = computed(() => username.value.trim() !== '');
const hasNameInput = computed(() => name.value.trim() !== '');
const hasPasswordInput = computed(() => password.value.trim() !== '');
const hasConfirmPasswordInput = computed(() => confirmPassword.value.trim() !== '');
const isPasswordIdentical = computed(() => password.value === confirmPassword.value);

const telLegal = computed(() => {
  const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/;
  return telephone.value.trim() === '' || chinaMobileRegex.test(telephone.value.trim());
});
const emailLegal = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email.value.trim() === '' || emailRegex.test(email.value.trim());
});

const registerDisabled = computed(() => {
  return !(
      hasUsernameInput.value &&
      hasNameInput.value &&
      hasPasswordInput.value &&
      hasConfirmPasswordInput.value &&
      isPasswordIdentical.value &&
      telLegal.value &&
      emailLegal.value
  );
});

// 注册操作
function handleRegister() {
  accountRegister({
    role: role.value,
    username: username.value.trim(),
    name: name.value.trim(),
    telephone: telephone.value.trim(),
    password: password.value,
    location: location.value.trim(),
    email: email.value.trim(),
    avatar: avatar.value.trim(),
  }).then(res => {
    if (res.data.code === '200') {
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      });
      router.push({path: "/login"});
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      });
    }
  });
}
</script>

<template>
  <div class="register-container">
    <div class="apple-login-wrapper">
      <div class="login-box">
        <h1 class="login-title">创建新账户</h1>
        <p class="login-subtitle">番茄书城欢迎您</p>
        <div class="login-form-box" @keyup.enter="handleRegister">
          <!-- 用户名 -->
          <div class="login-input-group">
            <label for="username" class="login-input-label">
              用户名<span class="required">*</span>
            </label>
            <el-input id="username" v-model="username" placeholder="请输入用户名" class="input-field"/>
          </div>
          <!-- 昵称 -->
          <div class="login-input-group">
            <label for="name" class="login-input-label">
              昵称<span class="required">*</span>
            </label>
            <el-input id="name" v-model="name" placeholder="请输入昵称" class="input-field"/>
          </div>
          <!-- 密码 -->
          <div class="login-input-group">
            <label for="password" class="login-input-label">
              密码<span class="required">*</span>
            </label>
            <el-input id="password" type="password" v-model="password" placeholder="请输入密码" class="input-field"/>
          </div>
          <!-- 确认密码 -->
          <div class="login-input-group">
            <label for="confirmPassword" class="login-input-label">
              确认密码<span class="required">*</span>
            </label>
            <el-input id="confirmPassword" type="password" v-model="confirmPassword" placeholder="请再次输入密码"
                      class="input-field"/>
          </div>
          <!-- 手机号 -->
          <div class="login-input-group">
            <label for="telephone" class="login-input-label">手机号</label>
            <el-input id="telephone" v-model="telephone" placeholder="请输入手机号" class="input-field"/>
          </div>
          <div v-if="telephone && !telLegal" class="error-message">
            手机号格式不正确
          </div>
          <!-- 邮箱 -->
          <div class="login-input-group">
            <label for="email" class="login-input-label">邮箱</label>
            <el-input id="email" v-model="email" placeholder="请输入邮箱" class="input-field"/>
          </div>
          <div v-if="email && !emailLegal" class="error-message">
            邮箱格式不正确
          </div>
          <!-- 地址 -->
          <div class="login-input-group">
            <label for="location" class="login-input-label">地址</label>
            <el-input id="location" v-model="location" placeholder="请输入地址" class="input-field"/>
          </div>
          <!-- 按钮区域 -->
          <div class="login-button-group">
            <el-button type="primary" @click.prevent="handleRegister" :disabled="registerDisabled" class="login-button">
              创建账户
            </el-button>
            <router-link to="/login" custom v-slot="{ navigate }">
              <el-button type="default" @click="navigate" class="register-button">
                去登录
              </el-button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.register-container {
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
    max-width: 400px;
    width: 100%;
    text-align: left;
  }

  .login-title {
    margin-top: 0;
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin-bottom: 0;
    text-align: center;
  }

  .login-subtitle {
    margin-top: 10px;
    font-size: 14px;
    color: #888;
    margin-bottom: 40px;
    text-align: center;
  }

  .login-form-box {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  /* 信息项左右排列 */

  .login-input-group {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .login-input-label {
    margin-left: 10px;
    width: 90px;
    font-size: 14px;
    color: #444;
  }
}

.required {
  color: red;
  margin-left: 2px;
}

.login-input-field {
  flex: 1;
}

/* 自定义输入框样式 */
.login-input-field >>> .el-input__inner {
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.login-input-field >>> .el-input__inner:focus {
  border-color: #0071e3;
}

/* 错误提示 */
.error-message {
  color: red;
  font-size: 12px;
  margin-top: -12px;
  margin-left: 120px;
  margin-bottom: 0;
}

.router-link {
  display: inline-block;
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
<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from "element-plus";
import { ref, computed } from 'vue';
import {accountInfo, accountLogin} from "../../api/account.ts";
import {router} from "../../router";

// 输入框值
const username = ref('');//用户名
const password = ref('');//密码

// 用户名是否为空
const hasUsernameInput = computed(() => username.value.trim() !== '');
// 密码是否为空
const hasPasswordInput = computed(() => password.value.trim() !== '');
// 登录按钮可用性
const loginDisabled = computed(() => {
  return !(hasUsernameInput.value && hasPasswordInput.value);
});

// 登录按钮触发
function handleLogin() {
  console.log("登录按钮被点击了！");
  accountLogin({
    username: username.value.trim(),
    password: password.value
  }).then(res => {
    console.log("登录响应:", res); // 检查是否进入这里
    if (res.data.code === '200') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.result;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', username.value);
      console.log(sessionStorage.getItem('username'));
      // 调用 accountInfo，传入当前登录的用户名
      console.log(token);
      accountInfo(username.value.trim()).then(res => {
        sessionStorage.setItem('name', res.data.result.name);
        sessionStorage.setItem('role', res.data.result.role);
        console.log(res.data);
        router.push({ path: "/home" });
      })

    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = '';
    }
  })
}
</script>

<template>
  <el-main class="main-frame bgimage">
    <el-card class="login-card">
      <div>
        <h1>登录</h1>
        <el-form>
          <el-form-item>
            <label for="username">用户名</label>
            <el-input id="username" type="text" v-model="username"
                      required placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="password">密码</label>
            <el-input id="password" type="password" v-model="password"
                      required
                      placeholder="••••••••"/>
          </el-form-item>

          <span class="button-group">
              <el-button @click.prevent="handleLogin" :disabled="loginDisabled"
                         type="primary">登入</el-button>
              <router-link to="/register" v-slot="{navigate}">
                <el-button @click="navigate">去注册</el-button>
              </router-link>
          </span>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>

<style scoped>
.main-frame {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.bgimage {
  background-image: url("../../assets/pattern.svg");
}

.login-card {
  width: 60%;
  padding: 20px;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}
</style>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
import { accountRegister } from "../../api/account.ts";
import { useRouter } from 'vue-router';

const router = useRouter();

// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const username = ref(''); // 用户名
const name = ref(''); // 昵称
const telephone = ref(''); // 电话号码
const location = ref(''); // 地址
const password = ref(''); // 密码
const confirmPassword = ref(''); // 确认密码
const email = ref(''); // 邮箱
const role = ref('CUSTOMER'); // 身份，默认为顾客
const avatar = ref('');//头像

// 用户名是否为空
const hasUsernameInput = computed(() => username.value.trim() !== '');
// 昵称是否为空
const hasNameInput = computed(() => name.value.trim() !== '');
// 电话号码是否为空
const hasTelInput = computed(() => telephone.value.trim() !== '');
// 密码是否为空
const hasPasswordInput = computed(() => password.value.trim() !== '');
// 重复密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value.trim() !== '');
// 地址是否为空
const hasEmailInput = computed(() => email.value.trim() !== '');
// 电话号码的规则
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/;
const telLegal = computed(() => chinaMobileRegex.test(telephone.value));
// 邮箱的规则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailLegal = computed(() => emailRegex.test(email.value));
// 重复密码的规则
const isPasswordIdentical = computed(() => password.value === confirmPassword.value);
// 注册按钮可用性
const registerDisabled = computed(() => {
  return !(
      hasUsernameInput.value &&
      hasPasswordInput.value &&
      hasConfirmPasswordInput.value &&
      isPasswordIdentical.value &&
      hasNameInput.value &&// 添加昵称校验
      ((hasEmailInput.value && emailLegal.value) || !hasEmailInput.value) &&
      ((hasTelInput.value && telLegal.value) || !hasTelInput.value)
  );
});

// 注册按钮触发
function handleRegister() {
  accountRegister({
    role: role.value, // 根据选择的身份注册
    username: username.value.trim(),
    name: name.value.trim(),
    telephone: telephone.value.trim(),
    password: password.value.trim(),
    location: location.value.trim(),
    email: email.value.trim(),
    avatar: avatar.value.trim(),
  }).then(res => {
    if (res.data.code === '200') {  // 类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      });
      router.push({ path: "/login" });
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
  <el-main class="main-frame bgimage">
    <el-card class="login-card" @keyup.enter="handleRegister">
      <div>
        <h1>创建新账户</h1>
        <el-form>
          <el-row>
            <el-col :span="24">
              <el-form-item label="用户名" label-width="80px" required>
                <el-input id="username" v-model="username" placeholder="请输入用户名" class="input-width" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="昵称" label-width="80px" required>
                <el-input id="name" v-model="name" placeholder="请输入昵称" class="input-width" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="密码" label-width="80px" required>
                <el-input type="password" id="password" v-model="password" placeholder="请输入密码" class="input-width" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="确认密码" label-width="80px" required>
                <el-input type="password" id="confirm-password"
                          v-model="confirmPassword"
                          :class="['input-width', { 'error-warn-input': (hasConfirmPasswordInput && !isPasswordIdentical) }]"
                          placeholder="请再次输入密码" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="身份" label-width="80px" required>
                <el-select v-model="role" placeholder="请选择身份" class="input-width">
                  <el-option label="顾客" value="CUSTOMER" />
                  <el-option label="管理员" value="ADMIN" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="地址" label-width="80px">
                <el-input id="address" v-model="location" placeholder="请输入地址（非必填）" class="input-width" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="手机号" label-width="80px">
                <el-input id="tel"
                          v-model="telephone" :class="{'error-warn-input': (hasTelInput && !telLegal)}"
                          placeholder="请输入手机号（非必填）" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="邮箱" label-width="80px">
                <el-input id="email"
                          v-model="email" :class="{'error-warn-input' :(hasEmailInput && !emailLegal)}"
                          placeholder="请输入邮箱（非必填）" />
              </el-form-item>
            </el-col>
          </el-row>
          <span class="button-group">
            <el-button @click.prevent="handleRegister"
                       :disabled="registerDisabled"
                       type="primary">
              创建账户
            </el-button>
            <router-link to="/login" v-slot="{navigate}">
              <el-button @click="navigate">
                去登录
              </el-button>
            </router-link>
          </span>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>

<style>
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
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.input-width {
  width: 100%; /* 统一输入框宽度 */
}

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-border-color: red;
  --el-input-hover-border-color: red;
  --el-input-focus-border-color: red;
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
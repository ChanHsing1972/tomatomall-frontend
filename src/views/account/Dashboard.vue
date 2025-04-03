<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { accountInfo, accountInfoUpdate } from '../../api/account.ts'
import { parseRole, parseTime } from "../../utils"
import { router } from '../../router'
import Header from "../../components/Header.vue"
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from "@element-plus/icons-vue"

const role = sessionStorage.getItem("role") || 'CUSTOMER'
const name = ref('')
const username = sessionStorage.getItem("username") || '默认用户名'
const telephone = ref('')
const location = ref('')
const createTime = ref('')
const email = ref('')

const newName = ref('')
const newEmail = ref('')
const newLocation = ref('')

const showInfoEdit = ref(true) // true：编辑个人信息；false：修改密码

const password = ref('')
const confirmPassword = ref('')

const hasConfirmPasswordInput = computed(() => confirmPassword.value !== '')
const isPasswordIdentical = computed(() => password.value === confirmPassword.value)
const changeDisabled = computed(() => !(hasConfirmPasswordInput.value && isPasswordIdentical.value))

function getUserInfo() {
  accountInfo(username).then(res => {
    const result = res.data.result
    name.value = result.name
    telephone.value = result.telephone
    location.value = result.location
    createTime.value = parseTime(result.createTime)
    email.value = result.email
    newName.value = name.value
  })
}

onMounted(() => { 
  getUserInfo() 
})

function updateInfo() {
  accountInfoUpdate({
    name: newName.value,
    location: newLocation.value,
    email: newEmail.value,
  }).then(res => {
    if (res.data.code === '200') {
      ElMessage({
        customClass: 'customMessage',
        type: 'success',
        message: '更新成功！',
      })
      getUserInfo()
    } else if (res.data.code === '400') {
      ElMessage({
        customClass: 'customMessage',
        type: 'error',
        message: res.data.msg,
      })
    }
  })
}

function updatePassword() {
  accountInfoUpdate({
    name: undefined,
    password: password.value,
    location: undefined
  }).then(res => {
    if (res.data.code === '200') {
      password.value = ''
      confirmPassword.value = ''
      ElMessageBox.alert(
        `请重新登录`,
        '修改成功',
        {
          customClass: "customDialog",
          confirmButtonText: '跳转到登录',
          type: "success",
          showClose: false,
          roundButton: true,
          center: true
        }
      ).then(() => router.push({ path: "/login" }))
    } else if (res.data.code === '400') {
      ElMessage({
        customClass: 'customMessage',
        type: 'error',
        message: res.data.msg,
      })
      password.value = ''
      confirmPassword.value = ''
    }
  })
}

const goToManagement = () => {
  router.push({ path: '/management' });
};
</script>

<template>
  <Header />
  <div class="dashboard-container">
    <!-- 左侧：完整用户信息展示卡片 -->
    <div class="user-summary">
      <div class="header-info">
        <el-avatar class="user-avatar" :icon="UserFilled" :size="80" />
        <div class="welcome-name">
          <span class="welcome-text">欢迎回来,</span>
          <span class="user-name">{{ name }}</span>
        </div>
      </div>
      <div class="info-details">
        <div class="info-item">
          <div class="info-label">身份</div>
          <div class="info-value">{{ parseRole(role) }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">用户名</div>
          <div class="info-value">{{ username }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">注册时间</div>
          <div class="info-value">{{ createTime }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">联系电话</div>
          <div class="info-value">{{ telephone }}</div>
        </div>

        <div class="info-item" v-if="role === 'CUSTOMER'">
          <div class="info-label">地址</div>
          <div class="info-value">{{ location }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">邮箱</div>
          <div class="info-value">{{ email }}</div>
        </div>

        <div v-if="role === 'MANAGER'" class="management-btn">
          <el-button class="button" type="primary" @click="goToManagement">管理商场</el-button>
        </div>
      </div>

    </div>
    <!-- 右侧：编辑/修改表单区域 -->
    <div class="edit-section">
      <div class="tab-bar">
        <div class="tab-item" :class="{ active: showInfoEdit }" @click="showInfoEdit = true">
          个人信息
        </div>
        <div class="tab-item" :class="{ active: !showInfoEdit }" @click="showInfoEdit = false">
          修改密码
        </div>
      </div>
      <div v-if="showInfoEdit" class="form-container">
        <el-form label-position="top">
          <el-form-item label="昵称">
            <el-input v-model="newName" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="telephone" disabled />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="newEmail" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item v-if="role === 'CUSTOMER' || role === 'STAFF'" label="收货地址">
            <el-input type="textarea" v-model="newLocation" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item>
            <el-button class="button" @click="updateInfo">更新资料</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="form-container">
        <el-form label-position="top">
          <el-form-item label="新密码">
            <el-input type="password" v-model="password" placeholder="••••••••" />
          </el-form-item>
          <el-form-item :label="hasConfirmPasswordInput && !isPasswordIdentical ? '密码不一致' : '确认新密码'">
            <el-input type="password" v-model="confirmPassword" placeholder="••••••••" :class="{'error-warn-input': hasConfirmPasswordInput && !isPasswordIdentical}" />
          </el-form-item>
          <el-form-item>
            <el-button class="button" @click="updatePassword" :disabled="changeDisabled">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 修改后的 dashboard-container */
.dashboard-container {
  margin-left: 10%;
  padding: 100px;           /* 增大整体内边距 */
  display: flex;
  gap: 20px;                /* 增加左右两侧卡片之间的间距 */
  font-family: "Segoe UI", Helvetica, "PingFang SC", sans-serif;
  color: #333;

}

/* 修改后的左侧：用户信息展示卡片 */
.user-summary {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 60px 50px 250px;       /* 增大内边距 */
  flex: 1 1 40%;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 保持 header-info 样式不变 */
.header-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.welcome-name {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 16px;
  color: #777;
}

.user-name {
  font-size: 24px;
  color: #333;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 20px;               /* 增大每项间距 */
  margin-left: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 0px;      /* 稍微增加间距 */
}

.info-value {
  font-size: 16px;
  color: #555;
}

/* 修改右侧：编辑区域 */
.edit-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 60px;           /* 保持足够的内边距 */
  flex: 1 1 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-right: 12%;
}

/* 修改 Tab 栏 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 40px;
  gap: 30px;               /* 为切换按钮增加间距 */
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  font-size: 18px;
  color: #555;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.tab-item.active {
  border-bottom: 2px solid #333;
  color: #333;
}

/* 修改表单区域 */
.form-container {
  max-width: 600px;       /* 限制表单宽度 */
}

/* 调整每个表单项间距 */
.el-form-item {
  margin-bottom: 28px;     /* 稍大一些 */
}

/* 错误输入样式保持不变 */
.error-warn-input {
  --el-input-border-color: red;
  --el-input-hover-border-color: red;
  --el-input-focus-border-color: red;
}

.button {
  margin-top: 10px;
}

/* Responsive adjustments 保持一致 */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
    margin: 60px auto;
    padding: 20px;
    gap: 20px;
  }
  .user-summary, .edit-section {
    flex: none;
  }
  .form-container {
    max-width: 100%;
  }
}
</style>
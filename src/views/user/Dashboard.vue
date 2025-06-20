<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {accountInfo, accountInfoUpdate} from "../../api/account.ts";
import {parseRole, parseTime} from "../../utils";
import {useRouter} from "vue-router";
import Header from "../../components/Header.vue";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";
import {Camera, UserFilled} from "@element-plus/icons-vue";

const router = useRouter();
const role = sessionStorage.getItem("role") || "user";
const name = ref("");
const username = sessionStorage.getItem("username") || "游客";
const telephone = ref("");
const location = ref("");
const createTime = ref("");
const email = ref("");
const avatar = ref(""); // 用于存储头像的 URL

// 新建的变量
const newName = ref("");
const newEmail = ref("");
const newLocation = ref("");
const newTelephone = ref("");

const showInfoEdit = ref(true); // true：编辑个人信息；false：修改密码

const password = ref("");
const confirmPassword = ref("");

const hasConfirmPasswordInput = computed(() => confirmPassword.value !== "");
const isPasswordIdentical = computed(() => password.value === confirmPassword.value);
const changeDisabled = computed(
    () => !(hasConfirmPasswordInput.value && isPasswordIdentical.value)
);

function getUserInfo() {
  accountInfo(username).then((res) => {
    const result = res.data.data;
    name.value = result.name;
    telephone.value = result.telephone;
    location.value = result.location;
    avatar.value = result.avatar;
    createTime.value = parseTime(result.createTime);
    email.value = result.email;
    newName.value = name.value;
    newEmail.value = email.value;
    newLocation.value = location.value;
    newTelephone.value = telephone.value;
  });
}

onMounted(() => {
  getUserInfo();
});

function updateInfo() {
  accountInfoUpdate({
    name: newName.value,
    location: newLocation.value,
    telephone: newTelephone.value,
    email: newEmail.value,
  }).then((res) => {
    if (res.data.code === "200") {
      ElMessage({
        customClass: "customMessage",
        type: "success",
        message: "更新成功！",
      });
      getUserInfo();
    } else if (res.data.code === "401") {
      ElMessage({
        customClass: "customMessage",
        type: "error",
        message: res.data.msg,
      });
    }
  });
}

function updatePassword() {
  accountInfoUpdate({
    name: undefined,
    password: password.value,
    location: undefined,
    avatar: undefined,
  }).then((res) => {
    if (res.data.code === "200") {
      password.value = "";
      confirmPassword.value = "";
      ElMessageBox.alert(`请重新登录`, "修改成功", {
        customClass: "customDialog",
        confirmButtonText: "跳转到登录",
        type: "success",
        showClose: false,
        roundButton: true,
        center: true,
      }).then(() => router.push({path: "/login"}));
    } else if (res.data.code === "401") {
      ElMessage({
        customClass: "customMessage",
        type: "error",
        message: res.data.msg,
      });
      password.value = "";
      confirmPassword.value = "";
    }
  });
}

const handleAvatarSuccess = (res: any) => {
  if (res.code === "200") {
    avatar.value = res.data;
    accountInfoUpdate({
      avatar: res.data,
    }).then((res) => {
      if (res.data.code === "200") {
        ElMessage({
          type: "success",
          message: "头像更新成功！",
          duration: 1000
        });
        getUserInfo();
      } else if (res.data.code === "401") {
        ElMessage({
          customClass: "customMessage",
          type: "error",
          message: res.data.msg,
          duration: 1000
        });
      }
    });
  } else {
    ElMessage.error("上传失败");
  }
};


const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('图片大小需要小于 10 MB!')
    return false
  }
  avatar.value = URL.createObjectURL(rawFile);
  return true
}

const goToManagement = () => {
  router.push({path: "/manage/products"});
};

const goToAd = () => {
  router.push({path: "/manage/ads"});
};

const goToCouponManagement = () => {
  router.push({path: "/manage/coupons"});
};
</script>

<template>
  <Header/>
  <div class="dashboard-container">
    <!-- 左侧：完整用户信息展示卡片 -->
    <div class="user-summary">
      <div class="header-info">
        <el-upload :show-file-list="false" action="http://138.68.21.119:8080/api/files/images" class="avatar-uploader"
                   :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
          <div class="avatar-container">
            <img v-if="avatar" :src="avatar" alt="avatar" class="user-avatar">
            <el-avatar v-else :icon="UserFilled" :size="80" class="user-avatar"/>
            <div class="avatar-overlay">
              <div class="upload-icon">
                <el-icon class="upload-icon">
                  <Camera/>
                </el-icon>
              </div>
            </div>
          </div>
        </el-upload>
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
          <div class="info-value">{{ createTime.substring(0, 10) }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">联系电话</div>
          <div class="info-value">{{ telephone }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">地址</div>
          <div class="info-value">{{ location }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">邮箱</div>
          <div class="info-value">{{ email }}</div>
        </div>

        <div v-if="role === 'admin'" class="management-btn-container">
          <button class="management-btn" @click="goToManagement">管理商品</button>
          <button class="management-btn" @click="goToAd">管理广告</button>
          <button class="management-btn" @click="goToCouponManagement">管理优惠券</button>
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
        <form class="custom-form" @submit.prevent="updateInfo">
          <div class="form-group">
            <label for="name">昵称</label>
            <input id="name" v-model="newName" placeholder="请输入昵称" type="text">
          </div>
          <div class="form-group">
            <label for="telephone">联系电话</label>
            <input id="telephone" v-model="newTelephone" placeholder="请输入手机号" type="tel">
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input id="email" v-model="newEmail" placeholder="请输入邮箱" type="email">
          </div>
          <div class="form-group">
            <label for="location">收货地址</label>
            <textarea id="location" v-model="newLocation" placeholder="请输入地址" rows="4"></textarea>
          </div>
          <div class="form-submit">
            <button class="submit-btn" type="submit">更新资料</button>
          </div>
        </form>
      </div>
      <div v-else class="form-container">
        <form class="custom-form" @submit.prevent="updatePassword">
          <div class="form-group">
            <label for="password">新密码</label>
            <input id="password" v-model="password" placeholder="••••••••" type="password">
          </div>
          <div class="form-group">
            <label :class="{ 'error-label': hasConfirmPasswordInput && !isPasswordIdentical }" for="confirmPassword">
              {{ hasConfirmPasswordInput && !isPasswordIdentical ? '密码不一致' : '确认新密码' }}
            </label>
            <input id="confirmPassword" v-model="confirmPassword"
                   :class="{ 'error-input': hasConfirmPasswordInput && !isPasswordIdentical }" placeholder="••••••••"
                   type="password">
          </div>
          <div class="form-submit">
            <button :disabled="changeDisabled" class="submit-btn" type="submit">修改密码</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 修改后的 dashboard-container */
.dashboard-container {
  margin-left: 10%;
  padding: 100px;
  display: flex;
  gap: 40px;
  font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

/* 修改后的左侧：用户信息展示卡片 */
.user-summary {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 60px 50px 100px;
  flex: 1 1 40%;
  text-align: left;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* 保持 header-info 样式不变 */
.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.welcome-name {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 14px;
  color: #777;
}

.user-name {
  font-size: 24px;
  color: #333;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-left: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 0;
}

.info-value {
  font-size: 16px;
  color: #555;
}

/* 修改右侧：编辑区域 */
.edit-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 60px;
  flex: 1 1 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-right: 12%;
}

/* 修改 Tab 栏 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 40px;
  gap: 30px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  font-size: 18px;
  color: #555;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.tab-item.active {
  border-bottom: 2px solid #06c;
  color: #06c;
  font-weight: 500;
}

/* 自定义表单和输入框样式 */
.custom-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.error-label {
  color: #ff3b30;
}

.form-group input,
.form-group textarea {
  padding: 12px 15px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #06c;
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
}

.error-input {
  border-color: #ff3b30;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.15);
}

/* 提交按钮样式 - 与ContactUs保持一致 */
.form-submit {
  margin-top: 10px;
}

.submit-btn {
  background: rgb(0, 113, 227);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: rgb(64, 158, 255);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 管理按钮容器 - 垂直居中排列 */
.management-btn-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
  align-items: center;
}

/* 管理按钮样式 */
.management-btn {
  width: 100%;
  background-color: #f5f5f7;
  color: #444;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.management-btn:hover {
  background-color: rgba(0, 102, 204, 0.1);
  border-color: #06c;
  box-shadow: 0 5px 15px rgba(0, 102, 204, 0.15);
}

.avatar-uploader {
  position: relative;
  cursor: pointer;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-container:hover .user-avatar {
  filter: brightness(0.7);
}

.upload-icon {
  font-size: 24px;
  color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
    margin: 60px auto;
    padding: 20px;
    gap: 20px;
  }

  .user-summary,
  .edit-section {
    flex: none;
  }

  .custom-form {
    max-width: 100%;
  }

  .management-btn {
    width: 100%;
  }
}
</style>

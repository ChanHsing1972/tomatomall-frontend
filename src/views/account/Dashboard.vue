<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {accountInfo, accountInfoUpdate} from "../../api/account.ts";
import {parseRole, parseTime} from "../../utils";
import {useRouter} from "vue-router";
import Header from "../../components/Header.vue";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";
import {UserFilled} from "@element-plus/icons-vue";

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
  router.push({path: "/management"});
};

const goToAd = () => {
  router.push({path: "/ad"});
};
</script>

<template>
  <Header/>
  <div class="dashboard-container">
    <!-- 左侧：完整用户信息展示卡片 -->
    <div class="user-summary">
      <div class="header-info">
        <el-upload :show-file-list="false" action="http://68.183.236.32/api/files/images" class="avatar-uploader"
                   :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
          <div class="avatar-container">
            <img v-if="avatar" :src="avatar" alt="avatar" class="user-avatar">
            <el-avatar v-else :icon="UserFilled" :size="80" class="user-avatar"/>
            <div class="avatar-overlay">
              <div class="upload-icon">📷</div>
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
          <div class="info-value">{{ createTime }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">联系电话</div>
          <div class="info-value">{{ telephone }}</div>
        </div>

        <div class="info-item" v-if="role === 'user'">
          <div class="info-label">地址</div>
          <div class="info-value">{{ location }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">邮箱</div>
          <div class="info-value">{{ email }}</div>
        </div>

        <div v-if="role === 'admin'" class="management-btn">
          <el-button class="button" type="primary" @click="goToManagement">管理商场</el-button>
          <el-button class="button" type="primary" @click="goToAd">管理广告</el-button>
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
            <el-input v-model="newName" placeholder="请输入昵称"/>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="newTelephone" placeholder="请输入手机号"/>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="newEmail" placeholder="请输入邮箱"/>
          </el-form-item>
          <el-form-item v-if="role === 'user'" label="收货地址">
            <el-input type="textarea" v-model="newLocation" placeholder="请输入地址"/>
          </el-form-item>
          <el-form-item>
            <el-button class="button" @click="updateInfo">更新资料</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="form-container">
        <el-form label-position="top">
          <el-form-item label="新密码">
            <el-input v-model="password" placeholder="••••••••" show-password type="password"/>
          </el-form-item>
          <el-form-item :label="hasConfirmPasswordInput && !isPasswordIdentical
            ? '密码不一致'
            : '确认新密码'
            ">
            <el-input type="password" v-model="confirmPassword" placeholder="••••••••" :class="{
              'error-warn-input': hasConfirmPasswordInput && !isPasswordIdentical,
            }" show-password/>
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
  padding: 100px;
  /* 增大整体内边距 */
  display: flex;
  gap: 20px;
  /* 增加左右两侧卡片之间的间距 */
  font-family: "Segoe UI", Helvetica, "PingFang SC", sans-serif;
  color: #333;
}

/* 修改后的左侧：用户信息展示卡片 */
.user-summary {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 60px 50px 250px;
  /* 增大内边距 */
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
  gap: 20px;
  /* 增大每项间距 */
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
  /* 稍微增加间距 */
}

.info-value {
  font-size: 16px;
  color: #555;
}

/* 修改右侧：编辑区域 */
.edit-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 60px;
  /* 保持足够的内边距 */
  flex: 1 1 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-right: 12%;
}

/* 修改 Tab 栏 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 40px;
  gap: 30px;
  /* 为切换按钮增加间距 */
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
  max-width: 600px;
  /* 限制表单宽度 */
}

/* 调整每个表单项间距 */
.el-form-item {
  margin-bottom: 28px;
  /* 稍大一些 */
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
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  color: white;
  text-align: center;
  line-height: 1.2;
}

/* Responsive adjustments 保持一致 */
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

  .form-container {
    max-width: 100%;
  }
}
</style>

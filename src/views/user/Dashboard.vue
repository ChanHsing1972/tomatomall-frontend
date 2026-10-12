<script setup lang="ts">
import { onMounted, ref } from "vue";
import { accountInfo, accountInfoUpdate } from "../../api/account.ts";
import { parseRole } from "../../utils";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import { ElMessage, UploadProps } from "element-plus";
import { UserFilled, Camera, CreditCard, ArrowRight } from "@element-plus/icons-vue";

const router = useRouter();
const uploadHeaders = { token: sessionStorage.getItem("token") || "" };
const role = sessionStorage.getItem("role") || "user";
const username = sessionStorage.getItem("username") || "游客";
const sharedDemo = username === "demo";

// 数据状态
const name = ref("");
const telephone = ref("");
const location = ref("");
const email = ref("");
const avatar = ref("");
const isEditing = ref(false);

// 表单状态
const editForm = ref({
  name: "",
  email: "",
  location: "",
  telephone: "",
  password: "",
  confirmPassword: ""
});

function getUserInfo() {
  accountInfo(username).then((res) => {
    const result = res.data.data;
    name.value = result.name;
    telephone.value = result.telephone;
    location.value = result.location;
    avatar.value = result.avatar;
    email.value = result.email;

    // 同步到编辑表单
    editForm.value = { ...editForm.value, ...result, password: "", confirmPassword: "" };
  });
}

onMounted(getUserInfo);

const saveChanges = async () => {
  if (editForm.value.password && editForm.value.password !== editForm.value.confirmPassword) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }

  accountInfoUpdate({
    name: editForm.value.name,
    location: editForm.value.location,
    telephone: editForm.value.telephone,
    email: editForm.value.email,
    password: editForm.value.password || undefined
  }).then((res) => {
    if (res.data.code === "200") {
      ElMessage.success("设置已更新");
      isEditing.value = false;
      getUserInfo();
    }
  });
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (res) => {
  if (res.code === "200") {
    avatar.value = res.data;
    accountInfoUpdate({ avatar: res.data }).then(() => {
      ElMessage.success("头像更新成功");
      getUserInfo();
    });
  }
};
</script>

<template>
  <Header />
  <div class="apple-bg">
    <div class="apple-container">
      <div class="apple-layout">
        <main class="apple-main">

          <div class="profile-summary-row">
            <div class="content-column">
              <div class="profile-header">
                <el-upload class="avatar-uploader" action="/api/files/images" :headers="uploadHeaders" :show-file-list="false"
                  :on-success="handleAvatarSuccess" :disabled="sharedDemo">
                  <div class="avatar-circle">
                    <img v-if="avatar" :src="avatar" class="avatar-img" />
                    <el-avatar v-else :icon="UserFilled" :size="72" />
                    <div class="avatar-overlay"><el-icon>
                        <Camera />
                      </el-icon></div>
                  </div>
                </el-upload>
                <div class="profile-text">
                  <div class="display-name">{{ name || username }}</div>
                  <div class="display-role">{{ parseRole(role) }}</div>
                </div>
              </div>
            </div>
          </div>

          <transition name="fade" mode="out-in">
            <div v-if="!isEditing" class="content-body">

              <section class="apple-row">
                <div class="label-column">送货</div>
                <div class="content-column">
                  <div class="info-split">
                    <div class="info-block">
                      <div class="sub-label">送货地址</div>
                      <div class="address-text">
                        <p class="name-line">{{ name }}</p>
                        <p v-for="(line, index) in (location || '').split('\n')" :key="index">{{ line }}</p>
                        <p class="phone-line">{{ telephone }}</p>
                      </div>
                      <a v-if="!sharedDemo" class="edit-link" @click="isEditing = true"><u>编辑</u></a>
                    </div>
                    <div class="info-block">
                      <div class="sub-label">联系信息</div>
                      <div class="address-text">
                        <p>{{ email }}</p>
                        <p>{{ telephone }}</p>
                      </div>
                      <a v-if="!sharedDemo" class="edit-link" @click="isEditing = true"><u>编辑</u></a>
                    </div>
                  </div>
                </div>
              </section>

              <section class="apple-row">
                <div class="label-column">付款与账单</div>
                <div class="content-column">
                  <div class="info-block">
                    <div class="sub-label">付款方式</div>
                    <div class="payment-card">
                      <el-icon class="payment-icon">
                        <CreditCard />
                      </el-icon>
                      <span class="payment-desc">支付宝</span>
                    </div>
                    <a class="apple-link mt-8">管理付款方式 <el-icon>
                        <ArrowRight />
                      </el-icon></a>
                  </div>
                </div>
              </section>

              <section class="apple-row">
                <div class="label-column">隐私</div>
                <div class="content-column">
                  <div class="sub-label">个人信息</div>
                  <p class="apple-desc">你可以自己掌控你的个人信息，并可随时管理你的数据或删除你的账户。枕石书屋致力于保护你的隐私。</p>
                  <a class="apple-link">管理我的个人信息 <el-icon class="arrow-icon">
                      <ArrowRight />
                    </el-icon></a>
                </div>
              </section>


              <section v-if="role === 'admin'" class="apple-row admin-border">
                <div class="label-column">管理</div>
                <div class="content-column">
                  <div class="admin-links">
                    <button class="admin-btn" @click="router.push('/manage/products')">管理产品 <el-icon>
                        <ArrowRight />
                      </el-icon></button>
                    <button class="admin-btn" @click="router.push('/manage/ads')">管理广告 <el-icon>
                        <ArrowRight />
                      </el-icon></button>
                    <button class="admin-btn" @click="router.push('/manage/coupons')">管理优惠券 <el-icon>
                        <ArrowRight />
                      </el-icon></button>
                  </div>
                </div>
              </section>
            </div>

            <div v-else class="content-body">
              <section class="apple-row">
                <div class="label-column">编辑账户</div>
                <div class="content-column">
                  <div class="edit-grid">
                    <div class="field">
                      <label>姓名</label>
                      <input v-model="editForm.name" class="apple-input" type="text" />
                    </div>
                    <div class="field">
                      <label>联系电话</label>
                      <input v-model="editForm.telephone" class="apple-input" type="text" />
                    </div>
                    <div class="field full">
                      <label>电子邮箱</label>
                      <input v-model="editForm.email" class="apple-input" type="text" />
                    </div>
                    <div class="field full">
                      <label>送货地址</label>
                      <textarea v-model="editForm.location" class="apple-input apple-textarea" rows="3"></textarea>
                    </div>
                    <div class="field">
                      <label>新密码</label>
                      <input v-model="editForm.password" class="apple-input" type="password" placeholder="••••••••" />
                    </div>
                    <div class="field">
                      <label>确认新密码</label>
                      <input v-model="editForm.confirmPassword" class="apple-input" type="password"
                        placeholder="••••••••" />
                    </div>
                  </div>
                  <div class="edit-actions">
                    <button class="btn-secondary" @click="isEditing = false">取消</button>
                    <button class="btn-primary" @click="saveChanges">保存</button>
                  </div>
                </div>
              </section>
            </div>
          </transition>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 核心设计基础 */
.apple-bg {
  background-color: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  padding-top: 60px;
  color: #1d1d1f;
}

.apple-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 22px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 50px;
}

/* 核心对齐布局：模拟苹果样式 */
.apple-row {
  display: flex;
  padding: 30px 0;
  border-top: 1px solid #d2d2d7;
}

.no-border {
  border-top: none;
}

.admin-border {
  border-top: 1px solid #d2d2d7;
  margin-top: 20px;
}

.label-column {
  width: 30%;
  /* 左侧标签固定宽度 */
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.content-column {
  flex: 1;
}

/* 顶部个人简况对齐 */
.profile-summary-row {
  display: flex;
  margin-bottom: 30px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: #f5f5f7;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-circle:hover .avatar-overlay {
  opacity: 1;
}

.display-name {
  font-size: 26px;
  font-weight: 600;
}

.display-role {
  font-size: 13px;
  color: #86868b;
}

/* 内容详情样式 */
.info-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.sub-label {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 8px;
  font-weight: 400;
}

.address-text {
  font-size: 15px;
  line-height: 1.6;
}

.address-text p {
  margin: 0;
}

.name-line {
  font-weight: 500;
}

.edit-link {
  display: inline-block;
  font-size: 15px;
  color: #0066cc;
  margin-top: 10px;
  cursor: pointer;
}

.apple-desc {
  font-size: 15px;
  line-height: 1.5;
  margin: 10px 0;
  color: #1d1d1f;
}

.apple-link {
  color: #0066cc;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.arrow-icon {
  margin-left: 4px;
  font-size: 12px;
}

/* Apple ID 区域 */
.apple-id-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.email-text {
  font-size: 15px;
}

.icon-bar {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.app-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f5f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
}

/* 编辑表单修复 */
.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 600px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: 1 / span 2;
}

.field label {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 6px;
}

/* 高亮渐变边框效果 */
.apple-input {
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}

.apple-textarea {
  resize: none;
}

/* 修复输入框高亮效果：渐变蓝色光晕 */
.apple-input:focus {
  border-color: #0071e3;
  /* 使用多层 box-shadow 模拟渐变深度的蓝色光晕 */
  box-shadow: 0 0 0 1px #0071e3, 0 0 0 4px rgba(0, 113, 227, 0.15);
}

.edit-actions {
  margin-top: 40px;
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: #0071e3;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f7;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
}

/* 管理员按钮 */
.admin-label {
  color: #86868b;
  font-size: 12px;
  text-transform: uppercase;
}

.admin-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 320px;
  background: none;
  border: 1px solid #d2d2d7;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.admin-btn:hover {
  background: #f9f9f9;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 800px) {

  .apple-row,
  .profile-summary-row {
    flex-direction: column;
  }

  .label-column {
    margin-bottom: 12px;
    font-size: 18px;
  }

  .info-split,
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  margin-bottom: 8px;
}

.payment-icon {
  font-size: 20px;
  color: #86868b;
}
</style>
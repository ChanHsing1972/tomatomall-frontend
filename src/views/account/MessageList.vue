<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {getRecentChats, sendMessage} from '../../api/message';
import Header from '../../components/Header.vue';
import {ElMessage} from 'element-plus';
import {accountInfo, getAllUsers} from '../../api/account';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

const router = useRouter();
const chats = ref<any[]>([]);
const loading = ref(false);
const currentUserId = sessionStorage.getItem('id');
const currentUserRole = sessionStorage.getItem('role');

// 新建对话相关
const searchDialogVisible = ref(false);
const user = ref<User | null>(null);
const searchKeyword = ref('');
const searchLoading = ref(false);

// 群发消息相关
const broadcastDialogVisible = ref(false);
const broadcastMessage = ref('');
const broadcastLoading = ref(false);
const userList = ref<User[]>([]);

// 获取最近聊天列表
const fetchRecentChats = async () => {
  loading.value = true;
  try {
    const res = await getRecentChats();
    if (res.code === '200') {
      chats.value = res.data;
      console.log('最近聊天列表:', chats.value);
    } else {
      ElMessage.error('获取聊天列表失败');
    }
  } catch (error) {
    console.error('获取聊天列表失败:', error);
    ElMessage.error('获取聊天列表失败');
  } finally {
    loading.value = false;
  }
};

// 生成标准化的对话ID
const generateConversationId = (user1Id: string, user2Id: string) => {
  // 将两个用户ID排序后组合，确保无论谁发起对话，ID都一样
  const sortedIds = [user1Id, user2Id].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// 打开对话
const openConversation = (chat: any) => {
  const conversationId = generateConversationId(chat.receiverId, chat.senderId);
  router.push(`/messages/conversation/${conversationId}`);
};

// 获取与当前用户对话的另一方的名称
const getOtherUserName = (chat: any) => {
  return chat.senderId === currentUserId ? chat.receiverName : chat.senderName;
};

// 获取与当前用户对话的另一方的头像
const getOtherUserAvatar = (chat: any) => {
  return chat.senderId === currentUserId ? chat.receiverAvatar : chat.senderAvatar;
};

// 打开搜索用户对话框
const openSearchUserDialog = () => {
  searchDialogVisible.value = true;
};

// 关闭搜索对话框
const closeSearchDialog = () => {
  searchDialogVisible.value = false;
  searchKeyword.value = '';
  user.value = null;
};

// 搜索用户
const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入用户名');
    return;
  }

  searchLoading.value = true;
  try {
    const res = await accountInfo(searchKeyword.value);
    console.log('搜索结果:', res);
    if (res.data.code === '200') {
      user.value = res.data.data;
      console.log(user.value)
    } else {
      ElMessage.error('未找到匹配的用户');
    }
  } catch (error) {
    console.error('搜索用户失败', error);
    ElMessage.error('搜索用户失败');
  } finally {
    searchLoading.value = false;
  }
};

// 开始对话 
const startConversation = (userId: string) => {
  const conversationId = generateConversationId(currentUserId!, userId);
  router.push(`/messages/conversation/${conversationId}`);
  closeSearchDialog();
};

// 获取所有用户列表
const fetchAllUsers = async () => {
  try {
    const res = await getAllUsers();
    if (res.data.code === '200') {
      // 过滤掉当前管理员自己
      userList.value = res.data.data.filter((u: User) => u.id !== currentUserId);
    } else {
      ElMessage.error('获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  }
};

// 打开群发消息对话框
const openBroadcastDialog = async () => {
  broadcastDialogVisible.value = true;
  await fetchAllUsers();
};

// 关闭群发消息对话框
const closeBroadcastDialog = () => {
  broadcastDialogVisible.value = false;
  broadcastMessage.value = '';
};

// 发送群发消息
const sendBroadcastMessage = async () => {
  if (!broadcastMessage.value.trim()) {
    ElMessage.warning('消息内容不能为空');
    return;
  }

  broadcastLoading.value = true;
  let successCount = 0;
  let failCount = 0;

  try {
    // 向所有用户发送消息
    const promises = userList.value.map(async (user) => {
      try {
        await sendMessage(Number(user.id), broadcastMessage.value);
        successCount++;
      } catch (error) {
        console.error(`发送给用户 ${user.name} 失败:`, error);
        failCount++;
      }
    });

    await Promise.all(promises);

    if (successCount > 0) {
      ElMessage.success(`群发消息成功！已发送给 ${successCount} 位用户${failCount > 0 ? `，${failCount} 位用户发送失败` : ''}`);
      closeBroadcastDialog();
      // 刷新聊天列表
      await fetchRecentChats();
    } else {
      ElMessage.error('群发消息失败');
    }
  } catch (error) {
    console.error('群发消息失败:', error);
    ElMessage.error('群发消息失败');
  } finally {
    broadcastLoading.value = false;
  }
};

onMounted(() => {
  fetchRecentChats();
});
</script>

<template>
  <div class="message-page">
    <Header/>
    <div class="message-container">
      <h1 class="page-title">我的消息</h1>

      <el-card class="message-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="header-title">最近联系人</span>
            <div class="header-actions">
              <el-button plain size="small" type="primary" @click="openSearchUserDialog">
                <i class="el-icon-plus"></i> 新建对话
              </el-button>
              <!-- 管理员群发功能 -->
              <el-button v-if="currentUserRole === 'admin'" plain size="small" type="warning"
                         @click="openBroadcastDialog">
                <i class="el-icon-chat-dot-round"></i> 群发消息
              </el-button>
              <el-button :loading="loading" size="small" type="primary" @click="fetchRecentChats">
                <i class="el-icon-refresh"></i> 刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-skeleton v-if="loading" :loading="loading" :rows="3" animated>
        </el-skeleton>

        <div v-else-if="chats.length === 0" class="empty-state">
          <el-empty description="暂无消息"/>
          <p class="empty-hint">开始新的对话或等待他人联系您</p>
        </div>

        <div v-else class="chat-list">
          <div v-for="chat in chats" :key="chat.id" class="chat-item" @click="openConversation(chat)">
            <div class="avatar-container">
              <!-- 优先显示头像，如果没有头像则使用 el-avatar -->
              <img v-if="getOtherUserAvatar(chat)" :alt="getOtherUserName(chat)" :src="getOtherUserAvatar(chat)"
                   class="avatar-image"/>
              <el-avatar v-else :size="40">{{ getOtherUserName(chat).charAt(0) }}</el-avatar>
              <div v-if="!chat.isRead && chat.receiverId === currentUserId" class="unread-badge"></div>
            </div>

            <div class="chat-info">
              <div class="chat-header">
                <span class="username">{{ getOtherUserName(chat) }}</span>
                <span class="time">{{ new Date(chat.createTime).toLocaleString() }}</span>
              </div>
              <div :class="{ 'unread-message': !chat.isRead && chat.receiverId === currentUserId }"
                   class="last-message">
                {{ chat.content }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>

  <!-- 搜索用户对话框 -->
  <el-dialog v-model="searchDialogVisible" destroy-on-close title="搜索用户" width="30%" @close="closeSearchDialog">
    <div class="search-container">
      <el-input v-model="searchKeyword" clearable placeholder="输入用户名搜索" @keyup.enter="searchUsers">
        <template #append>
          <el-button :loading="searchLoading" @click="searchUsers">搜索</el-button>
        </template>
      </el-input>

      <div v-if="user" class="user-list">
        <div class="user-item" @click="startConversation(user.id)">
          <el-avatar :size="32" class="user-avatar">{{ user.name.charAt(0) }}</el-avatar>
          <div class="user-info">
            <div class="username">{{ user.name }}</div>
            <div class="user-id">@{{ user.username }}</div>
          </div>
          <el-button class="start-chat-btn" plain size="small" type="primary">开始聊天</el-button>
        </div>
      </div>

      <div v-else-if="searchKeyword && !searchLoading" class="no-results">
        <i class="el-icon-search no-results-icon"></i>
        <p>未找到匹配的用户</p>
      </div>
    </div>
  </el-dialog>

  <!-- 群发消息对话框 -->
  <el-dialog v-model="broadcastDialogVisible" destroy-on-close title="群发消息" width="50%"
             @close="closeBroadcastDialog">
    <div class="broadcast-container">
      <div class="broadcast-info">
        <i class="el-icon-info-filled info-icon"></i>
        <p>将向商城所有用户（除您之外）发送消息，共 {{ userList.length }} 位用户</p>
      </div>

      <el-input v-model="broadcastMessage" :rows="6" maxlength="500" placeholder="请输入要群发的消息内容..."
                show-word-limit
                type="textarea"/>

      <div v-if="userList.length > 0" class="user-preview">
        <h4>接收用户预览：</h4>
        <div class="user-tags">
          <el-tag v-for="user in userList.slice(0, 10)" :key="user.id" class="user-tag" effect="light" size="small">
            {{ user.name }}
          </el-tag>
          <el-tag v-if="userList.length > 10" class="more-tag" effect="plain" size="small" type="info">
            还有 {{ userList.length - 10 }} 位用户...
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeBroadcastDialog">取消</el-button>
        <el-button :disabled="!broadcastMessage.trim()" :loading="broadcastLoading" type="primary"
                   @click="sendBroadcastMessage">
          <i class="el-icon-message"></i> 发送群发消息
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.message-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px 40px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
  position: relative;
  padding-bottom: 12px;
}

.message-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  font-size: 18px;
  font-weight: 400;
  color: #1d1d1f;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.chat-list {
  display: flex;
  flex-direction: column;
}

.chat-item {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.chat-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.chat-item:hover {
  background-color: #f9fafc;
}

.chat-item:hover::after {
  background-color: rgb(0, 113, 227);
}

.chat-item:last-child {
  border-bottom: none;
}

.avatar-container {
  position: relative;
  margin-right: 16px;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: #f56c6c;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.username {
  font-weight: 400;
  color: #1d1d1f;
  font-size: 15px;
}

.time {
  font-size: 12px;
  color: #909399;
}

.last-message {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-width: 100%;
}

.unread-message {
  font-weight: 600;
  color: #303133;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-hint {
  color: #909399;
  margin-top: 10px;
  font-size: 14px;
}

/* 搜索对话框样式 */
.search-container {
  padding: 10px 0;
}

.user-list {
  margin-top: 20px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f5f7fa;
  margin-bottom: 10px;
}

.user-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  background-color: rgb(0, 113, 227);
  color: white;
}

.user-info {
  margin-left: 14px;
  flex: 1;
}

.user-item .username {
  font-size: 15px;
  font-weight: 600;
}

.user-id {
  font-size: 13px;
  color: #909399;
}

.start-chat-btn {
  opacity: 0;
  transition: opacity 0.3s;
}

.user-item:hover .start-chat-btn {
  opacity: 1;
}

.no-results {
  text-align: center;
  color: #909399;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-results-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #dcdfe6;
}

/* 群发消息对话框样式 */
.broadcast-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.broadcast-info {
  display: flex;
  align-items: center;
  background-color: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 14px;
  color: rgb(0, 113, 227);
}

.info-icon {
  font-size: 20px;
  margin-right: 10px;
  color: rgb(0, 113, 227);
}

.broadcast-info p {
  margin: 0;
}

.user-preview {
  margin-top: 10px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.user-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-tag {
  transition: all 0.3s;
}

.user-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.more-tag {
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
}

@media (max-width: 768px) {
  .message-container {
    padding: 80px 15px 30px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .chat-item {
    padding: 12px 15px;
  }

  .avatar-container {
    margin-right: 12px;
  }

  .avatar-image {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 576px) {
  .message-container {
    padding: 70px 10px 20px;
  }

  .page-title {
    font-size: 22px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
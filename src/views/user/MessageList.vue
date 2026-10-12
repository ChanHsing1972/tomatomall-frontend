<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getRecentChats, sendMessage } from '../../api/message';
import Header from '../../components/Header.vue';
import { ElMessage } from 'element-plus';
import { accountInfo, getAllUsers } from '../../api/account'; import {
  Plus,
  ChatDotRound,
  Refresh,
  ChatLineSquare,
  ArrowRight,
  Search,
  Loading,
  InfoFilled
} from '@element-plus/icons-vue';
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
    if (res.data.code === '200') {
      user.value = res.data.data;
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
  <div class="page-wrapper">
    <Header />
    <div class="message-content">
      <div class="page-header">
        <h1>我的消息</h1>
        <div class="header-actions">
          <button class="icon-btn" @click="openSearchUserDialog" title="新消息">
            <el-icon>
              <Plus />
            </el-icon>
          </button>
          <button v-if="currentUserRole === 'admin'" class="icon-btn" @click="openBroadcastDialog" title="群发消息">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </button>
          <button class="icon-btn" @click="fetchRecentChats" :disabled="loading" title="刷新">
            <el-icon :class="{ 'rotating': loading }">
              <Refresh />
            </el-icon>
          </button>
        </div>
      </div>

      <div class="message-list-container">
        <div v-if="loading && chats.length === 0" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="chats.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon>
              <ChatLineSquare />
            </el-icon>
          </div>
          <h3>暂无消息</h3>
          <p>开始新的对话或等待他人联系您。</p>
          <button class="primary-btn" @click="openSearchUserDialog">开始聊天</button>
        </div>

        <div v-else class="chat-list">
          <div v-for="chat in chats" :key="chat.id" class="chat-item" @click="openConversation(chat)">
            <div class="avatar-wrapper">
              <img v-if="getOtherUserAvatar(chat)" :src="getOtherUserAvatar(chat)" :alt="getOtherUserName(chat)"
                class="avatar-img" />
              <div v-else class="avatar-placeholder">{{ getOtherUserName(chat).charAt(0) }}</div>
              <div v-if="!chat.isRead && chat.receiverId === currentUserId" class="unread-dot"></div>
            </div>

            <div class="chat-content">
              <div class="chat-header">
                <span class="chat-name">{{ getOtherUserName(chat) }}</span>
                <span class="chat-time">{{ new Date(chat.createTime).toLocaleDateString() }}</span>
              </div>
              <div class="chat-preview" :class="{ 'unread': !chat.isRead && chat.receiverId === currentUserId }">
                {{ chat.content }}
              </div>
            </div>

            <div class="chat-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Search Dialog -->
  <el-dialog v-model="searchDialogVisible" title="新消息" width="400px" destroy-on-close custom-class="apple-dialog">
    <div class="search-container">
      <div class="search-input-wrapper">
        <el-icon>
          <Search />
        </el-icon>
        <input v-model="searchKeyword" placeholder="搜索用户..." @keyup.enter="searchUsers" class="apple-input">
      </div>

      <div v-if="searchLoading" class="search-loading">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>

      <div v-else-if="user" class="user-result" @click="startConversation(user.id)">
        <div class="user-avatar-small">
          {{ user.name.charAt(0) }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-username">@{{ user.username }}</div>
        </div>
        <el-icon class="action-icon">
          <ChatDotRound />
        </el-icon>
      </div>

      <div v-else-if="searchKeyword && !user" class="no-results">
        未找到用户
      </div>
    </div>
  </el-dialog>

  <!-- Broadcast Dialog -->
  <el-dialog v-model="broadcastDialogVisible" title="群发消息" width="500px" destroy-on-close custom-class="apple-dialog">
    <div class="broadcast-container">
      <div class="info-banner">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>正在发送给 {{ userList.length }} 位用户</span>
      </div>

      <textarea v-model="broadcastMessage" class="apple-textarea" placeholder="输入消息内容..." rows="6"></textarea>

      <div class="dialog-footer">
        <button class="secondary-btn" @click="closeBroadcastDialog">取消</button>
        <button class="primary-btn" :disabled="!broadcastMessage.trim() || broadcastLoading"
          @click="sendBroadcastMessage">
          {{ broadcastLoading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.page-wrapper {
  background-color: #f5f5f7;
  min-height: 100vh;
  padding-top: 60px;
  font-family: "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.message-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 40px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #e8e8ed;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.icon-btn:hover {
  background: #d2d2d7;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.message-list-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  min-height: 400px;
}

.loading-state {
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d2d2d7;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px;
}

.empty-state p {
  color: #86868b;
  margin: 0 0 24px;
}

.primary-btn {
  background: #2D6FE3;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #0077ed;
}

.primary-btn:disabled {
  background: #e5e5e5;
  cursor: not-allowed;
}

.secondary-btn {
  background: #f5f5f7;
  color: #1d1d1f;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.secondary-btn:hover {
  background: #e8e8ed;
}

.chat-list {
  display: flex;
  flex-direction: column;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f7;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-item:hover {
  background: #f5f5f7;
}

.avatar-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e8e8ed;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #ff3b30;
  border-radius: 50%;
  border: 2px solid #fff;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.chat-time {
  font-size: 12px;
  color: #86868b;
}

.chat-preview {
  font-size: 14px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-preview.unread {
  color: #1d1d1f;
  font-weight: 500;
}

.chat-arrow {
  color: #d2d2d7;
  font-size: 14px;
}

/* Dialog Styles */
.search-container {
  padding: 10px 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  border-radius: 10px;
  padding: 8px 12px;
  gap: 8px;
  margin-bottom: 20px;
}

.search-input-wrapper i {
  color: #86868b;
}

.apple-input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #1d1d1f;
}

.user-result {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #f5f9ff;
  cursor: pointer;
  transition: background 0.2s;
}

.user-result:hover {
  background: #e8f2ff;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2D6FE3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.user-username {
  font-size: 12px;
  color: #86868b;
}

.action-icon {
  color: #2D6FE3;
  font-size: 20px;
}

.no-results {
  text-align: center;
  color: #86868b;
  padding: 20px;
}

/* Broadcast Dialog */
.broadcast-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-banner {
  background: #f5f9ff;
  color: #2D6FE3;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.apple-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.apple-textarea:focus {
  border-color: #2D6FE3;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .message-content {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 32px;
  }
}
</style>
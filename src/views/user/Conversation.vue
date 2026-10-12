<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearChat, getConversation, markAsRead, sendMessage } from '../../api/message';
import Header from '../../components/Header.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Delete, Position } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const messages = ref<any[]>([]);
const newMessage = ref('');
const loading = ref(false);
const sending = ref(false);
const conversationId = ref<string>(route.params.userId as string);
const currentUserId = sessionStorage.getItem('id');
const otherUserId = ref<string>('');
const otherUserName = ref('');

const formatDateTime = (dateTimeStr: string | number | Date) => {
  try {
    // 解析ISO格式的时间
    const date = new Date(dateTimeStr);

    // 使用明确的格式和区域设置
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 使用24小时制
    });
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateTimeStr;
  }
};

// 从对话ID中解析出对方用户ID
const parseOtherUserId = (convId: string) => {
  try {
    // 对话ID格式应为 "userId1_userId2"
    const [user1Id, user2Id] = convId.split('_');
    // 返回不是当前用户的那个ID
    return user1Id === currentUserId ? user2Id : user1Id;
  } catch (e) {
    console.error('解析对话ID失败:', e);
    return '';
  }
};

// 获取对话消息
const fetchConversation = async () => {
  loading.value = true;
  try {
    // 从对话ID获取对方的用户ID
    otherUserId.value = parseOtherUserId(conversationId.value);
    if (!otherUserId.value) {
      ElMessage.error('无法识别对话参与者');
      return;
    }

    const res = await getConversation(Number(otherUserId.value));
    if (res.code === '200') {
      messages.value = res.data;

      // 设置对方用户名
      if (messages.value.length > 0) {
        const otherUser = messages.value.find(msg => msg.senderId !== currentUserId);
        if (otherUser) {
          otherUserName.value = otherUser.senderName;
        } else if (messages.value[0]) {
          otherUserName.value = messages.value[0].receiverName;
        }
      } else {
        // 如果没有消息，尝试从路由参数中解析用户名，或者显示用户ID
        otherUserName.value = '用户' + otherUserId.value;
      }

      // 标记消息为已读
      markUnreadMessages();
      // 滚动到底部
      await nextTick();
      scrollToBottom();
    } else {
      ElMessage.error('获取对话失败');
    }
  } catch (error) {
    console.error('获取对话失败:', error);
    ElMessage.error('获取对话失败');
  } finally {
    loading.value = false;
  }
};

// 标记消息为已读
const markUnreadMessages = () => {
  messages.value.forEach(msg => {
    if (!msg.isRead && msg.receiverId === currentUserId) {
      markAsRead(Number(msg.id));
    }
  });
};

// 发送新消息
const sendNewMessage = async () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('消息不能为空');
    return;
  }

  sending.value = true;
  try {
    // 使用解析出的对方用户ID
    const res = await sendMessage(Number(otherUserId.value), newMessage.value);
    if (res.code === '200') {
      messages.value.push(res.data);
      newMessage.value = '';
      // 滚动到底部
      await nextTick();
      scrollToBottom();
    } else {
      ElMessage.error('发送失败');
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  } finally {
    sending.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  const messageContainer = document.querySelector('.message-list');
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
};

// 清空聊天记录
const clearChatHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定清空双方聊天记录？对方的记录也将被删除。此操作不可逆。',
      '清空聊天',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    loading.value = true;
    const res = await clearChat(Number(otherUserId.value));

    if (res.code === '200') {
      messages.value = [];
      ElMessage.success('聊天记录已清空');
    } else {
      ElMessage.error('清空聊天记录失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空聊天记录失败:', error);
      ElMessage.error('清空聊天记录失败');
    }
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化，重新加载对话
watch(() => route.params.userId, (newId) => {
  conversationId.value = newId as string;
  fetchConversation();
});

// 处理Enter键发送
const handleKeyDown = (e: Event | KeyboardEvent) => {
  // 确保是 KeyboardEvent 类型
  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendNewMessage();
    }
  }
};

// 设置定时刷新
let intervalId: number;

onMounted(() => {
  fetchConversation();
  // 每10秒更新一次消息
  intervalId = window.setInterval(() => {
    fetchConversation();
    console.log('conversationContent', messages.value);
  }, 10000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="page-wrapper">
    <Header />
    <div class="conversation-content">
      <div class="chat-window">
        <div class="chat-header">
          <div class="header-left">
            <button class="icon-btn" @click="router.push('/messages')" title="返回">
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </button>
            <div class="user-status">
              <span class="chat-title">{{ otherUserName || '加载中...' }}</span>
              <span class="status-dot"></span>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn danger" :disabled="loading || messages.length === 0" @click="clearChatHistory"
              title="清空聊天记录">
              <el-icon>
                <Delete />
              </el-icon>
            </button>
          </div>
        </div>

        <div class="messages-container" ref="messageList">
          <div v-if="loading && messages.length === 0" class="loading-state">
            <el-skeleton :rows="10" animated />
          </div>

          <div v-else-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>暂无消息</h3>
            <p>开始与 {{ otherUserName }} 的对话</p>
          </div>

          <div v-else class="message-list">
            <div v-for="msg in messages" :key="msg.id"
              :class="['message-row', msg.senderId === currentUserId ? 'sent' : 'received']">

              <div v-if="msg.senderId !== currentUserId" class="avatar-wrapper">
                <img v-if="msg.senderAvatar" :src="msg.senderAvatar" :alt="msg.senderName" class="avatar-img" />
                <div v-else class="avatar-placeholder">{{ msg.senderName.charAt(0) }}</div>
              </div>

              <div class="message-bubble-wrapper">
                <div class="message-bubble">
                  {{ msg.content }}
                </div>
                <div class="message-time">{{ formatDateTime(msg.createTime) }}</div>
              </div>

              <div v-if="msg.senderId === currentUserId" class="avatar-wrapper">
                <img v-if="msg.senderAvatar" :src="msg.senderAvatar" :alt="msg.senderName" class="avatar-img" />
                <div v-else class="avatar-placeholder">{{ msg.senderName.charAt(0) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrapper">
            <textarea v-model="newMessage" :disabled="sending" placeholder="输入消息..." @keydown="handleKeyDown"
              class="message-textarea" rows="1"></textarea>
            <button class="send-btn" :disabled="!newMessage.trim() || sending" @click="sendNewMessage">
              <el-icon>
                <Position />
              </el-icon>
            </button>
          </div>
          <div class="input-hint">按 Enter 发送，Shift+Enter 换行</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: #f5f5f7;
  min-height: 100vh;
  padding-top: 60px;
  font-family: "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.conversation-content {
  max-width: 850px;
  margin: 0 auto;
  padding: 40px 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.chat-window {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f7;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #34c759;
  border-radius: 50%;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f7;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.icon-btn:hover {
  background: #e8e8ed;
}

.icon-btn.danger {
  color: #ff3b30;
  background: #fff0f0;
}

.icon-btn.danger:hover {
  background: #ffe5e5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fff;
  scroll-behavior: smooth;
}

.loading-state {
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
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
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 80%;
}

.message-row.sent {
  align-self: flex-end;
  flex-direction: row;
}

.message-row.received {
  align-self: flex-start;
}

.avatar-wrapper {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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
  font-size: 14px;
  font-weight: 500;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.sent .message-bubble {
  background: #2D6FE3;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.received .message-bubble {
  background: #f5f5f7;
  color: #1d1d1f;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #86868b;
  margin: 0 4px;
}

.sent .message-time {
  text-align: right;
}

.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #f5f5f7;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f5f5f7;
  border-radius: 24px;
  padding: 8px 8px 8px 20px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  background: #fff;
  border-color: #2D6FE3;
  box-shadow: 0 0 0 4px rgba(45, 111, 227, 0.1);
}

.message-textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  resize: none;
  max-height: 120px;
  padding: 8px 0;
  color: #1d1d1f;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #2D6FE3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover {
  background: #0077ed;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d2d2d7;
  transform: none;
  cursor: not-allowed;
}

.input-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .conversation-content {
    padding: 0;
    height: calc(100vh - 60px);
  }

  .chat-window {
    border-radius: 0;
    box-shadow: none;
  }

  .message-row {
    max-width: 90%;
  }
}
</style>
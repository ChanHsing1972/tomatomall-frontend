<script lang="ts" setup>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {clearChat, getConversation, markAsRead, sendMessage} from '../../api/message';
import Header from '../../components/Header.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {ArrowLeft, Delete} from '@element-plus/icons-vue';

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
        if (messages.value[0].senderId === currentUserId) {
          otherUserName.value = messages.value[0].receiverName;
        } else {
          otherUserName.value = messages.value[0].senderName;
        }
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

// 获取消息发送者的名称
const getSenderName = (msg: any) => {
  return msg.senderId === currentUserId ? msg.senderName : msg.receiverName;
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
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendNewMessage();
  }
};

// 设置定时刷新
let intervalId: number;

onMounted(() => {
  fetchConversation();

  // 每10秒更新一次消息
  intervalId = window.setInterval(() => {
    fetchConversation();
  }, 10000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="conversation-page">
    <Header/>
    <div class="conversation-container">
      <el-card class="conversation-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-button :icon="ArrowLeft" class="back-button" plain @click="router.push('/messages')">
                返回
              </el-button>
              <span class="chat-title">{{ otherUserName || '加载中...' }}</span>
            </div>
            <div class="header-actions">
              <el-button :disabled="loading || messages.length === 0" :icon="Delete" plain size="small" type="danger"
                         @click="clearChatHistory">
                清空聊天
              </el-button>
            </div>
          </div>
        </template>

        <el-skeleton v-if="loading && messages.length === 0" :loading="loading" :rows="10" animated>
        </el-skeleton>

        <div v-else ref="messageList" class="message-list">
          <div v-if="messages.length === 0" class="empty-state">
            <p>暂无消息，开始聊天吧！</p>
          </div>

          <div v-for="msg in messages" :key="msg.id"
               :class="['message-item', { 'sent': msg.senderId === currentUserId, 'received': msg.senderId !== currentUserId }]">
            <div class="message-avatar">
              <!-- 优先显示头像，如果没有头像则使用 el-avatar -->
              <img v-if="msg.senderAvatar" :alt="getSenderName(msg)" :src="msg.senderAvatar" class="avatar-image"/>
              <el-avatar v-else :size="36">{{ getSenderName(msg).charAt(0) }}</el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble">{{ msg.content }}</div>
              <div class="message-time">{{ new Date(msg.createTime).toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <el-input v-model="newMessage" :disabled="sending" :rows="3" placeholder="输入消息..." type="textarea"
                    @keydown="handleKeyDown"/>
          <div class="input-actions">
            <span class="hint">Enter 发送，Shift+Enter 换行</span>
            <el-button :loading="sending" type="primary" @click="sendNewMessage">发送</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.conversation-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.conversation-container {
  max-width: 800px;
  margin: 100px auto;
  padding: 0 20px;
}

.conversation-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 15px;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-list {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.sent {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
}

.sent .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 18px;
  word-break: break-word;
}

.sent .message-bubble {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 4px;
}

.received .message-bubble {
  background-color: white;
  border: 1px solid #e6e6e6;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.received .message-time {
  text-align: left;
}

.message-input {
  padding-top: 10px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.hint {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.avatar-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e6e6e6;
}
</style>
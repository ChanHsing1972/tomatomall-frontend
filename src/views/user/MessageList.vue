<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getRecentChats, sendMessage } from '../../api/message';
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import '../../styles/store.css';
import { ElMessage } from 'element-plus';
import { accountInfo, getAllUsers } from '../../api/account';
import { Refresh, ChatLineSquare, ArrowRight, Search } from '@element-plus/icons-vue';
interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

const router = useRouter();
const chats = ref<any[]>([]);
const loading = ref(true);
const loadError = ref('');
const chatSearch = ref('');
const filteredChats = computed(() =>
  chats.value.filter((chat) =>
    [getOtherUserName(chat), chat.content]
      .join(' ')
      .toLowerCase()
      .includes(chatSearch.value.trim().toLowerCase())
  )
);
const formatTime = (value: string) =>
  new Date(value).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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
  loadError.value = '';
  try {
    const res = await getRecentChats();
    if (res.code === '200') {
      chats.value = res.data;
    } else {
      ElMessage.error('获取聊天列表失败');
    }
  } catch (error) {
    loadError.value = '消息暂时无法加载，请稍后重试。';
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
  router.push({
    path: `/messages/conversation/${conversationId}`,
    query: {
      username: chat.senderId === currentUserId ? chat.receiverUsername : chat.senderUsername,
    },
  });
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
  router.push({
    path: `/messages/conversation/${conversationId}`,
    query: { username: user.value?.username },
  });
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
  if (broadcastLoading.value) return;
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
      ElMessage.success(
        `群发消息成功！已发送给 ${successCount} 位用户${failCount > 0 ? `，${failCount} 位用户发送失败` : ''}`
      );
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
  <Header />
  <main class="store-page">
    <div class="store-shell messages-shell">
      <header class="store-heading">
        <div>
          <h1>让阅读，连接彼此。</h1>
        </div>
        <div class="message-actions">
          <button
            class="store-icon-button"
            @click="fetchRecentChats"
            :disabled="loading"
            aria-label="刷新消息"
          >
            <el-icon :size="20"><Refresh /></el-icon></button
          ><button
            v-if="currentUserRole === 'admin'"
            class="store-button secondary"
            @click="openBroadcastDialog"
          >
            群发消息</button
          ><button class="store-button" @click="openSearchUserDialog">新建对话</button>
        </div>
      </header>
      <div class="messages-toolbar">
        <h2>
          最近对话 <span v-if="!loading">{{ chats.length }}</span>
        </h2>
        <label class="messages-search"
          ><el-icon><Search /></el-icon
          ><input v-model="chatSearch" aria-label="搜索对话" placeholder="搜索书友或消息"
        /></label>
      </div>
      <div
        v-if="loading"
        class="chat-skeleton-list"
        role="status"
        aria-label="正在加载消息"
        aria-busy="true"
      >
        <div v-for="n in 4" :key="n" class="chat-row skeleton-row">
          <div class="sk-block chat-avatar"></div>
          <div class="chat-copy">
            <div class="sk-line short"></div>
            <div class="sk-line"></div>
          </div>
        </div>
      </div>
      <div v-else-if="loadError" class="store-error" role="alert">
        <p>{{ loadError }}</p>
        <button class="store-link" @click="fetchRecentChats">重新加载</button>
      </div>
      <div v-else-if="!filteredChats.length" class="store-empty">
        <el-icon :size="52"><ChatLineSquare /></el-icon>
        <h2>{{ chatSearch ? '没有找到匹配的对话。' : '好书值得分享。' }}</h2>
        <p>{{ chatSearch ? '换个关键词，再找找看。' : '找到一位书友，聊聊最近读到的故事。' }}</p>
        <button v-if="!chatSearch" class="store-link" @click="openSearchUserDialog">
          开始一段对话 <el-icon><ArrowRight /></el-icon></button
        ><button v-else class="store-link" @click="chatSearch = ''">查看全部消息</button>
      </div>
      <div v-else class="chat-list">
        <button
          v-for="chat in filteredChats"
          :key="chat.id"
          class="chat-row"
          @click="openConversation(chat)"
        >
          <span class="chat-avatar"
            ><img
              v-if="getOtherUserAvatar(chat)"
              :src="getOtherUserAvatar(chat)"
              alt=""
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            /><span v-else>{{ getOtherUserName(chat)?.slice(0, 1) || '书' }}</span></span
          ><span class="chat-copy"
            ><span class="chat-top"
              ><strong>{{ getOtherUserName(chat) }}</strong
              ><time>{{ formatTime(chat.createTime) }}</time></span
            ><span class="chat-preview"
              >{{ chat.senderId === currentUserId ? '你：' : '' }}{{ chat.content }}</span
            ></span
          ><span
            v-if="!chat.isRead && chat.receiverId === currentUserId"
            class="unread-dot"
            aria-label="未读消息"
          ></span
          ><el-icon class="row-chevron"><ArrowRight /></el-icon>
        </button>
      </div>
      <aside class="message-help">
        <h2>寻找你的书友。</h2>
        <p>通过用户名找到对方，开启关于书籍的交流。</p>
        <button class="store-link" @click="openSearchUserDialog">
          查找书友 <el-icon><ArrowRight /></el-icon>
        </button>
      </aside>
    </div>
  </main>
  <Footer />
  <el-dialog
    v-model="searchDialogVisible"
    class="store-dialog"
    title="开始一段对话"
    width="520px"
    @closed="closeSearchDialog"
    ><p class="dialog-intro">输入对方的用户名，找到想交流的书友。</p>
    <form class="user-search-form" @submit.prevent="searchUsers">
      <input
        v-model="searchKeyword"
        class="store-input"
        aria-label="书友用户名"
        placeholder="用户名"
      /><button class="store-button" :disabled="searchLoading || !searchKeyword.trim()">
        {{ searchLoading ? '查找中…' : '查找' }}
      </button>
    </form>
    <div v-if="searchLoading" class="search-user-skeleton" role="status" aria-label="正在查找书友">
      <div class="sk-line"></div>
      <div class="sk-line short"></div>
    </div>
    <div v-else-if="user" class="found-user">
      <div class="chat-avatar">{{ user.name?.slice(0, 1) || user.username.slice(0, 1) }}</div>
      <div>
        <strong>{{ user.name || user.username }}</strong>
        <p>@{{ user.username }}</p>
      </div>
      <button
        class="store-link"
        :disabled="user.id === currentUserId"
        @click="startConversation(user.id)"
      >
        {{ user.id === currentUserId ? '这是你' : '开始对话' }}
      </button>
    </div></el-dialog
  >
  <el-dialog
    v-if="currentUserRole === 'admin'"
    v-model="broadcastDialogVisible"
    class="store-dialog"
    title="发送书屋消息"
    width="560px"
    ><p class="dialog-intro">这条消息会发送给 {{ userList.length }} 位用户。</p>
    <textarea
      v-model="broadcastMessage"
      class="store-input"
      rows="5"
      maxlength="2000"
      aria-label="群发内容"
      placeholder="输入你想发送的内容"
    ></textarea
    ><template #footer
      ><button class="store-button secondary" @click="closeBroadcastDialog">取消</button
      ><button
        class="store-button"
        :disabled="broadcastLoading || !broadcastMessage.trim() || !userList.length"
        @click="sendBroadcastMessage"
      >
        {{ broadcastLoading ? '发送中…' : '发送消息' }}
      </button></template
    ></el-dialog
  >
</template>
<style scoped>
.message-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
.messages-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #d2d2d7;
  padding-bottom: 20px;
}
.messages-toolbar h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}
.messages-toolbar h2 span {
  font-size: 16px;
  color: #86868b;
  font-weight: 400;
  margin-left: 10px;
}
.messages-search {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #86868b;
}
.messages-search input {
  border: 0;
  background: transparent;
  font-size: 15px;
  outline: none;
  width: 200px;
  padding: 8px 0;
}
.chat-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 12px;
  width: 100%;
  border: 0;
  border-bottom: 1px solid #e8e8ed;
  text-align: left;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
}
.chat-list .chat-row:hover {
  background: #fafafa;
}
.chat-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f5f5f7;
  display: grid;
  place-items: center;
  font-size: 23px;
  font-weight: 500;
  overflow: hidden;
  color: #6e6e73;
}
.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.chat-copy {
  min-width: 0;
  flex: 1;
  display: block;
}
.chat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  line-height: 1.4;
}
.chat-top strong {
  font-size: 18px;
  font-weight: 600;
}
.chat-top time {
  font-size: 12px;
  color: #86868b;
  white-space: nowrap;
}
.chat-preview {
  display: block;
  color: #6e6e73;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 7px;
  line-height: 1.5;
}
.row-chevron {
  color: #86868b;
}
.unread-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0071e3;
}
.message-help {
  padding-top: 52px;
}
.message-help h2 {
  font-size: 26px;
  letter-spacing: -0.03em;
  font-weight: 600;
}
.message-help p {
  font-size: 16px;
  color: #6e6e73;
  line-height: 1.7;
}
.skeleton-row {
  cursor: default;
  min-height: 113px;
}
.skeleton-row .chat-avatar {
  background: #e8e8ed;
}
.skeleton-row .sk-line {
  height: 13px;
  margin: 10px 0;
}
.skeleton-row .sk-line.short {
  width: 25%;
}
.dialog-intro {
  font-size: 16px;
  color: #6e6e73;
  line-height: 1.6;
  margin: 0 0 24px;
}
.user-search-form {
  display: flex;
  gap: 12px;
}
.found-user {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #d2d2d7;
}
.found-user p {
  margin: 6px 0;
  color: #86868b;
  font-size: 14px;
}
.found-user .store-link {
  margin-left: auto;
}
.search-user-skeleton {
  margin-top: 24px;
}
@media (max-width: 600px) {
  .message-actions {
    margin: 0;
    width: 100%;
    justify-content: flex-end;
  }
  .messages-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
  .messages-search {
    width: 100%;
  }
  .messages-search input {
    width: 100%;
    min-width: 0;
    font-size: 16px;
  }
  .chat-row {
    padding: 22px 0;
    gap: 14px;
  }
  .chat-avatar {
    width: 46px;
    height: 46px;
    font-size: 20px;
  }
  .chat-top {
    gap: 10px;
  }
  .chat-top strong {
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chat-top time {
    font-size: 11px;
  }
  .chat-preview {
    font-size: 14px;
  }
  .found-user {
    gap: 12px;
    flex-wrap: wrap;
  }
  .found-user .store-link {
    margin-left: 0;
  }
  .skeleton-row {
    min-height: 100px;
  }
}
</style>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowUp, Delete, ChatLineSquare } from '@element-plus/icons-vue';
import Header from '../../components/Header.vue';
import { accountInfo } from '../../api/account';
import {
  clearChat,
  getConversation,
  markAsRead,
  sendMessage,
  type PrivateMessage,
} from '../../api/message';
import '../../styles/store.css';
const route = useRoute(),
  router = useRouter();
const currentUser = String(sessionStorage.getItem('id') || '');
const messages = ref<PrivateMessage[]>([]),
  draft = ref(''),
  otherId = ref(''),
  otherName = ref('');
const loading = ref(true),
  sending = ref(false),
  loadError = ref('');
const transcript = ref<HTMLElement | null>(null);
let timer: number,
  epoch = 0;
const formatTime = (value: string) =>
  new Date(value).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
function recipient() {
  const ids = String(route.params.userId).split('_');
  if (ids.length !== 2 || !ids.includes(currentUser) || ids.some((id) => !/^\d+$/.test(id)))
    return '';
  return ids.find((id) => id !== currentUser) || '';
}
async function scrollToBottom() {
  await nextTick();
  if (transcript.value) transcript.value.scrollTop = transcript.value.scrollHeight;
}
async function fetchConversation(silent = false) {
  const target = recipient();
  const requestEpoch = ++epoch;
  if (!target) {
    loadError.value = '无法识别这段对话，请返回消息列表重新打开。';
    loading.value = false;
    return;
  }
  otherId.value = target;
  if (!silent) {
    loading.value = true;
    loadError.value = '';
  }
  const nearBottom = transcript.value
    ? transcript.value.scrollHeight - transcript.value.scrollTop - transcript.value.clientHeight <
      90
    : true;
  try {
    const res = await getConversation(Number(target));
    if (requestEpoch !== epoch) return;
    messages.value = res.data || [];
    const first = messages.value[0];
    otherName.value = first
      ? first.senderId === currentUser
        ? first.receiverName
        : first.senderName
      : '书友 ' + target;
    if (!first && typeof route.query.username === 'string') {
      const profile = (await accountInfo(route.query.username)).data.data;
      if (requestEpoch !== epoch) return;
      if (String(profile.id) === target) otherName.value = profile.name || profile.username;
    }
    await Promise.allSettled(
      messages.value
        .filter((m) => !m.isRead && m.receiverId === currentUser)
        .map((m) => markAsRead(Number(m.id)))
    );
    if (!silent || nearBottom) await scrollToBottom();
  } catch {
    if (!silent) loadError.value = '对话暂时无法加载，请稍后重试。';
  } finally {
    if (requestEpoch === epoch) loading.value = false;
  }
}
async function send() {
  if (sending.value || !draft.value.trim() || !otherId.value) return;
  sending.value = true;
  const content = draft.value.trim(),
    target = otherId.value;
  try {
    const res = await sendMessage(Number(target), content);
    if (target === otherId.value) {
      messages.value.push(res.data);
      draft.value = '';
      await scrollToBottom();
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '发送失败，内容已保留，请重试。');
  } finally {
    sending.value = false;
  }
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    send();
  }
}
async function clear() {
  try {
    await ElMessageBox.confirm('清空双方聊天记录后无法恢复。确定清空这段对话？', '清空对话', {
      confirmButtonText: '清空',
      cancelButtonText: '保留',
    });
    await clearChat(Number(otherId.value));
    messages.value = [];
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error('清空失败，请稍后重试。');
  }
}
watch(
  () => route.params.userId,
  () => {
    messages.value = [];
    draft.value = '';
    fetchConversation();
  }
);
onMounted(() => {
  fetchConversation();
  timer = window.setInterval(() => {
    if (!sending.value) fetchConversation(true);
  }, 15000);
});
onUnmounted(() => {
  ++epoch;
  window.clearInterval(timer);
});
</script>
<template>
  <Header />
  <main class="store-page conversation-page">
    <div class="conversation-shell">
      <header class="conversation-header">
        <button class="store-icon-button" aria-label="返回消息" @click="router.push('/messages')">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <div class="conversation-person">
          <span class="store-eyebrow">书友对话</span>
          <h1>{{ otherName || '正在加载…' }}</h1>
        </div>
        <button
          class="store-icon-button"
          aria-label="清空对话"
          :disabled="loading || sending || !messages.length"
          @click="clear"
        >
          <el-icon :size="19"><Delete /></el-icon>
        </button>
      </header>
      <div
        ref="transcript"
        class="conversation-transcript"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div
          v-if="loading"
          class="conversation-skeleton"
          role="status"
          aria-label="正在加载对话"
          aria-busy="true"
        >
          <div
            v-for="n in 4"
            :key="n"
            class="sk-block skeleton-bubble"
            :class="{ own: n % 2 === 0 }"
          ></div>
        </div>
        <div v-else-if="loadError" class="store-error" role="alert">
          <p>{{ loadError }}</p>
          <button class="store-link" @click="fetchConversation()">重新加载</button>
        </div>
        <div v-else-if="!messages.length" class="conversation-empty">
          <el-icon :size="45"><ChatLineSquare /></el-icon>
          <h2>从一句问候开始。</h2>
          <p>聊聊你最近读到的好书。</p>
        </div>
        <div v-else class="conversation-messages">
          <article
            v-for="message in messages"
            :key="message.id"
            class="message-entry"
            :class="{ own: message.senderId === currentUser }"
          >
            <div class="message-bubble">{{ message.content }}</div>
            <time
              >{{ formatTime(message.createTime)
              }}<span v-if="message.senderId === currentUser">
                · {{ message.isRead ? '已读' : '已发送' }}</span
              ></time
            >
          </article>
        </div>
      </div>
      <form class="conversation-composer" @submit.prevent="send">
        <label for="message-draft" class="sr-only">消息内容</label
        ><textarea
          id="message-draft"
          v-model="draft"
          rows="2"
          maxlength="2000"
          placeholder="发送一条消息…"
          :disabled="!!loadError || loading"
          @keydown="keydown"
        ></textarea
        ><button
          type="submit"
          class="message-send"
          :disabled="sending || loading || !!loadError || !draft.trim()"
          :aria-label="sending ? '正在发送' : '发送消息'"
        >
          <el-icon :size="22"><ArrowUp /></el-icon></button
        ><small>Enter 发送，Shift + Enter 换行</small>
      </form>
    </div>
  </main>
</template>
<style scoped>
.conversation-page {
  height: 100dvh;
  min-height: 540px;
}
.conversation-shell {
  max-width: 900px;
  padding: 40px 24px 24px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.conversation-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #d2d2d7;
  flex-shrink: 0;
}
.conversation-person {
  flex: 1;
  min-width: 0;
}
.conversation-person .store-eyebrow {
  margin-bottom: 6px;
  font-size: 12px;
}
.conversation-person h1 {
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -0.025em;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conversation-transcript {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 32px 4px;
  scrollbar-gutter: stable;
}
.conversation-empty {
  text-align: center;
  color: #86868b;
  padding: 80px 20px;
}
.conversation-empty h2 {
  color: #1d1d1f;
  font-size: 28px;
  letter-spacing: -0.03em;
  font-weight: 600;
  margin: 22px 0 12px;
}
.conversation-empty p {
  color: #6e6e73;
  font-size: 16px;
}
.message-entry {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 22px;
}
.message-entry.own {
  align-items: flex-end;
}
.message-bubble {
  max-width: 78%;
  background: #f5f5f7;
  color: #1d1d1f;
  border-radius: 19px 19px 19px 5px;
  padding: 14px 18px;
  font-size: 16px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.own .message-bubble {
  background: #0071e3;
  color: #fff;
  border-radius: 19px 19px 5px 19px;
}
.message-entry time {
  font-size: 11px;
  color: #86868b;
  margin: 7px 5px 0;
}
.conversation-composer {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-top: 1px solid #d2d2d7;
  padding-top: 22px;
  padding-bottom: 26px;
}
.conversation-composer textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  border: 1px solid #86868b;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  color: #1d1d1f;
  background: #fff;
}
.conversation-composer textarea:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px #0071e322;
}
.conversation-composer textarea:disabled {
  background: #fafafa;
}
.message-send {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: #0071e3;
  border: 0;
  color: white;
  border-radius: 50%;
  margin-bottom: 7px;
  flex-shrink: 0;
  cursor: pointer;
}
.message-send:disabled {
  background: #d2d2d7;
  cursor: default;
}
.conversation-composer small {
  position: absolute;
  left: 0;
  bottom: 0;
  color: #86868b;
  font-size: 11px;
}
.skeleton-bubble {
  width: 55%;
  height: 68px;
  margin: 0 0 28px;
  border-radius: 19px;
}
.skeleton-bubble.own {
  margin-left: auto;
  width: 40%;
}
@media (max-width: 600px) {
  .conversation-page {
    height: 100dvh;
    min-height: 500px;
  }
  .conversation-shell {
    padding: 24px 16px max(16px, env(safe-area-inset-bottom));
  }
  .conversation-header {
    gap: 14px;
    padding-bottom: 18px;
  }
  .conversation-person h1 {
    font-size: 22px;
  }
  .conversation-transcript {
    padding: 24px 0;
  }
  .message-bubble {
    max-width: 88%;
    font-size: 15px;
  }
  .conversation-composer {
    gap: 9px;
    padding-top: 16px;
  }
  .conversation-empty {
    padding: 48px 12px;
  }
  .conversation-composer textarea {
    padding: 12px 14px;
  }
  .skeleton-bubble {
    width: 72%;
  }
}
</style>

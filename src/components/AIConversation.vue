<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUp, Delete, Reading } from '@element-plus/icons-vue';
import { askAIAssistant } from '../api/aiService';
import '../styles/store.css';
defineProps<{ page?: boolean }>();
const router = useRouter();
const question = ref('');
const loading = ref(false);
const transcript = ref<HTMLElement | null>(null);
const history = ref<
  { id: number; question: string; answer: string; error: boolean; pending: boolean }[]
>([]);
let nextId = 0;
const suggestions = ['想读一本轻松的小说', '推荐一些计算机类书籍', '适合了解历史的书有哪些？'];
async function scrollToBottom() {
  await nextTick();
  transcript.value?.scrollTo({ top: transcript.value.scrollHeight, behavior: 'smooth' });
}
async function send(value = question.value) {
  if (loading.value || !value.trim()) return;
  if (!sessionStorage.getItem('token')) {
    router.push({ path: '/login', query: { redirect: '/ai' } });
    return;
  }
  const item = { id: nextId++, question: value.trim(), answer: '', error: false, pending: true };
  history.value.push(item);
  question.value = '';
  loading.value = true;
  scrollToBottom();
  try {
    const response = await askAIAssistant(item.question);
    const target = history.value.find((i) => i.id === item.id);
    if (target) target.answer = response.data;
  } catch {
    const target = history.value.find((i) => i.id === item.id);
    if (target) {
      target.error = true;
      target.answer = '暂时无法连接书城助手。你可以稍后重试，或前往书库继续选书。';
    }
  } finally {
    const target = history.value.find((i) => i.id === item.id);
    if (target) target.pending = false;
    loading.value = false;
    scrollToBottom();
  }
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    send();
  }
}
function clear() {
  if (!loading.value) history.value = [];
}
</script>
<template>
  <section class="ai-conversation" :class="{ 'page-mode': page }" aria-label="AI 选书对话">
    <div
      ref="transcript"
      class="ai-transcript"
      :class="{ started: history.length }"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div v-if="!history.length" class="ai-welcome">
        <div class="ai-mark">
          <el-icon :size="32"><Reading /></el-icon>
        </div>
        <h2 v-if="!page">下一本好书，<br />从你的好奇开始。</h2>
        <h2 v-else>聊聊你的阅读兴趣。</h2>
        <div class="ai-suggestions">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            @click="question = suggestion"
          >
            {{ suggestion }} <span>↗</span>
          </button>
        </div>
      </div>
      <article v-for="entry in history" :key="entry.id" class="ai-exchange">
        <div class="ai-question">
          <span class="speaker">你</span>
          <p>{{ entry.question }}</p>
        </div>
        <div class="ai-answer">
          <span class="speaker"
            ><el-icon><Reading /></el-icon> 枕石书屋</span
          >
          <div
            v-if="entry.pending"
            class="ai-thinking"
            role="status"
            aria-label="正在根据书库挑选图书"
          >
            <span>正在根据书库挑选图书</span>
            <div class="sk-line"></div>
            <div class="sk-line"></div>
            <div class="sk-line short"></div>
          </div>
          <template v-else
            ><p class="answer-content" :class="{ error: entry.error }">{{ entry.answer }}</p>
            <button
              v-if="entry.error"
              class="store-link"
              :disabled="loading"
              @click="send(entry.question)"
            >
              重新尝试
            </button></template
          >
        </div>
      </article>
    </div>
    <div class="ai-composer">
      <form @submit.prevent="send()">
        <textarea
          id="ai-question"
          v-model="question"
          maxlength="1000"
          rows="2"
          placeholder="问问书城助手…"
          aria-label="你的选书问题"
          @keydown="keydown"
        ></textarea
        ><button
          class="send-circle"
          :disabled="loading || !question.trim()"
          type="submit"
          :aria-label="loading ? '正在回答' : '发送问题'"
        >
          <el-icon :size="22"><ArrowUp /></el-icon>
        </button>
      </form>
    </div>
  </section>
</template>
<style scoped>
.ai-conversation {
  display: flex;
  flex-direction: column;
  min-height: 550px;
  color: #1d1d1f;
  --store-line: #d2d2d7;
  --store-blue: #0066cc;
  --store-soft: #f5f5f7;
}
.ai-transcript {
  flex: 1;
  max-height: 62dvh;
  min-height: 340px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  padding: 0 8px 32px;
}
.ai-welcome {
  text-align: center;
  padding: 24px 16px 40px;
}
.ai-mark {
  display: grid;
  place-items: center;
  margin: 0 auto 24px;
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: #f5f5f7;
  color: #1d1d1f;
}
.ai-welcome h2 {
  font-size: 36px;
  letter-spacing: -0.035em;
  line-height: 1.16;
  margin: 0 0 18px;
  font-weight: 600;
}
.ai-welcome p {
  font-size: 17px;
  line-height: 1.65;
  color: #6e6e73;
  margin: 0;
}
.ai-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}
.ai-suggestions button {
  border: 0px solid #d2d2d7;
  border-radius: 14px;
  background: #fff;
  color: #1d1d1f;
  font-size: 14px;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ai-suggestions button:hover {
  background: #f5f5f7;
}
.ai-suggestions span {
  color: #0066cc;
}
.ai-exchange {
  max-width: 760px;
  margin: 0 auto 36px;
}
.speaker {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #6e6e73;
  font-weight: 600;
  margin-bottom: 10px;
}
.ai-question {
  max-width: 84%;
  margin-left: auto;
  background: #f5f5f7;
  padding: 18px 22px;
  border-radius: 20px;
  margin-bottom: 28px;
}
.ai-question p {
  font-size: 17px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.ai-answer {
  padding: 0 8px;
}
.answer-content {
  font-size: 17px;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
}
.answer-content.error {
  color: #6e6e73;
}
.ai-thinking {
  min-height: 120px;
}
.ai-thinking > span {
  font-size: 14px;
  color: #6e6e73;
}
.ai-thinking .sk-line {
  height: 12px;
}
.ai-composer {
  padding-top: 20px;
  background: #fff;
}
.composer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
  margin-bottom: 14px;
}
.composer-top label {
  font-weight: 600;
}
.composer-top button {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ai-composer form {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border: 1px solid #86868b;
  border-radius: 18px;
  padding: 16px;
}
.ai-composer form:focus-within {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px #0071e31c;
}
.ai-composer textarea {
  flex: 1;
  min-width: 0;
  border: 0;
  resize: none;
  background: transparent;
  color: #1d1d1f;
  outline: none;
  font-size: 17px;
  line-height: 1.5;
  padding: 0;
  max-height: 180px;
}
.ai-composer textarea:focus-visible {
  outline: none;
}
.send-circle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: #0071e3;
  color: white;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.send-circle:disabled {
  background: #d2d2d7;
  cursor: default;
}
@media (max-width: 600px) {
  .ai-conversation {
    min-height: calc(100dvh - 260px);
  }
  .ai-transcript {
    padding: 0 0 20px;
    max-height: 55dvh;
    min-height: 270px;
  }
  .ai-welcome {
    padding: 12px 0 28px;
  }
  .ai-welcome h2 {
    font-size: 30px;
  }
  .ai-suggestions {
    flex-direction: column;
    gap: 9px;
    margin-top: 24px;
  }
  .ai-suggestions button {
    justify-content: space-between;
    text-align: left;
  }
  .ai-question {
    max-width: 92%;
    padding: 14px 18px;
  }
  .answer-content,
  .ai-question p {
    font-size: 16px;
  }
  .ai-composer form {
    padding: 13px;
  }
  .ai-composer textarea {
    font-size: 16px;
  }
  .ai-composer {
    padding-top: 16px;
  }
  .desktop-break {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ai-transcript {
    scroll-behavior: auto;
  }
}
.page-mode {
  height: calc(100dvh - 300px);
  min-height: 420px;
}
.page-mode .ai-transcript {
  min-height: 0;
  max-height: none;
}
.page-mode .ai-welcome {
  padding: 0 16px 20px;
}
.page-mode .ai-mark {
  width: 44px;
  height: 44px;
  margin-bottom: 14px;
  border-radius: 14px;
}
.page-mode .ai-welcome h2 {
  font-size: 28px;
  margin-bottom: 12px;
}
.page-mode .ai-welcome p {
  font-size: 16px;
}
.page-mode .ai-suggestions {
  margin-top: 20px;
}
.page-mode .ai-suggestions button {
  padding: 12px 14px;
}
@media (max-width: 600px) {
  .page-mode {
    height: calc(100dvh - 300px);
    min-height: 430px;
  }
  .page-mode .ai-transcript {
    min-height: 0;
  }
  .page-mode .ai-welcome {
    padding: 0 0 20px;
  }
  .page-mode .ai-welcome h2 {
    font-size: 25px;
  }
  .page-mode .ai-welcome p {
    font-size: 15px;
  }
  .page-mode .ai-suggestions {
    gap: 8px;
  }
  .page-mode .ai-suggestions button {
    font-size: 13px;
  }
  .page-mode .ai-composer {
    padding-top: 12px;
  }
}
</style>

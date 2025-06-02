<script lang="ts" setup>
import {ref, watch} from 'vue';
import {ElMessage} from 'element-plus';
import {QuestionFilled} from '@element-plus/icons-vue';
import {askAIAssistant} from '../api/aiService';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const question = ref('');
const loading = ref(false);
const chatHistory = ref<{ role: 'user' | 'ai'; content: string; thinking?: boolean }[]>([]);

// 预设问题列表
const suggestedQuestions = [
  "书城里有哪些书",
  "推荐一些计算机类书籍"
];

// 选择预设问题
const selectSuggestedQuestion = (q: string) => {
  question.value = q;
};

// 监听visible属性的变化
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    // 当对话框关闭时，清空当前问题，但保留聊天历史
    question.value = '';
  } else {
    // 对话框打开时，如果没有历史，则添加欢迎语
    if (chatHistory.value.length === 0) {
      chatHistory.value.push({
        role: 'ai',
        content: '您好，我是番茄书城智能助手，有什么可以帮您？'
      });
    }
  }
});

// 发送问题到后端
const submitQuestion = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入您的问题');
    return;
  }

  loading.value = true;
  const currentQuestion = question.value;

  // 立即添加用户消息到聊天记录
  chatHistory.value.push({
    role: 'user',
    content: currentQuestion
  });

  // 立即添加AI的"思考中"消息
  const aiThinkingIndex = chatHistory.value.length;
  chatHistory.value.push({
    role: 'ai',
    content: '思考中，预计等待10s',
    thinking: true
  });

  // 清空输入框
  question.value = '';

  // 滚动到底部
  scrollToBottom();

  try {
    // 调用API获取回答
    const response = await askAIAssistant(currentQuestion);

    // 用实际回答替换"思考中"消息
    chatHistory.value[aiThinkingIndex] = {
      role: 'ai',
      content: response.data
    };

  } catch (error) {
    console.error('获取AI助手回答失败:', error);
    // 更新为错误消息
    chatHistory.value[aiThinkingIndex] = {
      role: 'ai',
      content: '抱歉，我遇到了一些问题，无法回答您的问题。'
    };
    ElMessage.error('获取AI助手回答失败，请稍后再试');
  } finally {
    loading.value = false;
    // 再次滚动到底部
    scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    const chatContainer = document.querySelector('.chat-history');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, 100);
};

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false);
};

// 处理按下回车键发送
const handleKeyDown = (e: KeyboardEvent | Event) => {
  // 兼容 Element Plus 的事件类型
  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  }
};

// 清空聊天历史
const clearHistory = () => {
  chatHistory.value = [];
};
</script>

<template>
  <el-dialog v-model="props.visible" :before-close="closeDialog" destroy-on-close title="AI 书城助手" width="650px">
    <div class="ai-assistant-container">
      <!-- 聊天历史 -->
      <div class="chat-history">
        <div v-if="chatHistory.length === 0" class="empty-chat">
          <el-icon :size="50" class="empty-icon">
            <QuestionFilled/>
          </el-icon>
          <p>您可以询问任何关于书城中书籍的问题</p>
          <p class="example">例如："书城里有哪些书"，"推荐一些计算机类书籍"</p>
        </div>
        <template v-else>
          <div v-for="(chat, index) in chatHistory" :key="index" class="chat-item">
            <!-- 用户消息 -->
            <div v-if="chat.role === 'user'" class="user-question">
              <div class="avatar user-avatar">您</div>
              <div class="message question-message">{{ chat.content }}</div>
            </div>

            <!-- AI消息 -->
            <div v-else class="ai-answer">
              <div class="avatar ai-avatar">AI</div>
              <div :class="{ 'thinking': chat.thinking }" class="message answer-message">
                <span v-if="chat.thinking" class="thinking-animation">{{ chat.content }}</span>
                <span v-else>{{ chat.content }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部输入区域 -->
      <div class="input-area">
        <div class="actions actions-horizontal">
          <div class="question-chips-horizontal">
            <div v-for="(q, index) in suggestedQuestions" :key="index" class="question-chip"
                 @click="selectSuggestedQuestion(q)">
              {{ q }}
            </div>
          </div>
          <el-button size="small" type="text" @click="clearHistory">清空对话</el-button>
        </div>
        <div class="input-wrapper">
          <el-input v-model="question" :rows="3" placeholder="请输入您的问题..." resize="none" type="textarea"
                    @keydown="handleKeyDown"/>
          <el-button :disabled="loading" :loading="loading" type="primary" @click="submitQuestion">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.ai-assistant-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  padding: 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  color: #dcdfe6;
}

.example {
  font-style: italic;
  font-size: 14px;
  color: #aaa;
  margin-top: 10px;
}

.chat-item {
  margin-bottom: 20px;
}

.user-question,
.ai-answer {
  display: flex;
  margin-bottom: 15px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 10px;
}

.user-avatar {
  background-color: #e6f7ff;
  color: #1890ff;
}

.ai-avatar {
  background-color: #1890ff;
  color: white;
}

.message {
  background-color: white;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: calc(100% - 50px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.question-message {
  background-color: #fff;
}

.answer-message {
  background-color: #fff;
  /* 番茄红色边框 */
}

.thinking {
  background-color: #fafafa !important;
}

.thinking-animation {
  position: relative;
  display: inline-block;
}

.thinking-animation::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
  margin-left: 5px;
  top: 50%;
  transform: translateY(-50%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: translateY(-50%) scale(0.8);
  }

  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
  }

  100% {
    opacity: 0.3;
    transform: translateY(-50%) scale(0.8);
  }
}

.input-area {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.actions-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

.question-chips-horizontal {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.question-chip {
  background-color: #f0f2f5;
  color: #409EFF;
  border: 1px solid #e0e3e9;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-chip:hover {
  background-color: #e6f1fc;
  border-color: #409EFF;
  transform: translateY(-1px);
}
</style>

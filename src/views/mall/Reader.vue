<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElSkeletonItem, ElSkeleton, ElDrawer } from 'element-plus';
import Header from '../../components/Header.vue';
import { getBookDetail, getChapterList, getChapterDetail, type Chapter, type ChapterDetail, type BookInfo } from '../../api/book.ts';
import SettingsPanel from '../../components/reader/SettingsPanel.vue';
import { Document, Setting, ArrowLeft, ArrowRight, List } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 状态
const loading = ref(true);
const book = ref<BookInfo | null>(null);
const chapters = ref<Chapter[]>([]);
const currentChapter = ref<ChapterDetail | null>(null);
const chapterDrawerVisible = ref(false);
const settingsDrawerVisible = ref(false);

// 阅读设置
const fontSize = ref(16);
const theme = ref('default');
const lineHeight = ref(1.8);

// 获取参数
const bookId = computed(() => route.query.bookId as string || '1');
const chapterId = computed(() => route.query.chapterId as string);

// 当前章节索引
const currentChapterIndex = computed(() => {
  if (!currentChapter.value) return 0;
  return chapters.value.findIndex(c => c.id === currentChapter.value?.id);
});

// 下一章和上一章ID
const nextChapterAvailable = computed(() => {
  return currentChapter.value?.nextChapterId !== null;
});

const prevChapterAvailable = computed(() => {
  return currentChapter.value?.prevChapterId !== null;
});

// 主题样式
const readerThemeStyle = computed(() => {
  switch (theme.value) {
    case 'eye-care':
      return {
        background: '#f5f5dc',
        color: '#333333'
      };
    case 'night':
      return {
        background: '#252525',
        color: '#dddddd'
      };
    case 'paper':
      return {
        background: '#f8f1e3',
        color: '#333333'
      };
    default:
      return {
        background: '#ffffff',
        color: '#333333'
      };
  }
});

// 内容样式
const contentStyle = computed(() => {
  return {
    fontSize: `${fontSize.value}px`,
    lineHeight: lineHeight.value,
    ...readerThemeStyle.value
  };
});

// 获取书籍信息
const fetchBookInfo = async () => {
  try {
    const response = await getBookDetail(bookId.value);
    if (response.data.code === '200') {
      book.value = response.data.data;
    } else {
      ElMessage.error('获取书籍信息失败');
    }
  } catch (error) {
    console.error('获取书籍信息错误:', error);
    ElMessage.error('获取书籍信息失败');
  }
};

// 获取章节列表
const fetchChapterList = async () => {
  try {
    const response = await getChapterList(bookId.value);
    if (response.data.code === '200') {
      chapters.value = response.data.data;

      // 如果没有指定章节ID，加载第一章
      if (!chapterId.value && chapters.value.length > 0) {
        loadChapter(chapters.value[0].id);
      } else if (chapterId.value) {
        loadChapter(chapterId.value);
      }
    } else {
      ElMessage.error('获取章节列表失败');
    }
  } catch (error) {
    console.error('获取章节列表错误:', error);
    ElMessage.error('获取章节列表失败');
  }
};

// 加载指定章节
const loadChapter = async (id: string) => {
  loading.value = true;
  try {
    const response = await getChapterDetail(bookId.value, id);
    if (response.data.code === '200') {
      currentChapter.value = response.data.data;

      // 更新URL参数，不刷新页面
      router.replace({
        query: { ...route.query, chapterId: id }
      });

      // 滚动到顶部
      window.scrollTo(0, 0);
    } else {
      ElMessage.error('获取章节内容失败');
    }
  } catch (error) {
    console.error('获取章节内容错误:', error);
    ElMessage.error('获取章节内容失败');
  } finally {
    loading.value = false;
  }
};

// 下一章
const goToNextChapter = () => {
  if (currentChapter.value?.nextChapterId) {
    loadChapter(currentChapter.value.nextChapterId);
  }
};

// 上一章
const goToPrevChapter = () => {
  if (currentChapter.value?.prevChapterId) {
    loadChapter(currentChapter.value.prevChapterId);
  }
};

// 选择章节
const selectChapter = (chapter: Chapter) => {
  loadChapter(chapter.id);
  chapterDrawerVisible.value = false;
};

// 保存阅读设置到本地存储
const saveReaderSettings = () => {
  const settings = {
    fontSize: fontSize.value,
    theme: theme.value,
    lineHeight: lineHeight.value
  };
  localStorage.setItem('readerSettings', JSON.stringify(settings));
};

// 加载保存的阅读设置
const loadReaderSettings = () => {
  try {
    const savedSettings = localStorage.getItem('readerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      fontSize.value = settings.fontSize || 16;
      theme.value = settings.theme || 'default';
      lineHeight.value = settings.lineHeight || 1.8;
    }
  } catch (e) {
    console.error('加载阅读设置失败:', e);
  }
};

// 监听设置变化并保存
watch([fontSize, theme, lineHeight], () => {
  saveReaderSettings();
});

// 初始化
onMounted(async () => {
  loadReaderSettings();
  await fetchBookInfo();
  await fetchChapterList();
  loading.value = false;
});
</script>

<template>
  <div class="reader-page">
    <Header />

    <div class="reader-container" :style="readerThemeStyle">
      <div class="reader-header">
        <div class="book-info" v-if="book">
          <h1>{{ book.title }}</h1>
          <p class="author">{{ book.author }}</p>
        </div>

        <div class="reader-actions">
          <el-button type="primary" plain circle @click="chapterDrawerVisible = true">
            <el-icon>
              <List />
            </el-icon>
          </el-button>
          <el-button type="primary" plain circle @click="settingsDrawerVisible = true">
            <el-icon>
              <Setting />
            </el-icon>
          </el-button>
        </div>
      </div>

      <div class="reader-content">
        <el-skeleton :loading="loading" animated>
          <template #default>
            <div v-if="currentChapter" class="chapter">
              <h2 class="chapter-title">{{ currentChapter.title }}</h2>

              <div class="chapter-content" :style="contentStyle" v-html="currentChapter.content"></div>

              <div class="chapter-navigation">
                <el-button :disabled="!prevChapterAvailable" @click="goToPrevChapter" type="primary" plain>
                  <el-icon>
                    <ArrowLeft />
                  </el-icon> 上一章
                </el-button>

                <span class="chapter-progress">
                  {{ currentChapterIndex + 1 }} / {{ chapters.length }}
                </span>

                <el-button :disabled="!nextChapterAvailable" @click="goToNextChapter" type="primary" plain>
                  下一章 <el-icon>
                    <ArrowRight />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <template #template>
            <div class="skeleton-content">
              <el-skeleton-item variant="h1" style="width: 40%" />
              <el-skeleton-item variant="text" style="margin-top: 10px; width: 20%" />
              <el-skeleton-item variant="h3" style="margin-top: 30px; width: 60%" />

              <div class="skeleton-paragraphs">
                <div v-for="i in 8" :key="i">
                  <el-skeleton-item variant="text" style="margin-top: 16px; width: 100%" />
                  <el-skeleton-item variant="text" style="margin-top: 10px; width: 95%" />
                  <el-skeleton-item variant="text" style="margin-top: 10px; width: 90%" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 章节抽屉 -->
    <el-drawer v-model="chapterDrawerVisible" title="章节列表" direction="ltr" size="280px">
      <div class="chapter-list">
        <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item"
          :class="{ active: currentChapter?.id === chapter.id }" @click="selectChapter(chapter)">
          {{ chapter.title }}
        </div>
      </div>
    </el-drawer>

    <!-- 设置抽屉 -->
    <el-drawer v-model="settingsDrawerVisible" title="阅读设置" direction="rtl" size="320px">
      <SettingsPanel v-model:fontSize="fontSize" v-model:theme="theme" v-model:lineHeight="lineHeight" />
    </el-drawer>
  </div>
</template>

<style scoped>
.reader-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.reader-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px 80px;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.book-info h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.author {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
}

.reader-actions {
  display: flex;
  gap: 12px;
}

.chapter-title {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 32px;
  text-align: center;
}

.chapter-content {
  line-height: 1.8;
  letter-spacing: 0.3px;
  hyphens: auto;
  word-break: break-word;
}

.chapter-content p {
  margin-bottom: 16px;
  text-indent: 2em;
}

.chapter-content h3 {
  margin: 24px 0 16px;
  font-size: 1.2em;
}

.chapter-content blockquote {
  border-left: 4px solid #ccc;
  margin: 20px 0;
  padding: 10px 20px;
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
  font-style: italic;
}

.chapter-content ul {
  margin: 16px 0;
  padding-left: 24px;
}

.chapter-content li {
  margin-bottom: 8px;
}

.chapter-navigation {
  margin-top: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chapter-progress {
  font-size: 14px;
  color: #666;
}

.chapter-list {
  padding: 10px 0;
}

.chapter-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chapter-item:hover {
  background-color: #f0f2f5;
}

.chapter-item.active {
  background-color: #409EFF;
  color: white;
}

.skeleton-content {
  padding: 20px 0;
}

.skeleton-paragraphs {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .reader-container {
    padding: 20px 16px 60px;
  }

  .chapter-title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .chapter-navigation {
    flex-direction: column;
    gap: 16px;
  }

  .chapter-progress {
    order: -1;
    margin-bottom: 16px;
  }
}
</style>
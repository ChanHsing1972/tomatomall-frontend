<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElDrawer, ElIcon, ElMessage, ElSkeleton, ElSkeletonItem } from 'element-plus';
import Header from '../../components/Header.vue';
import { type Chapter, getChapterDetail, getChapterList } from '../../api/reader.ts';
import { getProductDetail } from '../../api/product.ts';
import SettingsPanel from '../../components/reader/SettingsPanel.vue';
import { chapterParagraphs } from '../../utils/reader';
import { ArrowLeft, ArrowRight, Menu, Setting } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 状态定义
const loading = ref(true);
const book = ref<any>(null);
const chapters = ref<Chapter[]>([]);
const currentChapter = ref<Chapter | null>(null);
const paragraphs = computed(() => chapterParagraphs(currentChapter.value?.chapterContent || ''));
const loadError = ref('');
const sourceUrl = computed(() => {
  const value = book.value?.specifications?.find(
    (spec: { item: string; value: string }) => spec.item === '原文来源'
  )?.value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'zh.wikisource.org' ? url.href : '';
  } catch {
    return '';
  }
});
const chapterDrawerVisible = ref(false);
const settingsDrawerVisible = ref(false);
const controlsVisible = ref(true);

// 阅读设置
const fontSize = ref(16);
const theme = ref('default');
const lineHeight = ref(1.8);
const fontFamily = ref('serif'); // 新增字体系列选项

// 阅读进度
const readingProgress = ref(0);

// 控制界面显示计时器
let controlsTimer: number | null = null;

// 获取当前书籍ID和章节ID
const productId = computed(() => (route.query.productId as string) || '1');
const chapterId = computed(() => route.query.chapterId as string);

// 当前章节索引
const currentChapterIndex = computed(() => {
  if (!currentChapter.value) return 0;
  return chapters.value.findIndex((c) => c.chapterId === currentChapter.value?.chapterId);
});

// 上/下一章可用性判断
const nextChapterAvailable = computed(() => {
  return (
    !!currentChapter.value &&
    currentChapterIndex.value >= 0 &&
    currentChapterIndex.value < chapters.value.length - 1
  );
});

const prevChapterAvailable = computed(() => {
  return !!currentChapter.value && currentChapterIndex.value > 0;
});

// 根据主题返回完整样式
const readerThemeStyle = computed(() => {
  switch (theme.value) {
    case 'eye-care':
      return { background: '#e8f0d9', color: '#3a3a3a' };
    case 'night':
      return { background: '#252525', color: '#c8c8c8' };
    case 'paper':
      return { background: '#f8f1e3', color: '#333333' };
    case 'sepia':
      return { background: '#f1e9d4', color: '#5f4b32' };
    default:
      return { background: '#ffffff', color: '#333333' };
  }
});

// 内容样式
const contentStyle = computed(() => {
  return {
    fontSize: `${fontSize.value}px`,
    lineHeight: lineHeight.value,
    fontFamily: fontFamily.value,
    ...readerThemeStyle.value,
  };
});

// 是否显示滚动到顶部按钮
const showScrollTop = ref(false);

// 返回书籍详情
const goToBookDetails = () => {
  router.push(`/bookdetail/${productId.value}`);
};

// 获取书籍信息
const fetchBookInfo = async () => {
  try {
    const response = await getProductDetail(productId.value);
    if (response.data.code === '200') {
      book.value = response.data.data;
      document.title = `${book.value.title} - 阅读中 | 枕石书屋`;
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
    const response = await getChapterList(productId.value);
    if (response.data.code === '200') {
      chapters.value = response.data.data.sort(
        (a: Chapter, b: Chapter) => a.chapterNo - b.chapterNo
      );
      if (!chapterId.value && chapters.value.length > 0) {
        await loadChapter(chapters.value[0].chapterId);
      } else if (chapterId.value) {
        const chosen = chapters.value.find(
          (chapter) => chapter.chapterId === Number(chapterId.value)
        );
        if (chosen) await loadChapter(chosen.chapterId);
        else if (chapters.value[0]) await loadChapter(chapters.value[0].chapterId);
      }
    } else {
      ElMessage.error('获取章节列表失败');
    }
  } catch (error) {
    console.error('获取章节列表错误:', error);
    loadError.value = error instanceof Error ? error.message : '获取章节列表失败';
  }
};

// 加载指定章节
const loadChapter = async (id: number) => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await getChapterDetail(productId.value, id);
    if (response.data.code === '200') {
      currentChapter.value = response.data.data;
      // 更新URL参数使用 query 更新
      await router.replace({
        query: { ...route.query, chapterId: id.toString() },
      });
      window.scrollTo(0, 0);
    } else {
      ElMessage.error('获取章节内容失败');
    }
  } catch (error) {
    console.error('获取章节内容错误:', error);
    loadError.value = error instanceof Error ? error.message : '获取章节内容失败';
  } finally {
    loading.value = false;
  }
};

// 下一章
const goToNextChapter = () => {
  if (nextChapterAvailable.value)
    loadChapter(chapters.value[currentChapterIndex.value + 1]!.chapterId);
};

// 上一章
const goToPrevChapter = () => {
  if (prevChapterAvailable.value)
    loadChapter(chapters.value[currentChapterIndex.value - 1]!.chapterId);
};

// 选择章节
const selectChapter = (chapter: Chapter) => {
  loadChapter(chapter.chapterId);
  chapterDrawerVisible.value = false;
};

// 保存阅读设置到本地存储
const saveReaderSettings = () => {
  const settings = {
    fontSize: fontSize.value,
    theme: theme.value,
    lineHeight: lineHeight.value,
    fontFamily: fontFamily.value,
  };
  localStorage.setItem('readerSettings', JSON.stringify(settings));
};

// 加载本地存储的阅读设置
const loadReaderSettings = () => {
  try {
    const savedSettings = localStorage.getItem('readerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      fontSize.value = settings.fontSize || 16;
      theme.value = settings.theme || 'default';
      lineHeight.value = settings.lineHeight || 1.8;
      fontFamily.value = settings.fontFamily || 'serif';
    }
  } catch (e) {
    console.error('加载阅读设置失败:', e);
  }
};

// 处理滚动事件
const handleScroll = () => {
  // 显示/隐藏滚动到顶部按钮
  showScrollTop.value = window.scrollY > 300;

  // 计算阅读进度
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.value =
    scrollHeight > 0 ? Math.min(Math.round((window.scrollY / scrollHeight) * 100), 100) : 0;

  // 自动隐藏控制条
  showControls();
};

// 显示控制条，并在一段时间后自动隐藏
const showControls = () => {
  controlsVisible.value = true;

  // 清除之前的计时器
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }

  // 5秒后自动隐藏控制条
  controlsTimer = window.setTimeout(() => {
    controlsVisible.value = false;
  }, 5000);
};

// 监听设置变化并保存
watch([fontSize, theme, lineHeight, fontFamily], saveReaderSettings);

// 初始化逻辑
onMounted(async () => {
  loadReaderSettings();
  await fetchBookInfo();
  await fetchChapterList();
  loading.value = false;

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);

  // 移动端触摸屏幕显示控制条
  document.addEventListener('touchstart', showControls);
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('touchstart', showControls);
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
});
</script>

<template>
  <div :class="theme" class="reader-page" @click="showControls">
    <Header />

    <!-- 阅读器容器 -->
    <div class="reader-container" :style="readerThemeStyle">
      <!-- 顶部控制条 -->
      <div :class="{ visible: controlsVisible }" class="reader-controls top-controls">
        <div class="controls-wrapper">
          <div class="controls-left">
            <el-button class="return-button" text @click="goToBookDetails">
              <el-icon>
                <ArrowLeft />
              </el-icon>
              返回
            </el-button>
            <div v-if="book" class="book-info">
              <div class="title">{{ book.title }}</div>
              <div class="author">
                {{
                  book.specifications.find((spec: any) => spec.item === '作者')?.value || '未知作者'
                }}
              </div>
            </div>
          </div>

          <div class="controls-right">
            <el-button circle class="control-button" @click="chapterDrawerVisible = true">
              <el-icon>
                <Menu />
              </el-icon>
            </el-button>
            <el-button circle class="control-button" @click="settingsDrawerVisible = true">
              <el-icon>
                <Setting />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 阅读进度条 -->
      <div :style="{ width: `${readingProgress}%` }" class="reading-progress-bar"></div>

      <!-- 正文内容区域 -->
      <div class="reader-content" @click="showControls">
        <el-skeleton :loading="loading" animated>
          <template #default>
            <div v-if="loadError" class="reader-error" role="alert">
              <p>{{ loadError }}</p>
              <el-button @click="fetchChapterList">重新加载</el-button>
            </div>
            <div v-else-if="!currentChapter" class="reader-empty">此书暂未提供阅读章节。</div>
            <div v-else class="chapter">
              <h2 class="chapter-title">{{ currentChapter.chapterTitle }}</h2>
              <div class="chapter-content" :style="contentStyle">
                <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
              </div>

              <p v-if="sourceUrl" class="reading-source">
                原文来源：<a :href="sourceUrl" target="_blank" rel="noopener noreferrer"
                  >维基文库</a
                >
                · 原作公版，编辑内容依
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  >CC BY-SA 4.0</a
                >
                署名。
              </p>

              <!-- 底部章节导航 -->
              <div class="chapter-navigation">
                <el-button
                  :disabled="!prevChapterAvailable"
                  class="nav-button prev-chapter"
                  @click="goToPrevChapter"
                >
                  <el-icon>
                    <ArrowLeft />
                  </el-icon>
                  上一章
                </el-button>

                <div class="chapter-info">
                  <span class="chapter-progress">
                    第 {{ currentChapterIndex + 1 }} 章 / 共 {{ chapters.length }} 章
                  </span>
                  <div class="progress-indicator">
                    <div class="progress-track">
                      <div
                        :style="{
                          width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`,
                        }"
                        class="progress-fill"
                      ></div>
                    </div>
                  </div>
                </div>

                <el-button
                  :disabled="!nextChapterAvailable"
                  class="nav-button next-chapter"
                  @click="goToNextChapter"
                >
                  下一章
                  <el-icon>
                    <ArrowRight />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <!-- 骨架屏 -->
          <template #template>
            <div class="skeleton-content">
              <el-skeleton-item class="skeleton-title" variant="h1" />
              <el-skeleton-item class="skeleton-author" variant="text" />
              <el-skeleton-item class="skeleton-chapter" variant="h3" />
              <div class="skeleton-paragraphs">
                <div v-for="i in 8" :key="i" class="skeleton-paragraph">
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 章节列表抽屉 -->
      <el-drawer
        v-model="chapterDrawerVisible"
        :show-close="true"
        :with-header="true"
        class="chapter-drawer"
        direction="ltr"
        size="min(320px, 100vw)"
        title="目录"
      >
        <div class="chapter-list-header">
          <div class="title">{{ book?.title }}</div>
          <div class="author">共 {{ chapters.length }} 章</div>
        </div>
        <div class="chapter-list">
          <div
            v-for="(chapter, index) in chapters"
            :key="chapter.chapterId"
            :class="{
              active: currentChapter?.chapterId === chapter.chapterId,
              read: index <= currentChapterIndex,
            }"
            class="chapter-item"
            @click="selectChapter(chapter)"
          >
            <span class="chapter-number">{{ index + 1 }}</span>
            <span class="chapter-item-title">{{ chapter.chapterTitle }}</span>
            <span v-if="currentChapter?.chapterId === chapter.chapterId" class="reading-badge"
              >阅读中</span
            >
          </div>
        </div>
      </el-drawer>

      <!-- 设置抽屉 -->
      <el-drawer
        v-model="settingsDrawerVisible"
        :show-close="true"
        :with-header="true"
        class="settings-drawer"
        direction="rtl"
        size="min(380px, 100vw)"
        title="阅读设置"
      >
        <SettingsPanel
          v-model:fontFamily="fontFamily"
          v-model:fontSize="fontSize"
          v-model:lineHeight="lineHeight"
          v-model:theme="theme"
        />
      </el-drawer>
    </div>
  </div>

  <el-backtop :bottom="50" :right="30" />
</template>

<style scoped>
.reader-page {
  min-height: 100vh;
  background-color: var(--bg-color, #fff);
  margin-top: 60px;
  position: relative;
  transition: background-color 0.3s ease;
}

.reader-page.night {
  --bg-color: #252525;
  --text-color: #c8c8c8;
  --border-color: #444;
  --button-bg: #333;
  --button-color: #ddd;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

.reader-page.eye-care {
  --bg-color: #e8f0d9;
  --text-color: #3a3a3a;
  --border-color: #c5d5a9;
  --button-bg: #d8e6c2;
  --button-color: #3a3a3a;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

.reader-page.paper {
  --bg-color: #f8f1e3;
  --text-color: #333333;
  --border-color: #e5d8c3;
  --button-bg: #efe0cc;
  --button-color: #5f4b32;
  --shadow-color: rgba(0, 0, 0, 0.05);
}

.reader-page.sepia {
  --bg-color: #f1e9d4;
  --text-color: #5f4b32;
  --border-color: #d7cba8;
  --button-bg: #e6dbbc;
  --button-color: #5f4b32;
  --shadow-color: rgba(0, 0, 0, 0.05);
}

.reader-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 100px 40px 100px;
  min-height: calc(100vh - 60px);
  transition: all 0.5s ease;
  position: relative;
}

/* 顶部控制条 */
.reader-controls {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(
    to bottom,
    rgba(var(--bg-color-rgb, 255, 255, 255), 0.95),
    rgba(var(--bg-color-rgb, 255, 255, 255), 0.85)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  display: flex;
  justify-content: center;
  /* 居中显示包装器 */
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-100%);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
}

.controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  /* 设置最大宽度 */
  padding: 0 10px;
}

.reader-controls.visible {
  transform: translateY(0);
  opacity: 1;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.controls-right {
  margin-left: 15px;
  min-width: 100px;
  /* 确保右侧控制区有最小宽度 */
  justify-content: flex-end;
  /* 按钮靠右对齐 */
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.author {
  font-size: 14px;
  color: var(--text-color, #666);
}

/* 阅读进度条 */
.reading-progress-bar {
  position: fixed;
  top: 60px;
  left: 0;
  height: 2px;
  background-color: #409eff;
  z-index: 11;
  transition: width 0.3s ease;
}

/* 正文内容区域 */
.reader-content {
  position: relative;
  padding: 20px 0;
}

.chapter-title {
  font-family: 'sf pro display', 'Segoe UI', Roboto, serif;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 40px;
  text-align: center;
  color: var(--text-color, #333);
  position: relative;
  padding-bottom: 20px;
}

.chapter-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background-color: var(--border-color, #eaeaea);
}

.chapter-content {
  line-height: 1.8;
  letter-spacing: 0.5px;
  hyphens: auto;
  word-break: break-word;
  color: var(--text-color, #333);
  font-size: 16px;
}

/* 美化章节内容样式 */
.chapter-content p {
  margin: 0 0 1.25em;
  text-indent: 2em;
  text-align: justify;
  overflow-wrap: anywhere;
}

.chapter-content h3 {
  margin: 30px 0 20px;
  font-size: 1.3em;
  font-weight: 600;
}

.chapter-content blockquote {
  border-left: 4px solid var(--border-color, #ccc);
  margin: 25px 0;
  padding: 10px 20px;
  color: var(--text-color, #666);
  background-color: rgba(0, 0, 0, 0.03);
  font-style: italic;
  border-radius: 0 4px 4px 0;
}

.chapter-content ul {
  margin: 20px 0;
  padding-left: 30px;
}

.chapter-content li {
  margin-bottom: 10px;
}

/* 章节导航 */
.chapter-navigation {
  margin-top: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid var(--border-color, #eaeaea);
}

.chapter-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.chapter-progress {
  font-size: 14px;
  color: var(--text-color, #666);
  font-weight: 500;
}

.progress-indicator {
  width: 150px;
  margin-top: 5px;
}

.progress-track {
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: rgb(0, 113, 227);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.nav-button {
  border: 1px solid var(--border-color, #eaeaea);
  background-color: var(--button-bg, white);
  color: var(--button-color, #333);
  transition: all 0.3s ease;
  font-weight: 500;
  height: 38px;
}

.nav-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-chapter {
  padding-left: 15px;
}

.next-chapter {
  padding-right: 15px;
}

/* 章节列表样式 */
.chapter-list-header {
  padding: 20px 20px;
  border-bottom: 1px solid var(--border-color, #eaeaea);
  margin-bottom: 10px;
}

.chapter-list-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--text-color, #333);
}

.chapter-list-header p {
  font-size: 14px;
  color: var(--text-color, #666);
  margin: 0;
}

.chapter-list {
  padding: 10px 5px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.chapter-item {
  padding: 14px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  position: relative;
  margin: 4px 0;
}

.chapter-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.chapter-item.active {
  background-color: rgba(64, 158, 255, 0.15);
  font-weight: 500;
}

.chapter-item.read .chapter-number {
  color: #409eff;
}

.chapter-number {
  min-width: 28px;
  margin-right: 10px;
  color: var(--text-color, #666);
  font-size: 14px;
}

.chapter-item-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color, #333);
}

.reading-badge {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 骨架屏样式 */
.skeleton-content {
  padding: 20px 0;
}

.skeleton-title {
  width: 60%;
  height: 32px;
  margin: 0 auto 30px;
}

.skeleton-author {
  width: 30%;
  height: 16px;
  margin: 0 auto 40px;
}

.skeleton-chapter {
  width: 40%;
  height: 24px;
  margin: 0 auto 40px;
}

.skeleton-paragraphs {
  margin-top: 30px;
}

.skeleton-paragraph {
  margin-bottom: 25px;
}

.skeleton-paragraph :deep(.el-skeleton__text) {
  height: 16px;
  margin: 8px 0;
}

/* 设置抽屉样式 */
:deep(.settings-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
}

:deep(.settings-drawer .el-drawer__body) {
  padding: 0;
}

:deep(.chapter-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
}

:deep(.chapter-drawer .el-drawer__body) {
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .reader-container {
    padding: 80px 30px 80px;
  }

  .controls-wrapper {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .reader-container {
    padding: 70px 25px 60px;
  }

  .chapter-title {
    font-size: 22px;
    margin-bottom: 30px;
  }

  .chapter-navigation {
    flex-direction: column;
    gap: 20px;
  }

  .chapter-info {
    order: -1;
    margin-bottom: 10px;
  }

  .controls-left .book-info {
    display: none;
  }

  .controls-left {
    max-width: 60%;
    /* 限制左侧控制区宽度 */
  }

  .controls-right {
    min-width: 90px;
    /* 确保右侧按钮区域有足够宽度 */
  }
}

@media (max-width: 480px) {
  .reader-container {
    padding: 60px 16px 50px;
  }

  .chapter-content {
    font-size: 15px;
    letter-spacing: 0.3px;
  }

  .chapter-title {
    font-size: 20px;
    margin-bottom: 25px;
  }

  .nav-button {
    width: 100%;
  }

  .return-button span {
    display: none;
  }

  .controls-left {
    max-width: 50%;
  }

  .controls-right {
    min-width: 80px;
  }
}
.reading-source {
  margin-top: 36px;
  font-size: 13px;
  color: var(--text-color, #6e6e73);
  line-height: 1.7;
}
.reading-source a {
  color: #0066cc;
}
.reader-empty,
.reader-error {
  padding: 48px 0;
  text-align: center;
}
@media (max-width: 767px) {
  .reader-page {
    margin-top: 104px;
  }
  .reader-controls,
  .reading-progress-bar {
    top: 104px;
  }
  .reader-container {
    box-sizing: border-box;
    padding: 90px 20px 50px;
  }
}
</style>

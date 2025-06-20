<script setup lang="ts">
// 接收父组件的设置和更新方法
const props = defineProps<{
  fontSize: number;
  theme: string;
  lineHeight: number;
  fontFamily: string;
}>();

const emits = defineEmits(['update:fontSize', 'update:theme', 'update:lineHeight', 'update:fontFamily']);

// 字体大小选项
const fontSizeOptions = [
  {label: '小', value: 14},
  {label: '标准', value: 16},
  {label: '大', value: 18},
  {label: '超大', value: 20}
];

// 主题选项
const themeOptions = [
  {label: '默认', value: 'default', bgColor: '#ffffff', textColor: '#333333'},
  {label: '护眼', value: 'eye-care', bgColor: '#e8f0d9', textColor: '#3a3a3a'},
  {label: '纸张', value: 'paper', bgColor: '#f8f1e3', textColor: '#333333'},
  {label: '复古', value: 'sepia', bgColor: '#f1e9d4', textColor: '#5f4b32'},
  {label: '夜间', value: 'night', bgColor: '#252525', textColor: '#c8c8c8'}
];

// 行高选项
const lineHeightOptions = [
  {label: '紧凑', value: 1.6},
  {label: '标准', value: 1.8},
  {label: '宽松', value: 2.2}
];

// 字体选项
const fontFamilyOptions = [
  {label: '衬线体', value: 'serif'},
  {label: '无衬线体', value: 'sans-serif'},
  {label: '楷体', value: 'kaiti'},
  {label: '宋体', value: 'songti'},
];

// 更新设置
const updateFontSize = (value: number) => {
  emits('update:fontSize', value);
};

const updateTheme = (value: string) => {
  emits('update:theme', value);
};

const updateLineHeight = (value: number) => {
  emits('update:lineHeight', value);
};

const updateFontFamily = (value: string) => {
  emits('update:fontFamily', value);
};
</script>

<template>
  <div class="settings-panel">
    <!-- 字体大小设置 -->
    <div class="settings-section">
      <div class="section-header">
        <h4>字体大小</h4>
        <span class="current-value">{{ props.fontSize }}px</span>
      </div>

      <div class="option-group size-options">
        <div v-for="option in fontSizeOptions" :key="option.value" :class="{ active: props.fontSize === option.value }"
             class="option-item font-size-item" @click="updateFontSize(option.value)">
          <span :style="{ fontSize: option.value + 'px' }" class="size-preview">A</span>
          <span class="size-label">{{ option.label }}</span>
        </div>
      </div>

      <div class="size-slider">
        <input :value="props.fontSize" max="24" min="12" step="1" type="range"
               @input="updateFontSize(parseInt(($event.target as HTMLInputElement).value))"/>
        <div class="slider-markers">
          <span class="marker">小</span>
          <span class="marker">大</span>
        </div>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="settings-section">
      <div class="section-header">
        <h4>阅读主题</h4>
      </div>

      <div class="theme-options">
        <div v-for="option in themeOptions" :key="option.value" class="theme-option"
             :class="{ active: props.theme === option.value }" @click="updateTheme(option.value)">
          <div :style="{ backgroundColor: option.bgColor, color: option.textColor }" class="theme-preview">
            <span>A</span>
          </div>
          <span class="theme-label">{{ option.label }}</span>
        </div>
      </div>
    </div>

    <!-- 字体选择 -->
    <div class="settings-section">
      <div class="section-header">
        <h4>字体</h4>
      </div>

      <div class="option-group font-options">
        <div v-for="option in fontFamilyOptions" :key="option.value"
             :class="{ active: props.fontFamily === option.value }"
             class="option-item font-option" @click="updateFontFamily(option.value)">
          <span :style="{ fontFamily: option.value }" class="font-preview">字</span>
          <span class="font-label">{{ option.label }}</span>
        </div>
      </div>
    </div>

    <!-- 行高设置 -->
    <div class="settings-section">
      <div class="section-header">
        <h4>行间距</h4>
        <span class="current-value">{{ props.lineHeight }}倍</span>
      </div>

      <div class="option-group spacing-options">
        <div v-for="option in lineHeightOptions" :key="option.value"
             :class="{ active: props.lineHeight === option.value }"
             class="option-item spacing-item" @click="updateLineHeight(option.value)">
          <div :style="{ lineHeight: option.value }" class="spacing-preview">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="spacing-label">{{ option.label }}</span>
        </div>
      </div>

      <div class="size-slider">
        <input :value="props.lineHeight * 10" max="24" min="14" step="1" type="range"
               @input="updateLineHeight(parseInt(($event.target as HTMLInputElement).value) / 10)"/>
        <div class="slider-markers">
          <span class="marker">紧凑</span>
          <span class="marker">宽松</span>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section">
      <h5>预览</h5>
      <div :style="{
        fontSize: props.fontSize + 'px',
        lineHeight: props.lineHeight,
        fontFamily: props.fontFamily,
        backgroundColor: themeOptions.find(t => t.value === props.theme)?.bgColor,
        color: themeOptions.find(t => t.value === props.theme)?.textColor
      }" class="text-preview">
        <p>凉风有信，秋月无边。亏我思娇的情绪，好比度日如年。虽然我不是玉郎，穿我的心也一片。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 30px 20px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
}

/* 设置区块样式 */
.settings-section {
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  font-size: 17px;
  margin: 0;
  color: #333;
  font-weight: 600;
}

.current-value {
  font-size: 14px;
  color: #888;
}

/* 选项组样式 */
.option-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.option-item {
  border-radius: 12px;
  background: #f5f5f7;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(25% - 9px);
}

.option-item:hover {
  background: #eaeaea;
  transform: translateY(-2px);
}

.option-item.active {
  background: #409EFF;
  color: white;
}

/* 字体大小选项 */
.font-size-item {
  padding: 15px 10px;
}

.size-preview {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.size-label {
  font-size: 12px;
}

/* 滑块样式 */
.size-slider {
  margin-top: 20px;
  padding: 0 5px;
}

.size-slider input {
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
}

.size-slider input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #409EFF;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.size-slider input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #237aff;
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.marker {
  font-size: 12px;
  color: #888;
}

/* 主题选项样式 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-option:hover .theme-preview {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.theme-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
}

.theme-option.active .theme-preview {
  border-color: #409EFF;
  transform: scale(1.05);
}

.theme-preview span {
  font-size: 18px;
  font-weight: bold;
}

.theme-label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.theme-option.active .theme-label {
  color: #409EFF;
  font-weight: 500;
}

/* 字体选项样式 */
.font-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(25% - 9px);
}

.font-preview {
  font-size: 22px;
  font-weight: 500;
}

.font-label {
  font-size: 12px;
}

/* 行间距选项样式 */
.spacing-item {
  padding-top: 12px;
  padding-bottom: 12px;
  width: calc(33.33% - 8px);
}

.spacing-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.spacing-preview span {
  width: 80%;
  height: 3px;
  background-color: currentColor;
  opacity: 0.6;
  margin: 2px 0;
}

.spacing-label {
  font-size: 12px;
}

/* 预览区域 */
.preview-section {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
}

.preview-section h5 {
  margin: 0 0 15px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
}

.text-preview {
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.text-preview p {
  margin: 0;
  text-indent: 2em;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .theme-options {
    grid-template-columns: repeat(3, 1fr);
    row-gap: 20px;
  }

  .option-item {
    padding: 10px 8px;
  }

  .settings-panel {
    padding: 20px 15px;
  }

  .section-header h4 {
    font-size: 16px;
  }
}
</style>
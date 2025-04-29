<script setup lang="ts">

// 接收父组件的设置和更新方法
const props = defineProps<{
  fontSize: number;
  theme: string;
  lineHeight: number;
}>();

const emits = defineEmits(['update:fontSize', 'update:theme', 'update:lineHeight']);

// 字体大小选项
const fontSizeOptions = [
  { label: '小', value: 14 },
  { label: '标准', value: 16 },
  { label: '大', value: 18 },
  { label: '超大', value: 20 }
];

// 主题选项
const themeOptions = [
  { label: '默认', value: 'default', bgColor: '#ffffff', textColor: '#333333' },
  { label: '护眼', value: 'eye-care', bgColor: '#f5f5dc', textColor: '#333333' },
  { label: '夜间', value: 'night', bgColor: '#252525', textColor: '#dddddd' },
  { label: '纸张', value: 'paper', bgColor: '#f8f1e3', textColor: '#333333' }
];

// 行高选项
const lineHeightOptions = [
  { label: '紧凑', value: 1.5 },
  { label: '标准', value: 1.8 },
  { label: '宽松', value: 2.2 }
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
</script>

<template>
  <div class="settings-panel">
    <div class="settings-section">
      <h4>字体大小</h4>
      <div class="option-group">
        <div v-for="option in fontSizeOptions" :key="option.value" class="option-item"
          :class="{ active: props.fontSize === option.value }" @click="updateFontSize(option.value)">
          {{ option.label }}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h4>阅读主题</h4>
      <div class="option-group">
        <div v-for="option in themeOptions" :key="option.value" class="theme-option"
          :class="{ active: props.theme === option.value }" @click="updateTheme(option.value)"
          :style="{ backgroundColor: option.bgColor, color: option.textColor }">
          {{ option.label }}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h4>行高</h4>
      <div class="option-group">
        <div v-for="option in lineHeightOptions" :key="option.value" class="option-item"
          :class="{ active: props.lineHeight === option.value }" @click="updateLineHeight(option.value)">
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
  font-weight: 500;
}

.option-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.option-item {
  padding: 8px 16px;
  border-radius: 20px;
  background: #f5f5f7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-align: center;
}

.option-item:hover {
  background: #eaeaea;
}

.option-item.active {
  background: #333;
  color: white;
}

.theme-option {
  width: 70px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.theme-option.active {
  border-color: #409EFF;
}
</style>
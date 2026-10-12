<template>
  <div class="code-quality-test">
    <h2>{{ title }}</h2>

    <div v-if="data !== null">
      <p>{{ message }}</p>
    </div>

    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>

    <button @click="handleClick" style="margin-top: 20px">
      点击按钮
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 定义 props
withDefaults(defineProps<{ items?: { id: number; name: string }[] }>(), {
  items: () => [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
});

const emit = defineEmits(['click']);
let timer: ReturnType<typeof setTimeout>;
const title = ref<string>('代码质量测试组件');
const message = ref<string>('Hello World');
const data = ref<boolean | null>(true);

function fetchMessage(): void {
  timer = setTimeout(() => {
    message.value = 'Updated Message';
  }, 1000);
}

function handleClick(): void {
  emit('click');
}

onMounted(() => {
  fetchMessage();
});
onUnmounted(() => clearTimeout(timer));
</script>



<style scoped>
.code-quality-test {
  padding: 20px;
  background-color: #f0f0f0;
}

h2 {
  font-size: 24px;
  color: #333;
}

button {
  padding: 10px 20px;
}
</style>

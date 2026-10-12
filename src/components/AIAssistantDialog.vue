<script setup lang="ts">
import AIConversation from './AIConversation.vue';
import '../styles/store.css';
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>();
</script>
<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="AI 书城助手"
    class="store-dialog ai-store-dialog"
    width="850px"
    ><AIConversation
  /></el-dialog>
</template>
<style>
.ai-store-dialog.el-dialog {
  margin-top: 6dvh;
}
.ai-store-dialog .ai-transcript {
  max-height: 50dvh;
}
@media (max-width: 600px) {
  .ai-store-dialog.el-dialog {
    margin-top: 3dvh;
  }
  .ai-store-dialog .ai-conversation {
    min-height: unset;
  }
  .ai-store-dialog .ai-transcript {
    max-height: 48dvh;
  }
}
</style>

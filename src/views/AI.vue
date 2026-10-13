<script setup lang="ts">
import Header from '../components/Header.vue';
import AIConversation from '../components/AIConversation.vue';
import '../styles/store.css';
</script>
<template>
  <Header />
  <main class="store-page ai-page">
    <div class="store-shell ai-page-shell">
      <AIConversation page />
    </div>
  </main>
</template>
<style scoped>
.ai-page {
  height: 100dvh;
  overflow: hidden;
}
.ai-page-shell {
  max-width: 960px;
  height: calc(100dvh - 60px);
  padding: 32px 24px 0;
}
@media (max-width: 767px) {
  .ai-page-shell {
    height: calc(100dvh - 104px);
    padding: 24px 20px 0;
  }
}
</style>

<script setup lang="ts">
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import AIConversation from '../components/AIConversation.vue';
import '../styles/store.css';
</script>
<template>
  <Header />
  <main class="store-page">
    <div class="store-shell ai-page-shell">
      <AIConversation page />
    </div>
  </main>
  <Footer />
</template>
<style scoped>
.ai-page-shell {
  max-width: 960px;
  padding-top: 100px;
  padding-bottom: 32px;
}
.store-heading {
  margin-bottom: 30px;
}
@media (max-width: 600px) {
  .ai-page-shell {
    padding-top: 36px;
  }
  .store-heading {
    margin-bottom: 24px;
  }
}
</style>

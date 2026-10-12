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
      <header class="store-heading">
        <div>
          <span class="store-eyebrow">枕石书屋 · AI</span>
          <h1>为你，找到下一本。</h1>
          <p>在想法与书页之间，开启新的探索。</p>
        </div>
      </header>
      <AIConversation page />
    </div>
  </main>
  <Footer />
</template>
<style scoped>
.ai-page-shell {
  max-width: 960px;
  padding-top: 52px;
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

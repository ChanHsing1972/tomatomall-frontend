<script setup lang="ts">
import Header from './Header.vue';
import '../styles/admin.css';
defineProps<{ title: string }>();
</script>
<template>
  <Header />
  <main class="admin-page">
    <div class="admin-shell">
      <nav class="admin-nav" aria-label="管理后台">
        <router-link to="/manage/products">商品</router-link
        ><router-link to="/manage/ads">广告</router-link
        ><router-link to="/manage/coupons">优惠券</router-link>
      </nav>
      <header class="admin-heading">
        <h1>{{ title }}</h1>
        <div class="admin-actions"><slot name="actions" /></div>
      </header>
      <slot />
    </div>
  </main>
</template>

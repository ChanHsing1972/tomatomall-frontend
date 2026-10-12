<script setup lang="ts">
const insecureDemo = window.location.hostname === 'zhenshi.qd.je' && window.location.protocol !== 'https:';
</script>
<template>
  <el-container direction="vertical">
    <router-view />
    <div v-if="insecureDemo" class="connection-notice">安全连接准备中，请暂时仅使用演示账户。</div>
  </el-container>
</template>
<style scoped>
.connection-notice { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; padding: 10px; text-align: center; background: #fff4d8; color: #584718; font-size: 13px; }
</style>

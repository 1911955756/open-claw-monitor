<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <Layout>
        <router-view />
      </Layout>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { zhCn, en } from 'element-plus/es/locale/index'
import Layout from './components/Layout.vue'

const locale = ref(zhCn)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>

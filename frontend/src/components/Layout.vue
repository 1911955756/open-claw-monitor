<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <h1>🦞 OpenClaw</h1>
        <p>Monitor</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/overview">
          <el-icon><DataAnalysis /></el-icon>
          <span>总览</span>
        </el-menu-item>
        <el-menu-item index="/agents">
          <el-icon><Cpu /></el-icon>
          <span>Agents</span>
        </el-menu-item>
        <el-menu-item index="/sessions">
          <el-icon><ChatLineRound /></el-icon>
          <span>会话</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-right">
          <el-button type="primary" :icon="Refresh" @click="refreshData">
            刷新
          </el-button>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataAnalysis, Cpu, ChatLineRound, Refresh } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)

const refreshData = () => {
  window.location.reload()
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
  
  .logo {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #1f2d3d;
    
    h1 {
      margin: 0;
      font-size: 18px;
      color: #fff;
    }
    
    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .el-menu {
    border-right: none;
  }
}

.el-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
}

.el-main {
  background: #f0f2f5;
  padding: 20px;
}
</style>

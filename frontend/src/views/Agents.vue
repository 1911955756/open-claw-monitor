<template>
  <div class="agents-page">
    <h2>Agents 管理</h2>
    
    <el-table :data="agents" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="agent_id" label="Agent ID" width="200">
        <template #default="{ row }">
          <router-link :to="`/agents/${row.agent_id}`">
            {{ row.agent_id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="total_sessions" label="总 Sessions" width="120" align="center" />
      <el-table-column prop="success_rate" label="成功率" width="120">
        <template #default="{ row }">
          {{ (row.success_rate * 100).toFixed(1) }}%
        </template>
      </el-table-column>
      <el-table-column prop="total_tokens_in" label="Tokens In" width="120">
        <template #default="{ row }">
          {{ formatNumber(row.total_tokens_in) }}
        </template>
      </el-table-column>
      <el-table-column prop="total_tokens_out" label="Tokens Out" width="120">
        <template #default="{ row }">
          {{ formatNumber(row.total_tokens_out) }}
        </template>
      </el-table-column>
      <el-table-column prop="last_active" label="最后活跃" width="180">
        <template #default="{ row }">
          {{ row.last_active ? formatDate(row.last_active) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <router-link :to="`/agents/${row.agent_id}`">
            <el-button type="primary" link>查看详情</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { agentApi } from '@/api'

interface Agent {
  agent_id: string
  total_sessions: number
  success_rate: number
  total_tokens_in: number
  total_tokens_out: number
  last_active: string
}

const loading = ref(false)
const agents = ref<Agent[]>([])

const fetchAgents = async () => {
  loading.value = true
  try {
    const res = await agentApi.list()
    agents.value = res.data || []
  } catch (error) {
    console.error('Error fetching agents:', error)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchAgents()
})
</script>

<style scoped lang="scss">
.agents-page {
  h2 {
    margin-bottom: 20px;
    color: #303133;
  }
}
</style>

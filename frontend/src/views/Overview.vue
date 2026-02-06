<template>
  <div class="overview-page">
    <h2>系统总览</h2>
    
    <!-- KPI Cards -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总 Sessions</template>
          <div class="kpi-value">{{ stats.totalSessions || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>活跃 Agents</template>
          <div class="kpi-value">{{ stats.activeAgents || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>成功率</template>
          <div class="kpi-value">{{ (stats.successRate * 100).toFixed(1) }}%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总 Tokens</template>
          <div class="kpi-value">{{ formatNumber(stats.totalTokens || 0) }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Recent Sessions -->
    <el-card shadow="never" class="mt-20">
      <template #header>
        <div class="card-header">
          <span>最近的 Sessions</span>
          <router-link to="/sessions">
            <el-button type="primary" link>查看全部</el-button>
          </router-link>
        </div>
      </template>
      
      <el-table :data="recentSessions" stripe style="width: 100%">
        <el-table-column prop="id" label="Session ID" width="180">
          <template #default="{ row }">
            <router-link :to="`/sessions/${row.id}`">
              {{ row.id.slice(0, 8) }}...
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="agent_id" label="Agent" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_steps" label="Steps" width="80" />
        <el-table-column prop="start_time" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sessionApi, agentApi } from '@/api'

interface Session {
  id: string
  agent_id: string
  status: string
  total_steps: number
  start_time: string
}

const stats = ref({
  totalSessions: 0,
  activeAgents: 0,
  successRate: 0,
  totalTokens: 0,
})

const recentSessions = ref<Session[]>([])

const fetchData = async () => {
  try {
    const [agents, sessionsData] = await Promise.all([
      agentApi.list(),
      sessionApi.list({ limit: 5 }),
    ])
    
    const agentsData = agents.data || []
    const sessions = sessionsData.data?.data || []
    
    stats.value.totalSessions = sessions.length
    stats.value.activeAgents = agentsData.length
    
    const successCount = sessions.filter((s: Session) => s.status === 'success').length
    stats.value.successRate = sessions.length > 0 ? successCount / sessions.length : 0
    
    stats.value.totalTokens = sessions.reduce(
      (acc: number, s: Session) => acc + (s.total_steps || 0),
      0
    )
    
    recentSessions.value = sessions
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    running: 'warning',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.overview-page {
  h2 {
    margin-bottom: 20px;
    color: #303133;
  }
}

.kpi-row {
  .kpi-value {
    font-size: 32px;
    font-weight: bold;
    color: #409EFF;
    text-align: center;
  }
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

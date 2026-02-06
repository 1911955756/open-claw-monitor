<template>
  <div class="agent-detail" v-loading="loading">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="agent-id">{{ agentId }}</span>
        </template>
      </el-page-header>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总 Sessions</template>
          <div class="kpi-value">{{ stats.total_sessions || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>成功率</template>
          <div class="kpi-value">{{ (stats.success_rate * 100).toFixed(1) }}%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>平均 Steps</template>
          <div class="kpi-value">{{ (stats.avg_steps_per_session || 0).toFixed(1) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>最后活跃</template>
          <div class="kpi-value small">
            {{ stats.last_active ? formatDate(stats.last_active) : '-' }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="mt-20">
      <template #header>
        <span>最近的 Sessions</span>
      </template>
      
      <el-table :data="recentSessions" stripe style="width: 100%">
        <el-table-column prop="id" label="Session ID" width="220">
          <template #default="{ row }">
            <router-link :to="`/sessions/${row.id}`">
              {{ row.id }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_steps" label="Steps" width="80" align="center" />
        <el-table-column prop="total_tokens_in" label="Tokens" width="120" />
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
import { useRoute, useRouter } from 'vue-router'
import { agentApi } from '@/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const agentId = route.params.agentId as string
const stats = ref<any>({})
const recentSessions = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agentApi.get(agentId)
    stats.value = res.data
    recentSessions.value = res.data.recent_sessions || []
  } catch (error) {
    console.error('Error fetching agent:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/agents')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.agent-detail {
  .page-header {
    margin-bottom: 20px;
    
    .agent-id {
      font-family: monospace;
      font-size: 14px;
    }
  }
  
  .stats-row {
    .kpi-value {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      text-align: center;
      
      &.small {
        font-size: 14px;
      }
    }
  }
  
  .mt-20 {
    margin-top: 20px;
  }
}
</style>

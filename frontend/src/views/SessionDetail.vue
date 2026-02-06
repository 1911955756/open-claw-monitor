<template>
  <div class="session-detail" v-loading="loading">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="session-id">{{ sessionId }}</span>
        </template>
      </el-page-header>
    </div>
    
    <el-card v-if="session" class="session-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="Agent">
          {{ session.agent_id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(session.status)">
            {{ session.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="触发源">
          {{ session.trigger_source }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatDate(session.start_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ session.end_time ? formatDate(session.end_time) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="总 Steps">
          {{ session.total_steps || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Tokens In">
          {{ session.total_tokens_in || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="Tokens Out">
          {{ session.total_tokens_out || 0 }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>Steps 列表</span>
          <router-link :to="`/sessions/${sessionId}/timeline`">
            <el-button type="primary" link>查看时间线</el-button>
          </router-link>
        </div>
      </template>
      
      <el-table :data="steps" stripe style="width: 100%">
        <el-table-column prop="id" label="Step ID" width="200" />
        <el-table-column prop="step_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.step_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skill_name" label="Skill" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="耗时(ms)" width="100" />
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
import { sessionApi } from '@/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const sessionId = route.params.sessionId as string
const session = ref<any>(null)
const steps = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await sessionApi.get(sessionId)
    session.value = res.data
    steps.value = res.data.steps || []
  } catch (error) {
    console.error('Error fetching session:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/sessions')
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    running: 'warning',
  }
  return map[status] || 'info'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.session-detail {
  .page-header {
    margin-bottom: 20px;
    
    .session-id {
      font-family: monospace;
      font-size: 14px;
    }
  }
  
  .session-card {
    .el-descriptions {
      margin: 0;
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
}
</style>

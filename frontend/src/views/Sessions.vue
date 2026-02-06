<template>
  <div class="sessions-page">
    <div class="page-header">
      <h2>会话管理</h2>
      <div class="filters">
        <el-select v-model="filters.status" placeholder="状态筛选" clearable>
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="运行中" value="running" />
        </el-select>
        <el-button type="primary" @click="fetchSessions">刷新</el-button>
      </div>
    </div>
    
    <el-table :data="sessions" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="Session ID" width="220">
        <template #default="{ row }">
          <router-link :to="`/sessions/${row.id}`">
            {{ row.id }}
          </router-link>
        </template>
      </el-table-column>
      
      <el-table-column prop="agent_id" label="Agent" width="150" />
      
      <el-table-column prop="trigger_source" label="触发源" width="100" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="total_steps" label="Steps" width="80" align="center" />
      
      <el-table-column prop="total_tokens" label="Tokens" width="120">
        <template #default="{ row }">
          {{ (row.total_tokens_in || 0) + (row.total_tokens_out || 0) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="start_time" label="开始时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.start_time) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetails(row.id)">
            查看详情
          </el-button>
          <el-button 
            type="danger" 
            link 
            @click="deleteSession(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.offset"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="fetchSessions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { sessionApi } from '@/api'

interface Session {
  id: string
  agent_id: string
  trigger_source: string
  status: string
  total_steps: number
  total_tokens_in: number
  total_tokens_out: number
  start_time: string
}

const router = useRouter()
const loading = ref(false)
const sessions = ref<Session[]>([])

const filters = reactive({
  status: '',
})

const pagination = reactive({
  total: 0,
  limit: 20,
  offset: 1,
})

const fetchSessions = async () => {
  loading.value = true
  try {
    const params = {
      status: filters.status || undefined,
      limit: pagination.limit,
      offset: (pagination.offset - 1) * pagination.limit,
    }
    
    const res = await sessionApi.list(params)
    sessions.value = res.data?.data || []
    pagination.total = res.data?.pagination?.total || 0
  } catch (error) {
    ElMessage.error('获取会话列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewDetails = (sessionId: string) => {
  router.push(`/sessions/${sessionId}`)
}

const deleteSession = async (sessionId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await sessionApi.delete(sessionId)
    ElMessage.success('删除成功')
    fetchSessions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
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

watch(filters, () => {
  pagination.offset = 1
  fetchSessions()
})

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped lang="scss">
.sessions-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
    
    .filters {
      display: flex;
      gap: 10px;
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

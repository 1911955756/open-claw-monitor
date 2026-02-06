<template>
  <div class="session-timeline">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span>Session Timeline: {{ sessionId.slice(0, 8) }}...</span>
        </template>
      </el-page-header>
    </div>
    
    <div v-if="timeline" class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="(step, index) in timeline.timeline"
          :key="step.step_id"
          :timestamp="formatDate(step.start_time)"
          :type="step.status === 'success' ? 'success' : 'danger'"
          placement="top"
        >
          <el-card>
            <div class="step-header">
              <el-tag>{{ step.step_type }}</el-tag>
              <span class="step-id">{{ step.step_id }}</span>
              <span class="duration">{{ step.duration_ms }}ms</span>
            </div>
            
            <div v-if="step.skill_name" class="step-skill">
              Skill: {{ step.skill_name }}
            </div>
            
            <div v-if="step.llm_calls && step.llm_calls.length > 0" class="llm-info">
              <el-divider content-position="left">LLM Calls</el-divider>
              <div v-for="llm in step.llm_calls" :key="llm.model" class="llm-item">
                <el-tag size="small" type="info">{{ llm.model }}</el-tag>
                <span class="tokens">
                  In: {{ llm.tokens_in }} | Out: {{ llm.tokens_out }}
                </span>
                <span class="latency">{{ llm.latency_ms }}ms</span>
              </div>
            </div>
            
            <div v-if="step.tool_calls && step.tool_calls.length > 0" class="tool-info">
              <el-divider content-position="left">Tool Calls</el-divider>
              <div v-for="tool in step.tool_calls" :key="tool.tool_name" class="tool-item">
                <el-tag size="small" type="warning">{{ tool.tool_name }}</el-tag>
                <span class="status">
                  <el-tag :type="tool.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ tool.status }}
                  </el-tag>
                </span>
                <span class="latency">{{ tool.latency_ms }}ms</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    
    <el-skeleton v-else v-loading="loading" :rows="5" animated />
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
const timeline = ref<any>(null)

const fetchTimeline = async () => {
  loading.value = true
  try {
    const res = await sessionApi.timeline(sessionId)
    timeline.value = res.data
  } catch (error) {
    console.error('Error fetching timeline:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/sessions/${sessionId}`)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchTimeline()
})
</script>

<style scoped lang="scss">
.session-timeline {
  .page-header {
    margin-bottom: 20px;
  }
-container {
    padding  
  .timeline: 20px;
    background: #fff;
    border-radius: 4px;
  }
  
  .step-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    .step-id {
      font-family: monospace;
      font-size: 12px;
      color: #909399;
    }
    
    .duration {
      margin-left: auto;
      color: #409EFF;
      font-weight: bold;
    }
  }
  
  .step-skill {
    color: #606266;
    margin-bottom: 10px;
  }
  
  .llm-item, .tool-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 5px 0;
    
    .tokens, .latency {
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>

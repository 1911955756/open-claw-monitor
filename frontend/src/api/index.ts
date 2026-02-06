// API Service

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Health APIs
export const healthApi = {
  check: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
}

// Session APIs
export const sessionApi = {
  list: (params?: {
    agent_id?: string
    status?: string
    from?: string
    to?: string
    limit?: number
    offset?: number
  }) => api.get('/sessions', { params }),
  
  get: (sessionId: string) => api.get(`/sessions/${sessionId}`),
  
  timeline: (sessionId: string) => api.get(`/sessions/${sessionId}/timeline`),
  
  stats: (sessionId: string) => api.get(`/sessions/${sessionId}/stats`),
  
  delete: (sessionId: string) => api.delete(`/sessions/${sessionId}`),
}

// Agent APIs
export const agentApi = {
  list: () => api.get('/agents'),
  
  get: (agentId: string) => api.get(`/agents/${agentId}`),
  
  getSkills: (agentId: string) => api.get(`/agents/${agentId}/skills`),
}

// Telemetry APIs (for testing)
export const telemetryApi = {
  sessionStarted: (data: any) => api.post('/telemetry/session/started', data),
  sessionCompleted: (data: any) => api.post('/telemetry/session/completed', data),
  stepStarted: (data: any) => api.post('/telemetry/step/started', data),
  stepCompleted: (data: any) => api.post('/telemetry/step/completed', data),
  llmCall: (data: any) => api.post('/telemetry/llm/call', data),
  toolCall: (data: any) => api.post('/telemetry/tool/call', data),
  batch: (events: any[]) => api.post('/telemetry/batch', { events }),
}

export default api

// Vue Router Configuration

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/overview',
  },
  {
    path: '/overview',
    name: 'Overview',
    component: () => import('@/views/Overview.vue'),
    meta: { title: '总览' },
  },
  {
    path: '/agents',
    name: 'Agents',
    component: () => import('@/views/Agents.vue'),
    meta: { title: 'Agents' },
  },
  {
    path: '/agents/:agentId',
    name: 'AgentDetail',
    component: () => import('@/views/AgentDetail.vue'),
    meta: { title: 'Agent详情' },
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('@/views/Sessions.vue'),
    meta: { title: '会话' },
  },
  {
    path: '/sessions/:sessionId',
    name: 'SessionDetail',
    component: () => import('@/views/SessionDetail.vue'),
    meta: { title: '会话详情' },
  },
  {
    path: '/sessions/:sessionId/timeline',
    name: 'SessionTimeline',
    component: () => import('@/views/SessionTimeline.vue'),
    meta: { title: '时间线' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'OpenClaw Monitor'
  next()
})

export default router

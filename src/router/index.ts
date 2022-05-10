import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import RouteList from './routes/index'
import { getServerIp } from '@/stores/systemConfig.store'
import { ElNotification } from 'element-plus'

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('@/views/Error/ErrorPage.vue'),
  //   meta: {
  //     title: 'Χαλαρό - 404not found'
  //   }
  // },
  {
    path: '/',
    component: () => import('@/views/Home/Index.vue'),
    meta: {
      title: 'Χαλαρό',
      dom: '#home'
    }
  },
  ...RouteList
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name !== 'Setting' && !getServerIp()) {
    ElNotification({
      type: 'error',
      title: '配置',
      message: '请先配置服务器地址'
    })
    next({ name: 'Setting' })
  }
  next()
})

export default router

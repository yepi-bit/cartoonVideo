const User = () => import('@/views/User/Index.vue')

export default {
  path: '/user',
  name: 'User',
  component: User,
  meta: {
    title: 'Χαλαρό',
    dom: '#user'
  },
  children: []
}

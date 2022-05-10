const Setting = () => import('@/views/Setting/Index.vue')

export default {
  path: '/setting',
  name: 'Setting',
  component: Setting,
  meta: {
    title: 'Χαλαρό',
    dom: '#Setting'
  },
  children: []
}

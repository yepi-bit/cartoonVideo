const Home = () => import('@/views/Home/Index.vue')
export default {
  path: '/home',
  name: 'Home',
  component: Home,
  meta: {
    title: 'Χαλαρό',
    dom: '#home'
  },
  children: []
}

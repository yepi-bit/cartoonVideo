const Search = () => import('@/views/Search/Index.vue')
export default {
  path: '/search',
  name: 'Search',
  component: Search,
  meta: {
    title: 'Χαλαρό',
    dom: '#search'
  },
  children: []
}

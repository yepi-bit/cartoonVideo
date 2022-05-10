const Main = () => import('@/views/Main/Index.vue')
export default {
  path: '/comicmain/:id',
  name: 'ComicMain',
  component: Main,
  meta: {
    title: 'Χαλαρό',
    dom: '.comic-main'
  },
  props: true,
  children: []
}

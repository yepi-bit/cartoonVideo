<template>
  <img v-if="!loaded" ref="fakeImgEl" :src="BASE_IMG" alt="" />
  <img v-else :src="src" alt="" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { loadImg } from '@/utils/media'
import { domObserver } from '@/utils/dom'

const BASE_IMG =
  'https://api.adicw.cn/images/61e78c7e3d14b.JPG?path=StudyImg&w=600&h=600'

export default defineComponent({
  name: 'BaseImg',
  props: {
    src: {
      type: String,
      default: ''
    },
    lazy: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const fakeImgEl = ref<HTMLImageElement>()
    const loaded = ref(false)

    const load = async () => {
      if (!props.src) return
      await loadImg(props.src)
      loaded.value = true
    }
    if (!props.lazy) load()

    onMounted(() => {
      domObserver(fakeImgEl.value!, load)
    })

    return {
      loaded,
      BASE_IMG,
      fakeImgEl
    }
  }
})
</script>
<style lang="less" scoped>
img {
  object-fit: cover;
}
</style>

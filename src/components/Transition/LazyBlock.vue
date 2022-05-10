<template>
  <div ref="selfEl" class="lazy-block">
    <slot v-if="visible" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { domObserver } from '@/utils/dom'

export default defineComponent({
  name: 'LazyBlock',
  setup() {
    const selfEl = ref<HTMLElement>()
    const visible = ref(false)
    onMounted(() => {
      domObserver(selfEl.value!, () => {
        visible.value = true
      })
    })
    return {
      visible,
      selfEl
    }
  }
})
</script>

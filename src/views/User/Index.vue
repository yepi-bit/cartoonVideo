<template>
  <div id="user">
    <PlayHistory />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PlayHistory from './components/PlayHistory.vue'
export default defineComponent({
  name: 'User',
  components: {
    PlayHistory
  },
  setup() {
    return {}
  }
})
</script>
<style lang="less" scoped>
#user {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

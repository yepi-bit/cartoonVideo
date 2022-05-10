<template>
  <div v-if="detail" class="comic-card" @click="toComicMain(detail!.id)">
    <div class="cover">
      <HoverImgCard :src="detail.cover" />
    </div>
    <div class="info">{{ detail.title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import * as Api from '@/api'
import { toComicMain } from '@/hooks/router'

import HoverImgCard from '@/components/Transition/HoverImgCard.vue'

export default defineComponent({
  name: 'ComicCard',
  components: {
    HoverImgCard
  },
  props: {
    detail: {
      type: Object as PropType<Api.SearchComicReturn['data'][0] | null>,
      default: null
    }
  },
  setup() {
    return {
      toComicMain
    }
  }
})
</script>
<style lang="less" scoped>
.comic-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  .cover {
    flex: 1;
    width: 100%;
    aspect-ratio: 1/1.4;
    border-radius: 6px;
  }

  .info {
    display: flex;
    align-items: center;
    overflow: hidden;
    color: var(--font-color);
    text-align: center;
    font-size: 14px;
    height: 36px;
    margin: 8px 0;
    .p-truncate(2);
  }
}
</style>

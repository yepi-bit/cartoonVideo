<template>
  <div class="play-history">
    <h2>
      播放历史
      <el-popconfirm
        title="确定清空播放记录嘛？"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="clearHistory"
      >
        <template #reference>
          <Icon name="delete" />
        </template>
      </el-popconfirm>
    </h2>
    <div class="play-history__content">
      <CodepenCard
        v-for="item in list"
        :key="item.id"
        :detail="item"
        @click="toComicMain(item.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { toComicMain } from '@/hooks/router'
import { usePlayCacheStore } from '@/stores/playCache.store'
import CodepenCard, {
  Detail as CodepenCardDetail
} from '@comps/Card/CodepenCard.vue'

export default defineComponent({
  name: 'PlayHistory',
  components: {
    CodepenCard
  },
  setup() {
    const playCacheStore = usePlayCacheStore()
    const list = computed<CodepenCardDetail[]>(() =>
      playCacheStore.playHistory.map((item) => ({
        cover: item.cover,
        title: item.name,
        avatar: item.cover,
        desc: item.playEpisode
          ? `${item.playEpisode} ${item.playProgress}`
          : '播放失败',
        tags: [
          {
            icon: 'player',
            content: `最后播放时间：${item.date}`
          }
        ],
        id: item.id
      }))
    )
    const clearHistory = () => playCacheStore.clearHistory()
    return {
      clearHistory,
      list,
      toComicMain
    }
  }
})
</script>
<style lang="less" scoped>
.play-history {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 30px;
  box-sizing: border-box;
  background: var(--box-bg-color);
  border-top-left-radius: 24px;
  h2 {
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  &__content {
    display: grid;
    width: 100%;
    margin-top: 20px;
    grid-template-columns: repeat(4, 1fr);
    gap: 60px 50px;
    padding-bottom: 40px;
  }
}
</style>

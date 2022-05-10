<template>
  <div class="comic-main">
    <div class="comic-main__break">
      <Icon name="arrow" @click="$router.go(-1)" />
    </div>

    <div :style="{ opacity: isPending ? 0 : 1 }" class="comic-main__inner">
      <div class="comic-main__video">
        <AwVideo
          ref="awVideoComp"
          :key="id"
          :src="anthology.current"
          autoplay
          @next="nextAnthology"
          @ended="nextAnthology"
          @error="onVideoError"
        />
      </div>
      <div class="comic-main__box">
        <el-tabs>
          <el-tab-pane label="选集" lazy>
            <div class="comic-main__anthology">
              <!-- <div
                v-show="anthology.isPending"
                class="comic-main__anthology-loading"
              ></div>-->
              <ComicAnthology
                v-for="(item, index) in anthology.list"
                :key="index"
                :org-id="item.orgId"
                :active="anthology.current"
                :label="item.name"
                :list="item.values"
                :bad-anthology="anthology.bads"
                @change="changeAnthology"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="详情" lazy>
            <div class="comic-main__info">
              <div class="cover">
                <HoverImgCard :src="comic.cover" />
              </div>
              <div class="message">
                <h1>{{ comic.title }}</h1>
                <ul class="message-tags">
                  <li v-for="item in comicTags" :key="item.label">
                    <span>{{ item.label }}</span>
                    <b>{{ item.value }}</b>
                  </li>
                </ul>
                <ul class="message-cates">
                  <li v-for="item in comic.cates" :key="item">{{ item }}</li>
                </ul>
                <div class="message-desc">
                  <b>声优：</b>
                  <p>
                    <a
                      v-for="item in comic.voiceActors"
                      :key="item"
                      :href="`https://baike.baidu.com/item/${item}`"
                      target="_blank"
                      >{{ item }}</a
                    >
                  </p>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  reactive,
  Ref,
  ref,
  toRef,
  watch
} from 'vue'

import AwVideo from '@comps/AwVideo/AwVideo.vue'
import ComicAnthology, { ChangeReturns } from './component/ComicAnthology.vue'
import HoverImgCard from '@/components/Transition/HoverImgCard.vue'
import { ElNotification } from 'element-plus'

import * as Api from '@apis/index'
import * as Type from './types/index.type'
import { GetComicMainReturn } from '@apis/index'
import { getVal, sToMs, wait } from '@/utils/adLoadsh'
import { usePlayCache } from '@/hooks/user'

/**
 * 动漫信息模块
 * @param comicId 动漫id
 * @param init 信息请求完成后的回调
 */
function comicInfoModule(comicId: Ref<number | string>, init: () => void) {
  const isPending = ref(false)
  /** 动漫信息 */
  const comic = reactive<GetComicMainReturn>({
    title: '',
    season: '',
    region: '',
    rank: '',
    master: '',
    lang: '',
    firstDate: '',
    cover: '',
    voiceActors: [],
    cates: [],
    playlist: []
  })
  /** 动漫地址集 */
  const comicUrls = ref<Api.GetVideoUrlReturn>([])
  /** 动漫tags */
  const comicTags = computed(() => [
    {
      label: '评分',
      value: comic.rank
    },
    {
      label: '首播时间',
      value: comic.firstDate
    },
    {
      label: '状态',
      value: comic.season
    },
    {
      label: '语言',
      value: comic.lang
    },
    {
      label: '地区',
      value: comic.region
    },
    {
      label: '作者',
      value: comic.master
    }
  ])

  /** 数据获取 */
  watch(
    comicId,
    async (comicId) => {
      isPending.value = true
      comicUrls.value = await Api.getVideoUrl(comicId)
      const data = await Api.getComicMain(comicId)

      if (data) {
        comic.playlist = data.playlist
        ;(Object.keys(comic) as (keyof GetComicMainReturn)[]).forEach((k) => {
          if (typeof data[k] !== 'undefined') {
            comic[k] = data[k] as any
          }
        })
        isPending.value = false
        init()
      }
    },
    {
      immediate: true
    }
  )

  return {
    comic,
    comicUrls,
    comicTags,
    isPending
  }
}

export default defineComponent({
  name: 'ComicMain',
  components: {
    AwVideo,
    ComicAnthology,
    HoverImgCard
  },
  props: {
    id: {
      type: [Number, String],
      default: -1
    }
  },
  setup(props) {
    const awVideoComp = ref<InstanceType<typeof AwVideo>>()
    const { playProgressCache, playHistoryCache } = usePlayCache()
    const { comic, comicUrls, ...comicInfoModuleArgs } = comicInfoModule(
      toRef(props, 'id'),
      async () => {
        // 获取对应缓存
        const cache = playProgressCache.getLatestCache(+props.id)
        if (cache) {
          // 查找缓存对应源
          const list = anthology.list.find((item) => item.orgId === cache.orgId)
          if (!list) return
          // 查找缓存对应集
          const value = list.values.find((item) => item.name === cache.name)
          if (value) {
            changeAnthology(
              {
                ...value,
                orgId: list.orgId
              },
              false
            )
            await wait(2000)
            // 定位缓存进度
            awVideoComp.value!.changeProgress(cache.progress)
            awVideoComp.value!.notify({
              content: `已为您定位到 ${value.name} ${sToMs(cache.progress)}`,
              duration: 3000
            })
          }
        } else {
          // 默认选择第一个源下的第一集
          const item = getVal(() => anthology.list[0].values[0], null)
          const isBad =
            item &&
            !changeAnthology(
              {
                ...item,
                orgId: anthology.list[0].orgId
              },
              false
            )
          isBad &&
            ElNotification({
              type: 'error',
              title: '动漫加载',
              message: '默认加载失败，请手动选择源'
            })
        }
        playHistoryCache.add({
          id: +props.id,
          name: comic.title,
          cover: comic.cover
        })
      }
    )
    /** 选集 */
    const anthology = reactive<
      Type.Anthology & {
        /** 当前选中的集信息 */
        currentItem: ChangeReturns | null
      }
    >({
      current: '',
      currentItem: null,
      bads: [],
      list: computed(() =>
        comicUrls.value.map((item) => ({
          name: `播放源-${item.key}`,
          orgId: item.key,
          values: item.value.map((url, index) => ({
            name: getVal(() => comic.playlist[index].name, '未知'),
            value: url
          }))
        }))
      )
    })

    /**
     * 修改选集
     * @param item 选择集信息
     * @param isAddCache 是否添加到播放缓存
     */
    const changeAnthology = (item: ChangeReturns, isAddCache = true) => {
      const { value } = item
      // 错误地址判断
      if (['kol-fans.fp.ps'].some((key) => value.includes(key))) {
        anthology.bads.push(value)
        return false
      } else {
        anthology.current = value
        anthology.currentItem = item
        isAddCache && saveProgressCache(item)
        awVideoComp.value!.notify({
          content: `正在播放${item.name}`,
          duration: 3000
        })
        return true
      }
    }
    /** 下一集 */
    const nextAnthology = () => {
      if (!anthology.currentItem) return
      const org = anthology.list.find(
        (item) => item.orgId === anthology.currentItem!.orgId
      )
      if (!org) return
      const index =
        org.values.findIndex(
          (item) => item.value === anthology.currentItem!.value
        ) + 1
      if (index >= org.values.length) {
        awVideoComp.value!.notify({
          content: `已经是最后一个了~`,
          duration: 3000
        })
        return
      }

      changeAnthology({
        ...org.values[index],
        orgId: org.orgId
      })
    }
    /**
     * 保存播放缓存
     * @param item 集信息
     * @param item
     */
    const saveProgressCache = (item: ChangeReturns | null) => {
      if (!item) return
      playProgressCache.add({
        orgId: item.orgId,
        name: String(item.name),
        progress: getVal(() => awVideoComp.value!.player.currentTime, 0),
        comicId: +props.id
      })
    }
    /**
     * AwVideo-error事件
     */
    const onVideoError = async () => {
      // 重置当前选集
      anthology.bads.push(anthology.current)
      anthology.current = ''
      anthology.currentItem = null
    }

    /** 销毁前预处理 */
    onBeforeUnmount(() => {
      saveProgressCache(anthology.currentItem)
      playProgressCache.saveStore()
      playHistoryCache.saveStore()
    })

    return {
      ...comicInfoModuleArgs,
      comic,
      comicUrls,
      changeAnthology,
      anthology,
      awVideoComp,
      onVideoError,
      nextAnthology
    }
  }
})
</script>
<style lang="less" scoped>
.comic-main {
  @padding: 40px;
  @radius: 24px;
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--box-bg-color);
  border-top-left-radius: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  &__break {
    position: sticky;
    top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.25s;
    i {
      color: var(--font-color);
      font-size: 24px;
      transform: rotateY(180deg);
    }
    &:hover {
      transform: scale(0.8);
    }
  }
  &__inner {
    width: 90%;
    margin: 0 auto;
    animation-duration: 0.5s;
  }
  &__video {
    width: 100%;
    margin-top: @padding;
    border-radius: @radius;
    overflow: hidden;
  }
  &__box {
    width: 100%;
    padding: 30px;
    box-sizing: border-box;
    background: var(--bg-color);
    border-radius: @radius;
    color: var(--font-color);
    margin: @padding 0;
    ::v-deep(.el-tabs) {
      .el-tabs__nav-wrap {
        &::after {
          content: unset;
        }
      }
      .el-tabs__nav {
        padding-bottom: 12px;
      }
      .el-tabs__item {
        color: var(--font-unactive-color);
        font-weight: 600;
        font-size: 28px;
        &.is-active {
          color: var(--font-color);
        }
      }
      .el-tabs__content {
        overflow: unset;
      }
    }
  }
  &__anthology {
    position: relative;
    width: 100%;
    &-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
    }
  }
  &__info {
    display: flex;
    width: 100%;
    padding-top: 10px;
    .cover {
      width: 200px;
      aspect-ratio: 1.4/2;
      border-radius: 8px;
    }
    .message {
      padding-left: 30px;
      flex: 1;
      box-sizing: border-box;
      &-tags {
        margin-top: 20px;
        height: 46px;
        li {
          display: inline-flex;
          height: 100%;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          border-right: 1px solid var(--font-color);
          padding-right: 16px;
          font-size: 12px;
          margin-right: 16px;
          &:last-child {
            border: none;
          }
          span {
            opacity: 0.6;
          }
          b {
            margin-top: 6px;
            font-size: 18px;
            opacity: 0.85;
          }
        }
      }
      &-cates {
        margin-top: 16px;
        opacity: 0.9;
        li {
          font-size: 12px;
          display: inline-block;
          vertical-align: middle;
          height: 20px;
          padding: 0 4px;
          margin: 4px 0;
          margin-right: 10px;
          line-height: 20px;
          border: 1px solid var(--font-color);
          border-radius: 3px;
        }
      }
      &-desc {
        display: flex;
        align-items: flex-start;
        width: 100%;
        margin-top: 16px;
        font-size: 14px;
        b {
          width: 60px;
        }
        a {
          margin-right: 8px;
          color: var(--primary-color);
        }
      }
    }
  }
}
</style>

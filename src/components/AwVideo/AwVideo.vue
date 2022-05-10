<template>
  <div
    ref="selfEl"
    class="aw-video"
    @mousemove="controlBarVisibleHandler"
    @touchmove="controlBarVisibleHandler"
  >
    <div class="aw-video__mask" :class="{ disable: !src }" @click="playHandler">
      <Icon
        v-show="player.status === 2"
        class="aw-video__play"
        name="player-fill"
      />
    </div>
    <div v-show="player.status === 0" class="aw-video__loading">
      <LoadingBlockRun />
    </div>
    <div v-show="isBad" class="aw-video__bad">
      <img src="~static/img/video-bad.png" />
      <span>加载失败了，好耶！</span>
    </div>
    <div v-if="!src" class="aw-video__bad">
      <img src="~static/img/video-empty.png" />
      <span>暂无播放内容~</span>
    </div>

    <div
      :class="{ show: src && !isBad && controlBar.visible }"
      class="aw-video__control"
    >
      <AwVideoProgress
        :duration="player.duration"
        :current-time="player.currentTime"
        @timePreview="computedPreview"
        @change="onProgressChange"
        @progressing="controlBar.isProgressing = true"
        @progressend="controlBar.isProgressing = false"
      >
        <template #tooltip="{ time }">
          <div class="preview">
            <img v-if="player.preview" :src="player.preview" />
            <span>{{ time }}</span>
          </div>
        </template>
      </AwVideoProgress>
      <Icon
        class="control-icon control-icon__play"
        :name="player.status === 1 ? 'pause' : 'play'"
        @click="playHandler"
      />
      <Icon
        class="control-icon control-icon__next"
        name="iconfontsvgnext"
        @click="$emit('next')"
      />
      <div class="control-time">
        {{ sToMs(player.currentTime) }}
        <span>/</span>
        {{ sToMs(player.duration) }}
      </div>

      <div
        v-if="quality.length > 0"
        v-click-outside="() => (qualitySelectVisible = false)"
        class="control-select quality"
      >
        <span @click="qualitySelectVisible = !qualitySelectVisible">{{
          currentQualityName
        }}</span>
        <ul v-show="qualitySelectVisible">
          <li
            v-for="{ name, value } in quality"
            :key="value"
            :class="{ active: currentQuality === value }"
            @click="changeQuality(value)"
          >
            {{ name }}
          </li>
        </ul>
      </div>
      <div
        v-click-outside="() => (playbackRate.visible = false)"
        class="control-select playback-rate"
      >
        <span @click="playbackRate.visible = !playbackRate.visible">{{
          playbackRate.current
        }}</span>
        <ul v-show="playbackRate.visible">
          <li
            v-for="item in playbackRate.list"
            :key="item.value"
            :class="{ active: playbackRate.current === item.name }"
            @click="changePlayBackRate(item)"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <Icon
        class="control-icon"
        style="transform: rotateY(180deg)"
        name="rotate_b"
        @click="fastProgressChange(-15)"
      />
      <Icon
        class="control-icon"
        name="rotate_b"
        @click="fastProgressChange(15)"
      />
      <div class="control-icon control-volume">
        <Icon
          :name="player.isMute ? 'mute' : 'volume'"
          @click="volumeCutover"
        />
        <div class="control-volume__inner">
          <el-slider
            v-model="player.volume"
            vertical
            height="100px"
            :show-tooltip="false"
            @change="changeVolume(player.realVolume)"
          />
        </div>
      </div>
      <Icon
        class="control-icon"
        :name="player.fullScreen ? 'exit-full-screen' : 'full-screen'"
        @click="fullScreen"
      />
    </div>
    <AwVideoMsg ref="awVideoMsgComp" />
    <VideoRender
      ref="videoInstance"
      :key="src"
      :src="src"
      @error="videoEvents.error"
      @initStart="videoInits.start"
      @initSuccessed="videoInits.successed"
      @initFailed="videoInits.failed"
      @canplay="videoEvents.canplay"
      @timeupdate="videoEvents.timeupdate"
      @ended="videoEvents.ended"
      @play="videoEvents.play"
      @pause="videoEvents.pause"
      @waiting="videoEvents.waiting"
      @playing="videoEvents.playing"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  Ref,
  ref,
  SetupContext,
  toRefs
} from 'vue'

import AwVideoProgress from './AwVideoProgress.vue'
import LoadingBlockRun from '@comps/Loading/LoadingBlockRun.vue'
import AwVideoMsg, { NotifyItem, NotifyReturns } from './AwVideoMsg.vue'
import VideoRender from './VideoRender.vue'

import {
  checkFullscreen,
  debounce,
  fullscreen,
  sToMs,
  throttle
} from '@/utils/adLoadsh'
import { useEventListener } from '@/utils/vant/useEventListener'
import { getVideoScreenshot } from '@/utils/media'
import * as Type from './type'

export * from './type'

type Ctx = SetupContext<('changeQuality' | 'ended' | 'error' | 'next')[]>
type VideoInstance = InstanceType<typeof VideoRender>

/** 画质切换模块 */
function qualityModule(quality: Type.Quality[], { emit }: Ctx) {
  /** 当前画质 */
  const currentQuality = ref<Type.Quality['value']>(-1)
  /** 画质选项选项显隐 */
  const qualitySelectVisible = ref(false)
  /** 当前选择的画质名称 */
  const currentQualityName = computed(
    () =>
      quality.find((item) => item.value === currentQuality.value)?.name || '-'
  )

  /**
   * 画质切换
   * @param value 画质值
   */
  const changeQuality = (value: Type.Quality['value']) => {
    currentQuality.value = value
    qualitySelectVisible.value = false
    emit('changeQuality', value)
  }

  return {
    currentQuality,
    currentQualityName,
    changeQuality,
    qualitySelectVisible
  }
}

/** 播放倍数模块 */
function playbackRateModule(videoInstance: Ref<VideoInstance | undefined>) {
  /** 播放倍数集合 */
  const playbackRate = reactive({
    /** 选项显隐 */
    visible: false,
    /** 当前倍数名称 */
    current: '1.0x',
    /** 倍数列表 */
    list: [
      {
        name: '2.0x',
        value: 2
      },
      {
        name: '1.5x',
        value: 1.5
      },
      {
        name: '1.0x',
        value: 1
      },
      {
        name: '0.5x',
        value: 0.5
      }
    ]
  })
  /**
   * 倍数修改
   * @param item
   */
  const changePlayBackRate = (item: typeof playbackRate['list'][0]) => {
    playbackRate.current = item.name
    videoInstance.value?.setPlaybackRate(item.value)
    playbackRate.visible = false
  }
  return {
    changePlayBackRate,
    playbackRate
  }
}

/** 进度模块 */
function progressModule(
  src: Ref<string>,
  videoInstance: Ref<VideoInstance | undefined>,
  player: Type.Player
) {
  /**
   * 进度修改
   * @param val ms
   */
  const changeProgress = (val: number) => {
    videoInstance.value?.setCurrentTime(val)
  }
  /**
   * 计算进度预览图
   * @param val ms
   */
  const computedPreview = debounce(async (val: number) => {
    player.preview = await getVideoScreenshot(src.value, val)
  }, 100)
  /**
   * 进度切换
   * @param val 0-100
   */
  const onProgressChange = (val: any) => {
    const realTime = player.duration * (+val / 100)
    changeProgress(realTime)
  }
  /**
   * 进度快速切换
   * @param limit s
   */
  const fastProgressChange = (limit: number) => {
    const num = player.currentTime + limit
    if (num < 0 || num > player.duration) return
    changeProgress(num)
  }
  return {
    changeProgress,
    computedPreview,
    onProgressChange,
    fastProgressChange
  }
}

export default defineComponent({
  name: 'AwVideo',
  components: {
    AwVideoProgress,
    LoadingBlockRun,
    AwVideoMsg,
    VideoRender
  },
  inheritAttrs: true,
  props: {
    /** 视频源地址 */
    src: {
      type: String,
      default: ''
    },
    /** 画质列表 */
    quality: {
      type: Array as PropType<Type.Quality[]>,
      default: () => []
      // [
      //   {
      //     name: '1080p 超清',
      //     value: 0
      //   },
      //   {
      //     name: '720p 高清',
      //     value: 1
      //   },
      //   {
      //     name: '自动',
      //     value: -1
      //   }
      // ]
    },
    /** 初始化时是否静音 */
    muted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['changeQuality', 'ended', 'error', 'next'],
  setup(props, ctx) {
    const awVideoMsgComp = ref<InstanceType<typeof AwVideoMsg>>()
    const videoInstance = ref<VideoInstance>()
    const selfEl = ref<HTMLElement>()

    const player = reactive<Type.Player>({
      currentTime: 0,
      duration: 0,
      status: -2,
      volume: 60,
      get realVolume() {
        return this.volume / 100
      },
      fullScreen: false,
      isMute: props.muted,
      preview: '',
      isListened: false
    })
    /**
     * 提示框集合
     * ps: 用于存储当前展示的提示框，方便处理
     */
    const notifys = reactive<{
      [prop: string]: NotifyReturns | null
    }>({
      buffer: null,
      canplay: null
    })
    /**
     * 底部控制bar集合
     */
    const controlBar = reactive({
      /** 是否显示 */
      visible: false,
      // todo 类型完善
      timer: null as any,
      /** 是否在进度拖拽中 */
      isProgressing: false
    })
    /** 视频是否错误 */
    const isBad = computed(() => player.status === -1)

    const {
      changeProgress,
      computedPreview,
      onProgressChange,
      fastProgressChange
    } = progressModule(toRefs(props).src, videoInstance, player)

    /** 播放控制 */
    const playHandler = () => {
      switch (player.status) {
        case 0: {
          break
        }
        case 1: {
          videoInstance.value?.pause()
          break
        }
        case 2: {
          videoInstance.value?.play()
          break
        }
        case -1: {
          break
        }
      }
    }
    /** 全屏切换 */
    const fullScreen = () => {
      player.fullScreen = !player.fullScreen
      fullscreen(selfEl.value!, player.fullScreen ? 'to' : 'exit')
    }
    /** 静音切换 */
    const volumeCutover = () => {
      player.isMute = !player.isMute
      changeVolume(player.isMute ? 0 : player.realVolume)
    }
    /**
     * 音量修改
     * @param val 0-100
     */
    const changeVolume = (val: number) => {
      player.isMute = val === 0
      videoInstance.value?.setVolume(val)
    }
    /**
     * 消息提示
     * @param item
     */
    const notify = (item: NotifyItem) => {
      return awVideoMsgComp.value!.notify(item)
    }
    /** 控制bar显隐控制器 */
    const controlBarVisibleHandler = throttle(() => {
      if (controlBar.timer) {
        clearTimeout(controlBar.timer)
        controlBar.timer = null
      } else {
        controlBar.visible = true
        controlBar.timer = setTimeout(() => {
          controlBar.visible = false
          controlBar.timer = null
        }, 3000)
      }
    }, 100)

    /** 视频初始化钩子 */
    const videoInits = {
      start() {
        player.status = 0
        changeVolume(player.realVolume)
      },
      successed() {
        // player.status = 2
      },
      failed() {
        player.status = -1
      }
    }
    /** 视频响应事件 */
    const videoEvents = {
      canplay(e: Event) {
        player.status = 2
        const { duration } = e.target as HTMLVideoElement
        player.duration = duration
        notifys.canplay && notifys.canplay.remove()
        notifys.canplay = notify({
          content: '电波获取完成~',
          duration: 3000
        })
      },

      /** 进度 监听 */
      timeupdate(e: Event) {
        if (controlBar.isProgressing) return
        const { currentTime } = e.target as HTMLVideoElement
        player.currentTime = currentTime
      },
      /** 播放结束 监听 */
      ended() {
        player.status = 2
        notify({
          content: '本集已播放完成~',
          duration: 5000
        })
        ctx.emit('ended')
      },
      /** 播放 监听 */
      play() {
        player.status = 1
      },
      /** 暂停 监听 */
      pause() {
        player.status = 2
      },
      /** 错误 监听 */
      error(e: any) {
        console.error(e)
        player.status = -1
        ctx.emit('error')
        notify({
          content: '视频加载错误，emmm~',
          duration: 5000
        })
      },
      /** 缓冲开始 监听 */
      waiting() {
        player.status = 0
        notifys.buffer = notify({
          content: '电波获取中，请稍后~',
          duration: 3000
        })
      },
      /** 缓冲结束 监听 */
      playing() {
        player.status = 1
        notifys.buffer && notifys.buffer.remove()
      }
    }

    /** 监听 */
    ;(() => {
      // 全屏下无法监听keydown等
      useEventListener('resize', () => {
        !checkFullscreen() && (player.fullScreen = false)
      })
      useEventListener('keydown', (e) => {
        const el = e as KeyboardEvent
        // if (checkFullscreen()) {

        // }
        switch (el.key) {
          case 'ArrowLeft': {
            fastProgressChange(-10)
            break
          }
          case 'ArrowRight': {
            fastProgressChange(10)
            break
          }
        }
      })
    })()

    return {
      videoInits,
      videoEvents,
      videoInstance,
      selfEl,
      awVideoMsgComp,
      player,
      controlBar,
      isBad,
      playHandler,
      sToMs,
      fullScreen,
      volumeCutover,
      changeVolume,
      changeProgress,
      computedPreview,
      notify,
      onProgressChange,
      fastProgressChange,
      controlBarVisibleHandler,
      ...playbackRateModule(videoInstance),
      ...qualityModule(props.quality, ctx)
    }
  }
})
</script>
<style lang="less" scoped>
.aw-video {
  @controlHeight: 38px;
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  color: var(--font-unactive-color);
  background: #000;
  overflow: hidden;
  ::v-deep(.video-render) {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }
  .mask(@height: 100%) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: @height;
  }
  &__play {
    position: absolute;
    right: 30px;
    bottom: 16px;
    font-size: 50px;
    cursor: pointer;
    text-shadow: 0 4px 16px rgb(0 0 0 / 25%);
  }
  &__mask {
    .mask(calc(100% - @controlHeight - 10px));
    z-index: 2;
  }
  &__bad {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 16;
    background: #000;
    img {
      width: 100px;
    }
    span {
      font-weight: 600;
      font-size: 20px;
      margin-top: 30px;
    }
    &::after {
      content: '';
      .mask;
    }
  }
  &__loading {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 15;
    background: rgb(0 0 0 / 25%);
    span {
      margin-top: 30px;
    }
  }
  // &:hover {
  //   .aw-video__control {
  //     opacity: 1;
  //   }
  // }
  &__control {
    @padding: 16px;
    position: absolute;
    left: 0;
    bottom: 0;
    margin: 0 @padding;
    padding-top: 6px;
    margin-bottom: 12px;
    width: calc(100% - @padding*2);
    display: flex;
    align-items: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    height: @controlHeight;
    user-select: none;
    transition: all 0.25s;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    transform: translateY(150%);
    z-index: 6;
    &.show {
      transform: translateY(0%);
    }
    i {
      cursor: pointer;
    }
    .control {
      &-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: @controlHeight;
        height: 100%;
        font-size: 18px;
        &:active {
          opacity: 0.7;
        }
        &__play {
          font-size: 24px;
          &.icon-pause {
            font-size: 16px;
          }
        }
        &__next {
          font-size: 14px;
        }
      }
      &-time {
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0 20px;
        font-size: 14px;
        line-height: 14px;
        span {
          margin: 0 6px;
        }
      }
      &-select {
        position: relative;
        margin-left: auto;
        margin-right: 8px;
        text-align: center;
        &.quality {
          width: 100px;
        }
        &.playback-rate {
          width: 60px;
        }
        span {
          display: inline-block;
          cursor: pointer;
          font-size: 15px;
          line-height: 8px;
          width: 100%;
          height: 15px;
          font-weight: 500;
        }
        ul {
          position: absolute;
          bottom: @controlHeight;
          left: 0;
          right: 0;
          margin: 0 auto;
          width: 100%;
          padding: 6px 0;
          font-size: 14px;
          color: var(--font-unactive-color);
          background: var(--bg-color);
          border-radius: 14px;
          transition: all 0.25s;
          li {
            cursor: pointer;
            padding: 6px 0;
            transition: all 0.25s;
            &.active {
              color: var(--font-color);
              background: none !important;
            }
            &:hover {
              background: var(--primary-color);
            }
          }
        }
      }
      &-volume {
        &:hover {
          .control-volume__inner {
            opacity: 1;
            transform: translateY(0);
          }
        }
        &__inner {
          position: absolute;
          bottom: calc(@controlHeight);
          padding: 18px 4px;
          background: var(--aside-bg-color);
          border-radius: 24px;
          transition: all 0.25s;
          opacity: 0;
          transform: translateY(160%);
          box-shadow: 0 0 12px rgba(0 0 0 / 0.1);
          ::v-deep(.el-slider) {
            .el-slider__bar {
              background: var(--font-color);
            }
            .el-slider__runway {
              width: 2px;
              background: var(--font-unactive-color);
            }
            .el-slider__bar {
              width: 2px;
            }
            .el-slider__button-wrapper {
              left: calc(var(--el-slider-button-wrapper-offset) - 2px);
            }
            .el-slider__button {
              border-color: var(--font-color);
              transform: scale(0.7);
            }
          }
        }
      }
    }
    .preview {
      position: relative;
      width: 100px;
      aspect-ratio: 1.7/1;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      span {
        position: absolute;
        left: 4px;
        bottom: 4px;
        margin: 0 auto;
        font-size: 12px;
      }
    }
  }
  ::v-deep(.vjs-v7) {
    div,
    button {
      display: none !important;
    }
  }
}
</style>

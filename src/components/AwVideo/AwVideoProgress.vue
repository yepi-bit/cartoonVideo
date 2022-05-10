<template>
  <div
    ref="selfDom"
    class="aw-video__progress"
    :class="{ 'aw-video__progress-hide': !hasCurListenlist }"
    @mousemove="onMove"
    @touchmove="onMove"
    @mousedown="progressing"
    @touchstart="progressing"
    @mouseup="progressend"
    @touchend="progressend"
  >
    <el-slider v-model="sliderVal" :show-tooltip="false" v-bind="$attrs" />
    <div class="aw-video__progress-tooltip" :style="tooltipStyle">
      <slot name="tooltip" :time="sToMs(tooltipTime)">
        <span>{{ sToMs(tooltipTime) }}</span>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  CSSProperties,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { sToMs } from '@/utils/adLoadsh'
import { onWindowSizeChange } from '@/utils/vant/useWindowSize'
export default defineComponent({
  name: 'AwVideoProgress',
  props: {
    duration: {
      type: Number,
      default: 0
    },
    currentTime: {
      type: Number,
      default: 0
    }
  },
  emits: ['timeChange', 'timePreview', 'progressing', 'progressend'],
  setup(props, { emit }) {
    const selfDom = ref<HTMLElement>()

    const self = reactive({
      width: 0,
      offsetX: 0
    })
    const mouse = reactive({
      x: 0
    })
    const sliderVal = ref(0)
    const hasCurListenlist = computed(() => true)
    const tooltipStyle = computed(() => {
      return {
        transform: `translateX(${mouse.x - 20}px)`
      } as CSSProperties
    })
    const tooltipTime = computed(() => {
      const { duration } = props
      const time = (mouse.x / self.width) * duration
      return time | 0
    })

    const progressing = () => emit('progressing')
    const progressend = () => emit('progressend')
    const onMove = async (e: MouseEvent | TouchEvent) => {
      if (!hasCurListenlist.value) return
      let x = 0
      switch (e.type) {
        case 'touchmove': {
          x = (e as TouchEvent).changedTouches[0].pageX
          break
        }
        case 'mousemove': {
          x = (e as MouseEvent).pageX
          break
        }
      }
      mouse.x = x - self.offsetX
      emit('timePreview', tooltipTime.value)
    }
    const initStyle = async () => {
      self.width = selfDom.value!.clientWidth
      self.offsetX = selfDom.value!.getBoundingClientRect().left
    }
    const changProgress = () => {
      if (!hasCurListenlist.value) return
      emit('timeChange', tooltipTime.value)
    }
    const computeCurArea = (currentTime: number) => {
      const { duration } = props
      return currentTime === 0
        ? 0
        : +((currentTime / duration) * 100).toFixed(2)
    }

    watch(
      () => props.currentTime,
      (val) => {
        sliderVal.value = computeCurArea(val)
      }
    )

    onMounted(initStyle)
    onWindowSizeChange(initStyle)

    return {
      onMove,
      tooltipStyle,
      selfDom,
      tooltipTime,
      self,
      changProgress,
      sToMs,
      hasCurListenlist,
      progressing,
      progressend,
      sliderVal
    }
  }
})
</script>
<style lang="less" scoped>
.aw-video__progress {
  position: absolute;
  top: 0;
  width: 100%;
  cursor: pointer;
  &:hover {
    .aw-video__progress-tooltip {
      opacity: 1;
    }
  }
  ::v-deep(.el-slider) {
    .el-slider__runway {
      margin: 0;
      background: #eee3;
      .el-slider__bar {
        background: linear-gradient(to left, #1aafe8, #df6edc);
      }
    }
    .el-slider__button {
      border-radius: 4px;
      height: 14px;
    }
  }
  .progress {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.25s;
  }
  &-tooltip {
    position: absolute;
    bottom: 16px;
    left: 0;
    padding: 0 8px;
    background: rgb(0 0 0 / 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.25s;
  }
  &-hide {
    cursor: unset;
    .aw-video__progress-tooltip {
      opacity: 0 !important;
    }
    .progress {
      opacity: 0;
      transform: translateY(100px);
    }
  }
}
</style>

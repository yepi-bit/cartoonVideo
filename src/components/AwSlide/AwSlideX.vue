<template>
  <div ref="selfDom" class="aw-slide-x">
    <div class="aw-slide-content">
      <div class="aw-slide__inner" :class="innerClass" :style="innerStyle">
        <slot />
      </div>
    </div>
    <transition
      enter-active-class="fadeInLeft"
      leave-active-class="fadeOutLeft"
    >
      <div
        v-show="arrowVisible('left')"
        class="aw-slide__arrow aw-slide__arrow--left"
        @click="prev"
      >
        <Icon name="arrow" />
      </div>
    </transition>
    <transition
      enter-active-class="fadeInRight"
      leave-active-class="fadeOutRight"
    >
      <div
        v-show="arrowVisible('right')"
        class="aw-slide__arrow aw-slide__arrow--right"
        @click="next"
      >
        <Icon name="arrow" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  computed,
  CSSProperties,
  defineComponent,
  ComputedRef,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { AWSLIDE_KEY } from './const'
import { useChildren } from '@/utils/vant/useRelation/index'
import { onWindowSizeChange } from '@/utils/vant/useWindowSize'
interface Slider {
  /** 当前激活下标 */
  active: number
  /** 每屏最大内容数量 */
  perScreenChildcount: number
}
function linkChild() {
  const { children, linkChildren } = useChildren(AWSLIDE_KEY)
  linkChildren({})
  const childrenEls = computed<HTMLElement[]>(() =>
    children.map((item) => item.$el)
  )
  return {
    children,
    childrenEls
  }
}
function styleModule(childrenEls: ComputedRef<HTMLElement[]>, slider: Slider) {
  const selfDom = ref<HTMLElement>()

  const isTransition = ref(false)
  const childStyle = reactive({
    width: 0
  })
  const innerOffsetX = computed(() => slider.active * childStyle.width)
  const innerWidth = computed(() => childrenEls.value.length * childStyle.width)
  const innerStyle = computed(() => {
    return {
      width: `${innerWidth.value}px`,
      transform: `translateX(${-innerOffsetX.value}px)`
    } as CSSProperties
  })
  const innerClass = computed(() => ({
    'aw-slide__inner-transition': isTransition.value
  }))
  const arrowVisible = computed(() => (key: 'left' | 'right') => {
    if (key === 'left') {
      return slider.active !== 0
    } else if (key === 'right') {
      return slider.active < childrenEls.value.length - 1
    } else {
      return true
    }
  })

  const initStyle = () => {
    childStyle.width = childrenEls.value[0].clientWidth
    slider.perScreenChildcount =
      (selfDom.value!.clientWidth / childStyle.width) | 0
    isTransition.value = true
  }

  onMounted(initStyle)
  onWindowSizeChange(initStyle)

  return {
    innerStyle,
    innerClass,
    arrowVisible,
    selfDom
  }
}
function controlModule(slider: Slider) {
  const next = () => {
    slider.active++
  }
  const prev = () => {
    slider.active--
  }
  return {
    next,
    prev
  }
}
export default defineComponent({
  name: 'AwSlideX',
  emits: {
    /**
     * 轮播改变事件
     * @param active 当前下标
     */
    onChange: (e: number) => typeof e === 'number'
  },
  setup(props, { emit }) {
    const { children, childrenEls } = linkChild()
    const slider = reactive<Slider>({
      active: 0,
      perScreenChildcount: 0
    })
    watch(
      () => slider.active,
      (active: number) => {
        emit('onChange', active)
      },
      {
        immediate: true
      }
    )
    return {
      children,
      ...styleModule(childrenEls, slider),
      ...controlModule(slider)
    }
  }
})
</script>
<style lang="less" scoped>
.aw-slide-x {
  position: relative;
  .aw-slide {
    &-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    &__inner {
      display: flex;
      &-transition {
        transition: all 0.625s;
      }
    }
  }
  .aw-slide__arrow {
    position: absolute;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 100%;
    cursor: pointer;
    user-select: none;
    animation-duration: 0.25s;
    i {
      font-size: 36px;
      color: #fff;
    }
    &--left {
      left: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);

      i {
        transform: rotateY(180deg);
      }
    }
    &--right {
      right: 0;
      background: linear-gradient(to left, rgba(0, 0, 0, 0.6), transparent);
    }
  }
}
</style>

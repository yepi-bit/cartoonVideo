<template>
  <div class="aw-radio">
    <div v-if="label" class="aw-radio__label">{{ label }}：</div>
    <!-- <div class="aw-radio__options"> -->
    <div
      v-for="{ name, value } in options"
      :key="value"
      :class="{ active: modelValue === value }"
      class="aw-radio__item"
      @click="itemClick(value)"
      @contextmenu.prevent="itemRightClick(value)"
    >
      {{ name }}
    </div>
    <!-- </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Option } from './type'

export * from './type'

export default defineComponent({
  name: 'AwRadio',
  props: {
    options: {
      type: Array as PropType<Option[]>,
      default: () => []
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    rightCancle: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const itemClick = (value: Option['value']) => {
      emit('update:modelValue', value)
      emit('change', value)
    }
    const itemRightClick = (value: Option['value']) => {
      if (!props.rightCancle) return
      if (props.modelValue === value) {
        emit('update:modelValue', '')
        emit('change', '')
      }
    }
    return { itemClick, itemRightClick }
  }
})
</script>
<style lang="less" scoped>
.aw-radio {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
  flex-wrap: wrap;
  line-height: 16px;
  &__label {
    color: var(--font-color);
    width: max-content;
  }
  &__item {
    display: flex;
    align-items: center;
    padding: 0 14px;
    height: 32px;
    transition: all 0.25s;
    border-radius: 8px;
    user-select: none;
    color: var(--font-unactive-color);
    cursor: pointer;
    &.active {
      color: #fff;
      background: var(--primary-color);
    }
    &:hover {
      .active;
    }
  }
}
</style>

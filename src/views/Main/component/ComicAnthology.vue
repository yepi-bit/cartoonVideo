<template>
  <div class="comic-anthology">
    <label>{{ label }}</label>
    <ul>
      <li
        v-for="{ name, value } in list"
        :key="value"
        :class="{ active: active === value, disable: isBad(value) }"
        @click="liClick({ name, value })"
      >
        {{ name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export interface Option {
  name: string | number
  value: string
}
export type ChangeReturns = Option & {
  orgId: string
}

export default defineComponent({
  name: 'ComicAnthology',
  props: {
    label: {
      type: String,
      default: ''
    },
    active: {
      type: [String, Number],
      default: 0
    },
    list: {
      type: Array as PropType<Option[]>,
      default: () => []
    },
    badAnthology: {
      type: Array as PropType<Option['value'][]>,
      default: () => []
    },
    orgId: {
      type: String,
      default: ''
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const isBad = (value: Option['value']) => props.badAnthology.includes(value)
    const liClick = (item: Option) => {
      if (isBad(item.value)) return
      emit('change', {
        ...item,
        orgId: props.orgId
      } as ChangeReturns)
    }
    return {
      isBad,
      liClick
    }
  }
})
</script>
<style lang="less" scoped>
.comic-anthology {
  position: relative;
  margin-bottom: 16px;
  label {
    display: flex;
    padding-bottom: 12px;
  }
  ul {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    li {
      display: flex;
      align-items: center;
      padding: 8px 14px;
      transition: all 0.25s;
      border-radius: 8px;
      user-select: none;
      color: var(--font-unactive-color);
      cursor: pointer;
      &:hover {
        opacity: 0.4;
      }
      &.active {
        color: var(--font-color);
        background: var(--primary-color);
      }
      &.disable {
        opacity: 0.8;
        color: var(--warning-color);
        cursor: no-drop;
      }
    }
  }
}
</style>

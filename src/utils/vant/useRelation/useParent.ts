import {
  ref,
  inject,
  computed,
  onUnmounted,
  getCurrentInstance,
  ComponentPublicInstance,
  ComponentInternalInstance,
  Ref
} from 'vue'

type ParentProvide<T> = T & {
  link(child: ComponentInternalInstance): void
  unlink(child: ComponentInternalInstance): void
  children: ComponentPublicInstance[]
  internalChildren: ComponentInternalInstance[]
}

export function useParent<T>(key: string | symbol): {
  parent: any
  index: Ref<number>
} {
  const parent = inject<ParentProvide<T> | null>(key, null)

  if (parent) {
    const instance = getCurrentInstance()!
    const { link, unlink, internalChildren, ...rest } = parent

    link(instance)

    onUnmounted(() => {
      unlink(instance)
    })

    const index = computed(() => internalChildren.indexOf(instance))

    return {
      parent: rest,
      index
    }
  }

  return {
    parent: null,
    index: ref(-1)
  }
}

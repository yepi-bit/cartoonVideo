import { ref } from 'vue'

/**
 * 延时批渲染
 * @param maxStep 最大步数
 */
export function useDeferredRender(maxStep: number) {
  const deferredRenderStep = ref(0)
  /**
   * 渲染批次顺序
   * @param step 第几步，需小于传入的总步数
   * @returns 是否渲染
   */
  const defer = (step: number) => deferredRenderStep.value > step
  /**
   * 开始渲染
   */
  const runDeferredRender = () => {
    requestAnimationFrame(() => {
      deferredRenderStep.value++
      if (deferredRenderStep.value < maxStep) {
        runDeferredRender()
      }
    })
  }

  return {
    defer,
    runDeferredRender
  }
}

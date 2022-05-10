<template>
  <div class="app-contain">
    <aside class="app-contain__aside">
      <b class="animate__jello">Yepi</b>
      <AppAsideBar />
    </aside>
    <AppTabBar />
    <main class="app-contain__main">
      <AppRouter />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue'
import '@/assets/icon/iconfont.css'
import '@/assets/icon/iconfont.js'

import AppAsideBar from '@comps/Body/AppAsideBar.vue'
import AppTabBar from '@comps/Body/AppTabBar.vue'
import AppRouter from '@comps/Body/AppRouter.vue'
import { useSystemConfigStore } from './stores/systemConfig.store'

function provideModule() {
  const isDev = import.meta.env.MODE === 'development'
  provide('isDev', isDev)
  return {
    isDev
  }
}

export default defineComponent({
  name: 'Comic',
  components: {
    AppAsideBar,
    AppRouter,
    AppTabBar
  },
  setup() {
    const systemConfigStore = useSystemConfigStore()
    systemConfigStore.getServerIp()
    return {
      ...provideModule()
    }
  }
})
</script>
<style lang="less">
@import '~styles/common';
@import '~styles/app';
@import '~styles/var';
.app-contain {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: var(--bg-color);
  color: var(--font-color);
  @slideDruation: 0.625s;
  &__aside {
    display: flex;
    flex-direction: column;
    width: 280px;
    height: calc(100% - @frameTop*2);
    background: var(--aside-bg-color);
    border-radius: 24px;
    padding-left: @frameTop;
    box-sizing: border-box;
    animation: slide-in @slideDruation forwards;
    & > b {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      aspect-ratio: 2/1;
      font-size: 30px;
      animation-duration: 1.25s;
      animation-delay: @slideDruation;
    }
    @keyframes slide-in {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(-@frameTop);
      }
    }
  }
  &__main {
    margin-top: @frameTop;
    box-sizing: border-box;
    height: calc(100% - @frameTop);
    flex: 1;
    overflow: hidden;
    position: relative;
    opacity: 0;
    animation: fade-in 1s @slideDruation forwards;
    @keyframes fade-in {
      to {
        opacity: 1;
      }
    }
  }
}
</style>

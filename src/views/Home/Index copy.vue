<!-- <template>
  <div id="home">
    <header class="home-header">
      <div
        class="home-header__search"
        @click="$router.push({ name: 'Search' })"
      >
        <input type="text" placeholder="请输入搜索关键字..." disabled />
        <Icon name="iconsearch" />
      </div>
      <div class="home-header__else"></div>
    </header>
    <main class="home-main">
      <div class="home-main__col">
        <HomeBanner :is-init="isInit" :banner="comic.banner" />
        <HomeSection
          :is-init="isInit"
          :hots="comic.hots"
          :latest="comic.latest"
        />
      </div>
      <div class="home-main__col">
        <HomeArticle :perweek="comic.perweek" :is-init="isInit" />
        <HomeTv :tv="comic.tv" :is-init="isInit" />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'

import HomeBanner from './component/HomeBanner.vue'
import HomeSection from './component/HomeSection.vue'
import HomeArticle from './component/HomeArticle.vue'
import HomeTv from './component/HomeTv.vue'

import * as Api from '@apis/index'
import * as Type from './types/homeSection.type'

export default defineComponent({
  name: 'Home',
  components: {
    HomeBanner,
    HomeSection,
    HomeArticle,
    HomeTv
  },
  setup() {
    const isInit = ref(false)
    const comic = reactive<Type.Comic>({
      perweek: [],
      hots: [],
      latest: [],
      banner: [],
      tv: []
    })

    ;(async () => {
      const data = await Api.getHomeMixData()
      if (data) {
        const { hots, latest, banner, perweek, tv } = data
        comic.banner = banner
        comic.hots = hots
        comic.latest = latest
        comic.perweek = perweek
        comic.tv = tv
        isInit.value = true
      }
    })()

    return {
      comic,
      isInit
    }
  }
})
</script>
<style lang="less" scoped>
#home {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .home {
    &-header {
      display: flex;
      gap: 26px;
      width: 100%;
      height: 48px;
      // background: #fff;
      &__search {
        position: relative;
        flex: 1;
        input {
          width: 100%;
          height: 100%;
          background: var(--box-bg-color);
          outline: none;
          border: none;
          color: var(--font-color);
          text-indent: 20px;
          border-radius: 12px;
          cursor: pointer;
        }
        i {
          position: absolute;
          right: 14px;
          top: 0;
          bottom: 0;
          margin: auto 0;
          font-size: 22px;
          height: max-content;
          color: var(--font-color);
        }
      }
      &__else {
        flex: 1;
      }
    }
    &-main {
      flex: 1;
      background: var(--box-bg-color);
      border-top-left-radius: 24px;
      padding: 30px 50px;
      box-sizing: border-box;
      overflow-y: auto;
      &__col {
        display: flex;
        width: 100%;
        gap: 40px;
        margin-bottom: 40px;
      }
    }
  }
}
</style> -->

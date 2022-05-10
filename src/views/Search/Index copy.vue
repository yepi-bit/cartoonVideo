<!-- <template>
  <div id="search">
    <header class="search-header">
      <div class="search-header__search">
        <input
          v-model="filter.name"
          type="text"
          placeholder="请输入搜索关键字..."
          @keyup.enter="searchByName()"
        />
        <Icon
          :name="hasSearchKey ? 'delete1' : 'iconsearch'"
          @click="!hasSearchKey ? searchByName() : resetName()"
        />
      </div>
      <Icon
        class="search-header__filter"
        name="filter"
        :class="{ active: filterVisible }"
        @click="filterVisible = !filterVisible"
      />
    </header>
    <transition enter-active-class="fade-in">
      <article v-show="filterVisible" class="search-filter">
        <AwRadio
          v-for="{ label, key, options, rightCancle } in filterConfig"
          :key="key"
          v-model="filter[key]"
          :label="label"
          :options="options"
          :right-cancle="rightCancle"
          @change="searchByFilter"
        />
      </article>
    </transition>
    <main class="search-main">
      <transition
        enter-active-class="animate__fadeIn"
        leave-active-class="animate__fadeOut"
      >
        <div v-show="isFetchingSearch" class="search-main__loading">
          <LoadingCodeRun text="电波获取中，请稍后" />
        </div>
      </transition>
      <div ref="mainContentEl" class="search-main__content">
        <div
          v-for="(item, index) in realSearchResult"
          :key="index"
          class="search-main__content-col"
        >
          <ComicCard v-for="comic in item" :key="comic.id" :detail="comic" />
        </div>
      </div>
    </main>
    <el-pagination
      v-show="searchResult.length > 0"
      v-model:currentPage="pager.currnet"
      class="search-page"
      :page-size="pager.size"
      layout="prev, pager, next, jumper"
      :total="pager.total"
      @current-change="
        hasSearchKey ? searchByName(false) : searchByFilter(false)
      "
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'

import AwRadio from '@comps/Form/AwRadio.vue'
import ComicCard from './component/ComicCard.vue'
import LoadingCodeRun from '@comps/Loading/LoadingCodeRun.vue'

import { SEARCH_FILTER } from './statics/form'
import * as Api from '@/api'
import * as Type from './types/index.type'
import { arrAvgSplit } from '@/utils/adLoadsh'

function filterModule() {
  const filter = reactive({
    name: '',
    year: '',
    status: '',
    label: '',
    region: '',
    sort: '',
    order: SEARCH_FILTER.ORDER[0].value
  })
  const filterConfig: Type.FilterConfig<typeof filter>[] = [
    {
      label: '发布时间',
      key: 'year',
      rightCancle: true,
      options: SEARCH_FILTER.RELEASE_TIME
    },
    {
      label: '分类',
      key: 'label',
      rightCancle: true,
      options: SEARCH_FILTER.CATE
    },
    {
      label: '状态',
      key: 'status',
      rightCancle: true,
      options: SEARCH_FILTER.STATUS
    },
    {
      label: '地区',
      key: 'region',
      rightCancle: true,
      options: SEARCH_FILTER.CITY
    },
    {
      label: '排序',
      key: 'order',
      rightCancle: false,
      options: SEARCH_FILTER.ORDER
    }
  ]
  const pager = reactive({
    currnet: 1,
    size: 24,
    total: 0
  })
  const filterVisible = ref(true)

  const resetPager = () => {
    pager.currnet = 1
    pager.total = 0
  }
  const resetFilter = () => {
    resetPager()
    Object.keys(filter).forEach((key) => {
      if (key !== 'name') {
        ;(filter as any)[key] = ''
      }
    })
  }
  const resetName = () => {
    resetPager()
    filter.name = ''
  }

  ;(async () => {
    const data = await Api.getComicFilterConfig()
    console.log(data)
  })()

  return {
    filter,
    filterConfig,
    pager,
    filterVisible,
    resetFilter,
    resetName
  }
}
export default defineComponent({
  name: 'Search',
  components: {
    AwRadio,
    ComicCard,
    LoadingCodeRun
  },
  setup() {
    const mainContentEl = ref<HTMLElement>()
    const searchResult = ref<Api.ComicPageList[]>([])
    const isFetchingSearch = ref(false)
    const { filter, pager, resetName, resetFilter, ...filterModuleArgs } =
      filterModule()

    const hasSearchKey = computed(() => filter.name !== '')
    const realSearchResult = computed(() => arrAvgSplit(searchResult.value, 8))

    const setSearchResult = (data: Api.ComicPageList[]) => {
      searchResult.value = data
      // searchResult.value.splice(0)
      // const push = (count: number) => {
      //   searchResult.value.push(data[count])
      //   count++
      //   if (count < data.length) {
      //     requestAnimationFrame(() => push(count))
      //   }
      // }

      // push(0)
    }
    const searchByName = async (clear = true) => {
      if (!filter.name) return
      isFetchingSearch.value = true
      mainContentEl.value!.scrollTop = 0
      clear && resetFilter()
      const { data, total } = await Api.searchComic({
        name: filter.name,
        page: pager.currnet - 1
      })
      pager.total = total
      setSearchResult(data)
      isFetchingSearch.value = false
    }
    const searchByFilter = async (clear = true) => {
      isFetchingSearch.value = true
      clear && resetName()
      const { data, total } = await Api.filterComic({
        page: pager.currnet - 1,
        label: filter.label,
        region: filter.region,
        year: filter.year,
        status: filter.status,
        order: filter.order
      })
      setSearchResult(data)
      pager.total = total
      isFetchingSearch.value = false
    }

    onMounted(() => {
      searchByFilter()
    })

    return {
      mainContentEl,
      filter,
      pager,
      isFetchingSearch,
      searchResult,
      searchByFilter,
      searchByName,
      hasSearchKey,
      resetName,
      resetFilter,
      realSearchResult,
      ...filterModuleArgs
    }
  }
})
</script>
<style lang="less" scoped>
@import '~styles/var';
#search {
  @rootGap: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: @rootGap;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .search {
    @radius: 24px;
    @headerHeight: 48px;
    .box {
      background: var(--box-bg-color);
    }
    &-header {
      display: flex;
      align-items: center;
      gap: 26px;
      width: 800px;
      height: @headerHeight;
      // background: #fff;
      &__search {
        position: relative;
        width: 50%;
        height: 100%;
        color: var(--font-color);
        input {
          width: 100%;
          height: 100%;
          background: var(--box-bg-color);
          outline: none;
          border: none;
          text-indent: 20px;
          border-radius: 12px;
          color: var(--font-color);
          font-size: 16px;
        }
        i {
          position: absolute;
          right: 16px;
          top: 0;
          bottom: 0;
          margin: auto 0;
          height: max-content;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.25s;
          &:hover {
            opacity: 0.6;
          }
        }
      }
      &__filter {
        color: var(--font-color);
        font-size: 28px;
        cursor: pointer;
        transition: all 0.25s;
        &.active {
          color: var(--primary-color);
        }
        &:hover {
          .active;
        }
      }
    }
    &-filter {
      .box;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      padding: 16px 30px;
      box-sizing: border-box;
      border-top-left-radius: @radius;
      border-bottom-left-radius: @radius;
      user-select: none;
    }
    &-main {
      .box;
      position: relative;
      flex: 1;
      border-top-left-radius: @radius;
      overflow-y: auto;
      &__content {
        @padding: 30px;
        width: 100%;
        height: calc(100vh - @frameTop - @headerHeight - @rootGap);
        padding: 30px;
        box-sizing: border-box;
        &-col {
          width: 100%;
          display: flex;
          overflow: hidden;
        }
      }
      &__loading {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 4;
        background: var(--box-bg-color);
        animation-duration: 0.5s;
      }
    }
    &-page {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0 auto;
      width: max-content;
      padding: 12px 16px;
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 0 16px rgba(255, 255, 255, 0.1);
      transition: all 0.25s;
      opacity: 0.2;
      transform: translateY(70%);
      &:hover {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}
</style> -->

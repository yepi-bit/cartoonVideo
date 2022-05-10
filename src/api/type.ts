type Page<T> = {
  data: T
  total: number
}

export interface ComicPageList {
  cover: string
  id: string
  season: string
  title: string
}

export type SearchComicReturn = Page<ComicPageList[]>

export interface GetComicMainReturn {
  // playlist: {
  //   name: string
  //   value: {
  //     name: string
  //     value: string
  //   }[]
  // }[]
  playlist: {
    name: string
    value: number
  }[]
  /** 名称 */
  title: string
  /** 集数状态 */
  season: string
  /** 地区 */
  region: string
  /** 评分 */
  rank: string
  /** 作者名称 */
  master: string
  /** 语言 */
  lang: string
  /** 发布日期 */
  firstDate: string
  cover: string
  /** 声优名字集 */
  voiceActors: string[]
  /** 分类集 */
  cates: string[]
}

// export type GetLatestComic = Page<ComicPageList[]>

export type GetDaysWeek = {
  name: string
  value: ComicPageList[]
}[]

export type FilterComicReturn = Page<ComicPageList[]>

export interface GetHomeMixData {
  /** 每日更新 */
  perweek: {
    name: string
    key: string
    value: {
      title: string
      season: string
      id: string
    }[]
  }[]
  /** 热门 */
  hots: ComicPageList[]
  /** 最新 */
  latest: ComicPageList[]
  /** 剧场版 */
  tv: ComicPageList[]
  /** 完结日漫 */
  endJp: ComicPageList[]
  /** 国漫 */
  cn: ComicPageList[]
  /** 轮播 */
  banner: {
    cover: string
    id: string
    title: string
  }[]
}

export type GetVideoUrlReturn = {
  key: string
  value: string[]
}[]

export type GetComicFilterConfig = {
  id: number
  name: string
  value: {
    name: string
    value: string
  }[]
}[]

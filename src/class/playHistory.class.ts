import { jsonParse } from '@/utils/adLoadsh'
import { ref } from 'vue'

interface CacheItem {
  id: number
  cover: string
  name: string
  date: number
}

const PLAY_HISTORY_STORE_KEY = 'PLAY_HISTORY_STORE'

class PlayHistory {
  private cache_ = ref<CacheItem[]>([])

  public get cache() {
    return this.cache_.value
  }

  public add(item: Omit<CacheItem, 'date'>) {
    const index = this.cache_.value.findIndex((ch) => ch.id === item.id)
    if (!!~index) {
      this.cache_.value.splice(index, 1)
    }
    this.cache_.value.unshift({
      ...item,
      date: new Date().getTime()
    })
  }

  public saveStore() {
    localStorage.setItem(
      PLAY_HISTORY_STORE_KEY,
      JSON.stringify(this.cache_.value)
    )
  }

  public getStore() {
    const data = jsonParse(localStorage.getItem(PLAY_HISTORY_STORE_KEY), [])
    if (data instanceof Array) {
      this.cache_.value = data
    }
  }

  public clearStore() {
    this.cache_.value.splice(0)
    localStorage.removeItem(PLAY_HISTORY_STORE_KEY)
  }
}

let instance: PlayHistory | null
export function createPlayHistory() {
  if (!instance) {
    instance = new PlayHistory()
  }
  return instance
}
export function getPlayHistoryInstance() {
  return instance!
}

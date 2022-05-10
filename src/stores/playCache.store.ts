import { defineStore } from 'pinia'
import moment from 'moment'

import { sToMs } from '@/utils/adLoadsh'
import { getPlayHistoryInstance } from '@/class/playHistory.class'
import { getPlayProgressInstance } from '@/class/playProgress.class'

export const usePlayCacheStore = defineStore('playCache', {
  getters: {
    playHistory() {
      return getPlayHistoryInstance().cache.map((item) => {
        const cache = getPlayProgressInstance().cache.find(
          (cache) => cache.comicId === item.id
        )
        return {
          ...item,
          playProgress: sToMs(cache?.progress || 0),
          playEpisode: cache?.name || false,
          date: moment(item.date).format('YYYY-MM-DD hh:mm')
        }
      })
    }
  },
  actions: {
    clearHistory() {
      getPlayHistoryInstance().clearStore()
    }
  }
})

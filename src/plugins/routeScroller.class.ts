import { nextTick } from 'vue'

interface SessionObj {
  [prop: string]: string | number
}
interface SessionData {
  [prop: string]: SessionObj
}

/**
 * 路由根节点滚动进度守卫
 */
export default class RouteScroller {
  private sessionStorageName = 'routeScroller'
  constructor() {
    this.init()
  }
  private init() {
    sessionStorage.setItem(this.sessionStorageName, JSON.stringify({}))
  }
  private hasDom(obj: any): boolean {
    return typeof obj.meta.dom !== 'undefined'
  }
  private getOldSession(): SessionData {
    const oldData: string | null = sessionStorage.getItem(
      this.sessionStorageName
    )
    if (oldData === null) return {}
    const sessionData: SessionData = JSON.parse(oldData)
    return sessionData
  }
  private saveToSession(name: string, obj: SessionObj) {
    const newSessionData: SessionData = this.getOldSession()
    newSessionData[name] = obj
    sessionStorage.setItem(
      this.sessionStorageName,
      JSON.stringify(newSessionData)
    )
  }
  private readToSession(mame: string): SessionObj {
    const sessionData: SessionData = this.getOldSession()
    return sessionData[mame]
  }
  private scrollTo(domName: string, top: any) {
    nextTick(() => {
      const dom: HTMLElement | null = document.querySelector(domName)
      if (dom === null || !top) return
      dom.scrollTop = top
    })
  }
  public setScrollTop(to: any) {
    const { dom } = to.meta
    if (this.hasDom(to)) {
      const sessionObj: SessionObj = this.readToSession(to.name)
      if (typeof sessionObj === 'undefined') return
      this.scrollTo(dom, sessionObj.scrollTop)
    }
    return this
  }
  public saveScrollTop(from: any) {
    const { dom } = from.meta
    if (this.hasDom(from)) {
      if (dom) {
        this.saveToSession(from.name, {
          scrollTop: document.querySelector(dom)?.scrollTop || 0
        })
      }
    }
    return this
  }
}

export function createRouteScroller() {
  return new RouteScroller()
}

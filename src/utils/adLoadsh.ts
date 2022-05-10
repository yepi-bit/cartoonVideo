// import Notify from 'element-plus/lib/el-notification'

type DefaultFn = (...args: any[]) => void
interface Tree {
  [prop: string]: any
  children?: Tree[]
}

/**
 * 防抖
 * @param callback 执行方法
 * @param delay 间隔时间
 */
export function debounce(callback: DefaultFn, delay = 300) {
  let timer: NodeJS.Timeout | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}

/**
 * 节流
 * @param callback 执行方法
 * @param delay 间隔时间
 */
export function throttle(callback: DefaultFn, delay = 300) {
  let flag = false
  return function (this: any, ...args: any[]) {
    if (flag) return
    flag = true
    setTimeout(() => {
      callback.apply(this, args)
      flag = false
    }, delay)
  }
}

/**
 * 字符串插入
 * @param str 被插入的字符串
 * @param index 插入起点下标
 * @param insert 插入的字符串
 * @returns 结果字符串
 */
export function insertStr(str: string, index: number, insert: string): string {
  return str.slice(0, index) + insert + str.slice(index)
}

/**
 * 获取随机数
 * @param min 最小
 * @param max 最大
 * @returns 结果
 */
export function getRandom(min = 0, max = 1): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 秒钟转00:00
 * @param time 时间戳
 * @returns xx:xx
 */
export function sToMs(time: number): string {
  let m: number | string = parseInt(((time % 3600) / 60).toString()),
    s: number | string = parseInt(((time % 3600) % 60).toString())
  m = m < 10 ? '0' + m : m
  s = s < 10 ? '0' + s : s
  return m + ':' + s
}

/**
 * 00:00.0转秒钟
 * @param time 00:00.0格式的时间
 * @returns 秒钟
 */
export function timeToS(time: string): number {
  const times = time.split(':')
  return Number(times[0]) * 60 + Number(times[1])
}

/**
 * 时间转xxxx.xx.xx
 * @param time 时间
 * @returns xxxx.xx.xx
 */
export function msToYmd(time: string | number): string {
  const date = new Date(time)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

/**
 * 数字大小限制
 * @param num 传入数字
 * @param min 最小值
 * @param max 最大值
 * @returns 区间内的值
 */
export function numLimit(num: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(num, max))
}

/**
 * 获取指定内容在数组最后一次出现的下标
 * @param arr 数组
 * @param callback 回调，携带 当前遍历内容 当前遍历下标，需返回符合条件
 * @returns 结果下标，找不到为 -1
 */
export function findLastIndex(
  arr: any[],
  callback: (cur: any, index: number) => boolean
) {
  let index = 0
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i], i)) index = i
  }
  return index
}

/**
 * 基于JSON的深拷贝
 * @param obj 被拷贝对象
 * @returns 新对象
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 两数组对象去重 key为主键
 * @param arrA 数组A
 * @param arrB 数组B
 * @param key 去重的对象关键字
 * @returns 去重后结果
 */
export function arrObjRmSameByKey(arrA: any[], arrB: any[], key: string) {
  const res: any[] = []
  for (let i = 0; i < arrA.length; i++) {
    const index = arrB.findIndex((item: any) => item[key] === arrA[i][key])
    if (index === -1) res.push(arrA[i])
  }
  return res
}

/**
 * 两数组求交集
 * @param arrA 数组A
 * @param arrB 数组B
 * @returns 去重后结果
 */
export function arrSubtraction(arrA: any[], arrB: any[]) {
  return Array.from(
    new Set([...arrA].filter((item: any) => !arrB.includes(item)))
  )
}

/**
 * 对象类型数组去重
 * @param arr 数组
 * @param
 */
export function objArrDeDuplication<T>(
  arr: T[],
  callback: (item: T) => any
): T[] {
  const res: T[] = []
  arr.forEach((item) => {
    const hasThis = res.findIndex((key) => callback(item) === callback(key))
    hasThis === -1 && res.push(item)
  })
  return res
}

/**
 * 扁平化树形数组
 * @param tree 树形结构
 * @returns 一维树
 */
export function flatTree(tree: Tree[]): Tree[] {
  const res: Tree[] = []
  tree.forEach((item: any) => {
    const hasChild = item.children instanceof Array
    res.push(item)
    if (hasChild) {
      res.push(...flatTree(item.children))
    }
  })
  return res
}

/**
 * 寻找树的指定条件item
 * @param tree 树形结构
 * @param callback 循环回调，携带当前遍历数据，需返回bool
 * @returns 符合条件的第一个item
 */
export function findInTree(
  tree: Tree[],
  callback: (item: any) => boolean
): any {
  return tree.reduce((total: any, item: any) => {
    if (callback(item)) {
      total = item
    }
    const hasChild = item.children instanceof Array
    return total || (hasChild && findInTree(item.children, callback))
  }, undefined)
}

/**
 * tree遍历
 * @param tree 树形结构
 * @param callback 循环回调，携带当前遍历数据
 */
export function treeTraversal(tree: Tree[], callback?: (item: any) => void) {
  tree.forEach((item: any) => {
    const hasChild = item.children instanceof Array
    callback && callback(item)
    if (hasChild) {
      treeTraversal(item.children, callback)
    }
  })
}

/**
 * 截取数组指定条件下的内容下标后的内容
 * @param arr 源数组
 * @param callback 条件
 * @returns
 */
export function splitAfter(arr: any[], callback: (item: any) => boolean) {
  const index = arr.findIndex(callback)
  return arr.slice(index + 1, arr.length)
}

/**
 * 数组均分
 * @param arr
 * @param size 每项长度
 * @returns
 */
export function arrAvgSplit<T>(arr: Array<T>, size: number) {
  const result = []
  for (let i = 0, len = arr.length; i < len; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 等待
 * @param delay 等待时间
 * @returns
 */
export function wait(delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

/**
 * 将内容复制到粘贴板
 * @param text
 */
export function copyText(text: string | number) {
  const save = (e: ClipboardEvent) => {
    e.clipboardData!.setData('text/plain', text.toString())
    e.preventDefault()
  }
  document.addEventListener('copy', save)
  document.execCommand('copy')
  document.removeEventListener('copy', save)
  // Notify({
  //   title: '内容复制',
  //   message: '内容已经成功复制到粘贴板~',
  //   type: 'success'
  // })
}

/**
 * 将窗口全屏切换
 * @param el 绑定节点
 * @param type to全屏 exit退出全屏
 */
export function fullscreen(el: HTMLElement, type: 'to' | 'exit') {
  if (type === 'to') {
    const doc = el as any
    if (doc.requestFullscreen) {
      return doc.requestFullscreen()
    } else if (doc.webkitRequestFullScreen) {
      return doc.webkitRequestFullScreen()
    } else if (doc.mozRequestFullScreen) {
      return doc.mozRequestFullScreen()
    } else {
      return doc.msRequestFullscreen()
    }
  } else if (type === 'exit') {
    const doc = document as any
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen()
    } else if (doc.webkitCancelFullScreen) {
      doc.webkitCancelFullScreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    }
  }
}

/**
 * 判断浏览器当前是否为全屏状态
 * @returns
 */
export function checkFullscreen() {
  // const el = document as any
  // const wd = window as any
  // const isFull =
  //   el.fullscreenEnabled ||
  //   wd.fullScreen ||
  //   el.webkitIsFullScreen ||
  //   el.msFullscreenEnabled
  // if (typeof isFull === 'undefined') {
  //   return false
  // } else {
  //   return isFull
  // }
  return (document as any).webkitIsFullScreen
}

/**
 * 获取地址的query参数
 * @param key 参数名称
 * @returns 结果，找不到返回null
 */
export function getUrlQuery(key: string) {
  return new URL(location.href).searchParams.get(key)
}

/**
 * 平整数据转换为树
 * @param data 平整数据
 * @param rootCallback 用于判断是否为根节点的回调
 * @returns 树
 */
export function toTree(data: any[], rootCallback: (item: any) => boolean) {
  // 创建结果和map容器
  const tree: any[] = []
  const map: any = {}
  // 数据处理
  for (const item of data) {
    // 获取自身id和父id
    const selfId = item.id,
      pid = item.pid

    // 判断map中是否存在，否则添加初始化数据

    // ???
    // if (typeof map[selfId] === 'undefined') {
    // 	map[selfId] = {
    // 		children: []
    // 	}
    // }
    // map[selfId] = {
    // 	...item,
    // 	children: map[selfId].children
    // }

    map[selfId] = {
      ...item,
      children: []
    }

    const treeItem = map[selfId]
    // 根节点判断处理
    if (rootCallback(item)) {
      tree.push(treeItem)
    } else {
      // 数据初始化
      if (typeof map[pid] === 'undefined') {
        map[pid] = {
          children: []
        }
      }
      map[pid].children.push(treeItem)
    }
  }
  return tree
}

// export function numSplit(num: string | number) {
//   const nums = []
//   for (const i in num.toString().split('')) {

//   }
// }

// 00:00.0转秒钟
export function timeToMs(time: string) {
  const times = time.split(':')
  return Number(times[0]) * 60 + Number(times[1])
}

/**
 * json转对象
 * @param val
 * @param df 失败时的默认值
 * @returns
 */
export function jsonParse(val: any, df: any) {
  try {
    return JSON.parse(val)
  } catch (e) {
    return df || []
  }
}

/**
 * 延时递归获取指定信息
 * @param callback 回调，返回要获取的数据
 * @param count 尝试次数
 * @param curCount 当前次数，不建议传入此参数
 * @returns
 */
export async function getEl(
  callback: () => any,
  count = 10,
  curCount = 0
): Promise<null | any> {
  await wait(800)
  const data = await callback()
  curCount++
  return data || curCount > count ? data : getEl(callback, count, curCount)
}

/**
 * 取值
 * @param fn 回调
 * @param df 默认值
 * @returns
 */
export function getVal<T>(fn: () => T, df: any): T {
  try {
    const res = fn()
    if (!res) {
      throw new Error()
    }
    return res
  } catch (e) {
    return df
  }
}

/**
 * 顺滑push（此方法用于优化列表内容过多时的加载）
 * @param org 结果源
 * @param list 数据源
 */
export function smoothPush<T>(org: T[], list: T[]) {
  org.splice(0)
  const push = (count: number) => {
    org.push(list[count])
    count++
    if (count < list.length) {
      requestAnimationFrame(() => push(count))
    }
  }

  push(0)
}

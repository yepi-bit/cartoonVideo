import { App } from 'vue'
import 'element-plus/dist/index.css'
import {
  ElNotification,
  ElLoading,
  ElCarousel,
  ElCarouselItem,
  ElButton,
  ElPagination,
  ElProgress,
  ElSlider,
  ElTabs,
  ElTabPane,
  ElColorPicker,
  ElAffix,
  ElRate,
  ElTooltip,
  ElForm,
  ElFormItem,
  ElInput,
  ElPopconfirm
} from 'element-plus'
const comps = [
  ElCarousel,
  ElCarouselItem,
  ElButton,
  ElPagination,
  ElProgress,
  ElSlider,
  ElTabs,
  ElTabPane,
  ElColorPicker,
  ElAffix,
  ElRate,
  ElTooltip,
  ElForm,
  ElFormItem,
  ElInput,
  ElPopconfirm
]
const plugins = [ElLoading, ElNotification]
export function elementPlusInit(app: App<Element>) {
  comps.forEach((comp) => {
    app.component(comp.name, comp)
  })
  plugins.forEach((plugin) => {
    app.use(plugin)
  })
}

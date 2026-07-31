import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { applyAppConfig } from '@/config/app'
import { setupPermissionDirective } from '@/directives/permission'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { startSessionGuard } from '@/utils/session-guard'
import './style.css'

applyAppConfig()

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
setupPermissionDirective(app)

// 已登录（刷新页面）时预加载权限内容注册表，并启动会话守卫
const userStore = useUserStore()
if (localStorage.getItem('token')) {
  userStore.loadRegistry()
  startSessionGuard()
}

// 同步主题（CSS 变量已在 applyAppConfig 写入，此处保证 store 与界面一致）
useThemeStore().applyCurrent()

app.mount('#app')

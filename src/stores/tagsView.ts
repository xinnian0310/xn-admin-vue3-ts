import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import type { TagView } from '@/types/menu'
import { getAffixTags } from '@/utils/menu'
import { useMenuStore } from '@/stores/menu'

const STORAGE_KEY = 'xn-tags-view'
const MAX_CACHE = 10

function loadFromStorage(): TagView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TagView[]) : []
  } catch {
    return []
  }
}

function saveToStorage(views: TagView[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
}

function buildAffixTags(): TagView[] {
  const menuStore = useMenuStore()
  return getAffixTags(menuStore.menus).map((item) => ({
    path: item.path!,
    title: item.title,
    affix: true,
  }))
}

function pruneCachedViews(state: { visitedViews: TagView[]; cachedViews: string[] }) {
  const keep = new Set(
    state.visitedViews.map((v) => v.name).filter((n): n is string => !!n),
  )
  state.cachedViews = state.cachedViews.filter((name) => keep.has(name))
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: loadFromStorage() as TagView[],
    cachedViews: [] as string[],
    /** 内容区全屏（隐藏侧栏 / 顶栏 / 标签栏） */
    isFullscreen: false,
  }),

  actions: {
    initTags() {
      const affixTags = buildAffixTags()
      for (const tag of affixTags) {
        if (!this.visitedViews.some((v) => v.path === tag.path)) {
          this.visitedViews.unshift(tag)
        }
      }
      saveToStorage(this.visitedViews)
    },

    addView(route: RouteLocationNormalized) {
      if (route.meta.public || !route.meta.title) return

      const tag: TagView = {
        path: route.path,
        name: route.name as string | undefined,
        title: route.meta.title as string,
        affix: route.meta.affix,
      }

      if (!this.visitedViews.some((v) => v.path === tag.path)) {
        this.visitedViews.push(tag)
        saveToStorage(this.visitedViews)
      }

      if (route.name && !route.meta.noCache) {
        this.addCachedView(route.name as string)
      }
    },

    addCachedView(name: string) {
      if (this.cachedViews.includes(name)) return
      this.cachedViews.push(name)
      if (this.cachedViews.length > MAX_CACHE) {
        this.cachedViews.shift()
      }
    },

    delCachedView(name?: string) {
      if (!name) return
      const idx = this.cachedViews.indexOf(name)
      if (idx > -1) this.cachedViews.splice(idx, 1)
    },

    delView(tag: TagView) {
      if (tag.affix) return

      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index === -1) return

      this.visitedViews.splice(index, 1)
      saveToStorage(this.visitedViews)

      if (tag.name) {
        this.delCachedView(tag.name)
      }
    },

    delLeftViews(tag: TagView) {
      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index <= 0) return

      this.visitedViews = this.visitedViews.filter((v, i) => i >= index || v.affix)
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },

    delRightViews(tag: TagView) {
      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index === -1) return

      this.visitedViews = this.visitedViews.filter((v, i) => i <= index || v.affix)
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },

    delOthersViews(tag: TagView) {
      this.visitedViews = this.visitedViews.filter(
        (v) => v.affix || v.path === tag.path,
      )
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },

    delAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
      this.cachedViews = []
      saveToStorage(this.visitedViews)
    },

    /** 退出/重新登录：清空标签、缓存与全屏状态 */
    resetViews() {
      this.visitedViews = []
      this.cachedViews = []
      this.isFullscreen = false
      localStorage.removeItem(STORAGE_KEY)
    },

    setFullscreen(value: boolean) {
      this.isFullscreen = value
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },
  },
})

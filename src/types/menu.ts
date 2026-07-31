export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  permission?: string
  children?: MenuItem[]
  hidden?: boolean
  affix?: boolean
}

export interface TagView {
  path: string
  name?: string
  title: string
  affix?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    public?: boolean
    hidden?: boolean
    affix?: boolean
    activeMenu?: string
    noCache?: boolean
    permission?: string
  }
}

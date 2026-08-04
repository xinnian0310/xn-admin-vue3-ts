import { defineStore } from 'pinia'
import { computed, h, ref } from 'vue'
import { ElButton, ElNotification } from 'element-plus'
import { listMine, markRead } from '@/api/notice'
import type { MyNotice } from '@/types'
import { connectNoticeWs, disconnectNoticeWs, onNoticeWsMessage } from '@/utils/notice-ws'

export const useNoticeStore = defineStore('notice', () => {
  const notices = ref<MyNotice[]>([])
  const loading = ref(false)
  const drawerVisible = ref(false)
  const activeNotice = ref<MyNotice | null>(null)
  let offWs: (() => void) | undefined

  const unreadCount = computed(() => notices.value.filter((n) => !n.read).length)

  async function fetchMine() {
    loading.value = true
    try {
      const res = await listMine()
      notices.value = res.data || []
    } finally {
      loading.value = false
    }
  }

  async function openNotice(notice: MyNotice) {
    activeNotice.value = notice
    if (!notice.read) {
      try {
        await markRead(notice.id)
        notice.read = true
        notice.readAt = new Date().toISOString()
      } catch {
        /* ignore */
      }
    }
  }

  async function openNoticeById(id: number) {
    await fetchMine()
    const found = notices.value.find((n) => n.id === id)
    if (found) {
      await openNotice(found)
      return
    }
    openDrawer()
  }

  function closeDetail() {
    activeNotice.value = null
  }

  function openDrawer() {
    drawerVisible.value = true
    fetchMine()
  }

  function closeDrawer() {
    drawerVisible.value = false
  }

  function handleWs(data: Record<string, unknown>) {
    const type = String(data.type || '')
    if (type === 'notice:publish') {
      const id = Number(data.id)
      const title = String(data.title || '您有一条新公告')
      const notify = ElNotification({
        title: '新公告',
        type: 'info',
        duration: 0,
        showClose: true,
        position: 'top-right',
        message: h('div', { class: 'notice-ws-notify' }, [
          h('div', { class: 'notice-ws-notify__text' }, title),
          h('div', { class: 'notice-ws-notify__actions' }, [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => {
                  notify.close()
                  void openNoticeById(id)
                },
              },
              () => '查看',
            ),
          ]),
        ]),
      })
      fetchMine()
      return
    }
    if (type === 'notice:revoke') {
      const id = Number(data.id)
      notices.value = notices.value.filter((n) => n.id !== id)
      if (activeNotice.value?.id === id) {
        activeNotice.value = null
      }
    }
  }

  function startRealtime() {
    stopRealtime()
    offWs = onNoticeWsMessage(handleWs)
    connectNoticeWs()
    fetchMine()
  }

  function stopRealtime() {
    offWs?.()
    offWs = undefined
    disconnectNoticeWs()
    notices.value = []
    activeNotice.value = null
    drawerVisible.value = false
  }

  return {
    notices,
    loading,
    drawerVisible,
    activeNotice,
    unreadCount,
    fetchMine,
    openNotice,
    openNoticeById,
    closeDetail,
    openDrawer,
    closeDrawer,
    startRealtime,
    stopRealtime,
  }
})

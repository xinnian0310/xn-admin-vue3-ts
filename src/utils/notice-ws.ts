import { useUserStore } from '@/stores/user'
import {
  FORCE_LOGOUT_CLOSE_CODE,
  FORCE_LOGOUT_MESSAGE_TYPE,
  handleForceLogout,
} from '@/utils/force-logout'

type NoticeWsHandler = (data: Record<string, unknown>) => void

let socket: WebSocket | null = null
let heartbeatTimer: number | undefined
let reconnectTimer: number | undefined
let manualClose = false
const handlers = new Set<NoticeWsHandler>()

function buildWsUrl(token: string) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/notices?token=${encodeURIComponent(token)}`
}

function clearTimers() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = undefined
  }
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = undefined
  }
}

function startHeartbeat() {
  heartbeatTimer = window.setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }))
    }
  }, 25000)
}

function scheduleReconnect() {
  if (manualClose) return
  reconnectTimer = window.setTimeout(() => {
    connectNoticeWs()
  }, 3000)
}

export function onNoticeWsMessage(handler: NoticeWsHandler) {
  handlers.add(handler)
  return () => handlers.delete(handler)
}

export function connectNoticeWs() {
  const token = useUserStore().token || localStorage.getItem('token') || ''
  if (!token) return

  manualClose = false
  clearTimers()
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  socket = new WebSocket(buildWsUrl(token))

  socket.onopen = () => {
    startHeartbeat()
  }

  socket.onmessage = (event) => {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(String(event.data)) as Record<string, unknown>
    } catch {
      return
    }
    if (data.type === FORCE_LOGOUT_MESSAGE_TYPE) {
      // 必须同步置位，否则紧随其后的 onclose 会把连接重连回来
      manualClose = true
      handleForceLogout(typeof data.message === 'string' ? data.message : undefined)
      return
    }
    handlers.forEach((handler) => handler(data))
  }

  socket.onclose = (event) => {
    clearTimers()
    socket = null
    if (event.code === FORCE_LOGOUT_CLOSE_CODE) {
      manualClose = true
      handleForceLogout()
      return
    }
    scheduleReconnect()
  }

  socket.onerror = () => {
    socket?.close()
  }
}

export function disconnectNoticeWs() {
  manualClose = true
  clearTimers()
  if (socket) {
    socket.close()
    socket = null
  }
}

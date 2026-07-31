import request from '@/utils/request'
import type { ApiResponse, OnlineUser, ServerMonitor } from '@/types'

export function getOnlineUsers() {
  return request.get<any, ApiResponse<OnlineUser[]>>('/monitor/online')
}

export function kickUser(userId: number) {
  return request.post<any, ApiResponse<{ count: number }>>(`/monitor/online/${userId}/kick`)
}

export function getServerMonitor() {
  return request.get<any, ApiResponse<ServerMonitor>>('/monitor/server')
}

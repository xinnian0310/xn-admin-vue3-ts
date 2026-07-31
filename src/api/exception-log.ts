import request from '@/utils/request'
import type { ApiResponse, ExceptionLog, PageResult } from '@/types'

export type ExceptionLogListParams = {
  page: number
  size: number
  keyword?: string
  beginTime?: string
  endTime?: string
}

export function list(params?: ExceptionLogListParams) {
  return request.get<any, ApiResponse<PageResult<ExceptionLog>>>('/logs/exception', { params })
}

export function get(id: number) {
  return request.get<any, ApiResponse<ExceptionLog>>(`/logs/exception/${id}`)
}

export function remove(id: number) {
  return request.delete<any, ApiResponse<void>>(`/logs/exception/${id}`)
}

export function batchRemove(ids: number[]) {
  return request.post<any, ApiResponse<{ count: number }>>('/logs/exception/batch-delete', { ids })
}

export function clean() {
  return request.delete<any, ApiResponse<void>>('/logs/exception/clean')
}

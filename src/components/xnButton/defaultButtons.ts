import { Delete, Edit, Plus, View } from '@element-plus/icons-vue'
import type { ButtonListItem } from '@/types/button'

export interface DefaultButtonPermissions {
  create?: string
  update?: string
  view?: string
  delete?: string
}

export const XN_BUTTON_NAMES = {
  ADD: '新增',
  EDIT: '编辑',
  VIEW: '查看',
  DELETE: '删除',
} as const

export function createDefaultButtonList(permissions: DefaultButtonPermissions = {}): ButtonListItem[] {
  return [
    {
      name: XN_BUTTON_NAMES.ADD,
      action: 'add',
      type: 'button',
      icon: Plus,
      typeColor: 'primary',
      permission: permissions.create,
    },
    {
      name: XN_BUTTON_NAMES.EDIT,
      action: 'edit',
      type: 'button',
      icon: Edit,
      typeColor: 'primary',
      permission: permissions.update,
      index: 0,
    },
    {
      name: XN_BUTTON_NAMES.VIEW,
      action: 'view',
      type: 'button',
      icon: View,
      typeColor: 'primary',
      permission: permissions.view,
      index: 0,
    },
    {
      name: XN_BUTTON_NAMES.DELETE,
      action: 'delete',
      type: 'button',
      icon: Delete,
      typeColor: 'danger',
      permission: permissions.delete,
    },
  ]
}

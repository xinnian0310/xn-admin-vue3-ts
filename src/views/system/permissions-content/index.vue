<template>
  <PageLayout>
    <template #aside>
      <TreePanel
        ref="menuTreeRef"
        title="菜单"
        v-model:filter="menuKeyword"
        filter-placeholder="搜索菜单名称"
        :data="menuTree"
        :tree-props="{ label: 'name', children: 'children', disabled: 'disabled' }"
        :current-key="selectedRouteId ?? undefined"
        @node-click="onMenuClick"
      >
        <template #node="{ data }">
          <span class="menu-node" :class="{ 'is-disabled': data.disabled }">
            <span class="menu-node__name">{{ data.name }}</span>
            <el-tag
              v-if="!data.permissionControl && data.type === 'MENU'"
              type="info"
              effect="plain"
            >
              未控权
            </el-tag>
            <el-tag v-else-if="data.childCount" type="info" effect="plain">
              {{ data.childCount }}
            </el-tag>
          </span>
        </template>
      </TreePanel>
    </template>

    <template v-if="selectedRoute" #toolbar>
      <div class="perm-content__title">
        <span>{{ selectedRoute.title }}</span>
        <span v-if="selectedMenu?.code" class="perm-content__code">{{ selectedMenu.code }}</span>
      </div>
    </template>

    <div v-if="selectedRoute" class="perm-content__body">
      <el-alert
        v-if="!selectedMenu"
        type="warning"
        :closable="false"
        show-icon
        title="该路由尚未关联权限标识，请先在路由管理中保存以自动生成后再配置子权限。"
        class="perm-content__alert"
      />
      <el-tabs v-else v-model="activeType" class="perm-content__tabs">
        <el-tab-pane v-for="tab in tabs" :key="tab.type" :name="tab.type">
          <template #label>
            {{ tab.label }}
            <el-badge
              v-if="groups[tab.type].length"
              :value="groups[tab.type].length"
              type="info"
              class="perm-content__tab-badge"
            />
          </template>

          <div class="perm-content__tab-toolbar">
            <el-button
              v-permission="'permission-content:create'"
              type="primary"
              :icon="Plus"
              @click="openCreate(tab.type)"
            >
              新增{{ tab.label }}
            </el-button>
          </div>

          <el-table
            :data="groups[tab.type]"
            row-key="id"
            border
            stripe
            class="perm-content__table"
          >
            <el-table-column prop="name" label="名称" min-width="150" />
            <el-table-column v-if="tab.type !== 'API'" label="图标" width="70" align="center">
              <template #default="{ row }">
                <AppIcon v-if="row.icon" :name="row.icon" />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column v-if="tab.type !== 'API'" label="动作" min-width="110">
              <template #default="{ row }">
                <code v-if="row.action" class="perm-content__mono">{{ row.action }}</code>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="tab.type !== 'API'"
              label="按钮颜色"
              min-width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  v-if="row.buttonColor"
                  :type="buttonTypeOf(row.buttonColor)"
                >
                  {{ row.name || '示例' }}
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="权限编码" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <code class="perm-content__mono">{{ row.code }}</code>
              </template>
            </el-table-column>
            <el-table-column v-if="tab.type === 'API'" label="方法" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="methodTagType(row.method)">{{ row.method || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="tab.type === 'API'"
              prop="path"
              label="接口路径"
              min-width="220"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <code class="perm-content__mono">{{ row.path }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <el-table-column label="内置" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.builtIn" type="warning">内置</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-permission="'permission-content:table-edit'"
                  link
                  type="primary"
                  @click="openEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'permission-content:table-delete'"
                  link
                  type="danger"
                  :disabled="row.builtIn"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty :description="`暂无${tab.label}，点击上方新增`" :image-size="80" />
            </template>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-empty
      v-else
      class="perm-content__empty"
      description="请从左侧选择一个菜单，管理其接口 / 按钮权限"
      :image-size="120"
    />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="归属菜单">
          <el-input :model-value="selectedRoute?.title" disabled />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-tag :type="typeTagType(form.type)">{{ typeLabel(form.type) }}</el-tag>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="如：新增、导出、用户列表接口"
            @change="onNameChange"
          />
        </el-form-item>
        <template v-if="isButtonType">
          <el-form-item label="动作标识" prop="action">
            <el-input
              v-model="form.action"
              placeholder="英文，如：add / edit / view / delete / assign"
              @input="syncCodeFromForm"
            />
            <div class="perm-content__form-tip">
              用英文动作生成权限编码，并匹配前端处理函数（如 buttonClick('edit')）
            </div>
          </el-form-item>
          <el-form-item label="图标">
            <IconPicker v-model="form.icon" placeholder="选择按钮图标(可留空)" />
          </el-form-item>
          <el-form-item label="按钮颜色">
            <el-select v-model="form.buttonColor" placeholder="选择颜色" style="width: 160px">
              <template #label>
                <el-button
                  v-if="form.buttonColor"
                  :type="buttonTypeOf(form.buttonColor)"
                >
                  {{ form.name || '示例' }}
                </el-button>
              </template>
              <el-option
                v-for="c in buttonColors"
                :key="c.value"
                :label="c.label"
                :value="c.value"
              >
                <el-button :type="buttonTypeOf(c.value)">
                  {{ form.name || '示例' }}
                </el-button>
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="form.type === 'API'">
          <el-form-item label="请求方法" prop="method">
            <el-select
              v-model="form.method"
              placeholder="选择方法"
              :disabled="editingBuiltIn"
              @change="syncCodeFromForm"
            >
              <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
            </el-select>
          </el-form-item>
          <el-form-item label="接口路径" prop="path">
            <el-input
              v-model="form.path"
              placeholder="如：/api/users/{id}"
              :disabled="editingBuiltIn"
              @input="syncCodeFromForm"
            />
          </el-form-item>
        </template>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <div
          v-if="editingBuiltIn"
          class="perm-content__form-tip perm-content__form-tip--warn"
        >
          内置权限的路径 / 方法不可修改，仅可调整名称与排序。
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageLayout from '@/components/PageLayout/PageLayout.vue'
import TreePanel from '@/components/TreePanel/TreePanel.vue'
import AppIcon from '@/components/AppIcon/AppIcon.vue'
import IconPicker from '@/components/IconPicker/IconPicker.vue'
import { create, list as listPermissions, remove, update } from '@/api/permission'
import { list as listRoutes } from '@/api/route'
import type { Permission, PermissionForm, SysRoute } from '@/types'

defineOptions({ name: 'PermissionContent' })

type ContentType = 'BUTTON' | 'TABLE_BUTTON' | 'API'

interface MenuNode {
  id: number
  name: string
  code?: string
  type: 'DIR' | 'MENU'
  permissionControl: boolean
  /** 未开启权限控制的菜单 / 目录不可选中 */
  disabled: boolean
  childCount: number
  children: MenuNode[]
}

const tabs: { type: ContentType; label: string }[] = [
  { type: 'BUTTON', label: '按钮权限' },
  { type: 'TABLE_BUTTON', label: '表格按钮' },
  { type: 'API', label: '接口权限' },
]

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

const buttonColors: { label: string; value: string }[] = [
  { label: '主要', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
  { label: '信息', value: 'info' },
  { label: '默认', value: 'default' },
]

function buttonTypeOf(color?: string) {
  if (!color || color === 'default') return undefined
  return color as 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const typeLabels: Record<string, string> = {
  MENU: '菜单',
  BUTTON: '按钮',
  TABLE_BUTTON: '表格按钮',
  API: '接口',
}

const menuKeyword = ref('')
const routeTree = ref<SysRoute[]>([])
const selectedRouteId = ref<number | null>(null)
const activeType = ref<ContentType>('BUTTON')
const menuTreeRef = ref<InstanceType<typeof TreePanel>>()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingRow = ref<Permission | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = ref<PermissionForm>(emptyForm())

const permissionById = new Map<number, Permission>()
const permissionByCode = new Map<string, Permission>()
const routeById = new Map<number, SysRoute>()

function emptyForm(): PermissionForm {
  return {
    code: '',
    name: '',
    type: 'BUTTON',
    parentId: null,
    path: '',
    method: 'GET',
    action: '',
    icon: '',
    buttonColor: 'primary',
    sort: 0,
  }
}

const isButtonType = computed(
  () => form.value.type === 'BUTTON' || form.value.type === 'TABLE_BUTTON',
)

const menuTree = computed<MenuNode[]>(() => toMenuNodes(routeTree.value))

const selectedRoute = computed<SysRoute | null>(() =>
  selectedRouteId.value != null ? (routeById.get(selectedRouteId.value) ?? null) : null,
)

const selectedMenu = computed<Permission | null>(() => {
  const code = selectedRoute.value?.permission
  return code ? (permissionByCode.get(code) ?? null) : null
})

const groups = computed<Record<ContentType, Permission[]>>(() => {
  const result: Record<ContentType, Permission[]> = {
    BUTTON: [],
    TABLE_BUTTON: [],
    API: [],
  }
  for (const child of selectedMenu.value?.children ?? []) {
    if (child.type === 'BUTTON') result.BUTTON.push(child)
    else if (child.type === 'TABLE_BUTTON') result.TABLE_BUTTON.push(child)
    else if (child.type === 'API') result.API.push(child)
  }
  ;(Object.keys(result) as ContentType[]).forEach((key) => {
    result[key].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })
  return result
})

const editingBuiltIn = computed(() => isEdit.value && !!editingRow.value?.builtIn)

const dialogTitle = computed(
  () => `${isEdit.value ? '编辑' : '新增'}${typeLabel(form.value.type)}`,
)

/** 菜单权限码最后一段作为按钮前缀，如 menu:system:user → user */
const menuPrefix = computed(() => {
  const code = selectedMenu.value?.code
  if (!code) return ''
  const parts = code.split(':').filter(Boolean)
  return parts[parts.length - 1] || ''
})

/** 动作英文规范化：小写、空白转 -，仅保留英文数字连字符 */
function normalizeActionEnglish(action: string) {
  return action
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
}

function normalizeApiPath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** 用按钮英文动作生成编码：prefix:add / prefix:edit …；表格按钮避免与工具栏重码 */
function buildAutoCode() {
  if (form.value.type === 'API') {
    const method = (form.value.method || 'GET').toUpperCase()
    const path = normalizeApiPath(form.value.path || '')
    if (!path) return ''
    return `api:${method}:${path}`
  }
  const prefix = menuPrefix.value
  let action = normalizeActionEnglish(form.value.action || '')
  if (!prefix || !action) return ''
  // 表格按钮与工具栏可能同为 edit/delete，编码加 table- 前缀区分
  if (form.value.type === 'TABLE_BUTTON') {
    if (action === 'edit' || action === 'update') action = 'table-edit'
    else if (action === 'delete') action = 'table-delete'
    else if (action === 'add' || action === 'create') action = 'table-add'
  }
  return `${prefix}:${action}`
}

function syncCodeFromForm() {
  if (isEdit.value) return
  form.value.code = buildAutoCode()
}

/** 常用中文名 → 英文动作 */
function onNameChange() {
  if (isEdit.value || !isButtonType.value || form.value.action) return
  const name = form.value.name.trim()
  const nameActionMap: Record<string, string> = {
    新增: 'add',
    编辑: 'edit',
    查看: 'view',
    删除: 'delete',
    分配权限: 'assign',
    分配: 'assign',
    添加子级: 'add-child',
  }
  const action = nameActionMap[name]
  if (action) {
    form.value.action = action
    if (name === '删除') form.value.buttonColor = 'danger'
    syncCodeFromForm()
  }
}

watch(
  () => [form.value.type, form.value.action, form.value.method, form.value.path, menuPrefix.value],
  () => {
    if (dialogVisible.value && !isEdit.value) syncCodeFromForm()
  },
)

const rules = computed<FormRules<PermissionForm>>(() => ({
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '权限编码将自动生成', trigger: 'change' }],
  action:
    form.value.type === 'BUTTON' || form.value.type === 'TABLE_BUTTON'
      ? [{ required: true, message: '请输入动作标识', trigger: 'blur' }]
      : [],
  method:
    form.value.type === 'API'
      ? [{ required: true, message: '请选择请求方法', trigger: 'change' }]
      : [],
  path:
    form.value.type === 'API'
      ? [{ required: true, message: '请输入接口路径', trigger: 'blur' }]
      : [],
}))

function toMenuNodes(nodes: SysRoute[]): MenuNode[] {
  return [...nodes]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((node) => {
      const code = node.permission || undefined
      const linked = code ? permissionByCode.get(code) : undefined
      const childCount = (linked?.children ?? []).filter((c) => c.type !== 'MENU').length
      const permissionControl = !!node.permissionControl
      // 仅「开启权限控制」的菜单可点击配置
      const disabled = !(node.type === 'MENU' && permissionControl)
      return {
        id: node.id,
        name: node.title,
        code,
        type: node.type,
        permissionControl,
        disabled,
        childCount,
        children: node.children?.length ? toMenuNodes(node.children) : [],
      }
    })
}

function indexPermissions(nodes: Permission[]) {
  for (const node of nodes) {
    permissionById.set(node.id, node)
    if (node.code) permissionByCode.set(node.code, node)
    if (node.children?.length) indexPermissions(node.children)
  }
}

function indexRoutes(nodes: SysRoute[]) {
  for (const node of nodes) {
    routeById.set(node.id, node)
    if (node.children?.length) indexRoutes(node.children)
  }
}

function typeLabel(type: string) {
  return typeLabels[type] ?? type
}

function typeTagType(type: string) {
  switch (type) {
    case 'API':
      return 'success'
    case 'BUTTON':
      return 'primary'
    case 'TABLE_BUTTON':
      return 'warning'
    default:
      return 'info'
  }
}

function methodTagType(method?: string) {
  switch (method) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}

function onMenuClick(data: Record<string, unknown>) {
  if (data.disabled) return
  selectedRouteId.value = Number(data.id)
}

function firstSelectableRouteId(nodes: MenuNode[]): number | null {
  for (const node of nodes) {
    if (!node.disabled) return node.id
    const childMatch = firstSelectableRouteId(node.children)
    if (childMatch != null) return childMatch
  }
  return null
}

async function loadTree(preserveSelection = false) {
  const [routeRes, permRes] = await Promise.all([listRoutes(), listPermissions()])
  routeTree.value = routeRes.data
  routeById.clear()
  indexRoutes(routeRes.data)

  permissionById.clear()
  permissionByCode.clear()
  indexPermissions(permRes.data)

  if (
    !preserveSelection ||
    selectedRouteId.value == null ||
    !routeById.has(selectedRouteId.value) ||
    !routeById.get(selectedRouteId.value)?.permissionControl
  ) {
    selectedRouteId.value = firstSelectableRouteId(menuTree.value)
  }
  await nextTick()
  if (selectedRouteId.value != null) menuTreeRef.value?.setCurrentKey(selectedRouteId.value)
}

function openCreate(type: ContentType) {
  if (!selectedMenu.value) return
  isEdit.value = false
  editingRow.value = null
  form.value = { ...emptyForm(), type, parentId: selectedMenu.value.id }
  dialogVisible.value = true
  nextTick(() => syncCodeFromForm())
}

function openEdit(row: Permission) {
  isEdit.value = true
  editingRow.value = row
  form.value = {
    code: row.code,
    name: row.name,
    type: row.type,
    parentId: row.parentId ?? selectedMenu.value?.id ?? null,
    path: row.path ?? '',
    method: row.method ?? 'GET',
    action: row.action ?? '',
    icon: row.icon ?? '',
    buttonColor: row.buttonColor ?? 'primary',
    sort: row.sort ?? 0,
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.clearValidate()
  form.value = emptyForm()
  isEdit.value = false
  editingRow.value = null
}

async function handleSubmit() {
  if (!formRef.value) return
  if (!isEdit.value) {
    syncCodeFromForm()
    if (!form.value.code) {
      ElMessage.warning(
        form.value.type === 'API' ? '请填写接口路径以生成权限编码' : '请填写动作标识以生成权限编码',
      )
      return
    }
  }
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload: PermissionForm = { ...form.value }
    if (payload.type === 'API') {
      payload.path = normalizeApiPath(payload.path || '')
      payload.method = (payload.method || 'GET').toUpperCase()
    } else {
      payload.path = undefined
      payload.method = undefined
    }
    if (payload.type !== 'BUTTON' && payload.type !== 'TABLE_BUTTON') {
      payload.action = undefined
      payload.icon = undefined
      payload.buttonColor = undefined
    }
    if (isEdit.value && editingRow.value) {
      await update(editingRow.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await create(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await loadTree(true)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Permission) {
  await ElMessageBox.confirm(`确认删除权限「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await remove(row.id)
  ElMessage.success('删除成功')
  await loadTree(true)
}

onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.menu-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  overflow: hidden;
}

.menu-node.is-disabled .menu-node__name {
  color: #c0c4cc;
}

.menu-node__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perm-content__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: #303133;
}

.perm-content__code {
  font-size: var(--app-font-size-main);
  font-weight: 400;
  color: #909399;
}

.perm-content__body {
  flex: 1;
  min-height: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.perm-content__alert {
  margin-bottom: 12px;
}

.perm-content__tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.perm-content__tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.perm-content__tab-badge {
  margin-left: 2px;
}

.perm-content__tab-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.perm-content__table {
  width: 100%;
}

.perm-content__mono {
  font-family: monospace;
  font-size: var(--app-font-size-main);
  color: #606266;
}

.perm-content__empty {
  margin: auto;
}

.perm-content__form-tip {
  font-size: var(--app-font-size-main);
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.perm-content__form-tip--warn {
  color: #e6a23c;
  padding-left: 90px;
}
</style>

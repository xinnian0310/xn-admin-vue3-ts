<template>
  <div class="page-card api-docs-page">
    <div class="page-header">
      <h2 class="page-title">接口文档</h2>
      <div class="api-docs-actions">
        <el-radio-group v-model="mode">
          <el-radio-button value="swagger">Swagger UI</el-radio-button>
          <el-radio-button value="registry">权限 API 列表</el-radio-button>
        </el-radio-group>
        <el-button
          v-if="mode === 'registry'"
          v-permission="'api-docs:view'"
          :icon="Refresh"
          :loading="loading"
          @click="loadApis"
        >
          刷新
        </el-button>
        <el-button v-if="mode === 'swagger'" tag="a" href="/swagger-ui/index.html" target="_blank">
          新窗口打开
        </el-button>
      </div>
    </div>

    <iframe
      v-if="mode === 'swagger'"
      class="swagger-frame"
      src="/swagger-ui/index.html"
      title="Swagger UI"
    />

    <div v-else class="registry-panel" v-loading="loading">
      <div class="registry-toolbar">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索方法 / 路径"
          style="max-width: 320px"
        />
        <span class="registry-count">共 {{ filteredApis.length }} 条</span>
      </div>
      <el-table :data="filteredApis" border stripe height="100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="method" label="方法" width="100">
          <template #default="{ row }">
            <el-tag :type="methodTag(row.method)" effect="plain">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="360" show-overflow-tooltip />
      </el-table>
      <el-empty v-if="!loading && !filteredApis.length" description="暂无 API 登记数据" :image-size="90" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getApiRegistry } from '@/api/auth'

defineOptions({ name: 'SystemApiDocs' })

type ApiItem = { method: string; path: string }

const mode = ref<'swagger' | 'registry'>('swagger')
const loading = ref(false)
const keyword = ref('')
const apis = ref<ApiItem[]>([])

const filteredApis = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return apis.value
  return apis.value.filter(
    (a) => a.method.toLowerCase().includes(q) || a.path.toLowerCase().includes(q),
  )
})

function methodTag(method: string) {
  const m = (method || '').toUpperCase()
  if (m === 'GET') return 'success'
  if (m === 'POST') return 'primary'
  if (m === 'PUT' || m === 'PATCH') return 'warning'
  if (m === 'DELETE') return 'danger'
  return 'info'
}

async function loadApis() {
  loading.value = true
  try {
    const res = await getApiRegistry()
    apis.value = [...(res.data?.apis || [])].sort((a, b) =>
      `${a.path}${a.method}`.localeCompare(`${b.path}${b.method}`),
    )
  } finally {
    loading.value = false
  }
}

watch(mode, (val) => {
  if (val === 'registry' && !apis.value.length) {
    loadApis()
  }
})

onMounted(() => {
  if (mode.value === 'registry') loadApis()
})
</script>

<style scoped>
.api-docs-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 140px);
}

.api-docs-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.swagger-frame {
  flex: 1;
  width: 100%;
  min-height: 680px;
  border: 1px solid var(--app-border-color, var(--el-border-color));
  border-radius: 8px;
  margin-top: 12px;
  background: var(--app-card-bg, #fff);
}

.registry-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  margin-top: 12px;
  gap: 12px;
}

.registry-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.registry-count {
  font-size: 13px;
  color: var(--app-text-muted, #909399);
}
</style>

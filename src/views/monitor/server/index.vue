<template>
  <div class="server-monitor" v-loading="loading">
    <div class="page-card">
      <div class="page-header">
        <h2 class="page-title">服务监控</h2>
        <div class="server-actions">
          <span class="server-actions__label">自动刷新</span>
          <el-switch v-model="autoRefresh" @change="toggleAuto" />
          <el-button :icon="Refresh" @click="load">刷新</el-button>
        </div>
      </div>

      <!-- 使用率仪表盘 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="8" v-for="g in gauges" :key="g.key">
          <el-card shadow="never" class="gauge-card">
            <v-chart class="gauge" :option="gaugeOption(g.value)" autoresize />
            <div class="gauge-title">{{ g.title }}</div>
            <div class="gauge-foot">{{ g.foot }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 服务器信息 + JVM -->
    <el-row :gutter="16" class="info-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="info-card">
          <template #header><div class="info-card__header"><el-icon><Cpu /></el-icon><span>服务器信息</span></div></template>
          <el-descriptions :column="1" border class="info-desc">
            <el-descriptions-item label="操作系统">{{ data.system.osName }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ data.system.osArch }}</el-descriptions-item>
            <el-descriptions-item label="系统版本">{{ data.system.osVersion }}</el-descriptions-item>
            <el-descriptions-item label="主机名称">{{ data.system.hostName }}</el-descriptions-item>
            <el-descriptions-item label="服务器 IP">{{ data.system.ip }}</el-descriptions-item>
            <el-descriptions-item label="CPU 核心数">{{ data.cpu.cores }} 核</el-descriptions-item>
            <el-descriptions-item label="项目路径">{{ data.system.userDir }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="info-card">
          <template #header><div class="info-card__header"><el-icon><Coin /></el-icon><span>JVM 信息</span></div></template>
          <el-descriptions :column="1" border class="info-desc">
            <el-descriptions-item label="Java 版本">{{ data.jvm.version }}</el-descriptions-item>
            <el-descriptions-item label="运行厂商">{{ data.jvm.vendor }}</el-descriptions-item>
            <el-descriptions-item label="堆内存 (已用/最大)">
              {{ formatBytes(data.jvm.used) }} / {{ formatBytes(data.jvm.max) }}
            </el-descriptions-item>
            <el-descriptions-item label="启动时间">{{ data.jvm.startTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="运行时长">{{ formatUptime(data.jvm.uptimeSeconds) }}</el-descriptions-item>
            <el-descriptions-item label="安装路径">{{ data.jvm.home }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 磁盘状态 -->
    <div class="page-card">
      <div class="info-card__header disk-title"><el-icon><Files /></el-icon><span>磁盘状态</span></div>
      <el-table :data="data.disks" border stripe>
        <el-table-column prop="name" label="盘符 / 挂载点" min-width="160" />
        <el-table-column prop="type" label="文件系统" min-width="120" />
        <el-table-column label="总大小" min-width="110">
          <template #default="{ row }">{{ formatBytes(row.total) }}</template>
        </el-table-column>
        <el-table-column label="已用" min-width="110">
          <template #default="{ row }">{{ formatBytes(row.used) }}</template>
        </el-table-column>
        <el-table-column label="可用" min-width="110">
          <template #default="{ row }">{{ formatBytes(row.free) }}</template>
        </el-table-column>
        <el-table-column label="使用率" min-width="200">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.usage)" :color="usageColor(row.usage)" />
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无磁盘数据" :image-size="90" /></template>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Refresh, Cpu, Coin, Files } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import { getServerMonitor } from '@/api/monitor'
import type { ServerMonitor } from '@/types'

use([CanvasRenderer, GaugeChart])

defineOptions({ name: 'MonitorServer' })

const loading = ref(false)
const autoRefresh = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const emptyData: ServerMonitor = {
  cpu: { cores: 0, sysUsage: 0, processUsage: 0 },
  memory: { total: 0, used: 0, free: 0, usage: 0 },
  jvm: { total: 0, used: 0, free: 0, max: 0, usage: 0, version: '', vendor: '', home: '', uptimeSeconds: 0 },
  system: { osName: '', osArch: '', osVersion: '', hostName: '', ip: '', userDir: '', availableProcessors: 0 },
  disks: [],
}
const data = ref<ServerMonitor>({ ...emptyData })

const gauges = computed(() => [
  {
    key: 'cpu',
    title: 'CPU 使用率',
    value: data.value.cpu.sysUsage,
    foot: `进程 ${data.value.cpu.processUsage}% · ${data.value.cpu.cores} 核`,
  },
  {
    key: 'mem',
    title: '内存使用率',
    value: data.value.memory.usage,
    foot: `${formatBytes(data.value.memory.used)} / ${formatBytes(data.value.memory.total)}`,
  },
  {
    key: 'jvm',
    title: 'JVM 使用率',
    value: data.value.jvm.usage,
    foot: `${formatBytes(data.value.jvm.used)} / ${formatBytes(data.value.jvm.max)}`,
  },
])

function usageColor(usage: number) {
  if (usage >= 90) return '#f56c6c'
  if (usage >= 70) return '#e6a23c'
  return '#67c23a'
}

function gaugeOption(value: number) {
  const color = usageColor(value)
  return {
    animation: false,
    series: [
      {
        type: 'gauge',
        // 略缩小半径并上移中心，给下方标题/脚注留空，避免裁切溢出
        radius: '88%',
        center: ['50%', '58%'],
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 5,
        progress: { show: true, width: 10, roundCap: true, itemStyle: { color } },
        axisLine: { roundCap: true, lineStyle: { width: 10, color: [[1, '#ebeef5']] } },
        axisTick: { show: false },
        splitLine: { show: true, length: 8, distance: 2, lineStyle: { color: '#c0c4cc', width: 1 } },
        axisLabel: { distance: 14, color: '#909399', fontSize: 11 },
        pointer: { show: true, length: '46%', width: 3, itemStyle: { color } },
        anchor: { show: true, showAbove: true, size: 6, itemStyle: { color } },
        title: { show: false },
        detail: {
          valueAnimation: false,
          offsetCenter: [0, '28%'],
          fontSize: 20,
          fontWeight: 600,
          formatter: (v: number) => `${Number(v).toFixed(1)}%`,
          color,
        },
        data: [{ value: Number(value.toFixed(1)) }],
      },
    ],
  }
}

function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 2)} ${units[i]}`
}

function formatUptime(seconds: number) {
  if (!seconds || seconds < 0) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d} 天`)
  if (h > 0) parts.push(`${h} 时`)
  parts.push(`${m} 分`)
  return parts.join(' ')
}

async function load() {
  loading.value = true
  try {
    const res = await getServerMonitor()
    data.value = res.data
  } finally {
    loading.value = false
  }
}

function toggleAuto(val: string | number | boolean) {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (val) {
    timer = setInterval(load, 5000)
  }
}

onMounted(load)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.server-monitor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.server-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.server-actions__label {
  color: var(--app-text-muted);
  font-size: 13px;
}

.gauge-card {
  border: 1px solid var(--app-border-color);
  text-align: center;
}

.gauge-card :deep(.el-card__body) {
  padding: 12px 12px 16px;
  overflow: hidden;
}

.gauge {
  height: 180px;
  width: 100%;
  min-width: 0;
}

.gauge-title {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular, #606266);
  line-height: 1.4;
}

.gauge-foot {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 6px;
  padding: 0 4px;
  line-height: 1.4;
}

/* gutter 负边距限制在页面内，避免撑出横向滚动 */
.info-row {
  width: 100%;
  max-width: 100%;
}

.info-row :deep(> .el-col) {
  min-width: 0;
}

.info-card {
  border: 1px solid var(--app-border-color);
  height: 100%;
  min-width: 0;
}

.info-desc :deep(.el-descriptions__label),
.info-desc :deep(.el-descriptions__content) {
  word-break: break-all;
}

.info-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.disk-title {
  margin-bottom: 16px;
}

.server-monitor :deep(.el-table) {
  width: 100%;
}
</style>

<template>
  <div class="home">
    <!-- 上区：介绍 / 前端 / 后端 各 1/3 -->
    <el-row :gutter="16" class="home-top">
      <el-col :xs="24" :md="12" :lg="8">
        <div class="home-intro">
          <div class="home-intro__head">
            <div class="home-intro__title">
              {{ home.intro.title }}
              <el-tag type="primary" effect="plain" round size="small">{{ home.intro.version }}</el-tag>
            </div>
            <p class="home-intro__desc">{{ home.intro.description }}</p>
          </div>
          <div class="home-intro__features">
            <div v-for="f in home.intro.features" :key="f.title" class="feature-chip">
              <div class="feature-chip__icon">
                <el-icon :size="18"><component :is="iconOf(f.icon)" /></el-icon>
              </div>
              <div class="feature-chip__body">
                <div class="feature-chip__title">{{ f.title }}</div>
                <div class="feature-chip__desc">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <el-card shadow="never" class="home-card home-tech">
          <template #header>
            <div class="home-card__header">
              <el-icon><Monitor /></el-icon><span>前端技术选型</span>
            </div>
          </template>
          <div class="tech-list">
            <div v-for="t in home.frontendTech" :key="t.name" class="tech-row">
              <div class="tech-row__main">
                <span class="tech-row__name">{{ t.name }}</span>
                <span class="tech-row__desc">{{ t.desc }}</span>
              </div>
              <el-tag size="small" type="primary" effect="plain">{{ t.version }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <el-card shadow="never" class="home-card home-tech">
          <template #header>
            <div class="home-card__header">
              <el-icon><Coin /></el-icon><span>后端技术选型</span>
            </div>
          </template>
          <div class="tech-list">
            <div v-for="t in home.backendTech" :key="t.name" class="tech-row">
              <div class="tech-row__main">
                <span class="tech-row__name">{{ t.name }}</span>
                <span class="tech-row__desc">{{ t.desc }}</span>
              </div>
              <el-tag size="small" type="success" effect="plain">{{ t.version }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 更新日志 + 联系 / 捐赠 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="home-card">
          <template #header>
            <div class="home-card__header">
              <el-icon><Clock /></el-icon><span>更新日志</span>
            </div>
          </template>
          <el-timeline class="home-timeline">
            <el-timeline-item
              v-for="log in home.changelog"
              :key="log.version"
              :timestamp="`${log.version}  ·  ${log.date}`"
              placement="top"
              type="primary"
              hollow
            >
              <div v-for="(item, idx) in log.items" :key="idx" class="log-line">
                <el-tag size="small" :type="changelogTypeMeta[item.type].tag" effect="light">
                  {{ changelogTypeMeta[item.type].label }}
                </el-tag>
                <span class="log-line__text">{{ item.text }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="home-card home-card--mb">
          <template #header>
            <div class="home-card__header">
              <el-icon><Phone /></el-icon><span>联系信息</span>
            </div>
          </template>
          <div class="contact-list">
            <div v-for="c in home.contacts" :key="c.label" class="contact-item">
              <el-icon class="contact-item__icon"><component :is="iconOf(c.icon)" /></el-icon>
              <span class="contact-item__label">{{ c.label }}</span>
              <a v-if="c.link" :href="c.link" target="_blank" class="contact-item__value contact-item__value--link">
                {{ c.value }}
              </a>
              <span v-else class="contact-item__value">{{ c.value }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="home-card">
          <template #header>
            <div class="home-card__header">
              <el-icon><Coffee /></el-icon><span>捐赠情况</span>
              <span class="donation-total">累计 ¥{{ donationTotal }}</span>
            </div>
          </template>
          <p class="donation-tip">{{ home.donation.tip }}</p>
          <div class="donation-body">
            <div class="donation-qr">
              <el-image v-if="home.donation.qrcode" :src="home.donation.qrcode" fit="contain" class="donation-qr__img" />
              <div v-else class="donation-qr__placeholder">
                <el-icon :size="28"><Money /></el-icon>
                <span>收款码占位</span>
              </div>
            </div>
            <div class="donation-donors">
              <div v-for="(d, idx) in home.donation.donors" :key="idx" class="donor-item">
                <span class="donor-item__name">{{ d.name }}</span>
                <span class="donor-item__amount">¥{{ d.amount }}</span>
                <span class="donor-item__msg">{{ d.message || d.date }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Lock, Guide, Monitor, Bell, User, Message, Link, ChatDotRound,
  Coin, Clock, Phone, Coffee, Money,
} from '@element-plus/icons-vue'
import type { Component } from 'vue'
import { homeConfig, changelogTypeMeta } from '@/config/home'

defineOptions({ name: 'Dashboard' })

const home = homeConfig

const iconMap: Record<string, Component> = {
  Lock, Guide, Monitor, Bell, User, Message, Link, ChatDotRound, Coin, Clock, Phone, Coffee, Money,
}

function iconOf(name: string): Component {
  return iconMap[name] ?? Monitor
}

const donationTotal = computed(() =>
  home.donation.donors.reduce((sum, d) => sum + d.amount, 0).toFixed(2).replace(/\.00$/, ''),
)
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.home-top {
  align-items: stretch;
}

.home-top :deep(> .el-col) {
  display: flex;
  min-width: 0;
}

/* 介绍区：跟随主题卡片底色 */
.home-intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px 24px;
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-border-color);
  box-sizing: border-box;
}

.home-intro__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--app-text-primary);
}

.home-intro__desc {
  margin: 10px 0 0;
  line-height: 1.7;
  color: var(--app-text-muted);
  font-size: 13px;
}

.home-intro__features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.feature-chip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  background: var(--app-surface-soft);
  border: 1px solid var(--app-surface-soft-border);
}

.feature-chip__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-color-primary);
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-surface-soft-border);
}

.feature-chip__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--app-text-primary);
}

.feature-chip__desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

/* 卡片通用 */
.home-card {
  border: 1px solid var(--app-border-color);
  width: 100%;
}

.home-card--mb {
  margin-bottom: 16px;
}

.home-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* 右侧技术选型 */
.home-tech {
  height: 100%;
}

.home-tech :deep(.el-card__body) {
  padding-top: 12px;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tech-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--app-fill-color, #fafbfc);
  border: 1px solid var(--app-border-color);
}

.tech-row__main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tech-row__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-primary);
}

.tech-row__desc {
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 更新日志 */
.home-timeline {
  padding: 4px 4px 0;
}

.log-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.log-line__text {
  color: var(--app-text-primary);
  line-height: 1.6;
}

/* 联系信息 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--app-border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item__icon {
  color: var(--app-color-primary);
}

.contact-item__label {
  width: 56px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.contact-item__value {
  color: var(--app-text-primary);
}

.contact-item__value--link {
  color: var(--app-color-primary);
}

/* 捐赠 */
.donation-total {
  margin-left: auto;
  font-size: 13px;
  color: #f56c6c;
  font-weight: 600;
}

.donation-tip {
  margin: 0 0 12px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.donation-body {
  display: flex;
  gap: 16px;
}

.donation-qr {
  flex-shrink: 0;
}

.donation-qr__img,
.donation-qr__placeholder {
  width: 108px;
  height: 108px;
  border-radius: 10px;
}

.donation-qr__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed var(--app-surface-soft-border);
  background: var(--app-surface-soft);
  color: var(--app-text-muted);
  font-size: 12px;
}

.donation-donors {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.donor-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.donor-item__name {
  width: 52px;
  color: var(--app-text-primary);
}

.donor-item__amount {
  color: #f56c6c;
  font-weight: 600;
  width: 60px;
}

.donor-item__msg {
  flex: 1;
  min-width: 0;
  color: var(--app-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 992px) {
  .home-intro__features {
    grid-template-columns: 1fr;
  }
}
</style>

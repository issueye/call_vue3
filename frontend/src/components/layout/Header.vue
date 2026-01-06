<script setup>
import { computed } from 'vue'
import { useUserStore, usePatientStore } from '@/stores'
import { useResponsive } from '@/composables'
import './Header.css'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
const patientStore = usePatientStore()
const { isMobile } = useResponsive()

const orgName = computed(() => patientStore.currentOrg?.name || '未选择机构')
const deptName = computed(() => patientStore.currentDept?.name || '未选择诊室')

const handleLogout = () => {
  userStore.logout()
  window.location.href = '/login'
}
</script>

<template>
  <header class="workbench-header">
    <div class="workbench-header__left">
      <div class="workbench-header__brand">
        <span class="workbench-header__logo">🏥</span>
        <span class="workbench-header__title">呼叫客户端</span>
      </div>
    </div>

    <div class="workbench-header__center">
      <div class="workbench-header__info">
        <span class="info-tag info-tag--org">
          <span class="info-tag__icon">🏢</span>
          <span class="info-tag__text">{{ orgName }}</span>
        </span>
        <span class="info-tag info-tag--dept">
          <span class="info-tag__icon">🩺</span>
          <span class="info-tag__text">{{ deptName }}</span>
        </span>
      </div>
    </div>

    <div class="workbench-header__right">
      <div class="workbench-header__stats">
        <span class="stat-item">
          <span class="stat-item__label">等待</span>
          <span class="stat-item__value">{{ patientStore.waitingCount }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-item__label">总计</span>
          <span class="stat-item__value">{{ patientStore.patientCount }}</span>
        </span>
      </div>

      <div class="workbench-header__user" @click="handleLogout">
        <span class="workbench-header__username">{{ userStore.userName || '用户' }}</span>
        <span class="workbench-header__logout">退出</span>
      </div>
    </div>
  </header>
</template>

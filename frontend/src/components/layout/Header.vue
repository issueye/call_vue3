<script setup>
import { computed, ref } from 'vue'
import { useUserStore, usePatientStore } from '@/stores'
import { useResponsive } from '@/composables'
import { apiLoadForwardURL, apiSaveForwardURL } from '@/api'
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

const showServerDialog = ref(false)
const serverUrl = ref('http://0.0.0.0:21999')

const orgName = computed(() => userStore.org?.org_name || '未选择机构')
const deptName = computed(() => userStore.room?.name || '未选择诊室')
const userName = computed(() => userStore.userInfo?.nick_name || userStore.userInfo?.account || '用户')

const handleLogout = () => {
  userStore.logout()
  window.location.href = '/login'
}

// 设置服务器地址
const handleSetting = async () => {
  try {
    const res = await apiLoadForwardURL()
    serverUrl.value = res?.data || 'http://0.0.0.0:21999'
    showServerDialog.value = true
  } catch (error) {
    console.error('加载服务器地址失败:', error)
    serverUrl.value = 'http://0.0.0.0:21999'
    showServerDialog.value = true
  }
}

// 保存服务器地址
const saveServerUrl = async () => {
  if (!serverUrl.value) {
    alert('请输入服务器地址')
    return
  }
  await apiSaveForwardURL(serverUrl.value)
  showServerDialog.value = false
  window.location.reload()
}

// 关闭对话框
const closeServerDialog = () => {
  showServerDialog.value = false
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

      <div class="workbench-header__setting" @click="handleSetting" title="设置">
        <span class="workbench-header__setting-icon">⚙️</span>
      </div>

      <div class="workbench-header__user" @click="handleLogout">
        <span class="workbench-header__username">{{ userName }}</span>
        <span class="workbench-header__logout">退出</span>
      </div>
    </div>

    <!-- 服务器地址设置对话框 -->
    <Teleport to="body">
      <div v-if="showServerDialog" class="dialog-overlay" @click.self="closeServerDialog">
        <div class="dialog">
          <div class="dialog__header">服务器地址</div>
          <div class="dialog__body">
            <label class="dialog__label">请输入服务器地址</label>
            <input
              v-model="serverUrl"
              type="text"
              class="dialog__input"
              placeholder="http://0.0.0.0:21999"
              @keyup.enter="saveServerUrl"
            />
          </div>
          <div class="dialog__footer">
            <button class="dialog__btn dialog__btn--cancel" @click="closeServerDialog">取消</button>
            <button class="dialog__btn dialog__btn--confirm" @click="saveServerUrl">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

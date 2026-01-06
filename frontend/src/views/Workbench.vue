<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { usePatientStore, useUserStore } from '@/stores'
import { useScreenSize } from '@/composables'
import { WorkbenchLayout } from '@/components/layout'
import { initMqtt, connect, disconnect, linkOrgDocsStatus, linkPatientUpdate, connectionStatus, CONNECT_STATES } from '@/mqtt'
import './Workbench.css'

const patientStore = usePatientStore()
const userStore = useUserStore()
const { isSmall } = useScreenSize()

// 初始化工作台
const initWorkbench = async () => {
  // 检查是否有机构信息
  if (!userStore.org) {
    console.warn('未配置机构信息')
    return
  }

  // 获取患者列表
  await patientStore.fetchPatients(
    userStore.org.org_id,
    userStore.room?.dept_id || userStore.org.dept_id
  )

  // 如果有诊室信息，获取在诊患者
  if (userStore.room || userStore.org.dept_id) {
    const deptId = userStore.room?.dept_id || userStore.org.dept_id
    await patientStore.getVisitedPatient(
      userStore.userInfo?.id,
      userStore.org.org_id,
      deptId
    )
  }
}

// 初始化 MQTT 连接
const initMqttConnection = () => {
  if (!userStore.org) return

  const mqttUrl = import.meta.env.VITE_MQTT_URL || 'ws://localhost:8083/mqtt'

  // 初始化 MQTT
  initMqtt({
    clientId: `caller_${userStore.clientID || Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 3000
  })

  // 连接
  connect(mqttUrl)

  // 订阅机构医生状态
  if (userStore.org.org_code) {
    linkOrgDocsStatus(userStore.org.org_code, (message) => {
      // 更新医生状态
      patientStore.setDocStatus(message.data || message)
    })
  }

  // 订阅患者更新
  const deptId = userStore.room?.dept_id || userStore.org.dept_id
  if (deptId) {
    linkPatientUpdate(userStore.org.org_code, deptId, (message) => {
      // 刷新患者列表
      patientStore.fetchPatients(userStore.org.org_id, deptId)
    })
  }
}

// 清理
const cleanup = () => {
  disconnect()
}

// 监听机构变化
watch(
  () => userStore.org,
  (org) => {
    if (org) {
      initWorkbench()
      initMqttConnection()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 屏幕尺寸变化监听
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="workbench-page">
    <div class="workbench-page__status">
      <span
        class="mqtt-status"
        :class="[`mqtt-status--${connectionStatus}`]"
      >
        {{ connectionStatus === CONNECT_STATES.CONNECTED ? '已连接' : '未连接' }}
      </span>
    </div>
    <WorkbenchLayout />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePatientStore } from '@/stores'
import { PatientDetailCard, PatientList } from '@/components/business'
import './MobileLayout.css'

const patientStore = usePatientStore()

// 是否显示患者详情（用于切换视图）
const showDetail = ref(false)

const currentPatient = computed(() => patientStore.currentPatient)

// 切换到患者列表
const showList = () => {
  showDetail.value = false
}

// 切换到患者详情
const showPatientDetail = (patient) => {
  patientStore.setCurrentPatient(patient)
  showDetail.value = true
}

// 处理呼叫
const handleCall = (patient) => {
  patientStore.callPatient(patient)
}

// 处理下一位
const handleNext = () => {
  if (patientStore.visitPatient) {
    patientStore.showNextDialog = true
  } else {
    patientStore.handleNext(
      patientStore.userInfo?.id,
      patientStore.org?.org_id,
      patientStore.room?.dept_id || patientStore.org?.dept_id
    )
  }
}

// 处理重呼
const handleRecall = () => {
  if (patientStore.currentPatient) {
    patientStore.callPatient(patientStore.currentPatient)
  }
}

// 处理过号
const handleSkip = () => {
  if (patientStore.currentPatient) {
    patientStore.skipPatient(patientStore.currentPatient)
  }
}
</script>

<template>
  <div class="mobile-layout">
    <!-- 患者信息区域 -->
    <div class="mobile-layout__section mobile-layout__section--patient">
      <PatientDetailCard
        :patient="currentPatient"
        @next="handleNext"
        @recall="handleRecall"
        @skip="handleSkip"
      />
    </div>

    <!-- 患者列表区域 -->
    <div class="mobile-layout__section mobile-layout__section--list">
      <div class="section-header">
        <span class="section-header__title">排队患者</span>
        <span class="section-header__count">{{ patientStore.waitingCount }}人</span>
      </div>
      <PatientList
        :patients="patientStore.patients"
        :active-id="patientStore.currentPatient?.id"
        :loading="patientStore.loading"
        @select="showPatientDetail"
        @call="handleCall"
      />
    </div>
  </div>
</template>

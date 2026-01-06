<script setup>
import { ref, computed } from 'vue'
import { usePatientStore } from '@/stores'
import { PatientList, PatientDetailCard } from '@/components/business'
import './MobileLayout.css'

const patientStore = usePatientStore()
const showList = ref(true)

const currentPatient = computed(() => patientStore.currentPatient)

const toggleView = () => {
  showList.value = !showList.value
}

const handleSelect = (patient) => {
  patientStore.setCurrentPatient(patient)
  showList.value = false
}

const handleCall = (patient) => {
  patientStore.callPatient(patient)
}

const handleNext = () => {
  patientStore.nextPatient()
}

const handleRecall = () => {
  if (patientStore.currentPatient) {
    patientStore.callPatient(patientStore.currentPatient)
  }
}

const handleSkip = () => {
  if (patientStore.currentPatient) {
    patientStore.skipPatient(patientStore.currentPatient)
  }
}

const handleBack = () => {
  showList.value = true
}
</script>

<template>
  <div class="mobile-layout">
    <div v-if="showList" class="mobile-layout__list">
      <PatientList
        :patients="patientStore.patients"
        :active-id="patientStore.currentPatient?.id"
        :loading="patientStore.loading"
        @select="handleSelect"
        @call="handleCall"
      />
    </div>

    <div v-else class="mobile-layout__detail">
      <div class="mobile-layout__back" @click="handleBack">
        <span class="mobile-layout__back-icon">←</span>
        <span>返回列表</span>
      </div>
      <PatientDetailCard
        :patient="patientStore.currentPatient"
        @next="handleNext"
        @recall="handleRecall"
        @skip="handleSkip"
      />
    </div>
  </div>
</template>

<script setup>
import { usePatientStore } from '@/stores'
import { PatientList, PatientDetailCard } from '@/components/business'
import './DesktopLayout.css'

const patientStore = usePatientStore()

const handleSelect = (patient) => {
  patientStore.setCurrentPatient(patient)
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
</script>

<template>
  <div class="desktop-layout">
    <div class="desktop-layout__left">
      <PatientList
        :patients="patientStore.patients"
        :active-id="patientStore.currentPatient?.id"
        :loading="patientStore.loading"
        @select="handleSelect"
        @call="handleCall"
      />
    </div>
    <div class="desktop-layout__right">
      <PatientDetailCard
        :patient="patientStore.currentPatient"
        @next="handleNext"
        @recall="handleRecall"
        @skip="handleSkip"
      />
    </div>
  </div>
</template>

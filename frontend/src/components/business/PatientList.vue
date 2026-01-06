<script setup>
import { computed } from 'vue'
import PatientItem from './PatientItem.vue'
import './PatientList.css'

const props = defineProps({
  patients: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'call'])
</script>

<template>
  <div class="patient-list">
    <div class="patient-list__header">
      <h3 class="patient-list__title">患者列表</h3>
      <span class="patient-list__count">{{ patients.length }}人</span>
    </div>

    <div v-if="loading" class="patient-list__loading">
      <div class="loading-spinner" />
      <span>加载中...</span>
    </div>

    <div v-else-if="patients.length === 0" class="patient-list__empty">
      <span>暂无患者</span>
    </div>

    <div v-else class="patient-list__items">
      <transition-group name="list">
        <PatientItem
          v-for="patient in patients"
          :key="patient.id"
          :patient="patient"
          :active="patient.id === activeId"
          @click="emit('select', patient)"
          @call="emit('call', patient)"
        />
      </transition-group>
    </div>
  </div>
</template>

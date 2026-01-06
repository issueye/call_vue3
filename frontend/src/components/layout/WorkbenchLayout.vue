<script setup>
import { computed } from 'vue'
import { useResponsive } from '@/composables'
import DesktopLayout from './DesktopLayout.vue'
import MobileLayout from './MobileLayout.vue'
import Header from './Header.vue'
import './WorkbenchLayout.css'

const { isMobile } = useResponsive()
const CurrentLayout = computed(() => (isMobile.value ? MobileLayout : DesktopLayout))
</script>

<template>
  <div class="workbench-layout">
    <Header />
    <main class="workbench-layout__main">
      <component :is="CurrentLayout" />
    </main>
  </div>
</template>

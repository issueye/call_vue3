<script setup>
import { computed } from 'vue'
import { useResponsive } from '@/composables'
import DesktopLayout from './desktop/DesktopLayout.vue'
import MobileLayout from './mobile/MobileLayout.vue'
import DesktopHeader from './desktop/Header.vue'
import MobileHeader from './mobile/Header.vue'
import StatusBar from '@/components/common/StatusBar.vue'
import './WorkbenchLayout.css'

const { isMobile } = useResponsive()
const CurrentLayout = computed(() => (isMobile.value ? MobileLayout : DesktopLayout))
const CurrentHeader = computed(() => (isMobile.value ? MobileHeader : DesktopHeader))
</script>

<template>
  <div class="workbench-layout">
    <component :is="CurrentHeader" />
    <main class="workbench-layout__main">
      <component :is="CurrentLayout" />
    </main>
    <StatusBar />
  </div>
</template>

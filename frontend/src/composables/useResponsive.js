import { computed, ref, onMounted, onUnmounted } from 'vue'
import { BREAKPOINTS } from '@/utils/responsive'

export function useResponsive() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const isMobile = computed(() => width.value <= BREAKPOINTS.PORTRAIT_SM)
  const isDesktop = computed(() => width.value > BREAKPOINTS.PORTRAIT_SM)
  const orientation = computed(() => (width.value > height.value ? 'landscape' : 'portrait'))

  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    width,
    height,
    isMobile,
    isDesktop,
    orientation
  }
}

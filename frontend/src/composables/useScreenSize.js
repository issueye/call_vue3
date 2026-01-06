// 屏幕尺寸检测
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点配置
export const BREAKPOINTS = {
  SM: 650,
  LG: 'lg'
}

export function useScreenSize() {
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  const isSmall = computed(() => screenWidth.value <= BREAKPOINTS.SM)
  const isLarge = computed(() => screenWidth.value > BREAKPOINTS.SM)

  const currentSize = computed(() => {
    return isSmall.value ? 'sm' : 'lg'
  })

  const updateSize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    screenWidth,
    screenHeight,
    isSmall,
    isLarge,
    currentSize
  }
}

// 屏幕变化监听器
export function onScreenChange(callback) {
  let lastWidth = window.innerWidth

  const handler = () => {
    const currentWidth = window.innerWidth
    if (lastWidth !== currentWidth) {
      callback({
        width: currentWidth,
        height: window.innerHeight,
        isSmall: currentWidth <= BREAKPOINTS.SM,
        isLarge: currentWidth > BREAKPOINTS.SM
      })
      lastWidth = currentWidth
    }
  }

  window.addEventListener('resize', handler)

  // 返回取消监听函数
  return () => {
    window.removeEventListener('resize', handler)
  }
}

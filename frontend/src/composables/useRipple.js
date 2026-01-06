import { onMounted, onUnmounted } from 'vue'

export function useRipple(element, color = 'rgba(255, 255, 255, 0.3)') {
  const createRipple = (event) => {
    const ripple = document.createElement('span')
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`
    ripple.style.position = 'absolute'
    ripple.style.borderRadius = '50%'
    ripple.style.background = color
    ripple.style.transform = 'scale(0)'
    ripple.style.animation = 'ripple 0.6s ease-out'
    ripple.style.pointerEvents = 'none'

    element.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  const handleClick = (event) => createRipple(event)

  onMounted(() => {
    element.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    element.removeEventListener('click', handleClick)
  })
}

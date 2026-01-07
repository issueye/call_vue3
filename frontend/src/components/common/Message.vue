<template>
  <Transition name="message" appear>
    <div
      v-show="visible"
      :class="messageClasses"
      :style="messageStyle"
      role="alert"
    >
      <!-- 图标 -->
      <span v-if="showIcon" class="message__icon">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <!-- Success Icon -->
          <path v-if="type === 'success'" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292c-12.7 17.7-39 17.7-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"/>

          <!-- Warning Icon -->
          <path v-else-if="type === 'warning'" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"/>

          <!-- Info Icon -->
          <path v-else-if="type === 'info'" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 232v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8zm-32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"/>

          <!-- Error Icon -->
          <path v-else-if="type === 'error'" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"/>
        </svg>
      </span>

      <!-- 内容 -->
      <span class="message__content">
        <slot>{{ message }}</slot>
      </span>

      <!-- 关闭按钮 -->
      <span
        v-if="showClose"
        class="message__close"
        @click="close"
        role="button"
        aria-label="关闭"
      >
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 00-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1045.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0045.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 00-45.12-45.184z"/>
        </svg>
      </span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import './Message.css'

// Props 定义
const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'info', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  showClose: {
    type: Boolean,
    default: false
  },
  offset: {
    type: Number,
    default: 20
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  onClose: {
    type: Function,
    default: null
  }
})

// 响应式状态
const visible = ref(false)
let timer = null

// 计算样式类
const messageClasses = computed(() => [
  'message',
  `message--${props.type}`
])

// 计算内联样式
const messageStyle = computed(() => ({
  top: `${props.offset}px`
}))

// 关闭方法
const close = () => {
  visible.value = false
  if (props.onClose) {
    props.onClose()
  }
}

// 启动自动关闭定时器
const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 清除定时器
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 生命周期
onMounted(() => {
  visible.value = true
  startTimer()
})

onBeforeUnmount(() => {
  clearTimer()
})

// 暴露方法
defineExpose({
  close
})
</script>

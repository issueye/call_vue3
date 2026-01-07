/**
 * Message 消息提示工具函数
 * 提供类似 ElMessage 的全局消息提示功能
 */

import { createApp, h } from 'vue'
import MessageComponent from '@/components/common/Message.vue'

// 存储所有消息实例
const messageInstances = []

// 默认配置
const defaults = {
  message: '',
  type: 'info',
  duration: 3000,
  showClose: false,
  offset: 20,
  showIcon: true,
  onClose: null
}

/**
 * 创建消息容器
 */
const createContainer = () => {
  let container = document.querySelector('.message-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'message-container'
    document.body.appendChild(container)
  }
  return container
}

/**
 * 计算消息的偏移量
 */
const calculateOffset = (instance) => {
  // 找到当前实例在数组中的索引
  const index = messageInstances.indexOf(instance)
  if (index === -1) return defaults.offset

  // 计算前面所有消息的高度和间距
  let offset = defaults.offset
  for (let i = 0; i < index; i++) {
    const prevInstance = messageInstances[i]
    if (prevInstance && prevInstance.vm && prevInstance.vm.el) {
      const height = prevInstance.vm.el.offsetHeight
      offset += height + 16 // 16px 是消息之间的间距
    }
  }

  return offset
}

/**
 * 更新所有消息的偏移量
 */
const updateOffsets = () => {
  messageInstances.forEach((instance, index) => {
    if (instance && instance.vm && instance.vm.el) {
      let offset = defaults.offset
      for (let i = 0; i < index; i++) {
        const prevInstance = messageInstances[i]
        if (prevInstance && prevInstance.vm && prevInstance.vm.el) {
          const height = prevInstance.vm.el.offsetHeight
          offset += height + 16
        }
      }
      instance.vm.el.style.top = `${offset}px`
    }
  })
}

/**
 * 创建消息实例
 */
const createMessage = (options) => {
  // 合并配置
  const props = { ...defaults, ...options }

  // 创建容器
  const container = createContainer()

  // 创建 Vue 应用实例
  const app = createApp({
    render() {
      return h(MessageComponent, {
        ...props,
        onClose: () => {
          if (props.onClose) {
            props.onClose()
          }
          close(instance)
        }
      })
    }
  })

  // 挂载到容器
  const vm = app.mount(container)

  // 将 DOM 元素添加到容器
  container.appendChild(vm.$el)

  // 创建实例对象
  const instance = {
    app,
    vm,
    props,
    close: () => close(instance)
  }

  // 添加到实例数组
  messageInstances.push(instance)

  // 计算并设置偏移量
  setTimeout(() => {
    const offset = calculateOffset(instance)
    if (vm.$el) {
      vm.$el.style.top = `${offset}px`
    }
  }, 0)

  return instance
}

/**
 * 关闭消息实例
 */
const close = (instance) => {
  const index = messageInstances.indexOf(instance)
  if (index === -1) return

  // 从数组中移除
  messageInstances.splice(index, 1)

  // 更新剩余消息的偏移量
  updateOffsets()

  // 卸载实例
  if (instance.app) {
    instance.app.unmount()
  }

  // 移除 DOM 元素
  if (instance.vm && instance.vm.$el && instance.vm.$el.parentNode) {
    instance.vm.$el.parentNode.removeChild(instance.vm.$el)
  }
}

/**
 * Message API
 */
const Message = (options) => {
  return createMessage(options)
}

// 便捷方法
Message.success = (message, options = {}) => {
  return createMessage({ ...options, message, type: 'success' })
}

Message.warning = (message, options = {}) => {
  return createMessage({ ...options, message, type: 'warning' })
}

Message.info = (message, options = {}) => {
  return createMessage({ ...options, message, type: 'info' })
}

Message.error = (message, options = {}) => {
  return createMessage({ ...options, message, type: 'error' })
}

// 关闭所有消息
Message.closeAll = () => {
  const instances = [...messageInstances]
  instances.forEach(instance => instance.close())
}

export default Message

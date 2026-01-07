/**
 * Message 组件使用示例
 *
 * 在 Vue 组件中导入使用：
 */

import Message from '@/utils/message'

// ============= 基础用法 =============

// 1. 成功消息
Message.success('操作成功！')

// 2. 警告消息
Message.warning('请注意，这是一个警告信息')

// 3. 信息消息
Message.info('这是一条提示信息')

// 4. 错误消息
Message.error('操作失败，请重试')

// ============= 高级用法 =============

// 5. 自定义显示时间（默认 3000ms）
Message.success('操作成功！', {
  duration: 5000 // 5 秒后自动关闭
})

// 6. 显示关闭按钮（不允许自动关闭）
Message.info('重要提示，请手动关闭', {
  duration: 0, // 设置为 0 表示不自动关闭
  showClose: true
})

// 7. 带关闭回调
Message.success('操作成功！', {
  onClose: () => {
    console.log('消息已关闭')
  }
})

// 8. 使用完整配置
Message({
  message: '这是一条完整配置的消息',
  type: 'success',
  duration: 3000,
  showClose: true,
  offset: 20,
  showIcon: true,
  onClose: () => {
    console.log('消息关闭了')
  }
})

// 9. 在 Vue 组件中的使用示例
/*
<template>
  <div class="demo-page">
    <BaseButton @click="showSuccess">成功消息</BaseButton>
    <BaseButton @click="showWarning">警告消息</BaseButton>
    <BaseButton @click="showInfo">信息消息</BaseButton>
    <BaseButton @click="showError">错误消息</BaseButton>
    <BaseButton @click="showCustom">自定义消息</BaseButton>
    <BaseButton @click="closeAll">关闭所有</BaseButton>
  </div>
</template>

<script setup>
import Message from '@/utils/message'

const showSuccess = () => {
  Message.success('操作成功！')
}

const showWarning = () => {
  Message.warning('请注意，这是一个警告信息')
}

const showInfo = () => {
  Message.info('这是一条提示信息')
}

const showError = () => {
  Message.error('操作失败，请重试')
}

const showCustom = () => {
  Message({
    message: '这是一条完整配置的消息',
    type: 'success',
    duration: 5000,
    showClose: true,
    onClose: () => {
      console.log('消息关闭了')
    }
  })
}

const closeAll = () => {
  Message.closeAll()
}
</script>
*/

// ============= API 详解 =============

/**
 * Message.success(message, options)
 * @param {string} message - 消息内容
 * @param {object} options - 可选配置
 * @returns {object} 消息实例
 *
 * Message.warning(message, options)
 * Message.info(message, options)
 * Message.error(message, options)
 * 用法同上
 *
 * Message(options)
 * @param {object} options - 配置对象
 * @param {string} options.message - 消息内容
 * @param {string} options.type - 消息类型: 'success' | 'warning' | 'info' | 'error'
 * @param {number} options.duration - 自动关闭时间（毫秒），0 表示不自动关闭，默认 3000
 * @param {boolean} options.showClose - 是否显示关闭按钮，默认 false
 * @param {number} options.offset - 距离顶部的偏移量，默认 20
 * @param {boolean} options.showIcon - 是否显示图标，默认 true
 * @param {function} options.onClose - 关闭回调函数
 * @returns {object} 消息实例
 *
 * Message.closeAll()
 * 关闭所有消息
 */

export default Message

<template>
  <div class="message-demo">
    <div class="demo-header">
      <h1>Message 消息提示组件演示</h1>
      <p class="subtitle">类似 ElMessage 的轻量级消息提示组件</p>
    </div>

    <div class="demo-section">
      <h2>基础用法</h2>
      <div class="button-group">
        <BaseButton type="success" @click="showSuccess">
          成功消息
        </BaseButton>
        <BaseButton type="warning" @click="showWarning">
          警告消息
        </BaseButton>
        <BaseButton type="default" @click="showInfo">
          信息消息
        </BaseButton>
        <BaseButton type="danger" @click="showError">
          错误消息
        </BaseButton>
      </div>
    </div>

    <div class="demo-section">
      <h2>自定义配置</h2>
      <div class="button-group">
        <BaseButton type="primary" @click="showWithDuration">
          自定义时长 (5秒)
        </BaseButton>
        <BaseButton type="primary" @click="showWithClose">
          显示关闭按钮
        </BaseButton>
        <BaseButton type="primary" @click="showWithCallback">
          带关闭回调
        </BaseButton>
        <BaseButton type="primary" @click="showFullConfig">
          完整配置
        </BaseButton>
      </div>
    </div>

    <div class="demo-section">
      <h2>批量操作</h2>
      <div class="button-group">
        <BaseButton type="primary" @click="showMultiple">
          连续显示多条消息
        </BaseButton>
        <BaseButton type="danger" @click="closeAll">
          关闭所有消息
        </BaseButton>
      </div>
    </div>

    <div class="demo-section">
      <h2>实际应用场景</h2>
      <div class="button-group">
        <BaseButton type="success" @click="simulateSave">
          模拟保存操作
        </BaseButton>
        <BaseButton type="danger" @click="simulateDelete">
          模拟删除操作
        </BaseButton>
        <BaseButton type="primary" @click="simulateSubmit">
          模拟提交操作
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Message from '@/utils/message'

// 基础用法
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

// 自定义配置
const showWithDuration = () => {
  Message.success('这条消息将在 5 秒后自动关闭', {
    duration: 5000
  })
}

const showWithClose = () => {
  Message.info('这是一条重要信息，请手动关闭', {
    duration: 0,
    showClose: true
  })
}

const showWithCallback = () => {
  Message.success('操作成功！', {
    onClose: () => {
      console.log('消息已关闭')
      Message.info('你刚刚关闭了一条消息')
    }
  })
}

const showFullConfig = () => {
  Message({
    message: '这是一条完整配置的消息',
    type: 'success',
    duration: 5000,
    showClose: true,
    offset: 20,
    showIcon: true,
    onClose: () => {
      console.log('完整配置的消息已关闭')
    }
  })
}

// 批量操作
const showMultiple = () => {
  Message.success('第 1 条消息')
  setTimeout(() => {
    Message.warning('第 2 条消息')
  }, 300)
  setTimeout(() => {
    Message.info('第 3 条消息')
  }, 600)
  setTimeout(() => {
    Message.error('第 4 条消息')
  }, 900)
}

const closeAll = () => {
  Message.closeAll()
  Message.info('已关闭所有消息')
}

// 实际应用场景
const simulateSave = () => {
  Message.info('正在保存...')
  setTimeout(() => {
    Message.success('保存成功！')
  }, 1000)
}

const simulateDelete = () => {
  Message.warning('确定要删除吗？')
  setTimeout(() => {
    const confirmed = confirm('确认删除？')
    if (confirmed) {
      Message.success('删除成功！')
    } else {
      Message.info('已取消删除')
    }
  }, 500)
}

const simulateSubmit = () => {
  Message.info('正在提交...')
  setTimeout(() => {
    const isSuccess = Math.random() > 0.3
    if (isSuccess) {
      Message.success('提交成功！')
    } else {
      Message.error('提交失败，请重试')
    }
  }, 1500)
}
</script>

<style scoped>
.message-demo {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 60px;
}

.demo-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-muted);
}

.demo-section {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.demo-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-lighter);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .message-demo {
    padding: 20px 16px;
  }

  .demo-header h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .demo-section {
    padding: 20px;
  }

  .demo-section h2 {
    font-size: 18px;
  }
}
</style>

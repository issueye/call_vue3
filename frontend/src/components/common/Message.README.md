# Message 消息提示组件

一个轻量级、功能完整的消息提示组件，类似 Element Plus 的 ElMessage，专为 Wails + Vue 3 项目设计。

## 特性

- 四种消息类型：成功、警告、信息、错误
- 支持自动/手动关闭
- 支持多实例堆叠显示
- 流畅的淡入淡出 + 顶部滑入动画
- 完全响应式设计
- TypeScript 类型支持
- 内联 SVG 图标，无需额外依赖
- 与项目设计系统完美集成

## 文件结构

```
frontend/src/
├── components/common/
│   ├── Message.vue           # 消息组件
│   ├── Message.css           # 组件样式
│   └── Message.README.md     # 组件文档
└── utils/
    ├── message.js            # 工具函数
    └── message.example.js    # 使用示例
```

## 快速开始

### 基础用法

```javascript
import Message from '@/utils/message'

// 成功消息
Message.success('操作成功！')

// 警告消息
Message.warning('请注意，这是一个警告信息')

// 信息消息
Message.info('这是一条提示信息')

// 错误消息
Message.error('操作失败，请重试')
```

### 高级用法

```javascript
// 自定义显示时间
Message.success('操作成功！', {
  duration: 5000 // 5 秒后自动关闭
})

// 显示关闭按钮（不自动关闭）
Message.info('重要提示，请手动关闭', {
  duration: 0,
  showClose: true
})

// 完整配置
Message({
  message: '这是一条完整配置的消息',
  type: 'success',
  duration: 3000,
  showClose: true,
  offset: 20,
  showIcon: true,
  onClose: () => {
    console.log('消息已关闭')
  }
})

// 关闭所有消息
Message.closeAll()
```

## API 参数

### Message(options)

| 参数      | 说明             | 类型    | 可选值                          | 默认值  |
|-----------|------------------|---------|---------------------------------|---------|
| message   | 消息内容         | string  | -                               | ''      |
| type      | 消息类型         | string  | success / warning / info / error | info    |
| duration  | 自动关闭时间（毫秒） | number  | -                               | 3000    |
| showClose | 是否显示关闭按钮 | boolean | -                               | false   |
| offset    | 距离顶部偏移量   | number  | -                               | 20      |
| showIcon  | 是否显示图标     | boolean | -                               | true    |
| onClose   | 关闭回调函数     | function | -                              | null    |

### 便捷方法

- `Message.success(message, options)` - 成功消息
- `Message.warning(message, options)` - 警告消息
- `Message.info(message, options)` - 信息消息
- `Message.error(message, options)` - 错误消息
- `Message.closeAll()` - 关闭所有消息

## 样式定制

### 类型颜色

组件使用项目的 CSS 变量系统，默认颜色配置：

- success: `#52c41a` (绿色)
- warning: `#faad14` (橙色)
- info: `#1890ff` (蓝色)
- error: `#ff4d4f` (红色)

### CSS 变量

组件依赖以下 CSS 变量（定义在 `main.css` 中）：

```css
--border-radius-md: 8px
--font-size-md: 14px
--text-primary: #303133
--text-muted: #909399
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12)
```

### 自定义样式

如需自定义样式，可以修改 `Message.css` 文件：

```css
/* 修改背景色 */
.message--success {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
}

/* 修改动画时长 */
.message-enter-active {
  animation: messageSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 动画效果

组件实现了流畅的动画效果：

1. **进入动画**：从顶部向下滑入，同时淡入
2. **离开动画**：向顶部滑出，同时淡出
3. **过渡效果**：使用 cubic-bezier 缓动函数，提供自然的运动感

动画时长：300ms

## 响应式设计

- **桌面端**：固定宽度居中显示（min-width: 300px, max-width: 500px）
- **移动端**：自适应宽度（左右各 16px 间距）

## 使用示例

### 在 Vue 组件中使用

```vue
<template>
  <div class="page">
    <BaseButton type="success" @click="handleSuccess">
      成功消息
    </BaseButton>
    <BaseButton type="warning" @click="handleWarning">
      警告消息
    </BaseButton>
    <BaseButton type="danger" @click="handleError">
      错误消息
    </BaseButton>
  </div>
</template>

<script setup>
import Message from '@/utils/message'

const handleSuccess = () => {
  Message.success('操作成功！', {
    duration: 2000
  })
}

const handleWarning = () => {
  Message.warning('请注意检查输入内容')
}

const handleError = () => {
  Message.error('操作失败，请重试', {
    showClose: true,
    onClose: () => {
      console.log('用户已关闭错误提示')
    }
  })
}
</script>
```

### 在异步操作中使用

```javascript
import Message from '@/utils/message'

async function handleSubmit() {
  try {
    await submitForm()
    Message.success('提交成功！')
  } catch (error) {
    Message.error('提交失败：' + error.message)
  }
}
```

### 批量操作反馈

```javascript
import Message from '@/utils/message'

async function batchDelete(items) {
  const success = []
  const failed = []

  for (const item of items) {
    try {
      await deleteItem(item.id)
      success.push(item)
    } catch (error) {
      failed.push(item)
    }
  }

  if (failed.length === 0) {
    Message.success(`成功删除 ${success.length} 项`)
  } else if (success.length === 0) {
    Message.error(`删除失败 ${failed.length} 项`)
  } else {
    Message.warning(
      `删除完成：成功 ${success.length} 项，失败 ${failed.length} 项`
    )
  }
}
```

## 技术实现

### 核心特性

1. **动态创建**：使用 Vue 3 的 `createApp` 动态创建组件实例
2. **实例管理**：维护消息实例数组，实现堆叠显示和偏移计算
3. **自动清理**：消息关闭时自动卸载实例和移除 DOM 元素
4. **响应式**：使用 Vue 3 Composition API 和响应式系统

### 性能优化

- 使用 Vue 3 的 `Transition` 组件实现高效动画
- 合理的实例生命周期管理
- 防止内存泄漏的清理机制

## 浏览器兼容性

- Chrome/Edge: 最新版本
- Firefox: 最新版本
- Safari: 最新版本
- 不支持 IE11

## 常见问题

### Q: 如何让消息不自动关闭？

```javascript
Message.info('重要信息', {
  duration: 0,
  showClose: true
})
```

### Q: 如何同时显示多条消息？

```javascript
Message.success('操作1成功')
setTimeout(() => {
  Message.success('操作2成功')
}, 500)
setTimeout(() => {
  Message.success('操作3成功')
}, 1000)
```

### Q: 如何修改全局默认配置？

修改 `message.js` 中的 `defaults` 对象：

```javascript
const defaults = {
  message: '',
  type: 'info',
  duration: 5000, // 修改默认显示时间
  showClose: false,
  offset: 30,     // 修改默认偏移量
  showIcon: true,
  onClose: null
}
```

## 更新日志

### v1.0.0 (2026-01-07)

- 初始版本发布
- 支持四种消息类型
- 支持自动/手动关闭
- 支持多实例堆叠
- 实现流畅动画效果
- 完整的响应式设计

## 许可证

MIT

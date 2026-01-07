# Message 组件快速使用指南

## 已创建的文件

```
frontend/src/
├── components/common/
│   ├── Message.vue              # 消息组件主体
│   ├── Message.css              # 组件样式
│   └── Message.README.md        # 详细文档
├── utils/
│   ├── message.js               # 工具函数
│   └── message.example.js       # 使用示例
└── views/
    └── MessageDemo.vue          # 演示页面
```

## 立即使用

### 1. 在任何 Vue 组件中导入

```javascript
import Message from '@/utils/message'
```

### 2. 调用方法显示消息

```javascript
// 成功消息
Message.success('操作成功！')

// 警告消息
Message.warning('请注意检查输入')

// 信息消息
Message.info('这是一条提示信息')

// 错误消息
Message.error('操作失败，请重试')

// 自定义配置
Message({
  message: '自定义消息',
  type: 'success',
  duration: 5000,
  showClose: true,
  onClose: () => {
    console.log('消息已关闭')
  }
})

// 关闭所有消息
Message.closeAll()
```

## 完整配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| message | string | '' | 消息内容 |
| type | string | 'info' | 消息类型：success/warning/info/error |
| duration | number | 3000 | 自动关闭时间（毫秒），0 表示不自动关闭 |
| showClose | boolean | false | 是否显示关闭按钮 |
| offset | number | 20 | 距离顶部的偏移量（像素） |
| showIcon | boolean | true | 是否显示图标 |
| onClose | function | null | 关闭回调函数 |

## 查看演示效果

### 方法 1：添加路由（推荐）

在 `frontend/src/router/index.js` 中添加：

```javascript
{
  path: '/message-demo',
  name: 'MessageDemo',
  component: () => import('@/views/MessageDemo.vue')
}
```

然后访问：`http://localhost:3000/message-demo`

### 方法 2：直接在现有页面测试

在任何 Vue 组件中添加按钮：

```vue
<template>
  <BaseButton @click="showMessage">显示消息</BaseButton>
</template>

<script setup>
import Message from '@/utils/message'

const showMessage = () => {
  Message.success('测试消息！')
}
</script>
```

## 常见使用场景

### 1. 异步操作反馈

```javascript
async function handleSubmit() {
  try {
    await submitForm()
    Message.success('提交成功！')
  } catch (error) {
    Message.error('提交失败：' + error.message)
  }
}
```

### 2. 表单验证

```javascript
function validateForm() {
  if (!formData.name) {
    Message.warning('请输入姓名')
    return false
  }
  if (!formData.email) {
    Message.error('请输入邮箱')
    return false
  }
  return true
}
```

### 3. 重要提示

```javascript
Message.warning({
  message: '系统将在 5 分钟后维护',
  duration: 0,
  showClose: true
})
```

### 4. 批量操作结果

```javascript
const successCount = 10
const failCount = 2

if (failCount === 0) {
  Message.success(`成功处理 ${successCount} 项`)
} else {
  Message.warning(`处理完成：成功 ${successCount} 项，失败 ${failCount} 项`)
}
```

## 样式定制

如需修改样式，编辑 `Message.css` 文件：

```css
/* 修改成功类型的颜色 */
.message--success {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
}

.message--success .message__icon {
  color: #1890ff;
}

/* 修改消息宽度 */
.message {
  min-width: 400px;
  max-width: 600px;
}

/* 修改动画时长 */
.message-enter-active {
  animation: messageSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 注意事项

1. **不要在模板中使用**：这是命令式 API，在 JavaScript 代码中调用，而不是在模板中
2. **合理使用时长**：重要消息可以设置更长的显示时间或显示关闭按钮
3. **避免滥用**：过多消息会影响用户体验，建议同一时间不超过 3 条
4. **国际化**：消息内容需要自己处理国际化

## 技术支持

- 详细文档：`frontend/src/components/common/Message.README.md`
- 使用示例：`frontend/src/utils/message.example.js`
- 演示页面：`frontend/src/views/MessageDemo.vue`

## 测试命令

```bash
# 启动开发服务器
wails dev

# 或者只启动前端
cd frontend
npm run dev
```

开始使用 Message 组件吧！

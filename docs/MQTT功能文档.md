# MQTT 功能设计文档

## 1. 概述

MQTT（Message Queuing Telemetry Transport）是一种轻量级的发布/订阅消息协议，本项目使用 MQTT 实现实时消息推送，主要用于医生状态同步和机构医生状态变更的实时通知。

### 1.1 技术选型
- **客户端库**: `mqtt.js` - 成熟的 MQTT 客户端库
- **通信协议**: WebSocket（ws/wss）- 支持浏览器环境
- **协议版本**: MQTT 3.1.1 (protocolVersion: 4)

### 1.2 应用场景
- 医生接诊状态实时同步
- 叫号队列状态变更通知
- 医生上下班状态更新

---

## 2. 架构设计

### 2.1 模块结构

```
src/
├── utils/
│   ├── mqtt.js              # MQTT客户端核心类
│   └── mqtt_topics.js       # MQTT主题管理类
└── mqtt/
    └── mqtt.js              # 业务层封装（可选）
```

### 2.2 类图

```
MqttClient                    MQTT_TOPICSClass
─────────────────────────     ─────────────────────────
- client: MQTTClient         - MQTT_DOC_STATUS_SYNC: string
- handlers: Map              - MQTT_ORG_DOCS_STATUS_SYNC: string
- url: string                - status: ComputedRef
- status: Ref<string>        + connect(url)
- options: Object            + disconnect()
                             + subDoctorStatus()
+ connect(url)               + unSubDoctorStatus()
+ subscribe(topic, cb, id)   + subOrgDocsStatus()
+ onceSubscribe(topic, cb, id)+ unSubOrgDocsStatus()
+ unSubscribe(topic)
+ disconnect()
+ publish(topic, message)
+ onDisconnect(callback)
+ onReconnect(callback)
```

---

## 3. 核心功能详解

### 3.1 连接管理

#### 3.1.1 建立连接

```javascript
import MQTT_TOPICS from '@/utils/mqtt_topics'

// WebSocket连接
const url = 'ws://host:port/mqtt'
// 或安全连接
const url = 'wss://host:port/mqtt'

MQTT_TOPICS.connect(url)
```

#### 3.1.2 连接配置

```javascript
const options = {
  clean: true,                    // 连接时清除会话
  connectTimeout: 4000,           // 连接超时时间（毫秒）
  clientId: 'mqttjs_' + random,   // 客户端唯一标识
  protocolId: 'MQTT',             // 协议标识
  protocolVersion: 4,             // MQTT 3.1.1
  // username: '',               // 可选：用户名
  // password: '',               // 可选：密码
}
```

#### 3.1.3 断开连接

```javascript
MQTT_TOPICS.disconnect()
```

### 3.2 状态管理

#### 3.2.1 连接状态

```javascript
import { mqttStatus } from '@/mqtt/mqtt'

// 状态值: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
console.log(mqttStatus)
// 返回: { color: 'red', text: '未连接' }
//       { color: 'orange', text: '连接中' }
//       { color: 'green', text: '已连接' }
//       { color: 'orange', text: '重连中' }
```

#### 3.2.2 事件监听

```javascript
import mqttClient from '@/utils/mqtt'

// 断开连接监听
mqttClient.onDisconnect(() => {
  console.log('连接已断开')
})

// 重新连接监听
mqttClient.onReconnect(() => {
  console.log('正在重连...')
})
```

### 3.3 主题订阅

#### 3.3.1 订阅医生状态

```javascript
// 订阅单个医生状态
MQTT_TOPICS.subDoctorStatus(
  { org: 'org001', dept: 'dept001', docId: 'doc001' },
  'unique_subscription_id',
  (topic, message) => {
    const msg = JSON.parse(message)
    console.log('收到消息:', msg)
  }
)

// 主题格式: M:TRANSFER:DOC_STATUS_SYNC:org:dept:docId
```

#### 3.3.2 订阅机构医生状态变更

```javascript
// 订阅机构下所有医生状态变更
MQTT_TOPICS.subOrgDocsStatus(
  'org001',
  'unique_subscription_id',
  (topic, message) => {
    const msg = JSON.parse(message)
    console.log('机构医生状态变更:', msg)
  }
)

// 主题格式: M:TRANSFER:ORG_DOCS_STATUS_SYNC:org
```

#### 3.3.3 取消订阅

```javascript
// 取消订阅医生状态
MQTT_TOPICS.unSubDoctorStatus(org, dept, docId)

// 取消订阅机构医生状态
MQTT_TOPICS.unSubOrgDocsStatus(org)
```

### 3.4 消息发布

```javascript
import mqttClient from '@/utils/mqtt'

mqttClient.publish('topic/name', JSON.stringify({
  key: 'value'
}))
```

### 3.5 消息处理

#### 3.5.1 全局消息处理器

```javascript
import mqttService from '@/mqtt/mqtt'

// 注册全局处理器
mqttService.setHandler('key', (msg) => {
  console.log('处理消息:', msg)
})
```

#### 3.5.2 医生状态同步

```javascript
import { docsStatusSync } from '@/mqtt/mqtt'

// docsStatusSync 为响应式对象
// 数据结构:
{
  dept: string,        // 科室
  doc: number,         // 医生ID
  end_count: number,   // 已完成数量
  pass_count: number,  // 跳过数量
  queue_type: number,  // 队列类型
  status: number,      // 状态 (1: 工作中)
  wait_count: number   // 等待人数
}
```

---

## 4. 主题命名规范

### 4.1 主题格式

| 主题类型 | 格式 | 示例 |
|---------|------|------|
| 医生状态 | `M:TRANSFER:DOC_STATUS_SYNC:org:dept:docId` | `M:TRANSFER:DOC_STATUS_SYNC:001:01:1001` |
| 机构医生状态 | `M:TRANSFER:ORG_DOCS_STATUS_SYNC:org` | `M:TRANSFER:ORG_DOCS_STATUS_SYNC:001` |

### 4.2 命名规则
- 使用冒号（`:`）作为分隔符
- 格式: `前缀:模块:功能:参数1:参数2:...`
- 全部大写

---

## 5. 消息格式

### 5.1 医生状态消息

```json
{
  "data": {
    "dept": "科室编码",
    "doc": 1001,
    "end_count": 15,
    "pass_count": 2,
    "queue_type": 1,
    "status": 1,
    "wait_count": 5
  },
  "timestamp": 1699999999999
}
```

### 5.2 消息字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| dept | string | 科室编码 |
| doc | number | 医生ID |
| end_count | number | 已完成接诊数量 |
| pass_count | number | 跳过患者数量 |
| queue_type | number | 队列类型 |
| status | number | 医生状态（1=工作中） |
| wait_count | number | 当前等待人数 |

---

## 6. 使用示例

### 6.1 完整连接流程

```javascript
import MQTT_TOPICS from '@/utils/mqtt_topics'
import { mqttStatus, linkMqtt } from '@/mqtt/mqtt'

// 1. 检查连接状态
if (mqttStatus.value.text !== '已连接') {
  // 2. 建立连接
  linkMqtt(
    false,                    // use_tls
    '192.168.1.100',         // host
    8083,                    // port
    { code: 'org001' }       // org
  )
}

// 3. 订阅机构医生状态
MQTT_TOPICS.subOrgDocsStatus('org001', 'my_subscription', (topic, message) => {
  const data = JSON.parse(message)
  // 处理状态变更
})
```

### 6.2 Vue 组件中使用

```vue
<template>
  <div>
    <span :style="{ color: mqttStatus.color }">{{ mqttStatus.text }}</span>
  </div>
</template>

<script setup>
import { mqttStatus } from '@/mqtt/mqtt'
</script>
```

---

## 7. 错误处理

### 7.1 连接错误

```javascript
// 监听错误事件
mqttClient.on('error', (err) => {
  console.error('MQTT连接错误:', err)
})
```

### 7.2 自动重连

- 连接断开后自动触发重连
- 重连期间状态变为 `reconnecting`
- 重连成功后会重新订阅所有主题

---

## 8. 注意事项

1. **单例模式**: MQTT客户端使用单例，确保整个应用只有一个连接
2. **订阅ID**: 每次订阅需要传入唯一ID，防止重复订阅
3. **主题清理**: 组件卸载时取消不再需要的订阅
4. **消息解析**: 收到的消息需要手动解析为 JSON 对象
5. **连接复用**: 避免频繁断开重连，使用唯一连接

---

## 9. 文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/utils/mqtt.js` | MQTT客户端核心实现 |
| `src/utils/mqtt_topics.js` | 主题管理封装 |
| `src/mqtt/mqtt.js` | 业务层集成（可选） |

---

## 10. 依赖

```json
{
  "mqtt": "^5.x"
}
```

---

## 11. 变更日志

| 版本 | 日期 | 说明 |
|-----|------|------|
| 1.0 | 2024-01 | 初始版本 |

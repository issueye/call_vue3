// MQTT 连接管理模块
import { ref, reactive } from 'vue'
import mqtt from 'mqtt'
import * as MQTT_TOPICS from './topics'

// 连接状态
const CONNECT_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting'
}

// 全局状态
const client = ref(null)
const connectionStatus = ref(CONNECT_STATES.DISCONNECTED)
const messageHandlers = reactive(new Map())

// 消息处理器
const handlers = reactive(new Map())

// 连接选项
let connectOptions = {}

// 初始化 MQTT 连接
const initMqtt = (options) => {
  connectOptions = {
    clientId: options.clientId || `caller_${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    keepalive: 60,
    ...options
  }
}

// 连接 MQTT
const connect = (brokerUrl) => {
  if (client.value && connectionStatus.value === CONNECT_STATES.CONNECTED) {
    console.log('MQTT 已连接')
    return
  }

  connectionStatus.value = CONNECT_STATES.CONNECTING
  console.log('MQTT 连接中...')

  client.value = mqtt.connect(brokerUrl, connectOptions)

  client.value.on('connect', () => {
    console.log('MQTT 连接成功')
    connectionStatus.value = CONNECT_STATES.CONNECTED

    // 重新订阅之前订阅的主题
    reSubscribe()
  })

  client.value.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString())
      handleMessage(topic, payload)
    } catch (e) {
      console.error('MQTT 消息解析失败:', e)
    }
  })

  client.value.on('error', (error) => {
    console.error('MQTT 错误:', error)
    connectionStatus.value = CONNECT_STATES.DISCONNECTED
  })

  client.value.on('close', () => {
    console.log('MQTT 连接关闭')
    connectionStatus.value = CONNECT_STATES.DISCONNECTED
  })

  client.value.on('reconnect', () => {
    console.log('MQTT 正在重连...')
    connectionStatus.value = CONNECT_STATES.RECONNECTING
  })

  client.value.on('offline', () => {
    console.log('MQTT 离线')
    connectionStatus.value = CONNECT_STATES.DISCONNECTED
  })
}

// 消息处理
const handleMessage = (topic, payload) => {
  // 调用注册的处理器
  handlers.forEach((handler, key) => {
    if (topic.includes(key) || key === '*') {
      handler(topic, payload)
    }
  })
}

// 订阅主题
const subscribe = (topic, options = { qos: 0 }) => {
  if (!client.value || connectionStatus.value !== CONNECT_STATES.CONNECTED) {
    console.warn('MQTT 未连接，无法订阅')
    return
  }

  return new Promise((resolve, reject) => {
    client.value.subscribe(topic, options, (err, granted) => {
      if (err) {
        console.error('订阅失败:', err)
        reject(err)
      } else {
        console.log(`已订阅主题: ${topic}`, granted)
        resolve(granted)
      }
    })
  })
}

// 一次性订阅
const subscribeOnce = (topic, callback, id) => {
  const handler = (t, m) => {
    if (topic === t || t.includes(topic.replace('#', '').replace('+', ''))) {
      callback(t, m)
      unsubscribe(topic, id)
    }
  }
  return subscribe(topic).then(() => {
    handlers.set(id || topic, handler)
  })
}

// 取消订阅
const unsubscribe = (topic, id) => {
  if (!client.value) return

  const key = id || topic
  handlers.delete(key)

  return new Promise((resolve, reject) => {
    client.value.unsubscribe(topic, (err) => {
      if (err) {
        console.error('取消订阅失败:', err)
        reject(err)
      } else {
        console.log(`已取消订阅: ${topic}`)
        resolve()
      }
    })
  })
}

// 发布消息
const publish = (topic, message, options = { qos: 0, retain: false }) => {
  if (!client.value || connectionStatus.value !== CONNECT_STATES.CONNECTED) {
    console.warn('MQTT 未连接，无法发布')
    return
  }

  const payload = typeof message === 'string' ? message : JSON.stringify(message)
  client.value.publish(topic, payload, options, (err) => {
    if (err) {
      console.error('发布消息失败:', err)
    }
  })
}

// 断开连接
const disconnect = () => {
  if (client.value) {
    client.value.end(true)
    client.value = null
    connectionStatus.value = CONNECT_STATES.DISCONNECTED
    handlers.clear()
    console.log('MQTT 已断开')
  }
}

// 重新订阅
const reSubscribe = () => {
  handlers.forEach((_, topic) => {
    subscribe(topic).catch(err => {
      console.error('重新订阅失败:', err)
    })
  })
}

// 设置消息处理器
const setHandler = (key, handler) => {
  handlers.set(key, handler)
}

// 移除消息处理器
const removeHandler = (key) => {
  handlers.delete(key)
}

// 清除所有处理器
const clearHandlers = () => {
  handlers.clear()
}

// 订阅机构医生状态
const linkOrgDocsStatus = (orgCode, callback) => {
  const topic = MQTT_TOPICS.subOrgDocsStatus(orgCode)
  subscribe(topic)
    .then(() => {
      setHandler(`org_docs_status_${orgCode}`, (topic, message) => {
        if (message && message.data) {
          callback(message)
        }
      })
    })
    .catch(err => {
      console.error('订阅机构医生状态失败:', err)
    })
}

// 订阅患者更新
const linkPatientUpdate = (orgCode, deptId, callback) => {
  const topic = MQTT_TOPICS.subPatientUpdate(orgCode, deptId)
  subscribe(topic)
    .then(() => {
      setHandler(`patient_update_${deptId}`, (topic, message) => {
        if (message) {
          callback(message)
        }
      })
    })
    .catch(err => {
      console.error('订阅患者更新失败:', err)
    })
}

export {
  CONNECT_STATES,
  client,
  connectionStatus,
  messageHandlers,
  initMqtt,
  connect,
  subscribe,
  subscribeOnce,
  unsubscribe,
  publish,
  disconnect,
  setHandler,
  removeHandler,
  clearHandlers,
  linkOrgDocsStatus,
  linkPatientUpdate
}

import { ref, onUnmounted } from 'vue'
import mqtt from 'mqtt'

export function useMQTT() {
  const client = ref(null)
  const connected = ref(false)
  const messages = ref([])

  const connect = (brokerUrl, options = {}) => {
    const defaultOptions = {
      clientId: `caller_client_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      keepalive: 60,
      ...options
    }

    client.value = mqtt.connect(brokerUrl, defaultOptions)

    client.value.on('connect', () => {
      connected.value = true
      console.log('MQTT 已连接')
    })

    client.value.on('message', (topic, payload) => {
      try {
        const message = {
          topic,
          payload: JSON.parse(payload.toString()),
          qos: 0,
          retain: false
        }
        messages.value.unshift(message)
        if (messages.value.length > 100) {
          messages.value.pop()
        }
      } catch (e) {
        console.error('MQTT 消息解析失败:', e)
      }
    })

    client.value.on('error', (error) => {
      console.error('MQTT 错误:', error)
    })

    client.value.on('close', () => {
      connected.value = false
    })

    client.value.on('reconnect', () => {
      console.log('MQTT 正在重连...')
    })
  }

  const subscribe = (topic, qos = 0) => {
    client.value?.subscribe(topic, { qos }, (err) => {
      if (err) {
        console.error('MQTT 订阅失败:', err)
      } else {
        console.log(`已订阅主题: ${topic}`)
      }
    })
  }

  const unsubscribe = (topic) => {
    client.value?.unsubscribe(topic)
  }

  const publish = (topic, payload, qos = 0, retain = false) => {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload)
    client.value?.publish(topic, message, { qos, retain })
  }

  const disconnect = () => {
    client.value?.end(true)
    connected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    client,
    connected,
    messages,
    connect,
    subscribe,
    unsubscribe,
    publish,
    disconnect
  }
}

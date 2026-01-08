// MQTT 连接管理模块
import { ref, reactive, computed } from "vue";
import mqtt from "mqtt";
import * as MQTT_TOPICS from "./topics";

// 连接状态
const CONNECT_STATES = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
};

// 全局状态
const client = ref(null);
const connectionStatus = ref(CONNECT_STATES.DISCONNECTED);

// 消息处理器
const handlers = reactive(new Map());

// 当前机构信息
const currentOrg = ref(null);

// 当前用户信息
const currentUser = ref(null);

// 患者列表
const patList = ref([]);

// 心跳定时器
let heartbeatTimer = null;
// 心跳间隔（30秒）
const HEARTBEAT_INTERVAL = 30000;

// 医生状态同步（响应式对象）
export const docsStatusSync = reactive({
  dept: "",
  doc: 0,
  end_count: 0,
  pass_count: 0,
  queue_type: 0,
  status: 1,
  wait_count: 0,
});

// 连接状态UI展示
export const mqttStatus = computed(() => {
  switch (connectionStatus.value) {
    case "disconnected":
      return { color: "red", text: "未连接" };
    case "connecting":
      return { color: "orange", text: "连接中" };
    case "connected":
      return { color: "green", text: "已连接" };
    case "reconnecting":
      return { color: "orange", text: "重连中" };
    default:
      return { color: "red", text: "未连接" };
  }
});

// 连接选项
let connectOptions = {};

// localStorage key
const MQTT_STORAGE_KEY = "mqtt_config";

// 保存 MQTT 配置到 localStorage
const saveMqttConfig = (config) => {
  try {
    const storageData = {
      host: config.host,
      port: config.port,
      ws_port: config.ws_port,
      use_tls: config.use_tls,
      org_code: config.org_code,
      org_id: config.org_id,
      timestamp: Date.now(),
    };
    localStorage.setItem(MQTT_STORAGE_KEY, JSON.stringify(storageData));
    console.log("MQTT 配置已保存:", storageData);
  } catch (e) {
    console.error("保存 MQTT 配置失败:", e);
  }
};

// 从 localStorage 加载 MQTT 配置
const loadMqttConfig = () => {
  try {
    const data = localStorage.getItem(MQTT_STORAGE_KEY);
    if (data) {
      const config = JSON.parse(data);
      console.log("从 localStorage 加载 MQTT 配置:", config);
      return config;
    }
  } catch (e) {
    console.error("加载 MQTT 配置失败:", e);
  }
  return null;
};

// 清除 MQTT 配置
const clearMqttConfig = () => {
  localStorage.removeItem(MQTT_STORAGE_KEY);
  console.log("MQTT 配置已清除");
};

// 初始化 MQTT 连接配置
const initMqtt = (options) => {
  const clientId =
    options.clientId || `caller_${Math.random().toString(16).slice(2, 10)}`;
  console.log("mqtt -> clientId:", clientId);
  connectOptions = {
    clientId: clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    keepalive: 60,
    protocolId: "MQTT",
    protocolVersion: 4,
    ...options,
  };
};

// 连接 MQTT
const connect = (brokerUrl) => {
  return new Promise((resolve, reject) => {
    if (client.value && connectionStatus.value === CONNECT_STATES.CONNECTED) {
      console.log("MQTT 已连接");
      resolve();
      return;
    }

    connectionStatus.value = CONNECT_STATES.CONNECTING;
    console.log("MQTT 连接中...");

    client.value = mqtt.connect(brokerUrl, connectOptions);

    client.value.on("connect", () => {
      console.log("MQTT 连接成功");
      connectionStatus.value = CONNECT_STATES.CONNECTED;
      resolve();
    });

    client.value.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        handleMessage(topic, payload);
      } catch (e) {
        console.error("MQTT 消息解析失败:", e);
      }
    });

    client.value.on("error", (error) => {
      console.error("MQTT 错误:", error);
      connectionStatus.value = CONNECT_STATES.DISCONNECTED;
      reject();
    });

    client.value.on("close", () => {
      console.log("MQTT 连接关闭");
      connectionStatus.value = CONNECT_STATES.DISCONNECTED;
      reject();
    });

    client.value.on("reconnect", () => {
      console.log("MQTT 正在重连...");
      connectionStatus.value = CONNECT_STATES.RECONNECTING;
    });

    client.value.on("offline", () => {
      console.log("MQTT 离线");
      connectionStatus.value = CONNECT_STATES.DISCONNECTED;
      reject();
    });
  });
};

// 便捷连接函数（带机构信息）
const linkMqtt = (useTls, host, port, org, user = null) => {
  return new Promise((resolve, reject) => {
    // 保存用户信息
    if (user) {
      currentUser.value = user;
    }

    // 检查是否已经连接到同一个机构
    if (currentOrg.value && currentOrg.value.org_code === org?.org_code &&
        connectionStatus.value === CONNECT_STATES.CONNECTED) {
      console.log("MQTT 已连接到当前机构，无需重复连接");
      // 如果用户信息有变化，更新心跳
      if (user) {
        startHeartbeat();
      }
      resolve();
      return;
    }

    currentOrg.value = org;

    let url = `ws://${host}:${port}/mqtt`;
    if (useTls) {
      url = `wss://${host}:${port}/mqtt`;
    }

    // 初始化并连接
    initMqtt({});
    connect(url)
      .then(() => {
        // 启动心跳
        if (user) {
          startHeartbeat();
        }

        // 订阅机构医生状态主题
        if (org?.org_code) {
          const topic = MQTT_TOPICS.getOrgDocsStatusTopic(org.org_code);
          console.log("订阅主题", topic);
          subscribe(topic)
            .then(() => {
              console.log(`已订阅机构医生状态: ${topic}`);
              resolve();
            })
            .catch((err) => {
              console.error("订阅机构医生状态失败:", err);
              reject(err);
            });
        } else {
          resolve();
        }
      })
      .catch((err) => {
        console.error("MQTT 连接失败:", err);
        reject(err);
      });
  });
};

// 消息处理
const handleMessage = (topic, payload) => {
  // 调用注册的处理器
  for (const [key, handler] of handlers.entries()) {
    if (topic.includes(key) || key === "*") {
      try {
        handler(topic, payload);
      } catch (err) {
        console.error(`Handler ${key} 执行失败:`, err);
      }
    }
  }
};

// 订阅主题
const subscribe = (topic, options = { qos: 0 }) => {
  if (!client.value || connectionStatus.value !== CONNECT_STATES.CONNECTED) {
    console.warn("MQTT 未连接，无法订阅");
    return Promise.reject(new Error("MQTT 未连接"));
  }

  return new Promise((resolve, reject) => {
    client.value.subscribe(topic, options, (err, granted) => {
      if (err) {
        console.error("订阅失败:", err);
        reject(err);
      } else {
        console.log(`已订阅主题: ${topic}`, granted);
        resolve(granted);
      }
    });
  });
};

// 取消订阅
const unsubscribe = (topic, id) => {
  if (!client.value) return;

  const key = id || topic;
  handlers.delete(key);

  return new Promise((resolve, reject) => {
    client.value.unsubscribe(topic, (err) => {
      if (err) {
        console.error("取消订阅失败:", err);
        reject(err);
      } else {
        console.log(`已取消订阅: ${topic}`);
        resolve();
      }
    });
  });
};

// 发布消息
const publish = (topic, message, options = { qos: 0, retain: false }) => {
  if (!client.value || connectionStatus.value !== CONNECT_STATES.CONNECTED) {
    console.warn("MQTT 未连接，无法发布");
    return;
  }

  const payload =
    typeof message === "string" ? message : JSON.stringify(message);
  client.value.publish(topic, payload, options, (err) => {
    if (err) {
      console.error("发布消息失败:", err);
    }
  });
};

// 断开连接
const disconnect = () => {
  // 停止心跳
  stopHeartbeat();
  if (client.value) {
    client.value.end(true);
    client.value = null;
    connectionStatus.value = CONNECT_STATES.DISCONNECTED;
    handlers.clear();
    console.log("MQTT 已断开");
  }
};

// ==================== 心跳功能 ====================

/**
 * 启动心跳定时器
 */
const startHeartbeat = () => {
  // 清除已存在的心跳定时器
  stopHeartbeat();

  // 立即发送一次心跳
  sendHeartbeat();

  // 设置定时器，每30秒发送一次心跳
  heartbeatTimer = setInterval(() => {
    sendHeartbeat();
  }, HEARTBEAT_INTERVAL);

  console.log(`心跳定时器已启动，间隔 ${HEARTBEAT_INTERVAL / 1000} 秒`);
};

/**
 * 停止心跳定时器
 */
const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log("心跳定时器已停止");
  }
};

/**
 * 发送心跳消息
 */
const sendHeartbeat = () => {
  if (!currentOrg.value || !currentUser.value) {
    console.warn("无法发送心跳：缺少机构或用户信息");
    return;
  }

  if (connectionStatus.value !== CONNECT_STATES.CONNECTED) {
    console.warn("无法发送心跳：MQTT 未连接");
    return;
  }

  const topic = MQTT_TOPICS.getHeartbeatTopic(
    currentOrg.value.org_code,
    currentUser.value.id
  );

  const heartbeatData = {
    timestamp: Date.now(),
    org_code: currentOrg.value.org_code,
    org_id: currentOrg.value.org_id,
    doc_id: currentUser.value.id,
    doc_name: currentUser.value.name || currentUser.value.nickname || "",
    status: "online",
    client_id: client.value?.options?.clientId || "",
  };

  publish(topic, heartbeatData, { qos: 0 });
  console.log(`心跳已发送 -> ${topic}`);
};

// 设置消息处理器
const setHandler = (key, handler) => {
  handlers.set(key, handler);
};

// 移除消息处理器
const removeHandler = (key) => {
  handlers.delete(key);
};

// 清除所有处理器
const clearHandlers = () => {
  handlers.clear();
};

export {
  CONNECT_STATES,
  client,
  connectionStatus,
  currentOrg,
  currentUser,
  patList,
  saveMqttConfig,
  loadMqttConfig,
  clearMqttConfig,
  initMqtt,
  connect,
  linkMqtt,
  subscribe,
  unsubscribe,
  publish,
  disconnect,
  setHandler,
  removeHandler,
  clearHandlers,
  startHeartbeat,
  stopHeartbeat,
  sendHeartbeat,
};

<script setup>
import { onMounted, onUnmounted, watch, ref, computed } from "vue";
import { usePatientStore, useUserStore } from "@/stores";
import { useScreenSize, onScreenChange } from "@/composables";
import { WorkbenchLayout } from "@/components/layout";
import SettingsDialog from "@/components/common/SettingsDialog.vue";
import {
    initMqtt,
    connect,
    disconnect,
    linkOrgDocsStatus,
    linkPatientUpdate,
    connectionStatus,
    CONNECT_STATES,
} from "@/mqtt";
import { apiGetMqttInfo } from "@/api";
import "./Workbench.css";

const patientStore = usePatientStore();
const userStore = useUserStore();
const { isSmall } = useScreenSize();

// 移动端布局状态 (≤ 420px)
const isMobileLayout = ref(false);

// 初始化状态管理
const isInitialized = ref(false);

// 检测屏幕尺寸
const checkScreenSize = () => {
    isMobileLayout.value = window.innerWidth <= 420;
};

const showServerDialog = ref(false);

// MQTT 状态文本
const connectionStatusText = computed(() => {
    const statusMap = {
        [CONNECT_STATES.CONNECTED]: "已连接",
        [CONNECT_STATES.CONNECTING]: "连接中...",
        [CONNECT_STATES.RECONNECTING]: "重连中...",
        [CONNECT_STATES.DISCONNECTED]: "未连接",
    };
    return statusMap[connectionStatus.value] || "未知";
});

// 打开设置对话框
const handleSetting = () => {
    showServerDialog.value = true;
};

// 保存设置回调
const handleSettingsSave = (url) => {
    console.log("服务器地址已保存:", url);
    window.location.reload();
};

// 关闭设置回调
const handleSettingsClose = () => {
    showServerDialog.value = false;
};

// 初始化工作台
const initWorkbench = async () => {
    // 检查是否有机构信息
    if (!userStore.org?.org_id) {
        console.warn("未配置机构信息，跳过工作台初始化");
        return false;
    }

    const deptId = userStore.room?.dept_id || userStore.org.dept_id;
    if (!deptId) {
        console.warn("科室ID不存在，跳过获取患者列表");
        return false;
    }

    console.log("初始化工作台，获取患者列表...", {
        orgId: userStore.org.org_id,
        deptId,
    });

    // 获取患者列表
    await patientStore.fetchPatients(userStore.org.org_id, deptId);

    // 如果有诊室信息，获取在诊患者
    if (userStore.room?.id || userStore.org.dept_id) {
        await patientStore.getVisitedPatient(
            userStore.userInfo?.id,
            userStore.org.org_id,
            deptId,
        );
    }

    return true;
};

// 初始化 MQTT 连接 (参考旧版本)
const initMqttConnection = async () => {
    // 检查是否已有连接，避免重复初始化
    if (!userStore.org?.org_id) {
        console.warn("机构信息不存在，跳过 MQTT 初始化");
        return;
    }

    try {
        // 获取 MQTT 服务信息 (参考旧版本)
        const { data } = await apiGetMqttInfo();
        console.log("MQTT 配置:", data);

        // 构建 MQTT URL
        let mqttUrl = `ws://${data.host}:${data.ws_port}/mqtt`;
        if (data.use_tls) {
            mqttUrl = `wss://${data.host}:${data.ws_port}/mqtt`;
        }

        const clientId = `caller_${userStore.clientID || Math.random().toString(16).slice(2, 10)}`;

        console.log("初始化 MQTT 连接:", {
            mqttUrl,
            clientId,
            orgCode: userStore.org.org_code,
        });

        // 初始化 MQTT
        initMqtt({
            clientId,
            clean: true,
            reconnectPeriod: 3000,
            connectTimeout: 10000,
        });

        // 连接
        connect(mqttUrl);

        // 订阅机构医生状态
        if (userStore.org.org_code) {
            linkOrgDocsStatus(userStore.org.org_code, (message) => {
                console.log("收到医生状态更新:", message);
                const msgData = message.data || message;

                // 检查是否是当前医生的状态 (参考旧版本逻辑)
                if (msgData.doc === userStore.userInfo?.id) {
                    // 更新医生状态
                    patientStore.setDocStatus(msgData);
                }

                // 将内容推送到所有 handler 中
                patientStore.notifyDocStatusHandlers(msgData);
            });
        }

        // 订阅患者更新
        const deptId = userStore.room?.dept_id || userStore.org.dept_id;
        if (deptId) {
            linkPatientUpdate(userStore.org.org_code, deptId, (message) => {
                console.log("收到患者更新:", message);
                // 刷新患者列表
                patientStore.fetchPatients(userStore.org.org_id, deptId);
            });
        }
    } catch (error) {
        console.error("获取 MQTT 配置失败:", error);
        // 如果获取配置失败，使用环境变量作为后备
        fallbackMqttConnection();
    }
};

// 后备 MQTT 连接 (使用环境变量)
const fallbackMqttConnection = () => {
    const mqttUrl = import.meta.env.VITE_MQTT_URL || "ws://localhost:8083/mqtt";
    const clientId = `caller_${userStore.clientID || Math.random().toString(16).slice(2, 10)}`;

    console.log("使用后备配置初始化 MQTT:", mqttUrl);

    initMqtt({
        clientId,
        clean: true,
        reconnectPeriod: 3000,
    });

    connect(mqttUrl);

    // 订阅机构医生状态
    if (userStore.org?.org_code) {
        linkOrgDocsStatus(userStore.org.org_code, (message) => {
            const msgData = message.data || message;
            if (msgData.doc === userStore.userInfo?.id) {
                patientStore.setDocStatus(msgData);
            }
            patientStore.notifyDocStatusHandlers(msgData);
        });
    }

    // 订阅患者更新
    const deptId = userStore.room?.dept_id || userStore.org?.dept_id;
    if (deptId) {
        linkPatientUpdate(userStore.org?.org_code, deptId, (message) => {
            patientStore.fetchPatients(userStore.org?.org_id, deptId);
        });
    }
};

// 清理
const cleanup = () => {
    console.log("清理 Workbench，断开 MQTT 连接");
    disconnect();
    // 清理患者数据
    patientStore.clearPatients();
    // 重置初始化状态
    isInitialized.value = false;
};

// 统一的初始化函数
const doInit = async () => {
    const orgId = userStore.org?.org_id;
    const deptId = userStore.room?.dept_id || userStore.org?.dept_id;

    if (!orgId || !deptId) {
        console.warn("缺少机构或科室信息");
        return;
    }

    console.log("初始化工作台...", { orgId, deptId });
    isInitialized.value = true;

    await Promise.all([initWorkbench(), initMqttConnection()]);
};

// 轮询检查初始化
let pollTimer = null;
const pollForInit = () => {
    const orgId = userStore.org?.org_id;
    const deptId = userStore.room?.dept_id || userStore.org?.dept_id;

    if (orgId && deptId) {
        doInit();
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }
};

onMounted(() => {
    // 检测屏幕尺寸
    checkScreenSize();
    const unwatch = onScreenChange(checkScreenSize);

    // 立即检查一次
    pollForInit();

    // 如果没初始化，启动轮询
    if (!isInitialized.value) {
        pollTimer = setInterval(pollForInit, 100);
    }

    onUnmounted(() => {
        cleanup();
        unwatch();
        if (pollTimer) {
            clearInterval(pollTimer);
        }
    });
});
</script>

<template>
    <div class="workbench-page">
        <!-- 操作员信息栏 -->
        <div class="workbench-page__operator">
            <div class="operator-info">
                <span class="operator-info__item">
                    <span class="operator-info__icon">👤</span>
                    <span class="operator-info__value">{{
                        userStore.userInfo?.nick_name ||
                        userStore.userInfo?.account ||
                        "操作员"
                    }}</span>
                </span>
                <span class="operator-info__item">
                    <span class="operator-info__icon">🏢</span>
                    <span class="operator-info__value">{{
                        userStore.org?.org_name || "未配置机构"
                    }}</span>
                </span>
                <span class="operator-info__item">
                    <span class="operator-info__icon">🩺</span>
                    <span class="operator-info__value">{{
                        userStore.room?.name || "未配置诊室"
                    }}</span>
                </span>
            </div>
            <div class="workbench-page__status">
                <span
                    class="mqtt-status"
                    :class="[`mqtt-status--${connectionStatus}`]"
                >
                    {{ connectionStatusText }}
                </span>
            </div>
        </div>
        <WorkbenchLayout />

        <!-- 服务器地址设置对话框 -->
        <SettingsDialog
            v-model:visible="showServerDialog"
            title="服务器地址"
            :default-url="'http://0.0.0.0:21999'"
            placeholder="http://0.0.0.0:21999"
            @save="handleSettingsSave"
            @close="handleSettingsClose"
        />
    </div>
</template>

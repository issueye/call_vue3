<script setup>
import { onMounted, onUnmounted, watch, ref, computed } from "vue";
import { usePatientStore, useUserStore } from "@/stores";
import { useScreenSize, onScreenChange } from "@/composables";
import { WorkbenchLayout } from "@/components/layout";
import SettingsDialog from "@/components/common/SettingsDialog.vue";
import {
    disconnect,
    connectionStatus,
    CONNECT_STATES,
    saveMqttConfig,
    loadMqttConfig,
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

    const deptId = userStore.room?.dept_id || userStore.org?.dept_id;
    if (!deptId) {
        console.warn("科室ID不存在，跳过获取患者列表");
        return false;
    }

    // 获取患者列表
    await patientStore.fetchPatients(
        userStore.org.org_id,
        deptId,
        userStore.userInfo?.id,
    );

    // 如果有诊室信息，获取在诊患者
    if (userStore.room?.id || userStore.org.dept_id) {
        await patientStore.getVisitedPatient(userStore.userInfo?.id);
    }

    return true;
};

// 清理
const cleanup = () => {
    // 清理患者数据
    patientStore.clearPatients();
    // 重置初始化状态
    isInitialized.value = false;
};

onMounted(() => {
    // 检测屏幕尺寸
    checkScreenSize();
    const unwatch = onScreenChange(checkScreenSize);

    // 初始化工作台
    initWorkbench();

    onUnmounted(() => {
        cleanup();
        unwatch();
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

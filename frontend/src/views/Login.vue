<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore, usePatientStore } from "@/stores";
import { apiLogin, apiCheckDeviceReg, apiLoadForwardURL } from "@/api";
import CONSTANTS from "@/constants";
import BaseButton from "@/components/common/BaseButton.vue";
import SettingsDialog from "@/components/common/SettingsDialog.vue";
import "./Login.css";

const router = useRouter();
const userStore = useUserStore();
const patientStore = usePatientStore();

const form = ref({
    account: "",
    password: "",
});

const loading = ref(false);
const errorMsg = ref("");
const showServerDialog = ref(false);
const savedServerUrl = ref("");

// 计算属性 - 客户端信息
const clientInfo = computed(() => ({
    clientId: userStore.clientID,
    serverUrl: savedServerUrl.value,
}));

// 设备错误信息从 Pinia store 获取
const deviceErrorMsg = computed(() => userStore.deviceError);

// 清除设备错误
const clearDeviceError = () => {
    userStore.clearDeviceError();
};

// 检查并设置服务器地址
const checkAndSetServerUrl = async () => {
    try {
        const res = await apiLoadForwardURL();
        const savedUrl = res?.data || res?.data?.data;

        if (!savedUrl) {
            // 未配置服务器地址，弹窗配置
            savedServerUrl.value = "http://0.0.0.0:21999";
            showServerDialog.value = true;
            return false;
        }

        // 保存服务器地址
        savedServerUrl.value = savedUrl;
        return true;
    } catch (error) {
        console.error("检查服务器地址失败:", error);
        savedServerUrl.value = "http://0.0.0.0:21999";
        return false;
    }
};

// 打开设置对话框
const handleSetting = () => {
    showServerDialog.value = true;
};

// 保存设置回调
const handleSettingsSave = (url) => {
    savedServerUrl.value = url;
};

// 关闭设置回调
const handleSettingsClose = () => {
    showServerDialog.value = false;
};

// 检查设备注册状态并获取机构信息
const checkDeviceReg = async () => {
    if (!userStore.clientID) {
        console.warn("客户端ID不存在，无法检查设备注册状态");
        return false;
    }

    try {
        const regRes = await apiCheckDeviceReg(userStore.clientID);
        console.log("设备注册状态:", regRes);

        if (regRes.code === 200 && regRes.data) {
            // 保存机构信息
            userStore.setOrg(regRes.data.org);
            // 保存诊室信息（如果有）
            if (regRes.data.rooms && regRes.data.rooms.length > 0) {
                userStore.setRoom(regRes.data.rooms[0]);
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("检查设备注册状态失败:", error);
        alert("检查设备注册状态失败");
        return false;
    }
};

const handleLogin = async () => {
    if (!form.value.account || !form.value.password) {
        errorMsg.value = "请输入用户名和密码";
        return;
    }

    loading.value = true;
    errorMsg.value = "";

    try {
        // 请求参数
        const params = {
            account: form.value.account,
            password: form.value.password,
            type: 2,
            client_id: userStore.clientID,
            client_type: CONSTANTS.CALLER,
        };

        const res = await apiLogin(params);
        console.log("登录返回数据:", res);

        // 保存登录数据（包含 token、org、rooms）
        userStore.setLoginData(res);

        // 检查设备注册状态并获取机构信息
        await checkDeviceReg();

        // // 获取患者列表
        // const deptId = userStore.room?.dept_id || userStore.org?.dept_id;
        // if (userStore.org?.org_id && deptId) {
        //     await patientStore.fetchPatients(userStore.org.org_id, deptId);
        // }

        // 跳转到工作台
        router.push("/workbench");
    } catch (error) {
        console.error("登录失败:", error);
        errorMsg.value = error.message || "登录失败";
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    // 检查服务器地址（客户端ID和设备注册已在 main.js 中检查）
    await checkAndSetServerUrl();
});
</script>

<template>
    <div class="login-page">
        <div class="login-page__bg" />

        <div class="login-page__container">
            <div class="login-page__logo">
                <div class="login-page__logo-icon">🏥</div>
                <h1 class="login-page__logo-text">呼叫客户端</h1>
            </div>

            <div class="login-page__box">
                <h2 class="login-page__title">欢迎回来</h2>
                <p class="login-page__subtitle">请登录您的账号</p>

                <form class="login-page__form" @submit.prevent="handleLogin">
                    <div class="login-page__input-group">
                        <div class="login-page__input-wrapper">
                            <span class="login-page__input-icon">👤</span>
                            <input
                                v-model="form.account"
                                type="text"
                                placeholder="用户名"
                                class="login-page__input"
                                autocomplete="username"
                            />
                        </div>
                    </div>

                    <div class="login-page__input-group">
                        <div class="login-page__input-wrapper">
                            <span class="login-page__input-icon">🔒</span>
                            <input
                                v-model="form.password"
                                type="password"
                                placeholder="密码"
                                class="login-page__input"
                                @keyup.enter="handleLogin"
                            />
                        </div>
                    </div>

                    <div v-if="errorMsg" class="login-page__error">
                        {{ errorMsg }}
                    </div>

                    <div v-if="deviceErrorMsg" class="login-page__device-error">
                        {{ deviceErrorMsg }}
                    </div>

                    <BaseButton
                        gradient
                        size="large"
                        class="login-page__submit"
                        :loading="loading"
                        @click="handleLogin"
                    >
                        {{ loading ? "登录中..." : "登录" }}
                    </BaseButton>
                </form>

                <div class="login-page__setting">
                    <span
                        class="login-page__setting-icon"
                        @click="handleSetting"
                        title="设置服务器地址"
                        >⚙️</span
                    >
                </div>

                <!-- 客户端信息展示 -->
                <div class="login-page__footer">
                    <div class="login-page__client-info">
                        <span class="client-info__item">
                            <span class="client-info__label">客户端ID:</span>
                            <span class="client-info__value">{{
                                userStore.clientID
                            }}</span>
                        </span>
                        <span class="client-info__item">
                            <span class="client-info__label">服务器:</span>
                            <span class="client-info__value">{{
                                savedServerUrl
                            }}</span>
                        </span>
                    </div>
                    <div class="login-page__version">
                        <span>{{ CONSTANTS.COMPANY_NAME }}</span>
                        <span class="version__separator">|</span>
                        <span>{{ CONSTANTS.VERSION }}</span>
                    </div>
                </div>
            </div>
        </div>

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

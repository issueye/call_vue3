<script setup>
import { ref, onMounted, watch } from "vue";
import { apiLoadForwardURL, apiSaveForwardURL } from "@/api";
import Message from "@/utils/message";
import "./SettingsDialog.css";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: "服务器地址",
    },
    defaultUrl: {
        type: String,
        default: "http://0.0.0.0:21999",
    },
    placeholder: {
        type: String,
        default: "http://0.0.0.0:21999",
    },
});

const emit = defineEmits(["update:visible", "save", "close"]);

const serverUrl = ref("");
const loading = ref(false);

// 加载保存的服务器地址
const loadSavedUrl = async () => {
    try {
        const res = await apiLoadForwardURL();
        const savedUrl = res?.data || res?.data?.data;
        serverUrl.value = savedUrl || props.defaultUrl;
    } catch (error) {
        console.error("加载服务器地址失败:", error);
        serverUrl.value = props.defaultUrl;
    }
};

// 保存服务器地址
const saveServerUrl = async () => {
    if (!serverUrl.value) {
        Message.info("请输入服务器地址");
        return;
    }

    loading.value = true;
    try {
        await apiSaveForwardURL(serverUrl.value);
        emit("save", serverUrl.value);
        closeDialog();
        Message.info("服务器地址已保存");
    } catch (error) {
        console.error("保存服务器地址失败:", error);
        Message.error("保存失败，请重试");
    } finally {
        loading.value = false;
    }
};

// 关闭对话框
const closeDialog = () => {
    emit("update:visible", false);
    emit("close");
};

// 点击遮罩层关闭
const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
        closeDialog();
    }
};

// 监听 visible 变化
watch(
    () => props.visible,
    (val) => {
        if (val) {
            loadSavedUrl();
        }
    },
);

onMounted(() => {
    if (props.visible) {
        loadSavedUrl();
    }
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="visible"
            class="settings-dialog-overlay"
            @click="handleOverlayClick"
        >
            <div class="settings-dialog">
                <div class="settings-dialog__header">{{ title }}</div>
                <div class="settings-dialog__body">
                    <label class="settings-dialog__label"
                        >请输入服务器地址</label
                    >
                    <input
                        v-model="serverUrl"
                        type="text"
                        class="settings-dialog__input"
                        :placeholder="placeholder"
                        @keyup.enter="saveServerUrl"
                    />
                </div>
                <div class="settings-dialog__footer">
                    <button
                        class="settings-dialog__btn settings-dialog__btn--cancel"
                        @click="closeDialog"
                    >
                        取消
                    </button>
                    <button
                        class="settings-dialog__btn settings-dialog__btn--confirm"
                        :loading="loading"
                        @click="saveServerUrl"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { usePatientStore } from "@/stores";
import Message from "@/utils/message";
import "./TriageDialog.css";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    patient: {
        type: Object,
        default: null,
    },
    roomList: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["update:visible", "triage", "end", "cancel"]);

const patientStore = usePatientStore();
const selectedRoom = ref(null);
const loading = ref(false);

// 监听弹窗打开，重置选择
watch(
    () => props.visible,
    (val) => {
        if (val) {
            selectedRoom.value = null;
        }
    },
);

// 确认转诊
const handleTriage = async () => {
    if (!selectedRoom.value) {
        Message.info("请选择诊室");
        return;
    }

    loading.value = true;
    try {
        // 获取数据
        const room = props.roomList.find(
            (room) => room.id === selectedRoom.value,
        );
        await emit("triage", props.patient, room);
        emit("update:visible", false);
    } catch (error) {
        console.error("转诊失败:", error);
    } finally {
        loading.value = false;
    }
};

// 确认结诊
const handleEnd = async () => {
    loading.value = true;
    try {
        await emit("end", props.patient);
        // 注意：这里不自动关闭弹窗，由父组件决定
    } catch (error) {
        console.error("结诊失败:", error);
    } finally {
        loading.value = false;
    }
};

// 取消
const handleCancel = () => {
    selectedRoom.value = null;
    emit("update:visible", false);
    emit("cancel");
};

// 点击遮罩关闭
const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
        handleCancel();
    }
};
</script>

<template>
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div
                v-if="visible"
                class="triage-dialog-overlay"
                @click="handleOverlayClick"
            >
                <Transition name="dialog-slide">
                    <div v-if="visible" class="triage-dialog">
                        <!-- 标题栏 -->
                        <div class="triage-dialog__header">
                            <h3 class="triage-dialog__title">患者分诊</h3>
                            <button
                                class="triage-dialog__close"
                                @click="handleCancel"
                                title="关闭"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <!-- 内容区 -->
                        <div class="triage-dialog__body">
                            <!-- 当前患者信息 -->
                            <div
                                v-if="patient"
                                class="triage-dialog__patient-info"
                            >
                                <div class="patient-avatar">
                                    {{ patient.name?.charAt(0) || "?" }}
                                </div>
                                <div class="patient-details">
                                    <div class="patient-name">
                                        {{ patient.name }}
                                    </div>
                                    <div class="patient-meta">
                                        <span class="queue-no">{{
                                            patient.queueNo
                                        }}</span>
                                        <span class="divider">|</span>
                                        <span class="call-count">
                                            呼叫
                                            {{
                                                patient.call_count ||
                                                patient.callTimes ||
                                                0
                                            }}
                                            次
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- 提示信息 -->
                            <div class="triage-dialog__hint">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line
                                        x1="12"
                                        y1="16"
                                        x2="12"
                                        y2="12"
                                    ></line>
                                    <line
                                        x1="12"
                                        y1="8"
                                        x2="12.01"
                                        y2="8"
                                    ></line>
                                </svg>
                                <span
                                    >请选择处理方式：转诊到其他诊室或完成诊疗</span
                                >
                            </div>

                            <!-- 转诊选项 -->
                            <div
                                v-if="roomList.length > 0"
                                class="triage-dialog__options"
                            >
                                <div class="option-title">
                                    <span class="icon">🏥</span>
                                    转到其他诊室
                                </div>
                                <div class="room-selector">
                                    <select
                                        v-model="selectedRoom"
                                        class="room-select"
                                    >
                                        <option value="">请选择诊室</option>
                                        <option
                                            v-for="room in roomList"
                                            :key="room.id"
                                            :value="room.id"
                                        >
                                            {{ room.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <!-- 无可用诊室提示 -->
                            <div v-else class="triage-dialog__no-rooms">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path
                                        d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                                    ></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <p>当前无其他可用诊室</p>
                                <span>可直接完成本次诊疗</span>
                            </div>
                        </div>

                        <!-- 底部按钮区 -->
                        <div class="triage-dialog__footer">
                            <!-- 转诊按钮 -->
                            <button
                                v-if="roomList.length > 0"
                                class="btn btn--triage"
                                :disabled="!selectedRoom || loading"
                                @click="handleTriage"
                            >
                                <span v-if="!loading">确认转诊</span>
                                <span v-else>
                                    <svg class="spinner" viewBox="0 0 24 24">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                            fill="none"
                                            opacity="0.25"
                                        ></circle>
                                        <path
                                            d="M12 2a10 10 0 0 1 10 10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                            fill="none"
                                        >
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 12 12"
                                                to="360 12 12"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            />
                                        </path>
                                    </svg>
                                    处理中...
                                </span>
                            </button>

                            <!-- 结诊按钮 -->
                            <button
                                v-if="roomList.length === 0"
                                class="btn btn--end"
                                :disabled="loading"
                                @click="handleEnd"
                            >
                                <span v-if="!loading"> 完成诊疗 </span>
                                <span v-else>
                                    <svg class="spinner" viewBox="0 0 24 24">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                            fill="none"
                                            opacity="0.25"
                                        ></circle>
                                        <path
                                            d="M12 2a10 10 0 0 1 10 10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                            fill="none"
                                        >
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 12 12"
                                                to="360 12 12"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            />
                                        </path>
                                    </svg>
                                    处理中...
                                </span>
                            </button>

                            <!-- 取消按钮 -->
                            <button
                                class="btn btn--cancel"
                                :disabled="loading"
                                @click="handleCancel"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

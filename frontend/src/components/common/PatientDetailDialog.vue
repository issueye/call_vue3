<script setup>
import { computed, watch } from "vue";
import BaseIcon from "@/components/common/BaseIcon.vue";
import "./PatientDetailDialog.css";

// 状态配置（与 PatientItem 保持一致）
const statusConfig = {
    0: { label: "接诊中", class: "status-calling" },
    1: { label: "优先", class: "status-priority" },
    2: { label: "候诊中", class: "status-waiting" },
    3: { label: "复诊", class: "status-revisit" },
    4: { label: "过号", class: "status-passed" },
    99: { label: "结诊", class: "status-called" },
};

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    patient: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["update:visible", "close"]);

// 计算属性
const genderLabel = computed(() => (props.patient?.gender === 1 ? "男" : "女"));
const visitTypeLabel = computed(() =>
    props.patient?.visitType === 1 ? "初诊" : "复诊"
);
const currentStatus = computed(
    () => statusConfig[props.patient?.status] || statusConfig[2]
);

// 关闭弹窗
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
watch(() => props.visible, (val) => {
    if (val) {
        // 弹窗打开时的处理
        document.body.style.overflow = "hidden";
    } else {
        // 弹窗关闭时的处理
        document.body.style.overflow = "";
    }
});

// ESC 键关闭
const handleKeydown = (e) => {
    if (e.key === "Escape" && props.visible) {
        closeDialog();
    }
};

// 组件挂载时添加键盘监听
if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
}
</script>

<template>
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div
                v-if="visible"
                class="patient-detail-dialog-overlay"
                @click="handleOverlayClick"
            >
                <Transition name="dialog-slide">
                    <div v-if="visible" class="patient-detail-dialog">
                        <!-- 标题栏 -->
                        <div class="patient-detail-dialog__header">
                            <h3 class="patient-detail-dialog__title">患者详情</h3>
                            <button
                                class="patient-detail-dialog__close"
                                @click="closeDialog"
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
                        <div class="patient-detail-dialog__body">
                            <div v-if="!patient" class="patient-detail-dialog__empty">
                                <p>暂无患者信息</p>
                            </div>

                            <div v-else class="patient-detail-dialog__content">
                                <!-- 头部：排队号 + 状态 -->
                                <div class="patient-detail-dialog__patient-header">
                                    <div class="patient-detail-dialog__queue-no">
                                        {{ patient.queueNo }}
                                    </div>
                                    <div
                                        class="patient-detail-dialog__status"
                                        :class="currentStatus.class"
                                    >
                                        {{ currentStatus.label }}
                                    </div>
                                </div>

                                <!-- 基本信息区 -->
                                <div class="patient-detail-dialog__section">
                                    <div class="patient-detail-dialog__section-title">
                                        <BaseIcon name="clipboard" size="sm" class="icon" />
                                        <span>基本信息</span>
                                    </div>
                                    <div class="patient-detail-dialog__info-grid">
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">姓名</span>
                                            <span class="value">{{ patient.name }}</span>
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">性别</span>
                                            <span class="value">{{ genderLabel }}</span>
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">年龄</span>
                                            <span class="value">{{ patient.age }}岁</span>
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">联系电话</span>
                                            <span class="value">{{
                                                patient.phone ||
                                                patient.tel ||
                                                patient.parent_tel ||
                                                "-"
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 就诊信息区 -->
                                <div class="patient-detail-dialog__section">
                                    <div class="patient-detail-dialog__section-title">
                                        <BaseIcon name="hospital" size="sm" class="icon" />
                                        <span>就诊信息</span>
                                    </div>
                                    <div class="patient-detail-dialog__info-grid">
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">就诊类型</span>
                                            <span class="value">{{ visitTypeLabel }}</span>
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">排队号</span>
                                            <span class="value">{{
                                                patient.line_num || "-"
                                            }}</span>
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">呼叫次数</span>
                                            <span class="value"
                                                >{{ patient.callTimes || patient.call_count || 0 }}次</span
                                            >
                                        </div>
                                        <div class="patient-detail-dialog__info-item">
                                            <span class="label">就诊状态</span>
                                            <span class="value">
                                                <span
                                                    class="status-badge"
                                                    :class="currentStatus.class"
                                                >
                                                    {{ currentStatus.label }}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 底部按钮区 -->
                        <div class="patient-detail-dialog__footer">
                            <button
                                class="patient-detail-dialog__btn patient-detail-dialog__btn--close"
                                @click="closeDialog"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

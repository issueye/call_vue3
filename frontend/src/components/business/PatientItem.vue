<script setup>
import { computed } from "vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import BaseIcon from "@/components/common/BaseIcon.vue";
import "./PatientItem.css";
import consts from "@/consts";

const { PATIENT_STATE } = consts;

const props = defineProps({
    patient: {
        type: Object,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    calling: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["click", "call", "detail"]);

const currentStatus = computed(() => {
    for (const key in PATIENT_STATE) {
        if (PATIENT_STATE[key].state === props.patient.state) {
            return PATIENT_STATE[key];
        }
    }
    return PATIENT_STATE[2];
});

const genderLabel = computed(() => (props.patient.gender === 1 ? "男" : "女"));

// 计算状态颜色
const statusColor = computed(() => {
    const colorMap = {
        [PATIENT_STATE.CALLING.state]: "var(--status-calling)",
        [PATIENT_STATE.PRIORITY.state]: "var(--status-priority)",
        [PATIENT_STATE.WAITING.state]: "var(--status-waiting)",
        [PATIENT_STATE.REVISIT.state]: "var(--status-revisit)",
        [PATIENT_STATE.PASSED.state]: "var(--status-passed)",
        [PATIENT_STATE.CALLED.state]: "var(--status-called)",
    };
    return colorMap[props.patient.state] || "var(--status-waiting)";
});
</script>

<template>
    <div
        class="patient-item"
        :class="{
            'patient-item--active': active,
        }"
        :style="{ '--status-color': statusColor }"
        @click="emit('click', patient)"
    >
        <!-- 左侧状态条 -->
        <div class="patient-item__status-bar" />

        <!-- 主要内容区域 -->
        <div class="patient-item__content">
            <!-- 顶部信息行 -->
            <div class="patient-item__top">
                <div class="patient-item__main">
                    <h3 class="patient-item__name">{{ patient.name }}</h3>
                    <BaseBadge
                        :text="currentStatus.label"
                        :class="currentStatus.class"
                        size="sm"
                    />
                </div>
                <div class="patient-item__actions">
                    <!-- 过号患者呼叫按钮 -->
                    <button
                        v-if="patient.state === PATIENT_STATE.PASSED.state"
                        class="patient-item__detail-btn"
                        :disabled="calling"
                        @click.stop="emit('call', patient)"
                        title="呼叫"
                    >
                        <BaseIcon
                            name="call"
                            size="xs"
                            class="patient-item__call-btn__icon"
                        />
                    </button>
                    <!-- 详情按钮 -->
                    <button
                        class="patient-item__detail-btn"
                        @click.stop="emit('detail', patient)"
                        title="查看详情"
                    >
                        <BaseIcon name="clipboard" size="xs" />
                    </button>
                </div>
            </div>

            <!-- 底部信息行 -->
            <div class="patient-item__bottom">
                <div class="patient-item__queue">
                    <BaseIcon
                        name="clipboard"
                        size="xs"
                        class="patient-item__queue-icon"
                    />
                    <span class="patient-item__queue-num">{{
                        patient.line_num
                    }}</span>
                </div>
                <div class="patient-item__meta">
                    <span>{{ genderLabel }}</span>
                    <span class="divider">|</span>
                    <span>{{ patient.age }}岁</span>
                </div>
            </div>
        </div>

        <!-- 接诊中状态脉冲效果 -->
        <div
            v-if="patient.state === PATIENT_STATE.CALLING.state"
            class="patient-item__pulse"
        />
    </div>
</template>

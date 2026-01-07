<script setup>
import { computed } from "vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import "./PatientItem.css";

// 状态配置
const statusConfig = {
    0: { label: "接诊中", class: "status-calling" },
    1: { label: "优先", class: "status-priority" },
    2: { label: "候诊中", class: "status-waiting" },
    3: { label: "复诊", class: "status-revisit" },
    4: { label: "过号", class: "status-passed" },
    99: { label: "结诊", class: "status-called" },
};

const props = defineProps({
    patient: {
        type: Object,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["click", "call", "detail"]);

const currentStatus = computed(
    () => statusConfig[props.patient.state] || statusConfig[2],
);

const genderLabel = computed(() => (props.patient.gender === 1 ? "男" : "女"));
</script>

<template>
    <div
        class="patient-item"
        :class="{
            'patient-item--active': active,
            'patient-item--passed': patient.status === 4,
        }"
        @click="emit('click', patient)"
    >
        <div class="patient-item__header">
            <span class="patient-item__name">{{ patient.name }}</span>
            <div class="patient-item__header-right">
                <BaseBadge
                    :text="currentStatus.label"
                    :class="currentStatus.class"
                />
                <button
                    class="patient-item__detail-btn"
                    @click.stop="emit('detail', patient)"
                    title="查看详情"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    详情
                </button>
            </div>
        </div>

        <div class="patient-item__info">
            <span class="patient-item__meta">
                {{ genderLabel }} | {{ patient.age }}
            </span>
            <span class="patient-item__queue">
                排队号: {{ patient.line_num }}
            </span>
        </div>

        <div v-if="patient.status === 4" class="patient-item__call">
            <button
                class="patient-item__recall-btn"
                @click.stop="emit('call', patient)"
            >
                重新呼叫
            </button>
        </div>

        <div v-if="patient.status === 0" class="patient-item__pulse" />
    </div>
</template>

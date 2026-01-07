<script setup>
import { computed } from "vue";
import CallButtons from "./CallButtons.vue";
import "./PatientDetailCard.css";

const props = defineProps({
    patient: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["next", "recall", "skip"]);

const genderLabel = computed(() => (props.patient?.gender === 1 ? "男" : "女"));
const visitTypeLabel = computed(() =>
    props.patient?.visitType === 1 ? "初诊" : "复诊",
);
</script>

<template>
    <div class="patient-detail-card">
        <div class="patient-detail-card__header">
            <div class="patient-detail-card__header-content">
                <span class="patient-detail-card__queue-no">
                    {{ patient?.queueNo }}
                </span>
                <span class="patient-detail-card__visit-type">
                    {{ visitTypeLabel }}
                </span>
            </div>
        </div>

        <div class="patient-detail-card__body">
            <div class="patient-detail-card__info-grid">
                <div class="patient-detail-card__info-item">
                    <span class="label">姓名</span>
                    <span class="value">{{ patient?.name }}</span>
                </div>
                <div class="patient-detail-card__info-item">
                    <span class="label">性别</span>
                    <span class="value">{{ genderLabel }}</span>
                </div>
                <div class="patient-detail-card__info-item">
                    <span class="label">年龄</span>
                    <span class="value">{{ patient?.age }}岁</span>
                </div>
                <div class="patient-detail-card__info-item">
                    <span class="label">呼叫次数</span>
                    <span class="value">{{ patient?.callTimes }}次</span>
                </div>
                <div class="patient-detail-card__info-item">
                    <span class="label">排队号</span>
                    <span class="value">{{ patient?.queueNo }}</span>
                </div>
                <div class="patient-detail-card__info-item">
                    <span class="label">联系电话</span>
                    <span class="value">{{ patient?.phone || "-" }}</span>
                </div>
            </div>

            <div class="patient-detail-card__actions">
                <CallButtons
                    :patient="patient"
                    @next="emit('next')"
                    @recall="emit('recall')"
                    @skip="emit('skip')"
                />
            </div>
        </div>
    </div>
</template>

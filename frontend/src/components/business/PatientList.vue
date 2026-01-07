<script setup>
import { computed, ref } from "vue";
import { useUserStore, usePatientStore } from "@/stores";
import PatientItem from "./PatientItem.vue";
import "./PatientList.css";

const props = defineProps({
    activeId: {
        type: Number,
        default: 0,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["select", "call", "detail"]);

const patientStore = usePatientStore();
const userStore = useUserStore();
const docId = computed(() => userStore.userInfo?.id);
const isRefreshing = ref(false);

// Tab 配置
const tabs = [
    {
        key: "waiting",
        label: "候诊",
        count: computed(() => patientStore.docStatus.wait_count),
    },
    {
        key: "pass",
        label: "过号",
        count: computed(() => patientStore.docStatus.pass_count),
    },
    {
        key: "end",
        label: "结诊",
        count: computed(() => patientStore.docStatus.end_count),
    },
];

console.log("docStatus", patientStore.docStatus);

// 当前列表
const currentList = computed(() => patientStore.patients);

// 当前 Tab
const currentTab = computed(() => patientStore.activeTab);

// 切换 Tab
const handleTabChange = (tabKey) => {
    patientStore.setActiveTab(tabKey, docId.value);
};

// 获取列表标题
const listTitle = computed(() => {
    const tab = tabs.find((t) => t.key === currentTab.value);
    return tab ? tab.label : "患者列表";
});

// 刷新患者列表
const handleRefresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    try {
        const patType = patientStore.getPatientType();
        console.log("patType", patType);
        await patientStore.refreshPatients(docId.value, patType);
    } finally {
        setTimeout(() => {
            isRefreshing.value = false;
        }, 500);
    }
};
</script>

<template>
    <div class="patient-list">
        <div class="patient-list__header">
            <div class="patient-list__header-left">
                <h3 class="patient-list__title">{{ listTitle }}</h3>
                <span class="patient-list__count"
                    >{{ currentList.length }}人</span
                >
            </div>
            <button
                class="patient-list__refresh"
                :class="{ 'patient-list__refresh--loading': isRefreshing }"
                @click="handleRefresh"
                title="刷新"
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
                        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    />
                    <path d="M3 3v5h5" />
                    <path
                        d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
                    />
                    <path d="M16 21h5v-5" />
                </svg>
            </button>
        </div>

        <!-- Tab 切换 -->
        <div class="patient-list__tabs">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="patient-list__tab"
                :class="{ 'patient-list__tab--active': currentTab === tab.key }"
                @click="handleTabChange(tab.key)"
            >
                {{ tab.label }}
                <span class="patient-list__tab-count">
                    {{ tab.count }}
                </span>
            </button>
        </div>

        <div v-if="loading" class="patient-list__loading">
            <div class="loading-spinner" />
            <span>加载中...</span>
        </div>

        <div v-else-if="currentList.length === 0" class="patient-list__empty">
            <span>暂无患者</span>
        </div>

        <div v-else class="patient-list__items">
            <transition-group name="list">
                <PatientItem
                    v-for="patient in currentList"
                    :key="patient.id"
                    :patient="patient"
                    :active="patient.id === activeId"
                    @click="emit('select', patient)"
                    @call="emit('call', patient)"
                    @detail="emit('detail', patient)"
                />
            </transition-group>
        </div>
    </div>
</template>

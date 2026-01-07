<script setup>
import { computed } from "vue";
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

const emit = defineEmits(["select", "call"]);

const patientStore = usePatientStore();
const userStore = useUserStore();
const docId = computed(() => userStore.userInfo?.id);

// Tab 配置
const tabs = [
    {
        key: "waiting",
        label: "候诊",
        count: computed(() => patientStore.waitingCount),
    },
    {
        key: "pass",
        label: "过号",
        count: computed(() => patientStore.passedPatients.length),
    },
    {
        key: "end",
        label: "结诊",
        count: computed(() => patientStore.endedPatients.length),
    },
];

// 当前列表
const currentList = computed(() => patientStore.patients);

// 当前 Tab
const currentTab = computed(() => patientStore.activeTab);

// 切换 Tab
const handleTabChange = (tabKey) => {
    console.log("handleTabChange", tabKey);
    patientStore.setActiveTab(tabKey, docId.value);
};

// 获取列表标题
const listTitle = computed(() => {
    const tab = tabs.find((t) => t.key === currentTab.value);
    return tab ? tab.label : "患者列表";
});
</script>

<template>
    <div class="patient-list">
        <div class="patient-list__header">
            <h3 class="patient-list__title">{{ listTitle }}</h3>
            <span class="patient-list__count">{{ currentList.length }}人</span>
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
                <span class="patient-list__tab-count">{{
                    tab.count.value
                }}</span>
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
                />
            </transition-group>
        </div>
    </div>
</template>

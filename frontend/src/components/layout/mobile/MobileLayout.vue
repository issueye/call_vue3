<script setup>
import { ref, computed, onMounted } from "vue";
import { usePatientStore } from "@/stores";
import { useUserStore } from "@/stores";
import { PatientList } from "@/components/business";
import MobilePatientDetailCard from './PatientDetailCard.vue';
import "./MobileLayout.css";

const patientStore = usePatientStore();
const userStore = useUserStore();

// 是否显示患者详情（用于切换视图）
const showDetail = ref(false);

const currentPatient = computed(() => patientStore.currentPatient);

onMounted(() => {
    // 获取数据
    initWorkbench();
});

// 初始化工作台
const initWorkbench = async () => {
    console.log("初始化工作台", userStore.org);
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

    console.log("初始化工作台，获取患者列表...", {
        orgId: userStore.org.org_id,
        deptId,
        userInfo: userStore.userInfo,
        userId: userStore.userInfo?.id,
    });

    // 获取患者列表
    await patientStore.fetchPatients(userStore.userInfo?.id);

    // 如果有诊室信息，获取在诊患者
    if (userStore.room?.id || userStore.org.dept_id) {
        await patientStore.getVisitedPatient(
            userStore.userInfo?.id,
            userStore.org.org_id,
            deptId,
        );
    }

    return true;
};

// 切换到患者列表
const showList = () => {
    showDetail.value = false;
};

// 切换到患者详情
const showPatientDetail = (patient) => {
    patientStore.setCurrentPatient(patient);
    showDetail.value = true;
};

// 处理呼叫
const handleCall = (patient) => {
    patientStore.callPatient(patient);
};

// 处理下一位
const handleNext = () => {
    if (patientStore.visitPatient) {
        patientStore.showNextDialog = true;
    } else {
        patientStore.handleNext(
            patientStore.userInfo?.id,
            patientStore.org?.org_id,
            patientStore.room?.dept_id || patientStore.org?.dept_id,
        );
    }
};

// 处理重呼
const handleRecall = () => {
    if (patientStore.currentPatient) {
        patientStore.callPatient(
            userStore.userInfo?.id,
            patientStore.currentPatient,
        );
    }
};

// 处理过号
const handleSkip = () => {
    if (patientStore.currentPatient) {
        patientStore.skipPatient(patientStore.currentPatient);
    }
};
</script>

<template>
    <div class="mobile-layout">
        <!-- 患者信息区域 -->
        <div class="mobile-layout__section mobile-layout__section--patient">
            <MobilePatientDetailCard
                :patient="currentPatient"
                @next="handleNext"
                @recall="handleRecall"
                @skip="handleSkip"
            />
        </div>

        <!-- 患者列表区域 -->
        <div class="mobile-layout__section mobile-layout__section--list">
            <div class="section-header">
                <span class="section-header__title">排队患者</span>
                <span class="section-header__count"
                    >{{ patientStore.waitingCount }}人</span
                >
            </div>
            <PatientList
                :active-id="patientStore.currentPatient?.id"
                :loading="patientStore.loading"
                @select="showPatientDetail"
                @call="handleCall"
            />
        </div>
    </div>
</template>

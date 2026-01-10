<script setup>
import { ref, computed, onMounted } from "vue";
import Message from "@/utils/message";
import { usePatientStore } from "@/stores";
import { useUserStore } from "@/stores";
import { PatientList } from "@/components/business";
import PatientDetailDialog from "@/components/common/PatientDetailDialog.vue";
import TriageDialog from "@/components/common/TriageDialog.vue";
import MobilePatientDetailCard from "./PatientDetailCard.vue";
import "./MobileLayout.css";

const patientStore = usePatientStore();
const userStore = useUserStore();

// 是否显示患者详情（用于切换视图）
const showDetail = ref(false);

const currentPatient = computed(() => patientStore.visitPatient);

onMounted(async () => {
    // 初始化工作台
    await initWorkbench();

    // 获取在诊患者
    await patientStore.getVisitedPatient(userStore.userInfo.id);

    // 如果没有在诊患者，标记为首次呼叫
    if (!patientStore.visitPatient) {
        patientStore.isFirstCall = true;
    }
});

// 初始化工作台
const initWorkbench = async () => {
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

    // 获取患者列表
    await patientStore.fetchPatients(userStore.userInfo?.id);

    // 如果有诊室信息，获取在诊患者
    await patientStore.getVisitedPatient(
        userStore.userInfo?.id,
        userStore.org.org_id,
        deptId,
    );

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
const handleCall = async (patient) => {
    const result = await patientStore.callPatient(
        userStore.userInfo?.id,
        patient,
    );
    if (result.success) {
        Message.success(`呼叫 ${patient.name || "患者"} 成功`);
    } else {
        Message.error(result.message || "呼叫失败");
    }
};

// 处理查看详情
const handleDetail = (patient) => {
    patientStore.openDetailDialog(patient);
};

// 处理下一位
const handleNext = async () => {
    const result = await patientStore.handleNext(
        userStore.userInfo?.id,
        userStore.org?.org_id,
        userStore.room?.dept_id || userStore.org?.dept_id,
    );
    if (result.code === 200) {
        Message.success("呼叫成功");
    } else if (result.message) {
        // 只有在非"请先处理当前在诊患者"的情况下才显示错误
        if (!result.message.includes("请先处理")) {
            Message.warning(result.message);
        }
    }
};

// 处理分诊-转诊
const handleTriage = async (patient, info) => {
    try {
        // 获取当前操作员
        const operator = userStore.userInfo?.id;
        const result = await patientStore.confirmAssign(
            operator,
            info,
            patient,
        );

        if (result.success) {
            Message.success("转诊成功");
            // 关闭分诊弹窗
            patientStore.showNextDialog = false;

            // 自动呼叫下一位
            await handleNext();
        } else {
            Message.error(result.message || "转诊失败");
        }
    } catch (error) {
        console.error("转诊失败:", error);
        Message.error(error.message || "转诊失败");
    }
};

// 处理分诊-结诊
const handleEnd = async (patient) => {
    try {
        const result = await patientStore.endPatient(
            userStore.userInfo?.id,
            patient,
        );

        if (result.success) {
            Message.success("结诊成功");

            // 结诊成功后自动呼叫下一位
            await handleNext();

            // 关闭弹窗
            patientStore.showNextDialog = false;
        } else {
            Message.error(result.message || "结诊失败");
        }
    } catch (error) {
        console.error("结诊失败:", error);
        Message.error(error.message || "结诊失败");
    }
};

// 处理分诊弹窗取消
const handleTriageCancel = () => {
    patientStore.showNextDialog = false;
};

// 处理重呼
const handleRecall = async () => {
    if (patientStore.visitPatient) {
        const result = await patientStore.recallPatient(
            userStore.userInfo?.id,
            patientStore.visitPatient,
        );
        if (result.success) {
            Message.success("重呼成功");
        } else {
            Message.error(result.message || "重呼失败");
        }
    }
};

// 处理过号
const handleSkip = async () => {
    if (patientStore.visitPatient) {
        const result = await patientStore.skipPatient(
            userStore.userInfo?.id,
            patientStore.visitPatient,
        );
        if (result.success) {
            Message.success("过号成功");
        } else {
            Message.error(result.message || "过号失败");
        }
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
            <PatientList
                :active-id="patientStore.currentPatient?.id"
                :loading="patientStore.loading"
                @select="showPatientDetail"
                @call="handleCall"
                @detail="handleDetail"
            />
        </div>
    </div>

    <!-- 患者详情弹窗 -->
    <PatientDetailDialog
        v-model:visible="patientStore.showDetailDialog"
        :patient="patientStore.dialogPatient"
        @close="patientStore.closeDetailDialog"
    />

    <!-- 分诊弹窗 -->
    <TriageDialog
        v-model:visible="patientStore.showNextDialog"
        :patient="patientStore.visitPatient"
        :room-list="patientStore.deptRoomList"
        @triage="handleTriage"
        @end="handleEnd"
        @cancel="handleTriageCancel"
    />
</template>

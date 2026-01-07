<script setup>
import { onMounted } from "vue";
import Message from "@/utils/message";
import { usePatientStore, useUserStore } from "@/stores";
import { PatientList } from "@/components/business";
import PatientDetailDialog from "@/components/common/PatientDetailDialog.vue";
import TriageDialog from "@/components/common/TriageDialog.vue";
import DesktopPatientDetailCard from "./PatientDetailCard.vue";
import "./DesktopLayout.css";

const patientStore = usePatientStore();
const userStore = useUserStore();

// 初始化
onMounted(async () => {
    // 获取在诊患者
    await patientStore.getVisitedPatient(userStore.userInfo.id);

    // 如果没有在诊患者，标记为首次呼叫
    if (!patientStore.visitPatient) {
        patientStore.isFirstCall = true;
    }
});

const handleSelect = (patient) => {
    patientStore.setCurrentPatient(patient);
};

const handleCall = (patient) => {
    patientStore.callPatient(userStore.userInfo.id, patient);
};

const handleRecall = () => {
    patientStore.recallPatient(
        userStore.userInfo.id,
        patientStore.currentPatient,
    );
};

const handleSkip = () => {
    if (patientStore.currentPatient) {
        patientStore.skipPatient(
            userStore.userInfo.id,
            patientStore.currentPatient,
        );
    }
};

const handleDetail = (patient) => {
    patientStore.openDetailDialog(patient);
};

const handleNext = async () => {
    await patientStore.handleNext(
        userStore.userInfo.id,
        userStore.org.org_id,
        userStore.room.dept_id || userStore.org.dept_id,
    );
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
</script>

<template>
    <div class="desktop-layout">
        <div class="desktop-layout__left">
            <PatientList
                :active-id="patientStore.currentPatient?.id"
                :loading="patientStore.loading"
                @select="handleSelect"
                @call="handleCall"
                @detail="handleDetail"
            />
        </div>
        <div class="desktop-layout__right">
            <DesktopPatientDetailCard
                :patient="patientStore.currentPatient"
                @next="handleNext"
                @recall="handleRecall"
                @skip="handleSkip"
            />
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
    </div>
</template>

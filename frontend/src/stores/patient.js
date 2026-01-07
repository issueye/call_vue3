import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import {
  apiPatLineList,
  apiPatCall,
  apiPatPass,
  apiPatEnd,
  apiDocStart,
  apiDocStop,
  apiGetRoomList,
  apiAssignRoom,
  apiDoctorVisitedPatient,
} from "@/api";

export const usePatientStore = defineStore(
  "patient",
  () => {
    // 状态
    const patients = ref([]); // 患者列表
    const currentPatient = ref(null); // 当前选中患者
    const currentCall = ref(null); // 当前呼叫患者
    const loading = ref(false); // 加载状态
    const activeTab = ref("waiting"); // 当前标签: waiting/pass/end
    const pageConfig = ref({
      // 分页配置
      pageNum: 1,
      pageSize: 20,
      total: 0,
    });

    const deptRoomList = ref([]); // 可分配诊室列表
    const showNextDialog = ref(false); // 下一位弹窗
    const isFirstCall = ref(true); // 是否首次呼叫
    const visitPatient = ref(null); // 当前在诊患者

    // 医生状态统计
    const docStatus = ref({
      dept: "",
      doc: 0,
      end_count: 0,
      pass_count: 0,
      queue_type: 0,
      status: 1,
      wait_count: 0,
    });

    const patientType = {
      waiting: 0,
      pass: 1,
      end: 2,
    };

    // 计算属性
    const patientCount = computed(() => patients.value.length);
    const waitingCount = computed(
      () => patients.value.filter((p) => p.state === 2 || p.state === 1).length,
    );

    // 等待中的患者
    const waitingPatients = computed(() =>
      patients.value.filter((p) => p.state === 2),
    );

    // 已过号的患者
    const passedPatients = computed(() =>
      patients.value.filter((p) => p.state === 4),
    );

    // 已结诊的患者
    const endedPatients = computed(() =>
      patients.value.filter((p) => p.state === 99),
    );

    // 根据当前标签获取患者列表
    const currentList = computed(() => {
      switch (activeTab.value) {
        case "pass":
          return passedPatients.value;
        case "end":
          return endedPatients.value;
        default:
          return waitingPatients.value;
      }
    });

    // 方法 - 获取患者列表
    const fetchPatients = async (docId, patType = 0) => {
      loading.value = true;
      try {
        const params = {
          page_num: pageConfig.value.pageNum,
          page_size: pageConfig.value.pageSize,
          condition: {
            doc_id: docId,
            queue_type: 3, // 3 医生队列
            pat_type: patType, // 患者类型
          },
        };
        const data = await apiPatLineList(params);
        console.log("list -> data", data);
        patients.value = data?.list || [];
        pageConfig.value.total = data?.total || 0;
      } catch (error) {
        console.error("获取患者列表失败:", error);
        patients.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 方法 - 设置当前患者
    const setCurrentPatient = (patient) => {
      currentPatient.value = patient;
    };

    // 方法 - 呼叫患者
    const callPatient = async (docId, patient) => {
      try {
        const params = {
          appointment_id: "",
          dept_id: null,
          room_id: null,
          doc_id: docId,
        };
        const callRes = await apiPatCall(params);
        console.log("callRes", callRes);

        // 重新获取患者列表
        await fetchPatients(docId);

        currentCall.value = callRes;
        return { success: true };
      } catch (error) {
        console.error("呼叫患者失败:", error);
        return { success: false, message: error.message || "呼叫失败" };
      }
    };

    // 方法 - 过号
    const skipPatient = async (docId, patient) => {
      try {
        const params = {
          appointment_id: "",
          dept_id: null,
          room_id: null,
          doc_id: docId,
        };
        await apiPatPass(params);
        // 更新本地状态
        const index = patients.value.findIndex((p) => p.id === patient.id);
        if (index !== -1) {
          patients.value[index] = { ...patients.value[index], state: 4 };
        }
        if (currentPatient.value?.id === patient.id) {
          currentPatient.value = null;
        }
        return { success: true };
      } catch (error) {
        console.error("标记过号失败:", error);
        return { success: false, message: error.message || "操作失败" };
      }
    };

    // 方法 - 结诊
    const endPatient = async (docId, patient) => {
      try {
        const params = {
          appointment_id: patient.appointment_id,
          dept_id: null,
          room_id: null,
          doc_id: docId,
        };
        await apiPatEnd(params);
        // 更新本地状态
        const index = patients.value.findIndex(
          (p) => p.appointment_id === patient.appointment_id,
        );
        if (index !== -1) {
          patients.value[index] = { ...patients.value[index], state: 99 };
        }
        if (currentPatient.value?.id === patient.id) {
          currentPatient.value = null;
        }
        visitPatient.value = null;
        return { success: true };
      } catch (error) {
        console.error("结诊失败:", error);
        return { success: false, message: error.message || "结诊失败" };
      }
    };

    // 方法 - 医生开诊
    const doctorStart = async () => {
      try {
        await apiDocStart({});
        docStatus.value.status = 1;
        return { success: true };
      } catch (error) {
        console.error("开诊失败:", error);
        return { success: false, message: error.message || "开诊失败" };
      }
    };

    // 方法 - 医生停诊
    const doctorStop = async () => {
      try {
        await apiDocStop({});
        docStatus.value.status = 0;
        return { success: true };
      } catch (error) {
        console.error("停诊失败:", error);
        return { success: false, message: error.message || "停诊失败" };
      }
    };

    // 方法 - 获取可分配诊室列表
    const getDeptRoomList = async (orgId, deptId) => {
      try {
        const data = await apiGetRoomList({
          org_id: orgId,
          dept_id: deptId,
        });
        deptRoomList.value = data?.list || data || [];
        return deptRoomList.value;
      } catch (error) {
        console.error("获取诊室列表失败:", error);
        return [];
      }
    };

    // 方法 - 分配患者到其他诊室
    const assignRoom = async (patient, roomId) => {
      try {
        await apiAssignRoom({
          patient_id: patient.id,
          target_room_id: roomId,
          org_id: patient.org_id,
        });
        // 从列表中移除
        patients.value = patients.value.filter((p) => p.id !== patient.id);
        if (currentPatient.value?.id === patient.id) {
          currentPatient.value = null;
        }
        showNextDialog.value = false;
        return { success: true };
      } catch (error) {
        console.error("分配诊室失败:", error);
        return { success: false, message: error.message || "分配失败" };
      }
    };

    // 方法 - 获取当前在诊患者
    const getVisitedPatient = async (docId) => {
      try {
        const params = {
          doc_id: docId,
        };
        const data = await apiDoctorVisitedPatient(params);
        visitPatient.value = data || null;
        return visitPatient.value;
      } catch (error) {
        console.error("获取在诊患者失败:", error);
        return null;
      }
    };

    // 方法 - 下一位
    const handleNext = async (docId, orgId, deptId) => {
      if (!visitPatient.value) {
        // 首次呼叫
        if (waitingPatients.value.length > 0) {
          const nextPatient = waitingPatients.value[0];
          const result = await callPatient(docId, nextPatient);
          if (result.success) {
            visitPatient.value = nextPatient;
            isFirstCall.value = false;
          }
          return result;
        }
      } else {
        // 有在诊患者，弹出选择框
        showNextDialog.value = true;
        // 获取可分配诊室
        await getDeptRoomList(orgId, deptId);
      }
      return { success: false };
    };

    // 方法 - 确认分诊
    const confirmAssign = async (patient, roomId) => {
      if (roomId) {
        // 分配到诊室
        return await assignRoom(patient, roomId);
      } else {
        // 结诊
        return await endPatient(patient);
      }
    };

    // 方法 - 设置标签
    const setActiveTab = (tab, docId) => {
      activeTab.value = tab;

      const patType = patientType[tab];
      // 查询患者列表
      fetchPatients(docId, patType);
    };

    const getPatientType = () => {
      return patientType[activeTab.value];
    };

    // 方法 - 设置医生状态
    const setDocStatus = (status) => {
      docStatus.value = { ...docStatus.value, ...status };
    };

    // 方法 - 通知所有医生状态处理器 (参考旧版本)
    const docStatusHandlers = reactive(new Map());

    const addDocStatusHandler = (key, handler) => {
      docStatusHandlers.set(key, handler);
    };

    const removeDocStatusHandler = (key) => {
      docStatusHandlers.delete(key);
    };

    const notifyDocStatusHandlers = (data) => {
      docStatusHandlers.forEach((handler) => {
        handler(data);
      });
    };

    // 方法 - 刷新患者列表
    const refreshPatients = async (docId, patType) => {
      console.log("docId, patType", docId, patType);
      await fetchPatients(docId, patType);
    };

    // 方法 - 清理所有数据
    const clearPatients = () => {
      patients.value = [];
      currentPatient.value = null;
      currentCall.value = null;
      visitPatient.value = null;
      pageConfig.value = { pageNum: 1, pageSize: 20, total: 0 };
      docStatus.value = {
        dept: "",
        doc: 0,
        end_count: 0,
        pass_count: 0,
        queue_type: 0,
        status: 1,
        wait_count: 0,
      };
      // 清理所有处理器
      docStatusHandlers.clear();
    };

    return {
      // 状态
      patients,
      currentPatient,
      currentCall,
      loading,
      activeTab,
      pageConfig,
      deptRoomList,
      showNextDialog,
      isFirstCall,
      visitPatient,
      docStatus,
      // 计算属性
      patientCount,
      waitingCount,
      waitingPatients,
      passedPatients,
      endedPatients,
      currentList,
      // 方法
      fetchPatients,
      setCurrentPatient,
      callPatient,
      skipPatient,
      endPatient,
      doctorStart,
      doctorStop,
      getDeptRoomList,
      assignRoom,
      getVisitedPatient,
      handleNext,
      confirmAssign,
      setActiveTab,
      setDocStatus,
      addDocStatusHandler,
      removeDocStatusHandler,
      notifyDocStatusHandlers,
      clearPatients,
      refreshPatients,
      getPatientType,
    };
  },
  {
    persist: {
      key: "call-client-patient",
      paths: ["activeTab", "pageConfig", "isFirstCall"],
    },
  },
);

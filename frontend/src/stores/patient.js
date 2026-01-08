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
import { setHandler, getOrgDocsStatusTopic } from "@/mqtt";

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

    // 患者详情弹窗状态
    const showDetailDialog = ref(false); // 是否显示详情弹窗
    const dialogPatient = ref(null); // 弹窗展示的患者数据

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
        patients.value = data?.list || [];
        pageConfig.value.total = data?.total || 0;

        docStatus.value.end_count = data?.meta_data.end_count || 0;
        docStatus.value.pass_count = data?.meta_data.pass_count || 0;
        docStatus.value.wait_count = data?.meta_data.wait_count || 0;
        docStatus.value.call_count = data?.meta_data.call_count || 0;
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

    // 方法 - 重呼患者（重新呼叫当前在诊患者）
    const recallPatient = async (docId, patient) => {
      try {
        // 如果没有指定患者，重呼当前在诊患者
        const targetPatient =
          patient || visitPatient.value || currentCall.value;

        if (!targetPatient?.appointment_id) {
          return { success: false, message: "无在诊患者，无法重呼" };
        }

        const params = {
          appointment_id: targetPatient.appointment_id,
          dept_id: null,
          room_id: null,
          doc_id: docId,
        };

        const callRes = await apiPatCall(params);
        console.log("recallRes", callRes);

        // 更新呼叫次数
        const callCountKey =
          targetPatient.call_count !== undefined ? "call_count" : "callTimes";
        if (targetPatient[callCountKey] !== undefined) {
          targetPatient[callCountKey] += 1;
        }

        return { success: true, data: callRes };
      } catch (error) {
        console.error("重呼患者失败:", error);
        return { success: false, message: error.message || "重呼失败" };
      }
    };

    // 方法 - 过号
    const skipPatient = async (docId, patient) => {
      try {
        const params = {
          appointment_id: patient.appointment_id,
          doc_id: docId,
        };
        await apiPatPass(params);

        // 查询列表
        await fetchPatients(docId);

        // 更新当前就诊
        visitPatient.value = null;

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
          doc_id: docId,
        };
        await apiPatEnd(params);

        // 查询列表
        await fetchPatients(docId);

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
    const getDeptRoomList = async (docId) => {
      try {
        const appointmentId = visitPatient.value?.appointment_id || null;
        const data = await apiGetRoomList({
          doc_id: docId,
          queue_type: 3, // 医生队列
          appointment_id: appointmentId,
        });
        deptRoomList.value = data?.list || data || [];
        return deptRoomList.value;
      } catch (error) {
        console.error("获取诊室列表失败:", error);
        return [];
      }
    };

    // 方法 - 分配患者到其他诊室（转诊）
    const assignRoom = async (docId, info, patient) => {
      try {
        const params = {
          appointment_id: patient.appointment_id,
          new_doc_id: info.id,
          old_doc_id: docId,
        };
        // 调用转诊 API
        await apiAssignRoom(params);

        // 更新患者列表
        await fetchPatients(docId);

        // 更新就诊患者
        visitPatient.value = null;

        return { success: true, message: "转诊成功" };
      } catch (error) {
        console.error("转诊失败:", error);
        return { success: false, message: error.message || "转诊失败" };
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

    // 方法 - 下一位（优化版）
    const handleNext = async (docId, orgId, deptId) => {
      // 首次呼叫或无在诊患者 - 直接呼叫
      if (!visitPatient.value || isFirstCall.value) {
        if (patients.value.length > 0) {
          const nextPatient = patients.value[0];
          const result = await callPatient(docId, nextPatient);

          if (result.success) {
            visitPatient.value = nextPatient;
            isFirstCall.value = false; // 更新首次呼叫标记
          }

          return result;
        } else {
          return { success: false, message: "暂无候诊患者" };
        }
      }

      // 有在诊患者 - 显示分诊选择弹窗
      showNextDialog.value = true;

      await getDeptRoomList(docId);

      return { success: false, message: "请先处理当前在诊患者" };
    };

    // 方法 - 确认分诊
    const confirmAssign = async (docId, info, patient) => {
      if (info) {
        // 分配到诊室
        return await assignRoom(docId, info, patient);
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

    // 方法 - 打开患者详情弹窗
    const openDetailDialog = (patient) => {
      dialogPatient.value = patient;
      showDetailDialog.value = true;
    };

    // 方法 - 关闭患者详情弹窗
    const closeDetailDialog = () => {
      showDetailDialog.value = false;
      dialogPatient.value = null;
    };

    const setMqttHandler = (userId, orgCode) => {
      const topic = getOrgDocsStatusTopic(orgCode);
      console.log("setMqttHandler", userId, orgCode, topic);
      setHandler(topic, (topic, message) => {
        console.log("收到医生状态更新:", message);
        // 更新医生状态同步
        const data = message?.data;
        if (data?.doc) {
          if (userId === data.doc) {
            docStatus.value.end_count = data.end_count || 0;
            docStatus.value.pass_count = data.pass_count || 0;
            docStatus.value.wait_count = data.wait_count || 0;
          }
        }
      });
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
      showDetailDialog,
      dialogPatient,
      // 方法
      fetchPatients,
      setCurrentPatient,
      callPatient,
      recallPatient,
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
      openDetailDialog,
      closeDetailDialog,
      setMqttHandler,
    };
  },
  {
    persist: {
      key: "call-client-patient",
      paths: ["activeTab", "pageConfig", "isFirstCall"],
    },
  },
);

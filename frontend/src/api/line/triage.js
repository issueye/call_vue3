// 患者分诊相关 API
import { post, get } from "@/utils/request";

// 获取患者排队列表
export const apiPatLineList = (data) => {
  return post("/lime/api/triage/patient/line/list", data);
};

// 呼叫患者
export const apiPatCall = (data) => {
  return post("/lime/api/triage/patient/call", data);
};

// 患者过号
export const apiPatPass = (data) => {
  return post("/lime/api/triage/patient/pass", data);
};

// 患者结诊
export const apiPatEnd = (data) => {
  return post("/lime/api/triage/patient/end", data);
};

// 医生停诊
export const apiDocStop = (data) => {
  return post("/lime/api/triage/doctor/stop", data);
};

// 医生开诊
export const apiDocStart = (data) => {
  return post("/lime/api/triage/doctor/start", data);
};

// 获取可分配诊室列表
export const apiGetRoomList = (data) => {
  return post("/lime/api/triage/doctor/qryUntreated", data);
};

// 分配患者到其他诊室
export const apiAssignRoom = (data) => {
  return post("/lime/api/triage/patient/move", data);
};

// 获取当前医生在诊患者
export const apiDoctorVisitedPatient = (data) => {
  return post("/lime/api/triage/doctor/visitPat", data);
};

// 获取医生状态统计
export const apiGetDocStatus = (data) => {
  return post("/lime/api/triage/doctor/status", data);
};

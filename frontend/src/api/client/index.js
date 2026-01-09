// 客户端管理 API
import { post, get, put, del } from "@/utils/request";

// 获取客户端列表
export const apiGetClientList = (data) => {
  return post("/api/v1/s_admin/client_manage/list", data);
};

// 创建客户端
export const apiCreateClient = (data) => {
  return post("/api/v1/s_admin/client_manage/create", data);
};

// 更新客户端
export const apiUpdateClient = (id, data) => {
  return put(`/api/v1/s_admin/client_manage/update/${id}`, data);
};

// 更新关联信息
export const apiUpdateLink = (data) => {
  return put("/api/v1/s_admin/client_manage/update/link", data);
};

// 删除客户端
export const apiDeleteClient = (id) => {
  return del(`/api/v1/s_admin/client_manage/delete/${id}`);
};

// 检查设备是否注册
export const apiCheckDeviceReg = (id) => {
  return get(`/api/v1/s_admin/client_manage/check/${id}/1`);
};

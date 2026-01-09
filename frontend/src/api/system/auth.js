// 认证相关 API
import { post, get } from "@/utils/request";

// 登录
export const apiLogin = (data) => {
  return post("/api/v1/s_admin/auth/login", data);
};

// 退出登录
export const apiLogout = () => {
  return post("/api/v1/s_admin/auth/logout");
};

// 获取 MQTT 信息
export const apiGetMqttInfo = () => {
  return get("/api/v1/s_admin/common/mqtt");
};

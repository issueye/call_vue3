// 认证相关 API
import { post, get } from "@/utils/request";

// 登录
export const apiLogin = (data) => {
  return post("/lime/api/v1/auth/login", data);
};

// 退出登录
export const apiLogout = () => {
  return post("/lime/api/v1/auth/logout");
};

// 获取 MQTT 信息
export const apiGetMqttInfo = () => {
  return get("/lime/api/v1/common/mqtt");
};

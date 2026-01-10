// Axios 请求封装
import axios from "axios";
import { useUserStore } from "@/stores";

const baseUrl = "http://localhost:3000";

const service = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 不抛错的接口路径（返回完整响应）
const noThrowUrls = [
  "/client_manage/check", // 设备检查接口 (s_admin 路径)
  "/s_admin/client_manage/check", // 设备检查接口 (完整路径)
];

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();

    // 添加 Token
    if (userStore.limeToken) {
      // 避免重复添加 Bearer 前缀
      const token = userStore.limeToken.replace(/^Bearer\s+/i, "");
      config.headers.Authorization = token;
    }

    // 添加机构信息头
    if (userStore.org) {
      config.headers.orgid = userStore.org.org_id;
      config.headers.orgcode = userStore.org.org_code;
      // 注意：org_name 可能包含中文，ISO-8859-1 不支持， 先URL编码，然后进行base64编码
      config.headers.orgname = btoa(encodeURIComponent(userStore.org.org_name));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    console.log("res", res);
    const url = response.config.url || "";

    // 检查是否是不抛错的接口
    const isNoThrowUrl = noThrowUrls.some((u) => url.includes(u));

    // Blob 类型响应直接返回（用于文件下载）
    if (response.config.responseType === "blob") {
      return res;
    }

    // 成功响应
    // if (res.code === 200) {
    //   return res;
    // }

    // // 对于不抛错的接口，返回完整响应
    // if (isNoThrowUrl) {
    //   return res;
    // }

    // // 业务错误
    // return Promise.reject(new Error(res.message || res.error || "请求失败"));

    return res;
  },
  (error) => {
    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response;

      // 401 未授权 - Token 过期
      if (status === 401) {
        const userStore = useUserStore();
        // 清除用户信息并跳转到登录页
        userStore.clearUserInfo();
        userStore.setOrg(null);
        userStore.setRoom(null);
        userStore.setDeviceRegistered(false);
        userStore.clearDeviceError();
        // 使用动态导入避免循环依赖
        import("@/router").then(({ default: router }) => {
          router.push("/login");
        });
        return Promise.reject(new Error("登录已过期，请重新登录"));
      }

      // 其他错误
      return Promise.reject(new Error(data?.message || `请求失败 (${status})`));
    }

    // 网络错误
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("请求超时"));
    }

    console.log("error", error);

    return Promise.reject(new Error("网络连接失败"));
  },
);

export const get = (url, params, config) => {
  return service.get(url, { params, ...config });
};

export const post = (url, data, config) => {
  return service.post(url, data, config);
};

export const put = (url, data, config) => {
  return service.put(url, data, config);
};

export const del = (url, config) => {
  return service.delete(url, config);
};

/**
 * 更新 baseURL
 * @param {string} url - 新的基础URL
 */
export const updateBaseURL = (url) => {
  if (url && typeof url === "string") {
    service.defaults.baseURL = url;
  }
};

/**
 * 获取当前 baseURL
 */
export const getBaseURL = () => {
  return service.defaults.baseURL;
};

export default service;

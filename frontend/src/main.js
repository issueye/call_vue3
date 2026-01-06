import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import {
  apiLoadClientID,
  apiLoadForwardURL,
  apiSaveForwardURL,
  apiCheckDeviceReg,
} from "./api";

import "@/assets/css/main.css";

const app = createApp(App);

// 先注册 pinia
const pinia = createPinia();
app.use(pinia);

// 程序启动检查（需要等到 pinia 注册后才能使用 store）
const startupCheck = async () => {
  const { useUserStore } = await import("./stores");
  const userStore = useUserStore();

  // 1. 检查并设置客户端ID
  try {
    const clientRes = await apiLoadClientID();
    const clientId = clientRes?.data;
    if (clientId) {
      userStore.setClientID(clientId);
    } else if (!userStore.clientID) {
      // 生成新的客户端ID
      const newClientId = Math.random().toString(36).substring(2, 10);
      userStore.setClientID(newClientId);
    }
  } catch (error) {
    console.error("加载客户端ID失败:", error);
    if (!userStore.clientID) {
      const newClientId = Math.random().toString(36).substring(2, 10);
      userStore.setClientID(newClientId);
    }
  }

  // 2. 检查并设置服务器地址
  try {
    const urlRes = await apiLoadForwardURL();
    const savedUrl = urlRes?.data || urlRes?.data?.data;
    if (savedUrl) {
      await apiSaveForwardURL(savedUrl);
    }
  } catch (error) {
    console.error("检查服务器地址失败:", error);
  }

  // 3. 检查设备注册状态（仅在未登录时检查）
  // 如果已经有机构信息，说明已登录或已注册，跳过检查
  if (userStore.org?.org_id) {
    console.log("已有机构信息，跳过设备检查");
    return;
  }

  if (userStore.clientID) {
    try {
      const regRes = await apiCheckDeviceReg(userStore.clientID);
      console.log("apiCheckDeviceReg -> res", regRes);
      if (regRes) {
        // 保存设备信息到 Pinia store
        userStore.setDeviceInfo(regRes);
        userStore.setDeviceRegistered(true);
        userStore.clearDeviceError();
      } else {
        // 保存错误信息到 Pinia store
        const errorMsg = "设备检查失败";
        userStore.setDeviceError(errorMsg);
        userStore.setDeviceRegistered(false);
        // 不再弹 alert，由登录页面统一显示
      }
    } catch (error) {
      console.error("检查设备注册状态失败:", error);
    }
  }
};

// 在 pinia 注册后执行启动检查
startupCheck();

app.use(router);

app.mount("#app");

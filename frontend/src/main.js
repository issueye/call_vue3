import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./router";
import App from "./App.vue";
import { apiCheckDeviceReg } from "@/api";
import { updateBaseURL } from "@/utils/request";
import {
  SaveForwardURL,
  LoadForwardURL,
  LoadClientID,
} from "@/wails/wailsjs/go/main/App";
import { LogInfo } from "@/wails/wailsjs/runtime/runtime";
import Message from "@/utils/message";

import "@/assets/css/main.css";

const app = createApp(App);

// 先注册 pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

/**
 * 等待 Wails runtime 准备就绪
 */
const waitForWailsRuntime = async (maxWait = 3000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (window?.go?.main?.App) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
};

// 程序启动检查（需要等到 pinia 注册后才能使用 store）
const startupCheck = async () => {
  const { useUserStore } = await import("./stores");
  const userStore = useUserStore();

  // 等待 Wails runtime 准备就绪
  const isReady = await waitForWailsRuntime();
  if (!isReady) {
    console.warn("Wails runtime 未就绪，跳过启动检查");
    return;
  }

  // 1. 检查并设置客户端ID
  try {
    const clientRes = await LoadClientID();
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
    const urlRes = await LoadForwardURL();
    const savedUrl = urlRes?.data || urlRes?.data?.data;
    // console.log("save_url", savedUrl);
    LogInfo(`save_url: ${savedUrl}`);
    if (savedUrl) {
      await SaveForwardURL(savedUrl);

      // 更新请求基地址
      updateBaseURL(savedUrl);
    }
  } catch (error) {
    console.error("检查服务器地址失败:", error);
  }

  // 3. 检查设备注册状态（仅在未登录时检查）
  // 如果已经有机构信息，说明已登录或已注册，跳过检查
  // if (userStore.org?.org_id) {
  //   console.log("已有机构信息，跳过设备检查");
  //   return;
  // }

  try {
    // 清空绑定信息
    userStore.setOrg(null);
    userStore.setRoom(null);

    console.log("userStore.clientID", userStore.clientID);

    const { data, code, error } = await apiCheckDeviceReg(userStore.clientID);
    console.log("设备检查 ->", data);
    // Message.info(`设备检查 -> ${JSON.stringify(res)}`);
    if (code === 200) {
      // 保存设备信息到 Pinia store
      userStore.setDeviceInfo(data);
      userStore.setDeviceRegistered(true);
      userStore.clearDeviceError();
    } else {
      // 保存错误信息到 Pinia store
      const errorMsg = "设备检查失败";
      Message.info(error || errorMsg);
    }
  } catch (error) {
    console.error("检查设备注册状态失败:", error);
  }
};

// 在 pinia 注册后执行启动检查
startupCheck();

app.use(router);

app.mount("#app");

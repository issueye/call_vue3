import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { updateBaseURL } from "@/utils/request";
// Wails 绑定方法 - 由 wails dev 自动生成
import {
  LoadClientID,
  LoadForwardURL,
  SaveForwardURL,
  LoadLocaldata,
  SaveLocaldata,
  DeleteLocaldata,
  GetLocaldataList,
} from "@/wails/wailsjs/go/main/App";

export const useLocalStore = defineStore(
  "local",
  () => {
    // ========== 状态 ==========
    const clientID = ref(""); // 客户端ID
    const forwardURL = ref(""); // 服务器地址
    const localDataList = ref([]); // 本地数据列表
    const loading = ref(false); // 加载状态

    // ========== 计算属性 ==========
    const hasClientID = computed(() => !!clientID.value);
    const hasForwardURL = computed(() => !!forwardURL.value);

    // ========== 客户端ID相关方法 ==========
    /**
     * 加载客户端ID
     */
    const loadClientID = async () => {
      try {
        const res = await LoadClientID();
        if (res?.code === 200 && res?.data) {
          clientID.value = res.data;
          return res.data;
        }
        return null;
      } catch (error) {
        console.error("加载客户端ID失败:", error);
        throw error;
      }
    };

    /**
     * 设置客户端ID（本地状态）
     */
    const setClientID = (id) => {
      clientID.value = id;
    };

    // ========== 服务器地址相关方法 ==========
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

    /**
     * 加载保存的服务器地址
     */
    const loadForwardURL = async () => {
      try {
        // 等待 Wails runtime 准备就绪
        const isReady = await waitForWailsRuntime();
        if (!isReady) {
          console.warn("Wails runtime 未就绪，无法加载服务器地址");
          return null;
        }

        const res = await LoadForwardURL();
        if (res?.code === 200 && res?.data) {
          forwardURL.value = res.data;
          // 更新 axios baseURL
          updateBaseURL(res.data);
          return res.data;
        }
        return null;
      } catch (error) {
        console.error("加载服务器地址失败:", error);
        throw error;
      }
    };

    /**
     * 保存服务器地址
     * @param {string} url - 服务器地址
     */
    const saveForwardURL = async (url) => {
      try {
        const res = await SaveForwardURL(url);
        if (res?.code === 200) {
          forwardURL.value = url;
          // 更新 axios baseURL
          updateBaseURL(url);
          return res;
        }
        throw new Error(res?.message || "保存服务器地址失败");
      } catch (error) {
        console.error("保存服务器地址失败:", error);
        throw error;
      }
    };

    /**
     * 设置服务器地址（本地状态）
     */
    const setForwardURL = (url) => {
      forwardURL.value = url;
    };

    // ========== 本地数据相关方法 ==========
    /**
     * 加载本地数据
     * @param {string} id - 数据ID
     */
    const loadLocaldata = async (id) => {
      try {
        const res = await LoadLocaldata(id);
        if (res?.code === 200) {
          return res.data;
        }
        return null;
      } catch (error) {
        console.error(`加载本地数据失败 (${id}):`, error);
        throw error;
      }
    };

    /**
     * 保存本地数据
     * @param {object} data - 要保存的数据
     */
    const saveLocaldata = async (data) => {
      try {
        // data 格式: { id, type, data }
        const res = await SaveLocaldata(
          data.id,
          data.type || "default",
          data.data,
        );
        if (res?.code === 200) {
          return res;
        }
        throw new Error(res?.message || "保存本地数据失败");
      } catch (error) {
        console.error("保存本地数据失败:", error);
        throw error;
      }
    };

    /**
     * 删除本地数据
     * @param {string} id - 数据ID
     */
    const deleteLocaldata = async (id) => {
      try {
        const res = await DeleteLocaldata(id);
        if (res?.code === 200) {
          // 从列表中移除已删除的数据
          localDataList.value = localDataList.value.filter(
            (item) => item.id !== id,
          );
          return res;
        }
        throw new Error(res?.message || "删除本地数据失败");
      } catch (error) {
        console.error(`删除本地数据失败 (${id}):`, error);
        throw error;
      }
    };

    /**
     * 获取本地数据列表
     */
    const getLocaldataList = async () => {
      loading.value = true;
      try {
        const res = await GetLocaldataList();
        if (res?.code === 200) {
          localDataList.value = res.data || [];
          return localDataList.value;
        }
        return [];
      } catch (error) {
        console.error("获取本地数据列表失败:", error);
        throw error;
      } finally {
        loading.value = false;
      }
    };

    /**
     * 刷新本地数据列表
     */
    const refreshLocaldataList = () => {
      return getLocaldataList();
    };

    // ========== 通用方法 ==========
    /**
     * 清空所有状态
     */
    const clearAll = () => {
      clientID.value = "";
      forwardURL.value = "";
      localDataList.value = [];
    };

    /**
     * 初始化：加载所有本地配置
     */
    const init = async () => {
      try {
        await Promise.all([loadClientID(), loadForwardURL()]);
      } catch (error) {
        console.error("初始化本地数据失败:", error);
      }
    };

    return {
      // ========== 状态 ==========
      clientID,
      forwardURL,
      localDataList,
      loading,

      // ========== 计算属性 ==========
      hasClientID,
      hasForwardURL,

      // ========== 客户端ID方法 ==========
      loadClientID,
      setClientID,

      // ========== 服务器地址方法 ==========
      loadForwardURL,
      saveForwardURL,
      setForwardURL,

      // ========== 本地数据方法 ==========
      loadLocaldata,
      saveLocaldata,
      deleteLocaldata,
      getLocaldataList,
      refreshLocaldataList,

      // ========== 通用方法 ==========
      clearAll,
      init,
    };
  },
  {
    persist: {
      key: "call-client-local",
      paths: ["clientID", "forwardURL"],
    },
  },
);

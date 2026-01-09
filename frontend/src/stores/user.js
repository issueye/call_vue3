import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { apiLogin, apiLogout } from "@/api";
import { disconnect } from "@/mqtt";

export const useUserStore = defineStore(
  "user",
  () => {
    // ========== 设备状态 ==========
    const deviceError = ref(""); // 设备错误信息
    const deviceRegistered = ref(false); // 设备是否已注册

    // ========== 用户状态 ==========
    const limeToken = ref("");
    const clientID = ref("");
    // 机构信息
    const org = reactive({
      org_id: 0,
      org_code: "",
      org_name: "",
      dept_id: 0,
    });
    // 诊室信息
    const room = reactive({
      id: 0,
      description: "",
      name: "",
      dept_id: 0,
      room_type: 0,
      location: "",
      child_protection_room_type: 0,
    });
    // 用户信息
    const userInfo = reactive({
      id: 0,
      account: "",
      nick_name: "",
    });

    // ========== 计算属性 ==========
    const isLoggedIn = computed(() => !!limeToken.value);
    const hasOrgInfo = computed(() => !!org.org_id);
    const hasRoomInfo = computed(() => !!room.id);
    const hasDeviceError = computed(() => !!deviceError.value);

    // ========== 设备相关方法 ==========
    // 设置设备错误信息
    const setDeviceError = (error) => {
      deviceError.value = error || "";
    };

    // 清除设备错误信息
    const clearDeviceError = () => {
      deviceError.value = "";
    };

    // 设置设备注册状态
    const setDeviceRegistered = (registered) => {
      deviceRegistered.value = registered;
    };

    // 设置设备信息（机构+诊室）
    const setDeviceInfo = (data) => {
      if (data?.org) {
        org.org_id = data.org.org_id;
        org.org_code = data.org.org_code;
        org.org_name = data.org.org_name;
        org.dept_id = data.org.dept_id || 0;
      }
      if (data?.rooms && data.rooms.length > 0) {
        const r = data.rooms[0];
        // 兼容不同的字段命名：department_id 或 dept_id
        room.id = r.id;
        room.description = r.description || "";
        room.name = r.name || "";
        room.dept_id = r.department_id || r.dept_id || 0;
        room.room_type = r.room_type || 0;
        room.location = r.location || "";
        room.child_protection_room_type = r.child_protection_room_type || 0;
      } else if (data?.room) {
        // 兼容返回单个 room 对象的情况
        const r = data.room;
        room.id = r.id;
        room.description = r.description || "";
        room.name = r.name || "";
        room.dept_id = r.department_id || r.dept_id || 0;
        room.room_type = r.room_type || 0;
        room.location = r.location || "";
        room.child_protection_room_type = r.child_protection_room_type || 0;
      }
    };

    // ========== 用户相关方法 ==========
    // 方法 - 登录（保存登录返回的数据）
    const setLoginData = (data) => {
      // 处理 TOKEN
      limeToken.value = data.token;
      // 用户信息
      userInfo.id = data.id || 0;
      userInfo.account = data.account || "";
      userInfo.nick_name = data.nick_name || "";
    };

    // 方法 - 退出登录
    const logout = async () => {
      try {
        await apiLogout();
      } catch (e) {
        console.error("退出接口调用失败:", e);
      }
      // 断开 MQTT 连接
      disconnect();
      clearUserInfo();
      // 清理机构信息
      setOrg(null);
      setRoom(null);
      // 清理设备注册状态
      setDeviceRegistered(false);
      clearDeviceError();
      window.location.href = "/login";
    };

    // 方法 - 清空用户信息
    const clearUserInfo = () => {
      limeToken.value = "";
      userInfo.id = 0;
      userInfo.account = "";
      userInfo.nick_name = "";
    };

    // 方法 - 设置机构信息
    const setOrg = (orgInfo) => {
      if (orgInfo) {
        org.org_id = orgInfo.org_id;
        org.org_code = orgInfo.org_code;
        org.org_name = orgInfo.org_name;
        org.dept_id = orgInfo.dept_id;
      } else {
        org.org_id = 0;
        org.org_code = "";
        org.org_name = "";
        org.dept_id = 0;
      }
    };

    // 方法 - 设置诊室信息
    const setRoom = (roomInfo) => {
      if (roomInfo) {
        room.id = roomInfo.id;
        room.description = roomInfo.description;
        room.name = roomInfo.name;
        // 兼容 department_id 和 dept_id 两种字段名
        room.dept_id = roomInfo.department_id || roomInfo.dept_id;
        room.room_type = roomInfo.room_type;
        room.location = roomInfo.location;
        room.child_protection_room_type = roomInfo.child_protection_room_type;
      } else {
        room.id = 0;
        room.description = "";
        room.name = "";
        room.dept_id = 0;
        room.room_type = 0;
        room.location = "";
        room.child_protection_room_type = 0;
      }
    };

    // 方法 - 设置客户端ID
    const setClientID = (id) => {
      clientID.value = id;
    };

    // 初始化
    const init = async () => {
      if (limeToken.value) {
        try {
          // TODO: 获取用户信息
          // userInfo.value = await apiGetUserInfo()
        } catch (e) {
          console.error("获取用户信息失败:", e);
        }
      }
    };

    return {
      // ========== 设备状态 ==========
      deviceError,
      deviceRegistered,
      hasDeviceError,

      // ========== 用户状态 ==========
      limeToken,
      clientID,
      org,
      room,
      userInfo,
      // 计算属性
      isLoggedIn,
      hasOrgInfo,
      hasRoomInfo,
      // ========== 设备方法 ==========
      setDeviceError,
      clearDeviceError,
      setDeviceRegistered,
      setDeviceInfo,
      // ========== 用户方法 ==========
      setLoginData,
      logout,
      clearUserInfo,
      setOrg,
      setRoom,
      setClientID,
      init,
    };
  },
  {
    persist: {
      key: "call-client-user",
      paths: [
        "limeToken",
        "clientID",
        "org",
        "room",
        "deviceRegistered",
        "userInfo",
      ],
    },
  },
);

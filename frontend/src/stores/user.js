import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiLogin, apiLogout } from '@/api'
import CONSTANTS from '@/constants'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()

  // 状态
  const limeToken = ref(localStorage.getItem(CONSTANTS.LIMETOKEN_KEY))
  const clientID = ref(localStorage.getItem('client_id') || '')
  const org = ref(JSON.parse(localStorage.getItem('org') || 'null'))
  const room = ref(JSON.parse(localStorage.getItem('room') || 'null'))
  const userInfo = ref(null)

  // 计算属性
  const isLoggedIn = computed(() => !!limeToken.value)
  const hasOrgInfo = computed(() => !!org.value)
  const hasRoomInfo = computed(() => !!room.value)

  // 方法 - 登录
  const login = async (form) => {
    try {
      const res = await apiLogin(form)
      if (res) {
        limeToken.value = res.token || res.data?.token
        userInfo.value = res.user || res.data?.user
        localStorage.setItem(CONSTANTS.LIMETOKEN_KEY, limeToken.value)
        return { success: true }
      }
      return { success: false, message: '登录失败' }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 方法 - 退出登录
  const logout = async () => {
    try {
      await apiLogout()
    } catch (e) {
      console.error('退出接口调用失败:', e)
    }
    clearUserInfo()
    router.push('/login')
  }

  // 方法 - 清空用户信息
  const clearUserInfo = () => {
    limeToken.value = null
    userInfo.value = null
    localStorage.removeItem(CONSTANTS.LIMETOKEN_KEY)
  }

  // 方法 - 设置机构信息
  const setOrg = (orgInfo) => {
    org.value = orgInfo
    if (orgInfo) {
      localStorage.setItem('org', JSON.stringify(orgInfo))
    } else {
      localStorage.removeItem('org')
    }
  }

  // 方法 - 设置诊室信息
  const setRoom = (roomInfo) => {
    room.value = roomInfo
    if (roomInfo) {
      localStorage.setItem('room', JSON.stringify(roomInfo))
    } else {
      localStorage.removeItem('room')
    }
  }

  // 方法 - 设置客户端ID
  const setClientID = (id) => {
    clientID.value = id
    localStorage.setItem('client_id', id)
  }

  // 初始化
  const init = async () => {
    if (limeToken.value) {
      try {
        // TODO: 获取用户信息
        // userInfo.value = await apiGetUserInfo()
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    }
  }

  return {
    // 状态
    limeToken,
    clientID,
    org,
    room,
    userInfo,
    // 计算属性
    isLoggedIn,
    hasOrgInfo,
    hasRoomInfo,
    // 方法
    login,
    logout,
    clearUserInfo,
    setOrg,
    setRoom,
    setClientID,
    init
  }
})

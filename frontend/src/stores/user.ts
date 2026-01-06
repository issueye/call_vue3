import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || user.value?.username || '')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (userInfo: User) => {
    user.value = userInfo
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const initUser = async () => {
    if (token.value) {
      // TODO: 获取用户信息
      // user.value = await fetchUserInfo()
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    userName,
    setToken,
    setUser,
    logout,
    initUser
  }
})

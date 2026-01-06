// 认证相关 API
import { post, get } from '@/utils/request'

// 登录
export const apiLogin = (data) => {
  return post('/auth/login', data)
}

// 退出登录
export const apiLogout = () => {
  return post('/auth/logout')
}

// 获取 MQTT 信息
export const apiGetMqttInfo = () => {
  return get('/common/mqtt')
}

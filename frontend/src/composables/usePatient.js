// 患者相关工具函数
import { computed } from 'vue'

// 患者状态映射
export const patientStatusMap = {
  0: { title: '接诊中', color: 'blue' },
  1: { title: '优先', color: 'green' },
  2: { title: '候诊中', color: 'cyan' },
  3: { title: '复诊', color: 'orange' },
  4: { title: '过号', color: 'red' },
  99: { title: '结诊', color: 'yellow' }
}

// 获取患者状态信息
export const getPatientStatus = (status) => {
  return patientStatusMap[status] || patientStatusMap[2]
}

// 获取姓名首字母
export const getPatientInitial = (name) => {
  if (!name) return ''
  return name.charAt(0).toUpperCase()
}

// 格式化时间
export const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 格式化日期时间
export const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化年龄
export const formatAge = (age, birthDate) => {
  if (age) return age
  if (birthDate) {
    const year = new Date(birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    return currentYear - year
  }
  return '-'
}

// 性别映射
export const genderMap = {
  1: { label: '男', text: '男' },
  0: { label: '女', text: '女' }
}

export const getGenderLabel = (gender) => {
  return genderMap[gender]?.label || '-'
}

// 格式化排队号
export const formatQueueNo = (no) => {
  return no || '-'
}

// 患者状态 CSS 类名映射
export const statusClassMap = {
  0: 'status-calling',
  1: 'status-priority',
  2: 'status-waiting',
  3: 'status-revisit',
  4: 'status-passed',
  99: 'status-called'
}

export const getStatusClass = (status) => {
  return statusClassMap[status] || 'status-waiting'
}

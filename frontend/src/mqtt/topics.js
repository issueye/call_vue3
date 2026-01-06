// MQTT 主题配置

// 主题定义
export const MQTT_DOC_STATUS_SYNC = 'M/TRANSFER/DOC_STATUS_SYNC'
export const MQTT_ORG_DOCS_STATUS_SYNC = 'M/TRANSFER/ORG_DOCS_STATUS_SYNC'
export const MQTT_PATIENT_UPDATE = 'M/TRANSFER/PATIENT_UPDATE'

// 主题前缀
const TOPIC_PREFIX = 'M/TRANSFER'

// 获取医生状态同步主题
export const getDocStatusTopic = (orgCode, docId) => {
  return `${TOPIC_PREFIX}/DOC_STATUS/${orgCode}/${docId}`
}

// 获取机构医生状态同步主题
export const getOrgDocsStatusTopic = (orgCode) => {
  return `${TOPIC_PREFIX}/ORG_DOCS_STATUS/${orgCode}`
}

// 获取患者更新主题
export const getPatientUpdateTopic = (orgCode, deptId) => {
  return `${TOPIC_PREFIX}/PATIENT_UPDATE/${orgCode}/${deptId}`
}

// 订阅单个医生状态
export const subDoctorStatus = (orgCode, docId) => {
  return `${TOPIC_PREFIX}/DOC_STATUS/${orgCode}/${docId}`
}

// 订阅机构下所有医生状态
export const subOrgDocsStatus = (orgCode) => {
  return `${TOPIC_PREFIX}/ORG_DOCS_STATUS/${orgCode}`
}

// 订阅患者更新
export const subPatientUpdate = (orgCode, deptId) => {
  return `${TOPIC_PREFIX}/PATIENT_UPDATE/${orgCode}/${deptId}`
}

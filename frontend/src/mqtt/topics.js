// MQTT 主题配置
// 遵循 vue3(old) 的主题命名规范，使用冒号(:)作为分隔符

// 主题定义
export const MQTT_ORG_DOCS_STATUS_SYNC = "M/TRANSFER/ORG_DOCS_STATUS_SYNC";

// 主题前缀
const TOPIC_PREFIX = "M/TRANSFER";

// ==================== 主题生成函数 ====================

/**
 * 获取机构医生状态同步主题
 * 格式: M:TRANSFER:ORG_DOCS_STATUS_SYNC:orgCode
 * @param {string} orgCode - 机构代码
 * @returns {string} 主题字符串
 */
export const getOrgDocsStatusTopic = (orgCode) => {
  return `${MQTT_ORG_DOCS_STATUS_SYNC}/${orgCode}`;
};

// ==================== 订阅函数 ====================
/**
 * 订阅机构下所有医生状态
 * @param {string} orgCode - 机构代码
 * @returns {string} 主题字符串
 */
export const subOrgDocsStatus = (orgCode) => {
  return getOrgDocsStatusTopic(orgCode);
};

/**
 * 取消订阅机构医生状态
 * @param {string} orgCode - 机构代码
 * @returns {string} 主题字符串
 */
export const unsubOrgDocsStatus = (orgCode) => {
  return getOrgDocsStatusTopic(orgCode);
};

/**
 * 订阅患者更新
 * @param {string} orgCode - 机构代码
 * @param {string} deptId - 科室ID
 * @returns {string} 主题字符串
 */
export const subPatientUpdate = (orgCode, deptId) => {
  return getPatientUpdateTopic(orgCode, deptId);
};

/**
 * 取消订阅患者更新
 * @param {string} orgCode - 机构代码
 * @param {string} deptId - 科室ID
 * @returns {string} 主题字符串
 */
export const unsubPatientUpdate = (orgCode, deptId) => {
  return getPatientUpdateTopic(orgCode, deptId);
};

// ==================== 便捷方法 ====================

/**
 * 解析主题获取参数
 * @param {string} topic - MQTT 主题
 * @returns {object} 解析后的参数
 */
export const parseTopic = (topic) => {
  const parts = topic.split(":");
  return {
    prefix: parts[0],
    module: parts[1],
    action: parts[2],
    orgCode: parts[3],
    deptId: parts[4],
    docId: parts[5],
  };
};

/**
 * 根据主题类型获取名称
 * @param {string} topic - MQTT 主题
 * @returns {string} 主题类型名称
 */
export const getTopicType = (topic) => {
  if (topic.includes("DOC_STATUS_SYNC")) return "医生状态同步";
  if (topic.includes("ORG_DOCS_STATUS_SYNC")) return "机构医生状态";
  if (topic.includes("PATIENT_UPDATE")) return "患者更新";
  return "未知";
};

// 本地数据 API
import request from '@/utils/request'
import CONSTANTS from '@/constants'

const LOCAL_API_URL = CONSTANTS.LOCAL_API_URL

/**
 * 加载客户端ID
 * @returns
 */
export const apiLoadClientID = () => {
  return request.get(`${LOCAL_API_URL}/localdata/load?id=client_id`)
}

/**
 * 加载保存的服务器地址
 * @returns
 */
export const apiLoadForwardURL = () => {
  return request.get(`${LOCAL_API_URL}/localdata/load?id=forward_url`)
}

/**
 * 保存服务器地址
 * @param {string} url - 服务器地址
 * @returns
 */
export const apiSaveForwardURL = (url) => {
  return request.post(`${LOCAL_API_URL}/common/set_forward_url`, {
    data: url,
  })
}

/**
 * 加载本地数据
 * @param {string} id - 数据ID
 * @returns
 */
export const apiLoadLocaldata = (id) => {
  return request.get(`${LOCAL_API_URL}/localdata/load?id=${id}`)
}

/**
 * 保存本地数据
 * @param {object} data - 要保存的数据
 * @returns
 */
export const apiSaveLocaldata = (data) => {
  return request.post(`${LOCAL_API_URL}/localdata/save`, data)
}

/**
 * 删除本地数据
 * @param {string} id - 数据ID
 * @returns
 */
export const apiDeleteLocaldata = (id) => {
  return request.delete(`${LOCAL_API_URL}/localdata/delete?id=${id}`)
}

/**
 * 获取本地数据列表
 * @returns
 */
export const apiGetLocaldataList = () => {
  return request.get(`${LOCAL_API_URL}/localdata/list`)
}

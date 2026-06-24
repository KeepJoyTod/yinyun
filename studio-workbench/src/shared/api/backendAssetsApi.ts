import { apiRequestRaw, getApiAssetUrl } from './request'
import type { OssVo } from './yingyueAdapter'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type OssUploadData = {
  ossId?: string | number
  fileName?: string
  url?: string
}

const resolveOssById = async (ossId: string | number, fallbackUrl?: string) => {
  const response = await apiRequestRaw<RuoyiResponse<OssVo[]>>(`/resource/oss/listByIds/${ossId}`)
  const oss = response.data?.[0]
  if (!oss?.fileName) {
    throw new Error('OSS Key 获取失败，请检查 system:oss:query 权限或 OSS 记录')
  }
  return {
    ...oss,
    url: oss.url || fallbackUrl,
  }
}

export const assetsApi = {
  async uploadOssFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const uploadResponse = await apiRequestRaw<RuoyiResponse<OssUploadData>>('/resource/oss/upload', {
      method: 'POST',
      headers: { repeatSubmit: 'false' },
      body: formData,
    })
    const currentOssId = uploadResponse.data?.ossId
    if (!currentOssId) {
      throw new Error(uploadResponse.msg || 'OSS 上传失败：未返回 ossId')
    }
    const oss = await resolveOssById(currentOssId, uploadResponse.data?.url)
    return oss.url || uploadResponse.data?.url || getApiAssetUrl(`/resource/oss/${currentOssId}`)
  },
}

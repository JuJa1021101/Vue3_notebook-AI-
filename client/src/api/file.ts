import request from '@/utils/request';

/**
 * 上传单个图片
 */
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  return request({
    url: '/files/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 上传多个图片
 */
export const uploadMultipleImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  return request({
    url: '/files/upload-multiple',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 上传附件（支持所有文件类型）
 */
export const uploadAttachment = (file: File, noteId?: number) => {
  const formData = new FormData();
  formData.append('file', file);
  if (noteId) {
    formData.append('note_id', noteId.toString());
  }

  return request({
    url: '/files/upload-attachment',
    method: 'POST',
    data: formData,
    timeout: 60000, // 60秒超时，适合大文件上传
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 批量上传附件
 */
export const uploadMultipleAttachments = (files: File[], noteId?: number) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  if (noteId) {
    formData.append('note_id', noteId.toString());
  }

  return request({
    url: '/files/upload-attachments',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取文件列表
 */
export const getFiles = (params?: {
  page?: number;
  limit?: number;
  mime_type?: string;
  file_type?: string;
  note_id?: number;
}) => {
  return request({
    url: '/files',
    method: 'GET',
    params
  });
};

/**
 * 获取笔记的附件列表
 */
export const getNoteAttachments = (noteId: number) => {
  return request({
    url: '/files',
    method: 'GET',
    params: {
      note_id: noteId,
      limit: 100 // 获取所有附件
    }
  });
};

/**
 * 获取文件详情
 */
export const getFileById = (id: number) => {
  return request({
    url: `/files/${id}`,
    method: 'GET'
  });
};

/**
 * 删除文件
 */
export const deleteFile = (id: number) => {
  return request({
    url: `/files/${id}`,
    method: 'DELETE'
  });
};

/**
 * 批量删除文件
 */
export const deleteMultipleFiles = (fileIds: number[]) => {
  return request({
    url: '/files/delete-multiple',
    method: 'POST',
    data: { file_ids: fileIds }
  });
};

/**
 * 获取存储统计
 */
export const getStorageStats = () => {
  return request({
    url: '/files/stats',
    method: 'GET'
  });
};

import { uploadImage, uploadAttachment } from '@/api/file';
import { toast } from '@/utils/toast';

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  [FileType.IMAGE]: 10 * 1024 * 1024,      // 10MB
  [FileType.VIDEO]: 100 * 1024 * 1024,     // 100MB
  [FileType.AUDIO]: 20 * 1024 * 1024,      // 20MB
  [FileType.DOCUMENT]: 50 * 1024 * 1024,   // 50MB
  [FileType.ARCHIVE]: 50 * 1024 * 1024,    // 50MB
  [FileType.OTHER]: 50 * 1024 * 1024       // 50MB
};

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

/**
 * 判断文件类型
 */
export const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) return FileType.IMAGE;
  if (mimeType.startsWith('video/')) return FileType.VIDEO;
  if (mimeType.startsWith('audio/')) return FileType.AUDIO;

  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/csv'
  ];

  if (documentTypes.includes(mimeType)) return FileType.DOCUMENT;

  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];

  if (archiveTypes.includes(mimeType)) return FileType.ARCHIVE;

  return FileType.OTHER;
};

/**
 * 验证文件大小
 */
export const validateFileSize = (file: File): boolean => {
  const fileType = getFileType(file.type);
  const maxSize = FILE_SIZE_LIMITS[fileType];

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    toast.error(`文件大小不能超过 ${maxSizeMB}MB`);
    return false;
  }

  return true;
};

/**
 * 验证图片类型
 */
export const validateImageType = (file: File): boolean => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    toast.error('不支持的图片格式，请选择 JPG、PNG、GIF、WebP 或 SVG 格式');
    return false;
  }
  return true;
};

/**
 * 上传图片文件到服务器
 * @param file 图片文件
 * @returns 图片 URL
 */
export const uploadImageFile = async (file: File): Promise<string> => {
  // 验证文件类型
  if (!validateImageType(file)) {
    throw new Error('不支持的图片格式');
  }

  // 验证文件大小
  if (!validateFileSize(file)) {
    throw new Error('文件大小超过限制');
  }

  try {
    toast.info('正在上传图片...');

    const response = await uploadImage(file);

    if (response.data.success) {
      const fileData = response.data.data;
      toast.success('图片上传成功');
      return fileData.url;
    } else {
      throw new Error(response.data.message || '图片上传失败');
    }
  } catch (error: any) {
    console.error('图片上传失败:', error);
    const errorMsg = error.response?.data?.message || error.message || '图片上传失败';
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * 上传附件文件到服务器
 * @param file 附件文件
 * @param noteId 笔记ID（可选）
 * @returns 文件信息
 */
export const uploadAttachmentFile = async (file: File, noteId?: number) => {
  // 验证文件大小
  if (!validateFileSize(file)) {
    throw new Error('文件大小超过限制');
  }

  try {
    toast.info('正在上传附件...');

    const response = await uploadAttachment(file, noteId);

    if (response.data.success) {
      const fileData = response.data.data;
      toast.success('附件上传成功');
      return fileData;
    } else {
      throw new Error(response.data.message || '附件上传失败');
    }
  } catch (error: any) {
    console.error('附件上传失败:', error);
    const errorMsg = error.response?.data?.message || error.message || '附件上传失败';
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
};

/**
 * 获取文件图标类名
 */
export const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    // 图片
    jpg: 'fa-file-image',
    jpeg: 'fa-file-image',
    png: 'fa-file-image',
    gif: 'fa-file-image',
    webp: 'fa-file-image',
    svg: 'fa-file-image',

    // 视频
    mp4: 'fa-file-video',
    avi: 'fa-file-video',
    mov: 'fa-file-video',
    mkv: 'fa-file-video',

    // 音频
    mp3: 'fa-file-audio',
    wav: 'fa-file-audio',
    flac: 'fa-file-audio',

    // 文档
    pdf: 'fa-file-pdf',
    doc: 'fa-file-word',
    docx: 'fa-file-word',
    xls: 'fa-file-excel',
    xlsx: 'fa-file-excel',
    ppt: 'fa-file-powerpoint',
    pptx: 'fa-file-powerpoint',
    txt: 'fa-file-alt',
    md: 'fa-file-alt',

    // 压缩包
    zip: 'fa-file-archive',
    rar: 'fa-file-archive',
    '7z': 'fa-file-archive'
  };

  return iconMap[ext || ''] || 'fa-file';
};

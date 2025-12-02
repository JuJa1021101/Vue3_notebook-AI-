import request from '@/utils/request';

/**
 * 更新用户资料
 */
export const updateUserProfile = (data: { nickname?: string; avatar?: string }) => {
  return request({
    url: '/auth/profile',
    method: 'PUT',
    data
  });
};

/**
 * 更新用户密码
 */
export const updateUserPassword = (data: { oldPassword: string; newPassword: string }) => {
  return request({
    url: '/auth/password',
    method: 'PUT',
    data
  });
};

/**
 * 上传头像
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return request({
    url: '/auth/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取用户信息
 */
export const getUserProfile = () => {
  return request({
    url: '/auth/profile',
    method: 'GET'
  });
};

/**
 * 更新用户订阅
 */
export const updateUserSubscription = (tier: string) => {
  return request({
    url: '/auth/subscription',
    method: 'PUT',
    data: { tier }
  });
};

/**
 * 获取用户存储空间信息
 */
export const getStorageInfo = () => {
  return request({
    url: '/auth/storage',
    method: 'GET'
  });
};

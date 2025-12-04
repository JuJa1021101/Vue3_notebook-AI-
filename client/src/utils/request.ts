import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 90000, // 90秒超时，与后端AI服务保持一致
  headers: {
    'Content-Type': 'application/json'
  }
})

// 敏感字段列表（不在日志中显示）
const SENSITIVE_FIELDS = ['password', 'oldPassword', 'newPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken']

// 过滤敏感信息的函数
const filterSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data
  }

  // 如果是 FormData，不打印详细内容
  if (data instanceof FormData) {
    return '[FormData]'
  }

  // 深拷贝对象以避免修改原始数据
  const filtered = Array.isArray(data) ? [...data] : { ...data }

  // 遍历对象属性
  for (const key in filtered) {
    if (SENSITIVE_FIELDS.includes(key)) {
      // 敏感字段用 *** 替换
      filtered[key] = '***'
    } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
      // 递归处理嵌套对象
      filtered[key] = filterSensitiveData(filtered[key])
    }
  }

  return filtered
}

// 刷新Token的函数
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const refreshToken = async (): Promise<string> => {
  try {
    const response = await axios.post('/api/auth/refresh', {}, {
      // 不使用request实例，避免无限循环
      timeout: 10000
    });
    
    if (response.data.code === 200 && response.data.data?.accessToken) {
      const newAccessToken = response.data.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } else {
      throw new Error('刷新令牌失败');
    }
  } catch (error) {
    // 刷新失败，清除本地存储并跳转到登录页
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    throw error;
  }
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取accessToken
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // 如果是 FormData，删除 Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // 调试：打印请求信息（过滤敏感数据）
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    if (!(config.data instanceof FormData)) {
      console.log('请求数据:', filterSensitiveData(config.data))
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // 如果是文本响应（如代理文件内容），直接返回
    if (response.config.responseType === 'text' || typeof response.data === 'string') {
      return response
    }

    const res = response.data

    // 如果响应成功
    if (res.code === 200 || res.code === 201 || res.success === true) {
      return response
    }

    // 处理业务错误
    console.error('业务错误:', res.message)
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  async (error: AxiosError) => {
    console.error('响应错误:', error.message)
    console.error('错误详情:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    })

    const originalRequest = error.config as any;
    
    // 处理401未授权 - 自动刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message || '';
      
      // 只有在 token 无效或过期时才处理
      if (errorMessage.includes('token') || errorMessage.includes('认证') || errorMessage.includes('登录')) {
        // 标记请求已重试，避免无限循环
        originalRequest._retry = true;
        
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // 刷新token
            const newAccessToken = await refreshToken();
            
            // 更新所有等待中的请求
            notifyRefreshSubscribers(newAccessToken);
            
            // 重试原始请求
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return request(originalRequest);
          } catch (refreshError) {
            console.error('刷新token失败:', refreshError);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // 正在刷新token，将请求加入队列
          return new Promise((resolve) => {
            addRefreshSubscriber((newAccessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              resolve(request(originalRequest));
            });
          });
        }
      }
    }

    // 提取错误信息
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request

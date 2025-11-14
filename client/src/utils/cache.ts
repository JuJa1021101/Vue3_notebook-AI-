/**
 * 前端缓存工具
 * 减少不必要的 API 请求
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>

  constructor() {
    this.cache = new Map()
  }

  /**
   * 设置缓存
   * @param key - 缓存键
   * @param data - 缓存数据
   * @param expiresIn - 过期时间（毫秒），默认 5 分钟
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    })
  }

  /**
   * 获取缓存
   * @param key - 缓存键
   * @returns 缓存数据或 null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * 检查缓存是否存在且未过期
   * @param key - 缓存键
   * @returns 是否有效
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 删除缓存
   * @param key - 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiresIn) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

// 创建全局缓存实例
const cache = new CacheManager()

// 定期清理过期缓存（每 10 分钟）
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)

/**
 * 缓存装饰器工厂
 * @param key - 缓存键
 * @param expiresIn - 过期时间（毫秒）
 */
export function cached<T>(key: string, expiresIn?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // 生成带参数的缓存键
      const cacheKey = `${key}:${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cachedData = cache.get<T>(cacheKey)
      if (cachedData !== null) {
        console.log(`[Cache] 命中缓存: ${cacheKey}`)
        return cachedData
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 存入缓存
      cache.set(cacheKey, result, expiresIn)
      console.log(`[Cache] 存入缓存: ${cacheKey}`)

      return result
    }

    return descriptor
  }
}

export default cache

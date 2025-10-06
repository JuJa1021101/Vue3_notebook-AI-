const Joi = require('joi');

// 用户注册验证规则
const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'string.min': '用户名至少需要3个字符',
      'string.max': '用户名不能超过50个字符',
      'any.required': '用户名是必填项'
    }),
  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'string.max': '邮箱地址不能超过100个字符',
      'any.required': '邮箱是必填项'
    }),
  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.min': '密码至少需要6个字符',
      'string.max': '密码不能超过20个字符',
      'any.required': '密码是必填项'
    }),
  nickname: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': '昵称至少需要1个字符',
      'string.max': '昵称不能超过50个字符'
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': '请输入有效的手机号码'
    }),
  confirmPassword: Joi.string()
    .optional()
    .allow('')
}).unknown(true); // 允许其他未定义的字段

// 用户登录验证规则
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': '用户名或邮箱是必填项'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码是必填项'
    })
});

// 分类创建验证规则
const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': '分类名称至少需要1个字符',
      'string.max': '分类名称不能超过50个字符',
      'any.required': '分类名称是必填项'
    }),
  icon: Joi.string()
    .max(50)
    .optional()
    .default('folder')
    .messages({
      'string.max': '图标名称不能超过50个字符'
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default('#667eea')
    .messages({
      'string.pattern.base': '颜色必须是有效的十六进制颜色代码（如：#667eea）'
    })
});

// 分类更新验证规则
const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': '分类名称至少需要1个字符',
      'string.max': '分类名称不能超过50个字符'
    }),
  icon: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': '图标名称不能超过50个字符'
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': '颜色必须是有效的十六进制颜色代码（如：#667eea）'
    })
});

// 验证函数
const validateRegister = (data) => {
  return registerSchema.validate(data, { abortEarly: false });
};

const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};

// 通用验证中间件
const validate = (schema) => {
  return async (ctx, next) => {
    const { error } = schema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => detail.message);
      ctx.status = 400;
      ctx.body = {
        code: 400,
        success: false,
        message: '数据验证失败',
        errors
      };
      return;
    }
    return next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  createCategorySchema,
  updateCategorySchema,
  validateRegister,
  validateLogin,
  validate
};
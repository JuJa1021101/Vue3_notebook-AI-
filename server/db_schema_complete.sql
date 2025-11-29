-- ============================================
-- 个人笔记系统 - 完整数据库架构
-- 版本: 2.0
-- 更新时间: 2025-11-27
-- 说明: 包含所有表结构的完整定义，已整合所有历史修改
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  
  -- 用户等级和订阅相关字段（高优先级）
  `tier` VARCHAR(20) DEFAULT 'free' COMMENT '用户等级: free/basic/pro/enterprise',
  `is_subscribed` TINYINT(1) DEFAULT 0 COMMENT '是否订阅: 0-未订阅, 1-已订阅',
  `subscription_expiry` DATETIME DEFAULT NULL COMMENT '订阅过期时间',
  
  -- 用户状态和活动相关字段（高优先级）
  `last_login_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  `login_count` INT DEFAULT 0 COMMENT '登录次数统计',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '账号是否激活: 0-未激活, 1-已激活',
  
  -- 用户资料扩展字段（中优先级）
  `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '所在地',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_tier` (`tier`),
  INDEX `idx_subscription` (`is_subscribed`, `subscription_expiry`),
  INDEX `idx_last_login` (`last_login_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 分类表 (categories)
-- ============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(50) DEFAULT 'folder' COMMENT '分类图标',
  `color` VARCHAR(7) DEFAULT '#667eea' COMMENT '分类颜色',
  
  -- 分类扩展字段（中优先级）
  `description` VARCHAR(500) DEFAULT NULL COMMENT '分类描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序，数字越小越靠前',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否为默认分类: 0-否, 1-是',
  `note_count` INT DEFAULT 0 COMMENT '笔记数量（冗余字段，提高查询性能）',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ============================================
-- 3. 笔记表 (notes)
-- ============================================
DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '笔记ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `title` VARCHAR(200) NOT NULL COMMENT '笔记标题',
  `content` LONGTEXT DEFAULT NULL COMMENT '笔记内容（富文本HTML）',
  `content_text` LONGTEXT DEFAULT NULL COMMENT '纯文本内容，用于搜索',
  `thumbnail_url` VARCHAR(255) DEFAULT NULL COMMENT '缩略图URL',
  
  -- 笔记状态字段（高优先级）
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否软删除: 0-否, 1-是',
  `is_favorited` TINYINT(1) DEFAULT 0 COMMENT '是否收藏/标星: 0-否, 1-是',
  `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶: 0-否, 1-是',
  
  -- 笔记统计字段（高优先级）
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `word_count` INT DEFAULT 0 COMMENT '字数统计',
  `last_viewed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后查看时间',
  
  -- 笔记隐私和分享字段（中优先级）
  `visibility` ENUM('private', 'public', 'shared') DEFAULT 'private' COMMENT '可见性: private-私密, public-公开, shared-分享',
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '优先级: low-低, normal-普通, high-高, urgent-紧急',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态: draft-草稿, published-已发布, archived-已归档',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_is_deleted` (`is_deleted`),
  INDEX `idx_is_favorited` (`is_favorited`),
  INDEX `idx_is_pinned` (`is_pinned`),
  INDEX `idx_visibility` (`visibility`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_status` (`status`),
  FULLTEXT INDEX `idx_search` (`title`, `content_text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记表';

-- ============================================
-- 4. 标签表 (tags)
-- ============================================
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  
  -- 标签扩展字段（中优先级）
  `color` VARCHAR(7) DEFAULT '#3b82f6' COMMENT '标签颜色',
  `use_count` INT DEFAULT 0 COMMENT '使用次数统计',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '标签描述',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_tag` (`user_id`, `name`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_use_count` (`use_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================
-- 5. 笔记标签关联表 (note_tags)
-- ============================================
DROP TABLE IF EXISTS `note_tags`;
CREATE TABLE `note_tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
  `note_id` INT NOT NULL COMMENT '笔记ID',
  `tag_id` INT NOT NULL COMMENT '标签ID',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键和索引
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_note_tag` (`note_id`, `tag_id`),
  INDEX `idx_note_id` (`note_id`),
  INDEX `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记标签关联表';

-- ============================================
-- 6. 文件表 (files)
-- ============================================
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `note_id` INT DEFAULT NULL COMMENT '关联的笔记ID',
  
  -- 文件基本信息
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `filename` VARCHAR(255) NOT NULL COMMENT '存储文件名',
  `file_path` VARCHAR(1000) NOT NULL COMMENT '文件路径或OSS URL',
  `file_size` INT NOT NULL COMMENT '文件大小（字节）',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  
  -- 文件分类和存储信息
  `file_type` VARCHAR(20) DEFAULT 'other' COMMENT '文件类型分类: image/document/video/audio/other',
  `storage_mode` VARCHAR(20) DEFAULT 'local' COMMENT '存储模式: local-本地存储, oss-对象存储',
  
  -- 文件扩展信息（中优先级）
  `description` VARCHAR(500) DEFAULT NULL COMMENT '文件描述',
  `download_count` INT DEFAULT 0 COMMENT '下载次数',
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开: 0-私密, 1-公开',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_note_id` (`note_id`),
  INDEX `idx_file_type` (`file_type`),
  INDEX `idx_storage_mode` (`storage_mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- ============================================
-- 7. AI设置表 (ai_settings)
-- ============================================
DROP TABLE IF EXISTS `ai_settings`;
CREATE TABLE `ai_settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '设置ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  
  -- AI服务配置
  `provider` VARCHAR(50) NOT NULL DEFAULT 'siliconflow' COMMENT 'AI服务商',
  `model` VARCHAR(100) DEFAULT 'Qwen/Qwen2.5-7B-Instruct' COMMENT 'AI模型',
  
  -- AI默认参数
  `default_length` ENUM('short', 'medium', 'long') DEFAULT 'medium' COMMENT '默认续写长度',
  `default_style` ENUM('formal', 'casual', 'professional', 'creative') DEFAULT 'professional' COMMENT '默认写作风格',
  `default_language` ENUM('zh', 'en') DEFAULT 'zh' COMMENT '默认语言',
  `stream_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用流式输出: 0-否, 1-是',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user` (`user_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI设置表';

-- ============================================
-- 8. AI使用记录表 (ai_usage_logs)
-- ============================================
DROP TABLE IF EXISTS `ai_usage_logs`;
CREATE TABLE `ai_usage_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `note_id` INT DEFAULT NULL COMMENT '笔记ID',
  
  -- AI操作信息
  `action` ENUM('continue', 'format', 'beautify', 'polish', 'summarize', 'expand') NOT NULL COMMENT 'AI操作类型',
  `input_length` INT UNSIGNED DEFAULT NULL COMMENT '输入文本长度',
  `output_length` INT UNSIGNED DEFAULT NULL COMMENT '输出文本长度',
  `tokens_used` INT UNSIGNED DEFAULT NULL COMMENT '使用的token数',
  `cost` DECIMAL(10, 6) DEFAULT NULL COMMENT '本次调用成本',
  
  -- AI服务信息
  `provider` VARCHAR(50) DEFAULT NULL COMMENT 'AI服务商',
  `model` VARCHAR(100) DEFAULT NULL COMMENT '使用的模型',
  
  -- 执行结果
  `success` TINYINT(1) DEFAULT 1 COMMENT '是否成功: 0-失败, 1-成功',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `processing_time` INT UNSIGNED DEFAULT NULL COMMENT '处理时间（毫秒）',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_created` (`user_id`, `created_at`),
  INDEX `idx_action` (`action`),
  INDEX `idx_success` (`success`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用记录表';

-- ============================================
-- 9. AI操作历史表 (ai_history)
-- ============================================
DROP TABLE IF EXISTS `ai_history`;
CREATE TABLE `ai_history` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '历史ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `note_id` INT DEFAULT NULL COMMENT '笔记ID',
  
  -- AI操作信息
  `action` ENUM('continue', 'format', 'beautify', 'polish', 'summarize', 'expand') NOT NULL COMMENT 'AI操作类型',
  `original_content` MEDIUMTEXT DEFAULT NULL COMMENT '原始内容',
  `result_content` MEDIUMTEXT DEFAULT NULL COMMENT 'AI生成的结果',
  `options` JSON DEFAULT NULL COMMENT '操作选项（length, style等）',
  
  -- 操作状态
  `accepted` TINYINT(1) DEFAULT 0 COMMENT '用户是否接受: 0-未接受, 1-已接受',
  `tokens_used` INT UNSIGNED DEFAULT NULL COMMENT '使用的token数',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT '过期时间（用于自动清理）',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_note` (`user_id`, `note_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_expires_at` (`expires_at`),
  INDEX `idx_accepted` (`accepted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI操作历史表';

-- ============================================
-- 10. AI请求限流表 (ai_rate_limits)
-- ============================================
DROP TABLE IF EXISTS `ai_rate_limits`;
CREATE TABLE `ai_rate_limits` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '限流ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `request_date` DATE NOT NULL COMMENT '请求日期',
  
  -- 限流计数
  `hourly_count` INT UNSIGNED DEFAULT 0 COMMENT '当前小时请求次数',
  `daily_count` INT UNSIGNED DEFAULT 0 COMMENT '当天请求次数',
  
  -- 时间戳
  `last_request_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后请求时间',
  
  -- 外键和索引
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_date` (`user_id`, `request_date`),
  INDEX `idx_date` (`request_date`),
  INDEX `idx_last_request` (`last_request_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI请求限流表';

-- ============================================
-- 视图定义
-- ============================================

-- 笔记详情视图（包含分类和标签信息）
DROP VIEW IF EXISTS `note_details`;
CREATE VIEW `note_details` AS
SELECT 
    n.`id`,
    n.`user_id`,
    n.`title`,
    n.`content`,
    n.`content_text`,
    n.`thumbnail_url`,
    n.`is_favorited`,
    n.`is_pinned`,
    n.`view_count`,
    n.`word_count`,
    n.`visibility`,
    n.`priority`,
    n.`status`,
    n.`created_at`,
    n.`updated_at`,
    c.`name` as `category_name`,
    c.`icon` as `category_icon`,
    c.`color` as `category_color`,
    GROUP_CONCAT(t.`name` SEPARATOR ',') as `tags`
FROM `notes` n
LEFT JOIN `categories` c ON n.`category_id` = c.`id`
LEFT JOIN `note_tags` nt ON n.`id` = nt.`note_id`
LEFT JOIN `tags` t ON nt.`tag_id` = t.`id`
WHERE n.`is_deleted` = 0
GROUP BY n.`id`;

-- ============================================
-- 存储过程
-- ============================================

-- 清理软删除的笔记（30天后物理删除）
DROP PROCEDURE IF EXISTS `CleanupDeletedNotes`;
DELIMITER //
CREATE PROCEDURE `CleanupDeletedNotes`()
BEGIN
    DELETE FROM `notes` 
    WHERE `is_deleted` = 1 
    AND `updated_at` < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- 更新分类笔记数量
DROP PROCEDURE IF EXISTS `UpdateCategoryNoteCount`;
DELIMITER //
CREATE PROCEDURE `UpdateCategoryNoteCount`(IN category_id_param INT)
BEGIN
    UPDATE `categories` 
    SET `note_count` = (
        SELECT COUNT(*) 
        FROM `notes` 
        WHERE `category_id` = category_id_param 
        AND `is_deleted` = 0
    )
    WHERE `id` = category_id_param;
END //
DELIMITER ;

-- 更新标签使用次数
DROP PROCEDURE IF EXISTS `UpdateTagUseCount`;
DELIMITER //
CREATE PROCEDURE `UpdateTagUseCount`(IN tag_id_param INT)
BEGIN
    UPDATE `tags` 
    SET `use_count` = (
        SELECT COUNT(*) 
        FROM `note_tags` 
        WHERE `tag_id` = tag_id_param
    )
    WHERE `id` = tag_id_param;
END //
DELIMITER ;

-- ============================================
-- 触发器
-- ============================================

-- 笔记插入时自动提取纯文本内容
DROP TRIGGER IF EXISTS `extract_content_text_insert`;
DELIMITER //
CREATE TRIGGER `extract_content_text_insert` 
BEFORE INSERT ON `notes`
FOR EACH ROW
BEGIN
    -- 简单的HTML标签清理，实际项目中建议在应用层处理
    IF NEW.content IS NOT NULL THEN
        SET NEW.content_text = REGEXP_REPLACE(NEW.content, '<[^>]*>', '');
    END IF;
    
    -- 自动计算字数
    IF NEW.content_text IS NOT NULL THEN
        SET NEW.word_count = CHAR_LENGTH(TRIM(NEW.content_text));
    END IF;
END //
DELIMITER ;

-- 笔记更新时自动提取纯文本内容
DROP TRIGGER IF EXISTS `extract_content_text_update`;
DELIMITER //
CREATE TRIGGER `extract_content_text_update` 
BEFORE UPDATE ON `notes`
FOR EACH ROW
BEGIN
    -- 简单的HTML标签清理，实际项目中建议在应用层处理
    IF NEW.content IS NOT NULL AND NEW.content != OLD.content THEN
        SET NEW.content_text = REGEXP_REPLACE(NEW.content, '<[^>]*>', '');
    END IF;
    
    -- 自动计算字数
    IF NEW.content_text IS NOT NULL THEN
        SET NEW.word_count = CHAR_LENGTH(TRIM(NEW.content_text));
    END IF;
END //
DELIMITER ;

-- 笔记插入后更新分类笔记数量
DROP TRIGGER IF EXISTS `update_category_count_insert`;
DELIMITER //
CREATE TRIGGER `update_category_count_insert`
AFTER INSERT ON `notes`
FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 0 THEN
        UPDATE `categories` 
        SET `note_count` = `note_count` + 1 
        WHERE `id` = NEW.category_id;
    END IF;
END //
DELIMITER ;

-- 笔记更新后更新分类笔记数量
DROP TRIGGER IF EXISTS `update_category_count_update`;
DELIMITER //
CREATE TRIGGER `update_category_count_update`
AFTER UPDATE ON `notes`
FOR EACH ROW
BEGIN
    -- 如果删除状态改变
    IF NEW.is_deleted != OLD.is_deleted THEN
        IF NEW.is_deleted = 1 THEN
            -- 笔记被删除，减少计数
            UPDATE `categories` 
            SET `note_count` = GREATEST(`note_count` - 1, 0) 
            WHERE `id` = NEW.category_id;
        ELSE
            -- 笔记被恢复，增加计数
            UPDATE `categories` 
            SET `note_count` = `note_count` + 1 
            WHERE `id` = NEW.category_id;
        END IF;
    END IF;
    
    -- 如果分类改变
    IF NEW.category_id != OLD.category_id AND NEW.is_deleted = 0 THEN
        -- 旧分类减少计数
        UPDATE `categories` 
        SET `note_count` = GREATEST(`note_count` - 1, 0) 
        WHERE `id` = OLD.category_id;
        
        -- 新分类增加计数
        UPDATE `categories` 
        SET `note_count` = `note_count` + 1 
        WHERE `id` = NEW.category_id;
    END IF;
END //
DELIMITER ;

-- 笔记删除后更新分类笔记数量
DROP TRIGGER IF EXISTS `update_category_count_delete`;
DELIMITER //
CREATE TRIGGER `update_category_count_delete`
AFTER DELETE ON `notes`
FOR EACH ROW
BEGIN
    IF OLD.is_deleted = 0 THEN
        UPDATE `categories` 
        SET `note_count` = GREATEST(`note_count` - 1, 0) 
        WHERE `id` = OLD.category_id;
    END IF;
END //
DELIMITER ;

-- 标签关联插入后更新使用次数
DROP TRIGGER IF EXISTS `update_tag_count_insert`;
DELIMITER //
CREATE TRIGGER `update_tag_count_insert`
AFTER INSERT ON `note_tags`
FOR EACH ROW
BEGIN
    UPDATE `tags` 
    SET `use_count` = `use_count` + 1 
    WHERE `id` = NEW.tag_id;
END //
DELIMITER ;

-- 标签关联删除后更新使用次数
DROP TRIGGER IF EXISTS `update_tag_count_delete`;
DELIMITER //
CREATE TRIGGER `update_tag_count_delete`
AFTER DELETE ON `note_tags`
FOR EACH ROW
BEGIN
    UPDATE `tags` 
    SET `use_count` = GREATEST(`use_count` - 1, 0) 
    WHERE `id` = OLD.tag_id;
END //
DELIMITER ;

-- ============================================
-- 初始化数据（可选）
-- ============================================

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 数据库架构创建完成
-- ============================================

-- 用户表
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `phone` VARCHAR(20),
  `password_hash` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50),
  `avatar_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
);

-- 分类表
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'folder',
  `color` VARCHAR(7) DEFAULT '#667eea',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
);

-- 笔记表
CREATE TABLE `notes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT,
  `content_text` TEXT COMMENT '纯文本内容，用于搜索',
  `thumbnail_url` VARCHAR(255),
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_created_at` (`created_at`),
  FULLTEXT `idx_search` (`title`, `content_text`)
);

-- 标签表
CREATE TABLE `tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_tag` (`user_id`, `name`),
  INDEX `idx_user_id` (`user_id`)
);

-- 笔记标签关联表
CREATE TABLE `note_tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `note_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_note_tag` (`note_id`, `tag_id`)
);

-- 文件表（支持图片和其他文件类型）
CREATE TABLE `files` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
);
--修改文件表
-- 为 files 表添加附件功能所需的字段
USE personal_notes;

-- 1. 添加文件类型分类字段（用于区分图片、文档、视频等）
ALTER TABLE `files` 
ADD COLUMN `file_type` VARCHAR(20) DEFAULT 'image' COMMENT '文件类型分类：image/document/video/audio/other' AFTER `mime_type`;

-- 2. 添加存储模式字段（标识是本地存储还是OSS）
ALTER TABLE `files` 
ADD COLUMN `storage_mode` VARCHAR(20) DEFAULT 'local' COMMENT '存储模式：local/oss' AFTER `file_type`;

-- 3. 添加文件描述字段（可选）
ALTER TABLE `files` 
ADD COLUMN `description` VARCHAR(500) DEFAULT NULL COMMENT '文件描述' AFTER `storage_mode`;

-- 4. 添加下载次数字段（可选，用于统计）
ALTER TABLE `files` 
ADD COLUMN `download_count` INT DEFAULT 0 COMMENT '下载次数' AFTER `description`;

-- 5. 添加关联笔记ID字段（可选，用于关联附件到笔记）
ALTER TABLE `files` 
ADD COLUMN `note_id` INT DEFAULT NULL COMMENT '关联的笔记ID' AFTER `user_id`;

-- 6. 添加外键约束（如果需要关联笔记）
ALTER TABLE `files` 
ADD CONSTRAINT `fk_files_note` 
FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE SET NULL;

-- 7. 添加索引优化查询
ALTER TABLE `files` 
ADD INDEX `idx_note_id` (`note_id`),
ADD INDEX `idx_file_type` (`file_type`),
ADD INDEX `idx_storage_mode` (`storage_mode`);

-- 8. 修改 file_path 字段长度（OSS 路径可能较长）
ALTER TABLE `files` 
MODIFY COLUMN `file_path` VARCHAR(1000) NOT NULL COMMENT '文件路径或OSS路径';

-- 最终文件表结构
/*
CREATE TABLE `files` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,                    -- ✅ 必需：文件所属用户
  `note_id` INT DEFAULT NULL,                -- ✅ 必需：关联的笔记
  `original_name` VARCHAR(255) NOT NULL,     -- ✅ 必需：原始文件名（用于下载）
  `file_path` VARCHAR(1000) NOT NULL,        -- ✅ 必需：OSS URL 或本地路径
  `file_size` INT NOT NULL,                  -- ✅ 必需：文件大小（用于限制和统计）
  `mime_type` VARCHAR(100) NOT NULL,         -- ✅ 必需：MIME 类型（用于判断文件类型）
  `file_type` VARCHAR(20) DEFAULT 'other',   -- ✅ 必需：文件分类（便于筛选）
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ✅ 必需：创建时间
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_note_id` (`note_id`),
  INDEX `idx_file_type` (`file_type`)
);
*/


-- 1. AI 设置表
-- 用途：存储用户的 AI 偏好设置
CREATE TABLE IF NOT EXISTS ai_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  provider VARCHAR(50) NOT NULL DEFAULT 'siliconflow' COMMENT 'AI服务商',
  model VARCHAR(100) DEFAULT 'Qwen/Qwen2.5-7B-Instruct' COMMENT 'AI模型',
  default_length ENUM('short', 'medium', 'long') DEFAULT 'medium' COMMENT '默认续写长度',
  default_style ENUM('formal', 'casual', 'professional', 'creative') DEFAULT 'professional' COMMENT '默认写作风格',
  default_language ENUM('zh', 'en') DEFAULT 'zh' COMMENT '默认语言',
  stream_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用流式输出',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI设置表';

-- 2. AI 使用记录表
-- 用途：记录所有 AI 调用，用于统计和成本分析
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  note_id INT COMMENT '笔记ID',
  action ENUM('continue', 'format', 'beautify', 'polish', 'summarize', 'expand') NOT NULL COMMENT 'AI操作类型',
  input_length INT UNSIGNED COMMENT '输入文本长度',
  output_length INT UNSIGNED COMMENT '输出文本长度',
  tokens_used INT UNSIGNED COMMENT '使用的token数',
  cost DECIMAL(10, 6) COMMENT '本次调用成本',
  provider VARCHAR(50) COMMENT 'AI服务商',
  model VARCHAR(100) COMMENT '使用的模型',
  success BOOLEAN DEFAULT TRUE COMMENT '是否成功',
  error_message TEXT COMMENT '错误信息',
  processing_time INT UNSIGNED COMMENT '处理时间（毫秒）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_action (action),
  INDEX idx_success (success),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用记录表';

-- 3. AI 操作历史表
-- 用途：保存 AI 操作的原文和结果，支持撤销和历史查看
CREATE TABLE IF NOT EXISTS ai_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  note_id INT COMMENT '笔记ID',
  action ENUM('continue', 'format', 'beautify', 'polish', 'summarize', 'expand') NOT NULL COMMENT 'AI操作类型',
  original_content MEDIUMTEXT COMMENT '原始内容',
  result_content MEDIUMTEXT COMMENT 'AI生成的结果',
  options JSON COMMENT '操作选项（length, style等）',
  accepted BOOLEAN DEFAULT FALSE COMMENT '用户是否接受',
  tokens_used INT UNSIGNED COMMENT '使用的token数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  expires_at TIMESTAMP NULL COMMENT '过期时间（用于自动清理）',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  INDEX idx_user_note (user_id, note_id),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at),
  INDEX idx_accepted (accepted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI操作历史表';

-- 4. AI 请求限流表
-- 用途：跟踪用户请求次数，实现限流
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  request_date DATE NOT NULL COMMENT '请求日期',
  hourly_count INT UNSIGNED DEFAULT 0 COMMENT '当前小时请求次数',
  daily_count INT UNSIGNED DEFAULT 0 COMMENT '当天请求次数',
  last_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后请求时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, request_date),
  INDEX idx_date (request_date),
  INDEX idx_last_request (last_request_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI请求限流表';

-- 将 notes 表的 content 字段改为 LONGTEXT 类型
-- 这样可以存储更大的内容（包括 base64 图片）

USE personal_notes;

-- 修改 content 字段类型
ALTER TABLE notes 
MODIFY COLUMN content LONGTEXT;

-- 修改 content_text 字段类型（可选，但建议一起修改）
ALTER TABLE notes 
MODIFY COLUMN content_text LONGTEXT;

-- 创建全文搜索配置（MySQL 8.0+）
-- 设置最小搜索词长度
-- SET GLOBAL ft_min_word_len = 1;

-- 添加中文分词支持（需要安装相应插件）
-- ALTER TABLE `notes` ADD FULLTEXT(`title`, `content_text`) WITH PARSER ngram;

-- 创建视图：笔记详情视图（包含分类和标签信息）
CREATE VIEW `note_details` AS
SELECT 
    n.`id`,
    n.`user_id`,
    n.`title`,
    n.`content`,
    n.`content_text`,
    n.`thumbnail_url`,
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
WHERE n.`is_deleted` = FALSE
GROUP BY n.`id`;

-- 创建存储过程：清理软删除的笔记（30天后物理删除）
DELIMITER //
CREATE PROCEDURE CleanupDeletedNotes()
BEGIN
    DELETE FROM `notes` 
    WHERE `is_deleted` = TRUE 
    AND `updated_at` < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- 创建触发器：自动提取纯文本内容
DELIMITER //
CREATE TRIGGER `extract_content_text` 
BEFORE INSERT ON `notes`
FOR EACH ROW
BEGIN
    -- 简单的HTML标签清理，实际项目中建议在应用层处理
    SET NEW.content_text = REGEXP_REPLACE(NEW.content, '<[^>]*>', '');
END //

CREATE TRIGGER `update_content_text` 
BEFORE UPDATE ON `notes`
FOR EACH ROW
BEGIN
    -- 简单的HTML标签清理，实际项目中建议在应用层处理
    SET NEW.content_text = REGEXP_REPLACE(NEW.content, '<[^>]*>', '');
END //
DELIMITER ;
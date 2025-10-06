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
-- Data step of "Danh mục khóa học": the four categories of the original site, then every course moves from
-- the fixed `category` label ("DJ") to `category_id` ("dj"), in the column and in the JSON doc.
INSERT IGNORE INTO `course_categories` (`id`, `slug`, `label`, `sort_order`, `doc`, `created_at`, `updated_at`) VALUES
  ('dj', 'dj', 'DJ', 0, JSON_OBJECT('slug', 'dj', 'label', 'DJ', 'description', 'Kỹ năng chơi nhạc, mixing, biểu diễn', 'order', 0), NOW(3), NOW(3)),
  ('mc', 'mc', 'MC', 1, JSON_OBJECT('slug', 'mc', 'label', 'MC', 'description', 'MC Hype, dẫn dắt sân khấu', 'order', 1), NOW(3), NOW(3)),
  ('producer', 'producer', 'Producer', 2, JSON_OBJECT('slug', 'producer', 'label', 'Producer', 'description', 'Sản xuất âm nhạc trên DAW', 'order', 2), NOW(3), NOW(3)),
  ('flip', 'flip', 'Flip', 3, JSON_OBJECT('slug', 'flip', 'label', 'Flip', 'description', 'Mashup / edit / flip bài hát', 'order', 3), NOW(3), NOW(3));
--> statement-breakpoint
UPDATE `courses`
SET `category_id` = LOWER(`category`),
    `doc` = JSON_SET(JSON_REMOVE(`doc`, '$.category'), '$.categoryId', LOWER(`category`))
WHERE `category_id` IS NULL;

-- Courses keep one name: the natural-case list title ("DJ cơ bản") becomes `title` (the site upper-cases it where
-- the design does); the separate upper-case/preview titles and the slug (column dropped in 0007) leave the doc.
UPDATE `courses`
SET `title` = JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.indexTitle')),
    `doc` = JSON_SET(
      JSON_REMOVE(`doc`, '$.indexTitle', '$.previewTitle', '$.slug'),
      '$.title', JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.indexTitle'))
    )
WHERE JSON_CONTAINS_PATH(`doc`, 'one', '$.indexTitle');
--> statement-breakpoint
UPDATE `courses` SET `doc` = JSON_REMOVE(`doc`, '$.previewTitle', '$.slug');

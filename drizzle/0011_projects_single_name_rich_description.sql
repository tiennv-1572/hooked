-- Projects keep one name (the site upper-cases it with CSS); the services list gives way to the categories; the hero
-- is always shown whole (no format); the event date is gone (column dropped in 0010). The plain-text description
-- becomes rich-text HTML: escaped, one <p> per line.
UPDATE `projects`
SET `doc` = JSON_SET(
  JSON_REMOVE(`doc`, '$.title', '$.services', '$.heroFormat', '$.eventDate'),
  '$.description',
  CONCAT('<p>', REPLACE(REPLACE(REPLACE(REPLACE(
    TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.description'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '\n', '</p><p>'), '</p>')
)
WHERE JSON_TYPE(JSON_EXTRACT(`doc`, '$.description')) = 'STRING'
  AND JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.description')) NOT LIKE '<p>%';
--> statement-breakpoint
UPDATE `projects` SET `doc` = JSON_REMOVE(`doc`, '$.title', '$.services', '$.heroFormat', '$.eventDate');

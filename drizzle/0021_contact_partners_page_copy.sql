-- Contact column labels and the "PARTNERS" label are fixed on the site (`contactCopy.labels`, `partnersIntro.eyebrow`).
-- The plain-text Partners introduction becomes rich-text HTML: escaped, one <p> per line.
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.labels')
WHERE `key` = 'contactPage';
--> statement-breakpoint
UPDATE `singletons`
SET `doc` = JSON_SET(
  JSON_REMOVE(`doc`, '$.eyebrow'),
  '$.body',
  CONCAT('<p>', REPLACE(REPLACE(REPLACE(REPLACE(
    TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.body'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '\n', '</p><p>'), '</p>')
)
WHERE `key` = 'partnersPage'
  AND JSON_TYPE(JSON_EXTRACT(`doc`, '$.body')) = 'STRING'
  AND JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.body')) NOT LIKE '<p>%';
--> statement-breakpoint
UPDATE `singletons` SET `doc` = JSON_REMOVE(`doc`, '$.eyebrow') WHERE `key` = 'partnersPage';

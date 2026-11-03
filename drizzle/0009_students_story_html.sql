-- Student stories become one rich-text field: the paragraph list (≤ 12 items; the old editor allowed 8) turns into
-- escaped `<p>…</p>` HTML. CONCAT_WS skips the NULLs of missing / blank paragraphs.
UPDATE `students`
SET `doc` = JSON_SET(`doc`, '$.story', CONCAT_WS('',
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[0]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[1]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[2]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[3]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[4]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[5]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[6]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[7]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[8]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[9]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[10]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>'),
    CONCAT('<p>', NULLIF(REPLACE(REPLACE(REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(`doc`, '$.story[11]'))), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), ''), '</p>')
))
WHERE JSON_TYPE(JSON_EXTRACT(`doc`, '$.story')) = 'ARRAY';

-- "Dự án hợp tác" leave their own collection for the Partners page document (`partnersPage.collaborations`, managed on
-- /admin/pages/partners). Cards keep their order (window JSON_ARRAYAGG follows ORDER BY); the table is dropped in 0015.
UPDATE `singletons`
SET `doc` = JSON_SET(`doc`, '$.collaborations', COALESCE((
  SELECT JSON_ARRAYAGG(JSON_REMOVE(JSON_SET(c.`doc`, '$.id', c.`id`), '$.order'))
    OVER (ORDER BY c.`sort_order`, c.`id` ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
  FROM `collaborations` c
  LIMIT 1
), JSON_ARRAY()))
WHERE `key` = 'partnersPage' AND NOT JSON_CONTAINS_PATH(`doc`, 'one', '$.collaborations');

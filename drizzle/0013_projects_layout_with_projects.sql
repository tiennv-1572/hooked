-- "Cài đặt hiển thị dự án" cells now name their project (`projectId`, a project may fill several cells). A layout
-- saved before that only had formats; it is dropped so the seed applies again (the original projects in order).
DELETE FROM `singletons`
WHERE `key` = 'projectsLayout' AND JSON_LENGTH(`doc`, '$.slots') > 0
  AND NOT JSON_CONTAINS_PATH(`doc`, 'one', '$.slots[0].projectId');

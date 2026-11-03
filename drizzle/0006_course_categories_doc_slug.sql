-- Course categories keep only a label (0005 dropped the slug column): remove slug and description from the JSON docs.
UPDATE `course_categories` SET `doc` = JSON_REMOVE(`doc`, '$.slug', '$.description');

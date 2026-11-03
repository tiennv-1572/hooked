-- The Student Stories heading, labels and reader copy are fixed on the site (`studentsPage` in src/data/students.ts);
-- the page document keeps its SEO only.
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.title', '$.description', '$.collectionLabel', '$.readLabel', '$.readerLabel')
WHERE `key` = 'studentsPage';

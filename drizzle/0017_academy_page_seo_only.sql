-- The Academy heading ("ACADEMY") is fixed on the site (ACADEMY_COPY.title); the Academy page document keeps its SEO only.
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.title')
WHERE `key` = 'academyPage';

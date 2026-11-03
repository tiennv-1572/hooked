-- The Academy section labels and the "Đăng ký tư vấn" dialog copy are fixed on the site (ACADEMY_COPY); the Academy
-- page document keeps its heading and SEO only.
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.coursesHeading', '$.directoryHeading', '$.storiesHeading', '$.storiesCtaLabel', '$.registration')
WHERE `key` = 'academyPage';

-- The Projects overview copy (heading, "Tất cả" chip, empty state) and the blog index header are fixed on the site
-- (PROJECTS_COPY, BLOG_INDEX_COPY); both page documents keep their SEO only.
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.title', '$.description', '$.allFilterLabel', '$.emptyTitle', '$.emptyBody')
WHERE `key` = 'projectsPage';
--> statement-breakpoint
UPDATE `singletons`
SET `doc` = JSON_REMOVE(`doc`, '$.title', '$.description')
WHERE `key` = 'blogPage';

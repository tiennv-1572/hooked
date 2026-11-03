-- Card formats move from each project to the "Cài đặt hiển thị dự án" singleton (`projectsLayout`, cells of the
-- "Tất cả" grid). Until it is saved once, the seed applies: Landscape · Portrait · Wide · Compact · Panorama.
UPDATE `projects` SET `doc` = JSON_REMOVE(`doc`, '$.cardFormat');

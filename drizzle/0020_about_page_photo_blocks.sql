-- The About gallery (one list of 8 photos) splits into its two photo blocks: photos 1–4 → `photos.top` (after the
-- intro), photos 5–8 → `photos.bottom` (after the ecosystem). A missing photo becomes an empty slot (null).
UPDATE `singletons`
SET `doc` = JSON_REMOVE(
  JSON_SET(
    `doc`,
    '$.photos',
    JSON_OBJECT(
      'top', JSON_ARRAY(
        JSON_EXTRACT(`doc`, '$.gallery[0]'), JSON_EXTRACT(`doc`, '$.gallery[1]'),
        JSON_EXTRACT(`doc`, '$.gallery[2]'), JSON_EXTRACT(`doc`, '$.gallery[3]')
      ),
      'bottom', JSON_ARRAY(
        JSON_EXTRACT(`doc`, '$.gallery[4]'), JSON_EXTRACT(`doc`, '$.gallery[5]'),
        JSON_EXTRACT(`doc`, '$.gallery[6]'), JSON_EXTRACT(`doc`, '$.gallery[7]')
      )
    )
  ),
  '$.gallery'
)
WHERE `key` = 'aboutPage' AND JSON_CONTAINS_PATH(`doc`, 'one', '$.gallery');

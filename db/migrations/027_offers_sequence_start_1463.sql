-- Advance the offers id sequence so the next newly created offer receives ID 1463.
-- Existing offers (IDs 1-19) are not touched.
-- setval with is_called=true means nextval() will return last_value + 1, i.e. 1463.
SELECT setval('public.offers_id_seq', 1462, true);

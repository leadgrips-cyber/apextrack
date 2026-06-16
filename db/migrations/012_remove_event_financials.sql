-- Events are conversion signals only. Payout/revenue is the offer's responsibility.
ALTER TABLE offer_events DROP COLUMN IF EXISTS publisher_payout;
ALTER TABLE offer_events DROP COLUMN IF EXISTS advertiser_revenue;

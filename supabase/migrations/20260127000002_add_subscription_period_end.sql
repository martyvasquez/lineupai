-- Add subscription period end date for displaying billing info
ALTER TABLE public.profiles ADD COLUMN subscription_period_end TIMESTAMPTZ;

-- This column stores:
-- For active subscriptions: the next billing date
-- For canceled subscriptions: the last day of access

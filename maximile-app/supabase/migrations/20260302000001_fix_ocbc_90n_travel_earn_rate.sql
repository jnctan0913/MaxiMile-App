-- =============================================================================
-- Fix: OCBC 90°N Visa travel earn rate
-- =============================================================================
-- Root cause: The earn_rule for OCBC 90°N Visa (travel) was seeded as
-- is_bonus = FALSE, earn_rate_mpd = 1.2 (local SGD rate).  The recommend()
-- function only joins is_bonus = TRUE rules, so the card was falling back to
-- its 1.2 mpd base rate instead of the correct 2.1 mpd overseas/FCY rate.
-- The seed row's own conditions_note already states the right value:
-- "Overseas travel spend earns 2.1 mpd."
--
-- Fix: promote the row to a bonus rule at 2.1 mpd.
-- The card's base_rate_mpd (1.2) already covers local SGD fallback.
-- =============================================================================

UPDATE public.earn_rules
SET
  earn_rate_mpd    = 2.1,
  is_bonus         = TRUE,
  conditions_note  = 'Earns 2.1 mpd on overseas / FCY transactions and travel merchants. Local SGD transactions earn the base rate of 1.2 mpd. No monthly cap. [VERIFIED from OCBC website]'
WHERE card_id     = '00000000-0000-0000-0001-000000000004'
  AND category_id = 'travel'
  AND is_bonus    = FALSE
  AND earn_rate_mpd = 1.2;

-- Verify: expect exactly 1 row updated.
-- SELECT card_id, category_id, is_bonus, earn_rate_mpd, conditions_note
-- FROM earn_rules
-- WHERE card_id = '00000000-0000-0000-0001-000000000004' AND category_id = 'travel';

-- Migration: Fix source_configs URLs that were returning 404s
-- Date: 2026-02-28
-- Description: Update T&C PDF URLs for cards where the original URLs were broken.
--              URLs verified by user against live sites. Reset failure counters.

-- =============================================================================
-- DBS CARDS
-- =============================================================================

-- DBS Altitude Card
UPDATE source_configs
SET
    url = 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/promotions/dbs-cards-acqui-altitude-credit-card-tnc.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-altitude-card-tnc.pdf';

-- DBS Vantage Card
UPDATE source_configs
SET
    url = 'https://www.dbs.com.sg/iwov-resources/pdf/cards/vantage-card-T&Cs.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-vantage-card-tnc.pdf';

-- POSB Everyday Card
UPDATE source_configs
SET
    url = 'https://www.posb.com.sg/iwov-resources/pdf/cards/credit-cards/posb-everyday-card/posb-everyday-card-tncs.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/posb-everyday-card-tnc.pdf';

-- =============================================================================
-- UOB CARDS
-- =============================================================================

-- UOB PRVI Miles Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/assets/pdfs/terms-and-conditions-governing-uob-prvi-miles-card.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/prvi-miles-tnc.pdf';

-- UOB Preferred Platinum Visa Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/web-resources/personal/pdf/personal/cards/credit-cards/rewards-cards/uob-preferred-platinum-visa-card/terms-and-conditions-for-preferred-plat-visa.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/preferred-platinum-tnc.pdf';

-- UOB Visa Signature Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/web-resources/personal/pdf/personal/cards/credit-cards/travel-cards/uob-visa-signature-card/terms-and-conditions-governing-uob-visa-signature-card.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/visa-signature-tnc.pdf';

-- UOB Lady's Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/assets/pdfs/ladys-cards-tcs.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/ladys-card-tnc.pdf';

-- UOB Lady's Solitaire Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/personal/cards/credit/ladys/pdf/Ladys_Solitaire_Card_TCs.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/ladys-solitaire-tnc.pdf';

-- UOB KrisFlyer Card
UPDATE source_configs
SET
    url = 'https://www.uob.com.sg/assets/pdfs/kf_credit_card_full_tnc.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/krisflyer-uob-tnc.pdf';

-- =============================================================================
-- HSBC CARDS
-- =============================================================================

-- HSBC Revolution Card
-- NOTE: New URL points to the 10x reward points promotion T&Cs rather than a
--       generic card T&C page. This was the best available live URL.
UPDATE source_configs
SET
    url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/revolution/offers/10x-reward-points-terms-and-conditions.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/revolution/terms-and-conditions.pdf';

-- HSBC Premier Mastercard
UPDATE source_configs
SET
    url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/premier-mastercard/pmc-tncs.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/premier/terms-and-conditions.pdf';

-- =============================================================================
-- AMERICAN EXPRESS CARDS
-- =============================================================================

-- Amex KrisFlyer Ascend Credit Card
UPDATE source_configs
SET
    url = 'https://www.americanexpress.com/content/dam/amex/sg/campaigns/pdfs/krisflyer-ascend-credit-card.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.americanexpress.com/content/dam/amex/sg/credit-cards/krisflyer-ascend/krisflyer-ascend-tnc.pdf';

-- Amex KrisFlyer Credit Card
UPDATE source_configs
SET
    url = 'https://www.americanexpress.com/content/dam/amex/sg/campaigns/pdfs/krisflyer-credit-card.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.americanexpress.com/content/dam/amex/sg/credit-cards/krisflyer/krisflyer-credit-card-tnc.pdf';

-- =============================================================================
-- STANDARD CHARTERED CARDS
-- =============================================================================

-- SC Visa Infinite
-- NOTE: Possibly outdated — this appears to be a Malaysia PB VI relaunch doc.
--       Verify the correct SG Visa Infinite T&C URL against MileLion before
--       relying on this for scraping.
UPDATE source_configs
SET
    url = 'https://www.sc.com/global/av/my-pbvi-relaunch-tnc.pdf',
    notes = 'Possibly outdated — verify against MileLion',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.sc.com/sg/_pdf/credit-cards/visa-infinite-tnc.pdf';

-- SC Journey Card / SC X Card
-- NOTE: No standalone Journey Card T&C PDF was found. The X Card T&C at the
--       URL below also covers Journey Card earn rates. The card name in the
--       source_configs notes has been updated to reflect this.
--       Verify against MileLion to confirm coverage.
UPDATE source_configs
SET
    url = 'https://av.sc.com/sg/content/docs/x-card-tnc.pdf',
    notes = 'SC X Card T&C — also covers Journey Card earn rates. Verify against MileLion.',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.sc.com/sg/_pdf/credit-cards/journey-card-tnc.pdf';

-- SC Smart Credit Card
-- NOTE: Adobe Marketing Cloud query parameters (adobe_mc=...) have been stripped
--       from the URL as they are tracking parameters and not required to access
--       the document.
UPDATE source_configs
SET
    url = 'https://av.sc.com/sg/content/docs/Standard-Chartered-Smart-Credit-Card-Terms-and-Conditions_6Dec2024.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.sc.com/sg/_pdf/credit-cards/smart-card-tnc.pdf';

-- SC Beyond Card
-- NOTE: The URL below points to an India T&C document. The SG-specific Beyond
--       Card T&C could not be confirmed. Verify the correct SG URL against
--       MileLion before relying on this for scraping.
UPDATE source_configs
SET
    url = 'https://av.sc.com/in/content/docs/in-beyond-credit-card-tnc.pdf',
    notes = 'India T&C — verify SG version against MileLion',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.sc.com/sg/_pdf/credit-cards/beyond-card-tnc.pdf';

-- =============================================================================
-- MAYBANK CARDS
-- =============================================================================

-- Maybank World Mastercard
UPDATE source_configs
SET
    url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/maybank-world-mastercard-tnc.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/world-mastercard-tnc.pdf';

-- Maybank Horizon Visa (XL Rewards / XL Privileges)
-- NOTE: Old URL referenced "xl-rewards-card"; new URL uses "xl-privileges-tp"
--       which appears to be the current product name.
UPDATE source_configs
SET
    url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/xl-privileges-tp-tnc.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/xl-rewards-card-tnc.pdf';

-- Maybank FC Barcelona Visa Signature Card
UPDATE source_configs
SET
    url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/fc-barcelona-visa-signature-tnc-1jan2023.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/fc-barcelona-card-tnc.pdf';

-- =============================================================================
-- CITIBANK CARDS
-- =============================================================================

-- Citi PremierMiles Card
-- NOTE: New URL is dated 0225 (Feb 2025) and points to a Cardmembers Agreement
--       rather than a general T&C document. Check MileLion for the canonical
--       T&C URL as this may be superseded by newer agreements.
UPDATE source_configs
SET
    url = 'https://www.citibank.com.sg/pdf/0225/Citi_PremierMiles_Cardmembers_Agreement.pdf',
    notes = 'Check MileLion — dated Feb 2025, verify if superseded',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.citibank.com.sg/pdf/citi-premiermiles-tnc.pdf';

-- Citi Rewards Card
-- NOTE: New URL points to the 10x Rewards Promotion T&Cs (2020). This may be
--       a promotion-specific document rather than the full card T&Cs. Check
--       for a more current general T&C URL.
UPDATE source_configs
SET
    url = 'https://www.citibank.com.sg/credit-cards/rewards/citi-rewards-card/pdf/10x-rewards-promotion-terms-and-conditions-2020.pdf',
    consecutive_failures = 0,
    status = 'active'
WHERE url = 'https://www.citibank.com.sg/pdf/citi-rewards-card-tnc.pdf';

// =============================================================================
// Card Image Map — Local asset mapping by card slug
// =============================================================================
// React Native requires static `require()` calls, so we map each slug manually.
// Replace placeholder PNGs in assets/cards/ with real card face images.
// =============================================================================

import { ImageSourcePropType } from 'react-native';

const CARD_IMAGES: Record<string, ImageSourcePropType> = {
  'dbs-altitude-visa': require('../assets/cards/dbs-altitude-visa.png'),
  'citi-premiermiles-visa': require('../assets/cards/citi-premiermiles-visa.png'),
  'uob-prvi-miles-visa': require('../assets/cards/uob-prvi-miles-visa.png'),
  'ocbc-90n-visa': require('../assets/cards/ocbc-90n-visa.png'),
  'krisflyer-uob': require('../assets/cards/krisflyer-uob.png'),
  'hsbc-revolution': require('../assets/cards/hsbc-revolution.png'),
  'amex-krisflyer-ascend': require('../assets/cards/amex-krisflyer-ascend.png'),
  'boc-elite-miles-world-mc': require('../assets/cards/boc-elite-miles-world-mc.png'),
  'sc-visa-infinite': require('../assets/cards/sc-visa-infinite.png'),
  'dbs-womans-world-card': require('../assets/cards/dbs-womans-world-card.png'),
  'uob-ladys-card': require('../assets/cards/uob-ladys-card.png'),
  'ocbc-titanium-rewards': require('../assets/cards/ocbc-titanium-rewards.png'),
  'hsbc-travelone': require('../assets/cards/hsbc-travelone.png'),
  'amex-krisflyer-credit-card': require('../assets/cards/amex-krisflyer-credit-card.png'),
  'sc-x-card': require('../assets/cards/sc-x-card.png'),
  'maybank-horizon-visa': require('../assets/cards/maybank-horizon-visa.png'),
  'maybank-fc-barcelona': require('../assets/cards/maybank-fc-barcelona.png'),
  'citi-rewards': require('../assets/cards/citi-rewards.png'),
  'posb-everyday-card': require('../assets/cards/posb-everyday-card.png'),
  'uob-preferred-platinum': require('../assets/cards/uob-preferred-platinum.png'),
};

/**
 * Get the local card image by slug.
 * Returns undefined if no local image exists for the slug.
 */
export function getCardImage(slug: string): ImageSourcePropType | undefined {
  return CARD_IMAGES[slug];
}

export default CARD_IMAGES;

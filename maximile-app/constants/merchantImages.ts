// =============================================================================
// Merchant Image Map — Local asset mapping by merchant slug
// =============================================================================
// React Native requires static `require()` calls, so we map each slug manually.
// Replace placeholder PNGs in assets/merchants/ with real 64×64 merchant logos.
// =============================================================================

import { ImageSourcePropType } from 'react-native';

const MERCHANT_IMAGES: Record<string, ImageSourcePropType> = {
  // DINING
  'mcdonalds': require('../assets/merchants/mcdonalds.png'),
  'starbucks': require('../assets/merchants/starbucks.png'),
  'kfc': require('../assets/merchants/kfc.png'),
  'burger-king': require('../assets/merchants/burger-king.png'),
  'subway': require('../assets/merchants/subway.png'),
  'toast-box': require('../assets/merchants/toast-box.png'),
  'ya-kun-kaya-toast': require('../assets/merchants/ya-kun-kaya-toast.png'),
  'sushi-tei': require('../assets/merchants/sushi-tei.png'),
  'crystal-jade': require('../assets/merchants/crystal-jade.png'),
  'din-tai-fung': require('../assets/merchants/din-tai-fung.png'),
  'pizza-hut': require('../assets/merchants/pizza-hut.png'),
  'dominos-pizza': require('../assets/merchants/dominos-pizza.png'),
  'nandos': require('../assets/merchants/nandos.png'),
  'old-chang-kee': require('../assets/merchants/old-chang-kee.png'),
  'gong-cha': require('../assets/merchants/gong-cha.png'),
  'jollibean': require('../assets/merchants/jollibean.png'),
  'foodpanda': require('../assets/merchants/foodpanda.png'),
  'grabfood': require('../assets/merchants/grabfood.png'),
  'deliveroo': require('../assets/merchants/deliveroo.png'),
  'kopitiam': require('../assets/merchants/kopitiam.png'),
  'food-republic': require('../assets/merchants/food-republic.png'),
  'koufu': require('../assets/merchants/koufu.png'),
  'swensens': require('../assets/merchants/swensens.png'),
  'sakae-sushi': require('../assets/merchants/sakae-sushi.png'),
  'genki-sushi': require('../assets/merchants/genki-sushi.png'),
  'tim-ho-wan': require('../assets/merchants/tim-ho-wan.png'),
  'pepper-lunch': require('../assets/merchants/pepper-lunch.png'),
  'ajisen-ramen': require('../assets/merchants/ajisen-ramen.png'),
  'ichiban-boshi': require('../assets/merchants/ichiban-boshi.png'),
  'yoshinoya': require('../assets/merchants/yoshinoya.png'),
  'jollibee': require('../assets/merchants/jollibee.png'),
  'pastamania': require('../assets/merchants/pastamania.png'),
  'collins': require('../assets/merchants/collins.png'),
  'the-soup-spoon': require('../assets/merchants/the-soup-spoon.png'),
  'stuffd': require('../assets/merchants/stuffd.png'),
  'poke-theory': require('../assets/merchants/poke-theory.png'),
  'saladstop': require('../assets/merchants/saladstop.png'),
  'breadtalk': require('../assets/merchants/breadtalk.png'),
  'delifrance': require('../assets/merchants/delifrance.png'),
  'coffee-bean-tea-leaf': require('../assets/merchants/coffee-bean-tea-leaf.png'),
  'wendys': require('../assets/merchants/wendys.png'),
  'marche-movenpick': require('../assets/merchants/marche-movenpick.png'),
  'hai-di-lao': require('../assets/merchants/hai-di-lao.png'),
  'paradise-group': require('../assets/merchants/paradise-group.png'),
  'jumbo-seafood': require('../assets/merchants/jumbo-seafood.png'),
  'liho': require('../assets/merchants/liho.png'),
  'koi-the': require('../assets/merchants/koi-the.png'),
  'tiger-sugar': require('../assets/merchants/tiger-sugar.png'),
  'krispy-kreme': require('../assets/merchants/krispy-kreme.png'),
  'paris-baguette': require('../assets/merchants/paris-baguette.png'),

  // TRANSPORT
  'grab': require('../assets/merchants/grab.png'),
  'gojek': require('../assets/merchants/gojek.png'),
  'comfortdelgro': require('../assets/merchants/comfortdelgro.png'),
  'smrt': require('../assets/merchants/smrt.png'),
  'ez-link': require('../assets/merchants/ez-link.png'),
  'cdg-zig': require('../assets/merchants/cdg-zig.png'),
  'bluesg': require('../assets/merchants/bluesg.png'),
  'tada': require('../assets/merchants/tada.png'),
  'ryde': require('../assets/merchants/ryde.png'),
  'getgo': require('../assets/merchants/getgo.png'),
  'tribecar': require('../assets/merchants/tribecar.png'),

  // ONLINE SHOPPING
  'shopee': require('../assets/merchants/shopee.png'),
  'lazada': require('../assets/merchants/lazada.png'),
  'amazon': require('../assets/merchants/amazon.png'),
  'zalora': require('../assets/merchants/zalora.png'),
  'asos': require('../assets/merchants/asos.png'),
  'shein': require('../assets/merchants/shein.png'),
  'spotify': require('../assets/merchants/spotify.png'),
  'netflix': require('../assets/merchants/netflix.png'),
  'disney-plus': require('../assets/merchants/disney-plus.png'),
  'apple': require('../assets/merchants/apple.png'),
  'google': require('../assets/merchants/google.png'),
  'steam': require('../assets/merchants/steam.png'),
  'qoo10': require('../assets/merchants/qoo10.png'),
  'carousell': require('../assets/merchants/carousell.png'),
  'love-bonito': require('../assets/merchants/love-bonito.png'),
  'charles-keith': require('../assets/merchants/charles-keith.png'),
  'taobao': require('../assets/merchants/taobao.png'),
  'iherb': require('../assets/merchants/iherb.png'),
  'book-depository': require('../assets/merchants/book-depository.png'),
  'youtube-premium': require('../assets/merchants/youtube-premium.png'),
  'hbo-go': require('../assets/merchants/hbo-go.png'),
  'viu': require('../assets/merchants/viu.png'),

  // GROCERIES
  'ntuc-fairprice': require('../assets/merchants/ntuc-fairprice.png'),
  'cold-storage': require('../assets/merchants/cold-storage.png'),
  'giant': require('../assets/merchants/giant.png'),
  'sheng-siong': require('../assets/merchants/sheng-siong.png'),
  'don-don-donki': require('../assets/merchants/don-don-donki.png'),
  'redmart': require('../assets/merchants/redmart.png'),
  'daiso': require('../assets/merchants/daiso.png'),
  'mustafa-centre': require('../assets/merchants/mustafa-centre.png'),
  'little-farms': require('../assets/merchants/little-farms.png'),
  'market-place': require('../assets/merchants/market-place.png'),
  'hao-mart': require('../assets/merchants/hao-mart.png'),
  'prime-supermarket': require('../assets/merchants/prime-supermarket.png'),
  'meidi-ya': require('../assets/merchants/meidi-ya.png'),
  'isetan-supermarket': require('../assets/merchants/isetan-supermarket.png'),
  '7-eleven': require('../assets/merchants/7-eleven.png'),
  'cheers': require('../assets/merchants/cheers.png'),

  // PETROL
  'shell': require('../assets/merchants/shell.png'),
  'esso': require('../assets/merchants/esso.png'),
  'caltex': require('../assets/merchants/caltex.png'),
  'spc': require('../assets/merchants/spc.png'),
  'sinopec': require('../assets/merchants/sinopec.png'),

  // BILLS — Telco
  'singtel': require('../assets/merchants/singtel.png'),
  'starhub': require('../assets/merchants/starhub.png'),
  'm1': require('../assets/merchants/m1.png'),
  'simba-telecom': require('../assets/merchants/simba-telecom.png'),
  'circles-life': require('../assets/merchants/circles-life.png'),
  'gomo': require('../assets/merchants/gomo.png'),
  'myrepublic': require('../assets/merchants/myrepublic.png'),
  'viewqwest': require('../assets/merchants/viewqwest.png'),

  // BILLS — Utilities
  'sp-services': require('../assets/merchants/sp-services.png'),
  'geneco': require('../assets/merchants/geneco.png'),
  'hdb': require('../assets/merchants/hdb.png'),
  'pub': require('../assets/merchants/pub.png'),
  'town-council': require('../assets/merchants/town-council.png'),
  'keppel-electric': require('../assets/merchants/keppel-electric.png'),
  'tuas-power': require('../assets/merchants/tuas-power.png'),

  // BILLS — Insurance
  'aia': require('../assets/merchants/aia.png'),
  'prudential': require('../assets/merchants/prudential.png'),
  'great-eastern': require('../assets/merchants/great-eastern.png'),
  'ntuc-income': require('../assets/merchants/ntuc-income.png'),
  'aviva': require('../assets/merchants/aviva.png'),
  'fwd': require('../assets/merchants/fwd.png'),
  'manulife': require('../assets/merchants/manulife.png'),

  // TRAVEL
  'singapore-airlines': require('../assets/merchants/singapore-airlines.png'),
  'scoot': require('../assets/merchants/scoot.png'),
  'jetstar': require('../assets/merchants/jetstar.png'),
  'airasia': require('../assets/merchants/airasia.png'),
  'expedia': require('../assets/merchants/expedia.png'),
  'booking-com': require('../assets/merchants/booking-com.png'),
  'agoda': require('../assets/merchants/agoda.png'),
  'airbnb': require('../assets/merchants/airbnb.png'),
  'klook': require('../assets/merchants/klook.png'),
  'marriott': require('../assets/merchants/marriott.png'),
  'hilton': require('../assets/merchants/hilton.png'),
  'trip-com': require('../assets/merchants/trip-com.png'),
  'changi-airport': require('../assets/merchants/changi-airport.png'),
  'trivago': require('../assets/merchants/trivago.png'),
  'klm': require('../assets/merchants/klm.png'),
  'cathay-pacific': require('../assets/merchants/cathay-pacific.png'),
  'emirates': require('../assets/merchants/emirates.png'),
  'traveloka': require('../assets/merchants/traveloka.png'),

  // GENERAL
  'guardian': require('../assets/merchants/guardian.png'),
  'watsons': require('../assets/merchants/watsons.png'),
  'uniqlo': require('../assets/merchants/uniqlo.png'),
  'h-m': require('../assets/merchants/h-m.png'),
  'zara': require('../assets/merchants/zara.png'),
  'cotton-on': require('../assets/merchants/cotton-on.png'),
  'miniso': require('../assets/merchants/miniso.png'),
  'decathlon': require('../assets/merchants/decathlon.png'),
  'courts': require('../assets/merchants/courts.png'),
  'harvey-norman': require('../assets/merchants/harvey-norman.png'),
  'best-denki': require('../assets/merchants/best-denki.png'),
  'challenger': require('../assets/merchants/challenger.png'),
  'popular-bookstore': require('../assets/merchants/popular-bookstore.png'),
  'ikea': require('../assets/merchants/ikea.png'),
  'marks-spencer': require('../assets/merchants/marks-spencer.png'),
  'sephora': require('../assets/merchants/sephora.png'),
  'nike': require('../assets/merchants/nike.png'),
  'adidas': require('../assets/merchants/adidas.png'),
};

/**
 * Get the local merchant image by slug.
 * Returns undefined if no local image exists for the slug.
 */
export function getMerchantImage(slug: string): ImageSourcePropType | undefined {
  return MERCHANT_IMAGES[slug];
}

export default MERCHANT_IMAGES;

// =============================================================================
// MaxiMile — Merchant Catalogue (Sprint 34 — F42 Merchant Search)
// =============================================================================
// Curated catalogue of ~200 popular Singapore merchants mapped to spend
// categories. Used by the merchant search feature on the Recommend home screen.
// =============================================================================

export interface MerchantEntry {
  /** Display name (e.g. "Starbucks") */
  name: string;
  /** Search aliases / common misspellings (e.g. ["starbux"]) */
  keywords: string[];
  /** Category ID from CATEGORIES constant */
  categoryId: string;
  /** For bills merchants — which subcategory to route to */
  subcategory?: string;
}

// ---------------------------------------------------------------------------
// Static catalogue builder
// ---------------------------------------------------------------------------

function buildStaticCatalogue(): MerchantEntry[] {
  return [
    // =========================================================================
    // DINING (40+)
    // =========================================================================
    { name: "McDonald's", keywords: ['mcdonalds', 'mcd', 'mcds', 'macs'], categoryId: 'dining' },
    { name: 'Starbucks', keywords: ['starbux', 'sbux'], categoryId: 'dining' },
    { name: 'KFC', keywords: ['kentucky fried chicken', 'kentucky'], categoryId: 'dining' },
    { name: 'Burger King', keywords: ['bk', 'burgerking'], categoryId: 'dining' },
    { name: 'Subway', keywords: ['sub'], categoryId: 'dining' },
    { name: 'Toast Box', keywords: ['toastbox'], categoryId: 'dining' },
    { name: 'Ya Kun Kaya Toast', keywords: ['ya kun', 'yakun', 'kaya toast'], categoryId: 'dining' },
    { name: 'Sushi Tei', keywords: ['sushitei'], categoryId: 'dining' },
    { name: 'Crystal Jade', keywords: ['crystaljade', 'crystal jade kitchen'], categoryId: 'dining' },
    { name: 'Din Tai Fung', keywords: ['dintaifung', 'dtf'], categoryId: 'dining' },
    { name: 'Pizza Hut', keywords: ['pizzahut', 'ph'], categoryId: 'dining' },
    { name: "Domino's Pizza", keywords: ['dominos', 'dominoes'], categoryId: 'dining' },
    { name: "Nando's", keywords: ['nandos', 'nando'], categoryId: 'dining' },
    { name: 'Old Chang Kee', keywords: ['ock', 'oldchangkee', 'old chang'], categoryId: 'dining' },
    { name: 'Gong Cha', keywords: ['gongcha', 'bubble tea'], categoryId: 'dining' },
    { name: 'Jollibean', keywords: ['jolli bean'], categoryId: 'dining' },
    { name: 'FoodPanda', keywords: ['foodpanda', 'food panda', 'panda'], categoryId: 'dining' },
    { name: 'GrabFood', keywords: ['grabfood', 'grab food'], categoryId: 'dining' },
    { name: 'Deliveroo', keywords: ['deliveroo', 'roo'], categoryId: 'dining' },
    { name: 'Kopitiam', keywords: ['kopi tiam', 'kopi'], categoryId: 'dining' },
    { name: 'Food Republic', keywords: ['foodrepublic', 'food court'], categoryId: 'dining' },
    { name: 'Koufu', keywords: ['kou fu'], categoryId: 'dining' },
    { name: "Swensen's", keywords: ['swensens', 'swensen'], categoryId: 'dining' },
    { name: 'Sakae Sushi', keywords: ['sakae'], categoryId: 'dining' },
    { name: 'Genki Sushi', keywords: ['genki'], categoryId: 'dining' },
    { name: 'Tim Ho Wan', keywords: ['timhowan', 'dim sum'], categoryId: 'dining' },
    { name: 'Pepper Lunch', keywords: ['pepperlunch', 'pepper'], categoryId: 'dining' },
    { name: 'Ajisen Ramen', keywords: ['ajisen', 'ramen'], categoryId: 'dining' },
    { name: 'Ichiban Boshi', keywords: ['ichiban'], categoryId: 'dining' },
    { name: 'Yoshinoya', keywords: ['yoshi', 'beef bowl'], categoryId: 'dining' },
    { name: 'Jollibee', keywords: ['jolly bee', 'jolli bee'], categoryId: 'dining' },
    { name: 'PastaMania', keywords: ['pastamania', 'pasta mania', 'pasta'], categoryId: 'dining' },
    { name: "Collin's", keywords: ['collins', 'collin'], categoryId: 'dining' },
    { name: 'The Soup Spoon', keywords: ['soup spoon', 'soupspoon'], categoryId: 'dining' },
    { name: "Stuff'd", keywords: ['stuffd', 'stuffed', 'kebab'], categoryId: 'dining' },
    { name: 'Poke Theory', keywords: ['poke', 'poketheory'], categoryId: 'dining' },
    { name: 'SaladStop!', keywords: ['saladstop', 'salad stop', 'salad'], categoryId: 'dining' },
    { name: 'BreadTalk', keywords: ['breadtalk', 'bread talk', 'bread'], categoryId: 'dining' },
    { name: 'Delifrance', keywords: ['deli france', 'delifrance'], categoryId: 'dining' },
    { name: 'Coffee Bean & Tea Leaf', keywords: ['cbtl', 'coffee bean', 'coffeebean'], categoryId: 'dining' },
    { name: "Wendy's", keywords: ['wendys'], categoryId: 'dining' },
    { name: "Marché Mövenpick", keywords: ['marche', 'movenpick', 'marche movenpick'], categoryId: 'dining' },
    { name: 'Hai Di Lao', keywords: ['haidilao', 'hai di lao', 'hotpot'], categoryId: 'dining' },
    { name: 'Paradise Group', keywords: ['paradise', 'paradise dynasty'], categoryId: 'dining' },
    { name: 'Jumbo Seafood', keywords: ['jumbo', 'chilli crab'], categoryId: 'dining' },
    { name: 'LiHO', keywords: ['liho', 'li ho', 'bubble tea'], categoryId: 'dining' },
    { name: 'Koi Thé', keywords: ['koi', 'koi the', 'bubble tea'], categoryId: 'dining' },
    { name: 'Tiger Sugar', keywords: ['tigersugar', 'boba'], categoryId: 'dining' },
    { name: 'Krispy Kreme', keywords: ['krispykreme', 'krispy', 'donut'], categoryId: 'dining' },
    { name: 'Paris Baguette', keywords: ['paris', 'baguette', 'parisbaguette'], categoryId: 'dining' },

    // =========================================================================
    // TRANSPORT (10+)
    // =========================================================================
    { name: 'Grab', keywords: ['grab ride', 'grabcar', 'grab car', 'ride hailing'], categoryId: 'transport' },
    { name: 'Gojek', keywords: ['go jek', 'go-jek'], categoryId: 'transport' },
    { name: 'ComfortDelGro', keywords: ['comfort', 'cdg', 'comfortdelgro', 'comfort taxi'], categoryId: 'transport' },
    { name: 'SMRT', keywords: ['smrt taxis', 'mrt'], categoryId: 'transport' },
    { name: 'EZ-Link', keywords: ['ezlink', 'ez link', 'ez-link top up'], categoryId: 'transport' },
    { name: 'CDG Zig', keywords: ['zig', 'cdg zig', 'comfort zig'], categoryId: 'transport' },
    { name: 'BlueSG', keywords: ['bluesg', 'blue sg', 'car sharing'], categoryId: 'transport' },
    { name: 'Tada', keywords: ['tada ride'], categoryId: 'transport' },
    { name: 'Ryde', keywords: ['ryde ride'], categoryId: 'transport' },
    { name: 'GetGo', keywords: ['getgo', 'get go', 'car rental'], categoryId: 'transport' },
    { name: 'Tribecar', keywords: ['tribe car', 'tribecar'], categoryId: 'transport' },

    // =========================================================================
    // ONLINE SHOPPING (20+)
    // =========================================================================
    { name: 'Shopee', keywords: ['shoppee', 'shopee sg'], categoryId: 'online' },
    { name: 'Lazada', keywords: ['lazada sg'], categoryId: 'online' },
    { name: 'Amazon', keywords: ['amazon sg', 'amazon.sg', 'amzn'], categoryId: 'online' },
    { name: 'Zalora', keywords: ['zalora sg'], categoryId: 'online' },
    { name: 'ASOS', keywords: ['asos.com'], categoryId: 'online' },
    { name: 'SHEIN', keywords: ['shein.com', 'she in'], categoryId: 'online' },
    { name: 'Spotify', keywords: ['spotify premium', 'music streaming'], categoryId: 'online' },
    { name: 'Netflix', keywords: ['netflix.com', 'streaming'], categoryId: 'online' },
    { name: 'Disney+', keywords: ['disney plus', 'disneyplus', 'disney+ hotstar'], categoryId: 'online' },
    { name: 'Apple', keywords: ['apple store', 'app store', 'itunes', 'apple.com'], categoryId: 'online' },
    { name: 'Google', keywords: ['google play', 'google one', 'google store'], categoryId: 'online' },
    { name: 'Steam', keywords: ['steam store', 'valve', 'gaming'], categoryId: 'online' },
    { name: 'Qoo10', keywords: ['qoo10 sg'], categoryId: 'online' },
    { name: 'Carousell', keywords: ['carousell sg', 'carouhell'], categoryId: 'online' },
    { name: 'Love Bonito', keywords: ['lovebonito', 'love, bonito'], categoryId: 'online' },
    { name: 'Charles & Keith', keywords: ['charleskeith', 'charles keith', 'cnk'], categoryId: 'online' },
    { name: 'Taobao', keywords: ['taobao sg', 'tb'], categoryId: 'online' },
    { name: 'iHerb', keywords: ['iherb.com', 'supplements'], categoryId: 'online' },
    { name: 'Book Depository', keywords: ['bookdepository', 'books'], categoryId: 'online' },
    { name: 'YouTube Premium', keywords: ['youtube', 'yt premium'], categoryId: 'online' },
    { name: 'HBO Go', keywords: ['hbo', 'hbo max'], categoryId: 'online' },
    { name: 'Viu', keywords: ['viu premium'], categoryId: 'online' },

    // =========================================================================
    // GROCERIES (15+)
    // =========================================================================
    { name: 'NTUC FairPrice', keywords: ['fairprice', 'ntuc', 'fair price', 'fp'], categoryId: 'groceries' },
    { name: 'Cold Storage', keywords: ['coldstorage', 'cs'], categoryId: 'groceries' },
    { name: 'Giant', keywords: ['giant supermarket', 'giant sg'], categoryId: 'groceries' },
    { name: 'Sheng Siong', keywords: ['shengsiong', 'sheng siong supermarket', 'ss'], categoryId: 'groceries' },
    { name: 'Don Don Donki', keywords: ['donki', 'don quijote', 'dondondonki'], categoryId: 'groceries' },
    { name: 'RedMart', keywords: ['redmart', 'red mart', 'lazada redmart'], categoryId: 'groceries' },
    { name: 'Daiso', keywords: ['daiso japan', '$2 shop'], categoryId: 'groceries' },
    { name: 'Mustafa Centre', keywords: ['mustafa', 'mustafa centre'], categoryId: 'groceries' },
    { name: 'Little Farms', keywords: ['littlefarms', 'little farms organic'], categoryId: 'groceries' },
    { name: 'Market Place', keywords: ['marketplace', 'market place by jasons'], categoryId: 'groceries' },
    { name: 'HAO Mart', keywords: ['haomart', 'hao mart'], categoryId: 'groceries' },
    { name: 'Prime Supermarket', keywords: ['prime', 'prime supermarket'], categoryId: 'groceries' },
    { name: 'Meidi-Ya', keywords: ['meidiya', 'meidi ya', 'japanese grocery'], categoryId: 'groceries' },
    { name: 'Isetan Supermarket', keywords: ['isetan', 'isetan scotts'], categoryId: 'groceries' },
    { name: '7-Eleven', keywords: ['7eleven', '711', 'seven eleven', '7-11'], categoryId: 'groceries' },
    { name: 'Cheers', keywords: ['cheers convenience'], categoryId: 'groceries' },

    // =========================================================================
    // PETROL (5+)
    // =========================================================================
    { name: 'Shell', keywords: ['shell station', 'shell petrol'], categoryId: 'petrol' },
    { name: 'Esso', keywords: ['esso station', 'exxonmobil'], categoryId: 'petrol' },
    { name: 'Caltex', keywords: ['caltex station', 'chevron'], categoryId: 'petrol' },
    { name: 'SPC', keywords: ['spc station', 'singapore petroleum'], categoryId: 'petrol' },
    { name: 'Sinopec', keywords: ['sinopec station', 'china petroleum'], categoryId: 'petrol' },

    // =========================================================================
    // BILLS — Telco (subcategory: telco)
    // =========================================================================
    { name: 'Singtel', keywords: ['singtel mobile', 'singtel broadband'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'StarHub', keywords: ['starhub mobile', 'starhub broadband'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'M1', keywords: ['m1 mobile', 'm1 broadband'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'Simba Telecom', keywords: ['simba', 'simba tel'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'Circles.Life', keywords: ['circles life', 'circleslife', 'circles'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'GOMO', keywords: ['gomo singtel'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'MyRepublic', keywords: ['myrepublic', 'my republic'], categoryId: 'bills', subcategory: 'telco' },
    { name: 'ViewQwest', keywords: ['viewqwest', 'view qwest'], categoryId: 'bills', subcategory: 'telco' },

    // =========================================================================
    // BILLS — Utilities (subcategory: utilities)
    // =========================================================================
    { name: 'SP Services', keywords: ['sp group', 'sp services', 'singapore power'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'Geneco', keywords: ['geneco energy', 'geneco power'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'HDB', keywords: ['hdb rent', 'hdb loan'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'PUB', keywords: ['pub utilities', 'water bill'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'Town Council', keywords: ['town council', 'service and conservancy'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'Keppel Electric', keywords: ['keppel', 'keppel electric'], categoryId: 'bills', subcategory: 'utilities' },
    { name: 'Tuas Power', keywords: ['tuas power', 'tuaspower'], categoryId: 'bills', subcategory: 'utilities' },

    // =========================================================================
    // BILLS — Insurance (subcategory: insurance)
    // =========================================================================
    { name: 'AIA', keywords: ['aia insurance', 'aia sg'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'Prudential', keywords: ['prudential insurance', 'pru'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'Great Eastern', keywords: ['great eastern insurance', 'ge'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'NTUC Income', keywords: ['income insurance', 'ntuc income'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'Aviva', keywords: ['aviva insurance', 'aviva singlife'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'FWD', keywords: ['fwd insurance'], categoryId: 'bills', subcategory: 'insurance' },
    { name: 'Manulife', keywords: ['manulife insurance'], categoryId: 'bills', subcategory: 'insurance' },

    // =========================================================================
    // TRAVEL (15+)
    // =========================================================================
    { name: 'Singapore Airlines', keywords: ['sia', 'sq', 'singaporeairlines'], categoryId: 'travel' },
    { name: 'Scoot', keywords: ['scoot airline', 'flyscoot'], categoryId: 'travel' },
    { name: 'Jetstar', keywords: ['jetstar asia', 'jetstar airways'], categoryId: 'travel' },
    { name: 'AirAsia', keywords: ['airasia', 'air asia', 'aa'], categoryId: 'travel' },
    { name: 'Expedia', keywords: ['expedia.com', 'expedia sg'], categoryId: 'travel' },
    { name: 'Booking.com', keywords: ['booking', 'bookingcom'], categoryId: 'travel' },
    { name: 'Agoda', keywords: ['agoda.com', 'agoda sg'], categoryId: 'travel' },
    { name: 'Airbnb', keywords: ['air bnb', 'airbnb.com'], categoryId: 'travel' },
    { name: 'Klook', keywords: ['klook travel', 'klook sg'], categoryId: 'travel' },
    { name: 'Marriott', keywords: ['marriott hotel', 'marriott bonvoy'], categoryId: 'travel' },
    { name: 'Hilton', keywords: ['hilton hotel', 'hilton honors'], categoryId: 'travel' },
    { name: 'Trip.com', keywords: ['trip com', 'tripcom', 'ctrip'], categoryId: 'travel' },
    { name: 'Changi Airport', keywords: ['changi', 'jewel changi', 'changi airport group'], categoryId: 'travel' },
    { name: 'Trivago', keywords: ['trivago.com'], categoryId: 'travel' },
    { name: 'KLM', keywords: ['klm royal dutch'], categoryId: 'travel' },
    { name: 'Cathay Pacific', keywords: ['cathay', 'cx'], categoryId: 'travel' },
    { name: 'Emirates', keywords: ['emirates airline', 'ek'], categoryId: 'travel' },
    { name: 'Traveloka', keywords: ['traveloka sg'], categoryId: 'travel' },

    // =========================================================================
    // GENERAL (10+)
    // =========================================================================
    { name: 'Guardian', keywords: ['guardian pharmacy', 'guardian health'], categoryId: 'general' },
    { name: 'Watsons', keywords: ['watson', 'watsons pharmacy'], categoryId: 'general' },
    { name: 'Uniqlo', keywords: ['uniqlo sg', 'uni qlo'], categoryId: 'general' },
    { name: 'H&M', keywords: ['hm', 'h and m', 'hennes'], categoryId: 'general' },
    { name: 'Zara', keywords: ['zara sg', 'inditex'], categoryId: 'general' },
    { name: 'Cotton On', keywords: ['cottonon', 'cotton on sg'], categoryId: 'general' },
    { name: 'Miniso', keywords: ['miniso sg'], categoryId: 'general' },
    { name: 'Decathlon', keywords: ['decathlon sg', 'sports'], categoryId: 'general' },
    { name: 'Courts', keywords: ['courts sg', 'courts electronics'], categoryId: 'general' },
    { name: 'Harvey Norman', keywords: ['harveynorman', 'harvey norman sg'], categoryId: 'general' },
    { name: 'Best Denki', keywords: ['bestdenki', 'best denki'], categoryId: 'general' },
    { name: 'Challenger', keywords: ['challenger sg', 'electronics'], categoryId: 'general' },
    { name: 'Popular Bookstore', keywords: ['popular', 'popular book'], categoryId: 'general' },
    { name: 'IKEA', keywords: ['ikea sg', 'ikea tampines', 'ikea alexandra'], categoryId: 'general' },
    { name: 'Marks & Spencer', keywords: ['marks spencer', 'm&s', 'marks and spencer'], categoryId: 'general' },
    { name: 'Sephora', keywords: ['sephora sg', 'beauty'], categoryId: 'general' },
    { name: 'Nike', keywords: ['nike sg', 'nike store'], categoryId: 'general' },
    { name: 'Adidas', keywords: ['adidas sg', 'adidas store'], categoryId: 'general' },
  ];
}

// ---------------------------------------------------------------------------
// Lazy singleton
// ---------------------------------------------------------------------------

let _catalogue: MerchantEntry[] | null = null;

/**
 * Returns the full merchant catalogue. Lazily initialised on first call.
 */
export function getMerchantCatalogue(): MerchantEntry[] {
  if (!_catalogue) _catalogue = buildStaticCatalogue();
  return _catalogue;
}

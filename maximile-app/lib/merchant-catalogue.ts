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
  /** Slug matching filename in assets/merchants/ (e.g. 'starbucks') */
  logo?: string;
}

// ---------------------------------------------------------------------------
// Static catalogue builder
// ---------------------------------------------------------------------------

function buildStaticCatalogue(): MerchantEntry[] {
  return [
    // =========================================================================
    // DINING (40+)
    // =========================================================================
    { name: "McDonald's", keywords: ['mcdonalds', 'mcd', 'mcds', 'macs'], categoryId: 'dining', logo: 'mcdonalds' },
    { name: 'Starbucks', keywords: ['starbux', 'sbux'], categoryId: 'dining', logo: 'starbucks' },
    { name: 'KFC', keywords: ['kentucky fried chicken', 'kentucky'], categoryId: 'dining', logo: 'kfc' },
    { name: 'Burger King', keywords: ['bk', 'burgerking'], categoryId: 'dining', logo: 'burger-king' },
    { name: 'Subway', keywords: ['sub'], categoryId: 'dining', logo: 'subway' },
    { name: 'Toast Box', keywords: ['toastbox'], categoryId: 'dining', logo: 'toast-box' },
    { name: 'Ya Kun Kaya Toast', keywords: ['ya kun', 'yakun', 'kaya toast'], categoryId: 'dining', logo: 'ya-kun-kaya-toast' },
    { name: 'Sushi Tei', keywords: ['sushitei'], categoryId: 'dining', logo: 'sushi-tei' },
    { name: 'Crystal Jade', keywords: ['crystaljade', 'crystal jade kitchen'], categoryId: 'dining', logo: 'crystal-jade' },
    { name: 'Din Tai Fung', keywords: ['dintaifung', 'dtf'], categoryId: 'dining', logo: 'din-tai-fung' },
    { name: 'Pizza Hut', keywords: ['pizzahut', 'ph'], categoryId: 'dining', logo: 'pizza-hut' },
    { name: "Domino's Pizza", keywords: ['dominos', 'dominoes'], categoryId: 'dining', logo: 'dominos-pizza' },
    { name: "Nando's", keywords: ['nandos', 'nando'], categoryId: 'dining', logo: 'nandos' },
    { name: 'Old Chang Kee', keywords: ['ock', 'oldchangkee', 'old chang'], categoryId: 'dining', logo: 'old-chang-kee' },
    { name: 'Gong Cha', keywords: ['gongcha', 'bubble tea'], categoryId: 'dining', logo: 'gong-cha' },
    { name: 'Jollibean', keywords: ['jolli bean'], categoryId: 'dining', logo: 'jollibean' },
    { name: 'FoodPanda', keywords: ['foodpanda', 'food panda', 'panda'], categoryId: 'dining', logo: 'foodpanda' },
    { name: 'GrabFood', keywords: ['grabfood', 'grab food'], categoryId: 'dining', logo: 'grabfood' },
    { name: 'Deliveroo', keywords: ['deliveroo', 'roo'], categoryId: 'dining', logo: 'deliveroo' },
    { name: 'Kopitiam', keywords: ['kopi tiam', 'kopi'], categoryId: 'dining', logo: 'kopitiam' },
    { name: 'Food Republic', keywords: ['foodrepublic', 'food court'], categoryId: 'dining', logo: 'food-republic' },
    { name: 'Koufu', keywords: ['kou fu'], categoryId: 'dining', logo: 'koufu' },
    { name: "Swensen's", keywords: ['swensens', 'swensen'], categoryId: 'dining', logo: 'swensens' },
    { name: 'Sakae Sushi', keywords: ['sakae'], categoryId: 'dining', logo: 'sakae-sushi' },
    { name: 'Genki Sushi', keywords: ['genki'], categoryId: 'dining', logo: 'genki-sushi' },
    { name: 'Tim Ho Wan', keywords: ['timhowan', 'dim sum'], categoryId: 'dining', logo: 'tim-ho-wan' },
    { name: 'Pepper Lunch', keywords: ['pepperlunch', 'pepper'], categoryId: 'dining', logo: 'pepper-lunch' },
    { name: 'Ajisen Ramen', keywords: ['ajisen', 'ramen'], categoryId: 'dining', logo: 'ajisen-ramen' },
    { name: 'Ichiban Boshi', keywords: ['ichiban'], categoryId: 'dining', logo: 'ichiban-boshi' },
    { name: 'Yoshinoya', keywords: ['yoshi', 'beef bowl'], categoryId: 'dining', logo: 'yoshinoya' },
    { name: 'Jollibee', keywords: ['jolly bee', 'jolli bee'], categoryId: 'dining', logo: 'jollibee' },
    { name: 'PastaMania', keywords: ['pastamania', 'pasta mania', 'pasta'], categoryId: 'dining', logo: 'pastamania' },
    { name: "Collin's", keywords: ['collins', 'collin'], categoryId: 'dining', logo: 'collins' },
    { name: 'The Soup Spoon', keywords: ['soup spoon', 'soupspoon'], categoryId: 'dining', logo: 'the-soup-spoon' },
    { name: "Stuff'd", keywords: ['stuffd', 'stuffed', 'kebab'], categoryId: 'dining', logo: 'stuffd' },
    { name: 'Poke Theory', keywords: ['poke', 'poketheory'], categoryId: 'dining', logo: 'poke-theory' },
    { name: 'SaladStop!', keywords: ['saladstop', 'salad stop', 'salad'], categoryId: 'dining', logo: 'saladstop' },
    { name: 'BreadTalk', keywords: ['breadtalk', 'bread talk', 'bread'], categoryId: 'dining', logo: 'breadtalk' },
    { name: 'Delifrance', keywords: ['deli france', 'delifrance'], categoryId: 'dining', logo: 'delifrance' },
    { name: 'Coffee Bean & Tea Leaf', keywords: ['cbtl', 'coffee bean', 'coffeebean'], categoryId: 'dining', logo: 'coffee-bean-tea-leaf' },
    { name: "Wendy's", keywords: ['wendys'], categoryId: 'dining', logo: 'wendys' },
    { name: "Marché Mövenpick", keywords: ['marche', 'movenpick', 'marche movenpick'], categoryId: 'dining', logo: 'marche-movenpick' },
    { name: 'Hai Di Lao', keywords: ['haidilao', 'hai di lao', 'hotpot'], categoryId: 'dining', logo: 'hai-di-lao' },
    { name: 'Paradise Group', keywords: ['paradise', 'paradise dynasty'], categoryId: 'dining', logo: 'paradise-group' },
    { name: 'Jumbo Seafood', keywords: ['jumbo', 'chilli crab'], categoryId: 'dining', logo: 'jumbo-seafood' },
    { name: 'LiHO', keywords: ['liho', 'li ho', 'bubble tea'], categoryId: 'dining', logo: 'liho' },
    { name: 'Koi Thé', keywords: ['koi', 'koi the', 'bubble tea'], categoryId: 'dining', logo: 'koi-the' },
    { name: 'Tiger Sugar', keywords: ['tigersugar', 'boba'], categoryId: 'dining', logo: 'tiger-sugar' },
    { name: 'Krispy Kreme', keywords: ['krispykreme', 'krispy', 'donut'], categoryId: 'dining', logo: 'krispy-kreme' },
    { name: 'Paris Baguette', keywords: ['paris', 'baguette', 'parisbaguette'], categoryId: 'dining', logo: 'paris-baguette' },

    // =========================================================================
    // TRANSPORT (10+)
    // =========================================================================
    { name: 'Grab', keywords: ['grab ride', 'grabcar', 'grab car', 'ride hailing'], categoryId: 'transport', logo: 'grab' },
    { name: 'Gojek', keywords: ['go jek', 'go-jek'], categoryId: 'transport', logo: 'gojek' },
    { name: 'ComfortDelGro', keywords: ['comfort', 'cdg', 'comfortdelgro', 'comfort taxi'], categoryId: 'transport', logo: 'comfortdelgro' },
    { name: 'SMRT', keywords: ['smrt taxis', 'mrt'], categoryId: 'transport', logo: 'smrt' },
    { name: 'EZ-Link', keywords: ['ezlink', 'ez link', 'ez-link top up'], categoryId: 'transport', logo: 'ez-link' },
    { name: 'CDG Zig', keywords: ['zig', 'cdg zig', 'comfort zig'], categoryId: 'transport', logo: 'cdg-zig' },
    { name: 'BlueSG', keywords: ['bluesg', 'blue sg', 'car sharing'], categoryId: 'transport', logo: 'bluesg' },
    { name: 'Tada', keywords: ['tada ride'], categoryId: 'transport', logo: 'tada' },
    { name: 'Ryde', keywords: ['ryde ride'], categoryId: 'transport', logo: 'ryde' },
    { name: 'GetGo', keywords: ['getgo', 'get go', 'car rental'], categoryId: 'transport', logo: 'getgo' },
    { name: 'Tribecar', keywords: ['tribe car', 'tribecar'], categoryId: 'transport', logo: 'tribecar' },

    // =========================================================================
    // ONLINE SHOPPING (20+)
    // =========================================================================
    { name: 'Shopee', keywords: ['shoppee', 'shopee sg'], categoryId: 'online', logo: 'shopee' },
    { name: 'Lazada', keywords: ['lazada sg'], categoryId: 'online', logo: 'lazada' },
    { name: 'Amazon', keywords: ['amazon sg', 'amazon.sg', 'amzn'], categoryId: 'online', logo: 'amazon' },
    { name: 'Zalora', keywords: ['zalora sg'], categoryId: 'online', logo: 'zalora' },
    { name: 'ASOS', keywords: ['asos.com'], categoryId: 'online', logo: 'asos' },
    { name: 'SHEIN', keywords: ['shein.com', 'she in'], categoryId: 'online', logo: 'shein' },
    { name: 'Spotify', keywords: ['spotify premium', 'music streaming'], categoryId: 'online', logo: 'spotify' },
    { name: 'Netflix', keywords: ['netflix.com', 'streaming'], categoryId: 'online', logo: 'netflix' },
    { name: 'Disney+', keywords: ['disney plus', 'disneyplus', 'disney+ hotstar'], categoryId: 'online', logo: 'disney-plus' },
    { name: 'Apple', keywords: ['apple store', 'app store', 'itunes', 'apple.com'], categoryId: 'online', logo: 'apple' },
    { name: 'Google', keywords: ['google play', 'google one', 'google store'], categoryId: 'online', logo: 'google' },
    { name: 'Steam', keywords: ['steam store', 'valve', 'gaming'], categoryId: 'online', logo: 'steam' },
    { name: 'Qoo10', keywords: ['qoo10 sg'], categoryId: 'online', logo: 'qoo10' },
    { name: 'Carousell', keywords: ['carousell sg', 'carouhell'], categoryId: 'online', logo: 'carousell' },
    { name: 'Love Bonito', keywords: ['lovebonito', 'love, bonito'], categoryId: 'online', logo: 'love-bonito' },
    { name: 'Charles & Keith', keywords: ['charleskeith', 'charles keith', 'cnk'], categoryId: 'online', logo: 'charles-keith' },
    { name: 'Taobao', keywords: ['taobao sg', 'tb'], categoryId: 'online', logo: 'taobao' },
    { name: 'iHerb', keywords: ['iherb.com', 'supplements'], categoryId: 'online', logo: 'iherb' },
    { name: 'Book Depository', keywords: ['bookdepository', 'books'], categoryId: 'online', logo: 'book-depository' },
    { name: 'YouTube Premium', keywords: ['youtube', 'yt premium'], categoryId: 'online', logo: 'youtube-premium' },
    { name: 'HBO Go', keywords: ['hbo', 'hbo max'], categoryId: 'online', logo: 'hbo-go' },
    { name: 'Viu', keywords: ['viu premium'], categoryId: 'online', logo: 'viu' },

    // =========================================================================
    // GROCERIES (15+)
    // =========================================================================
    { name: 'NTUC FairPrice', keywords: ['fairprice', 'ntuc', 'fair price', 'fp'], categoryId: 'groceries', logo: 'ntuc-fairprice' },
    { name: 'Cold Storage', keywords: ['coldstorage', 'cs'], categoryId: 'groceries', logo: 'cold-storage' },
    { name: 'Giant', keywords: ['giant supermarket', 'giant sg'], categoryId: 'groceries', logo: 'giant' },
    { name: 'Sheng Siong', keywords: ['shengsiong', 'sheng siong supermarket', 'ss'], categoryId: 'groceries', logo: 'sheng-siong' },
    { name: 'Don Don Donki', keywords: ['donki', 'don quijote', 'dondondonki'], categoryId: 'groceries', logo: 'don-don-donki' },
    { name: 'RedMart', keywords: ['redmart', 'red mart', 'lazada redmart'], categoryId: 'groceries', logo: 'redmart' },
    { name: 'Daiso', keywords: ['daiso japan', '$2 shop'], categoryId: 'groceries', logo: 'daiso' },
    { name: 'Mustafa Centre', keywords: ['mustafa', 'mustafa centre'], categoryId: 'groceries', logo: 'mustafa-centre' },
    { name: 'Little Farms', keywords: ['littlefarms', 'little farms organic'], categoryId: 'groceries', logo: 'little-farms' },
    { name: 'Market Place', keywords: ['marketplace', 'market place by jasons'], categoryId: 'groceries', logo: 'market-place' },
    { name: 'HAO Mart', keywords: ['haomart', 'hao mart'], categoryId: 'groceries', logo: 'hao-mart' },
    { name: 'Prime Supermarket', keywords: ['prime', 'prime supermarket'], categoryId: 'groceries', logo: 'prime-supermarket' },
    { name: 'Meidi-Ya', keywords: ['meidiya', 'meidi ya', 'japanese grocery'], categoryId: 'groceries', logo: 'meidi-ya' },
    { name: 'Isetan Supermarket', keywords: ['isetan', 'isetan scotts'], categoryId: 'groceries', logo: 'isetan-supermarket' },
    { name: '7-Eleven', keywords: ['7eleven', '711', 'seven eleven', '7-11'], categoryId: 'groceries', logo: '7-eleven' },
    { name: 'Cheers', keywords: ['cheers convenience'], categoryId: 'groceries', logo: 'cheers' },

    // =========================================================================
    // PETROL (5+)
    // =========================================================================
    { name: 'Shell', keywords: ['shell station', 'shell petrol'], categoryId: 'petrol', logo: 'shell' },
    { name: 'Esso', keywords: ['esso station', 'exxonmobil'], categoryId: 'petrol', logo: 'esso' },
    { name: 'Caltex', keywords: ['caltex station', 'chevron'], categoryId: 'petrol', logo: 'caltex' },
    { name: 'SPC', keywords: ['spc station', 'singapore petroleum'], categoryId: 'petrol', logo: 'spc' },
    { name: 'Sinopec', keywords: ['sinopec station', 'china petroleum'], categoryId: 'petrol', logo: 'sinopec' },

    // =========================================================================
    // BILLS — Telco (subcategory: telco)
    // =========================================================================
    { name: 'Singtel', keywords: ['singtel mobile', 'singtel broadband'], categoryId: 'bills', subcategory: 'telco', logo: 'singtel' },
    { name: 'StarHub', keywords: ['starhub mobile', 'starhub broadband'], categoryId: 'bills', subcategory: 'telco', logo: 'starhub' },
    { name: 'M1', keywords: ['m1 mobile', 'm1 broadband'], categoryId: 'bills', subcategory: 'telco', logo: 'm1' },
    { name: 'Simba Telecom', keywords: ['simba', 'simba tel'], categoryId: 'bills', subcategory: 'telco', logo: 'simba-telecom' },
    { name: 'Circles.Life', keywords: ['circles life', 'circleslife', 'circles'], categoryId: 'bills', subcategory: 'telco', logo: 'circles-life' },
    { name: 'GOMO', keywords: ['gomo singtel'], categoryId: 'bills', subcategory: 'telco', logo: 'gomo' },
    { name: 'MyRepublic', keywords: ['myrepublic', 'my republic'], categoryId: 'bills', subcategory: 'telco', logo: 'myrepublic' },
    { name: 'ViewQwest', keywords: ['viewqwest', 'view qwest'], categoryId: 'bills', subcategory: 'telco', logo: 'viewqwest' },

    // =========================================================================
    // BILLS — Utilities (subcategory: utilities)
    // =========================================================================
    { name: 'SP Services', keywords: ['sp group', 'sp services', 'singapore power'], categoryId: 'bills', subcategory: 'utilities', logo: 'sp-services' },
    { name: 'Geneco', keywords: ['geneco energy', 'geneco power'], categoryId: 'bills', subcategory: 'utilities', logo: 'geneco' },
    { name: 'HDB', keywords: ['hdb rent', 'hdb loan'], categoryId: 'bills', subcategory: 'utilities', logo: 'hdb' },
    { name: 'PUB', keywords: ['pub utilities', 'water bill'], categoryId: 'bills', subcategory: 'utilities', logo: 'pub' },
    { name: 'Town Council', keywords: ['town council', 'service and conservancy'], categoryId: 'bills', subcategory: 'utilities', logo: 'town-council' },
    { name: 'Keppel Electric', keywords: ['keppel', 'keppel electric'], categoryId: 'bills', subcategory: 'utilities', logo: 'keppel-electric' },
    { name: 'Tuas Power', keywords: ['tuas power', 'tuaspower'], categoryId: 'bills', subcategory: 'utilities', logo: 'tuas-power' },

    // =========================================================================
    // BILLS — Insurance (subcategory: insurance)
    // =========================================================================
    { name: 'AIA', keywords: ['aia insurance', 'aia sg'], categoryId: 'bills', subcategory: 'insurance', logo: 'aia' },
    { name: 'Prudential', keywords: ['prudential insurance', 'pru'], categoryId: 'bills', subcategory: 'insurance', logo: 'prudential' },
    { name: 'Great Eastern', keywords: ['great eastern insurance', 'ge'], categoryId: 'bills', subcategory: 'insurance', logo: 'great-eastern' },
    { name: 'NTUC Income', keywords: ['income insurance', 'ntuc income'], categoryId: 'bills', subcategory: 'insurance', logo: 'ntuc-income' },
    { name: 'Aviva', keywords: ['aviva insurance', 'aviva singlife'], categoryId: 'bills', subcategory: 'insurance', logo: 'aviva' },
    { name: 'FWD', keywords: ['fwd insurance'], categoryId: 'bills', subcategory: 'insurance', logo: 'fwd' },
    { name: 'Manulife', keywords: ['manulife insurance'], categoryId: 'bills', subcategory: 'insurance', logo: 'manulife' },

    // =========================================================================
    // TRAVEL (15+)
    // =========================================================================
    { name: 'Singapore Airlines', keywords: ['sia', 'sq', 'singaporeairlines'], categoryId: 'travel', logo: 'singapore-airlines' },
    { name: 'Scoot', keywords: ['scoot airline', 'flyscoot'], categoryId: 'travel', logo: 'scoot' },
    { name: 'Jetstar', keywords: ['jetstar asia', 'jetstar airways'], categoryId: 'travel', logo: 'jetstar' },
    { name: 'AirAsia', keywords: ['airasia', 'air asia', 'aa'], categoryId: 'travel', logo: 'airasia' },
    { name: 'Expedia', keywords: ['expedia.com', 'expedia sg'], categoryId: 'travel', logo: 'expedia' },
    { name: 'Booking.com', keywords: ['booking', 'bookingcom'], categoryId: 'travel', logo: 'booking-com' },
    { name: 'Agoda', keywords: ['agoda.com', 'agoda sg'], categoryId: 'travel', logo: 'agoda' },
    { name: 'Airbnb', keywords: ['air bnb', 'airbnb.com'], categoryId: 'travel', logo: 'airbnb' },
    { name: 'Klook', keywords: ['klook travel', 'klook sg'], categoryId: 'travel', logo: 'klook' },
    { name: 'Marriott', keywords: ['marriott hotel', 'marriott bonvoy'], categoryId: 'travel', logo: 'marriott' },
    { name: 'Hilton', keywords: ['hilton hotel', 'hilton honors'], categoryId: 'travel', logo: 'hilton' },
    { name: 'Trip.com', keywords: ['trip com', 'tripcom', 'ctrip'], categoryId: 'travel', logo: 'trip-com' },
    { name: 'Changi Airport', keywords: ['changi', 'jewel changi', 'changi airport group'], categoryId: 'travel', logo: 'changi-airport' },
    { name: 'Trivago', keywords: ['trivago.com'], categoryId: 'travel', logo: 'trivago' },
    { name: 'KLM', keywords: ['klm royal dutch'], categoryId: 'travel', logo: 'klm' },
    { name: 'Cathay Pacific', keywords: ['cathay', 'cx'], categoryId: 'travel', logo: 'cathay-pacific' },
    { name: 'Emirates', keywords: ['emirates airline', 'ek'], categoryId: 'travel', logo: 'emirates' },
    { name: 'Traveloka', keywords: ['traveloka sg'], categoryId: 'travel', logo: 'traveloka' },

    // =========================================================================
    // GENERAL (10+)
    // =========================================================================
    { name: 'Guardian', keywords: ['guardian pharmacy', 'guardian health'], categoryId: 'general', logo: 'guardian' },
    { name: 'Watsons', keywords: ['watson', 'watsons pharmacy'], categoryId: 'general', logo: 'watsons' },
    { name: 'Uniqlo', keywords: ['uniqlo sg', 'uni qlo'], categoryId: 'general', logo: 'uniqlo' },
    { name: 'H&M', keywords: ['hm', 'h and m', 'hennes'], categoryId: 'general', logo: 'h-m' },
    { name: 'Zara', keywords: ['zara sg', 'inditex'], categoryId: 'general', logo: 'zara' },
    { name: 'Cotton On', keywords: ['cottonon', 'cotton on sg'], categoryId: 'general', logo: 'cotton-on' },
    { name: 'Miniso', keywords: ['miniso sg'], categoryId: 'general', logo: 'miniso' },
    { name: 'Decathlon', keywords: ['decathlon sg', 'sports'], categoryId: 'general', logo: 'decathlon' },
    { name: 'Courts', keywords: ['courts sg', 'courts electronics'], categoryId: 'general', logo: 'courts' },
    { name: 'Harvey Norman', keywords: ['harveynorman', 'harvey norman sg'], categoryId: 'general', logo: 'harvey-norman' },
    { name: 'Best Denki', keywords: ['bestdenki', 'best denki'], categoryId: 'general', logo: 'best-denki' },
    { name: 'Challenger', keywords: ['challenger sg', 'electronics'], categoryId: 'general', logo: 'challenger' },
    { name: 'Popular Bookstore', keywords: ['popular', 'popular book'], categoryId: 'general', logo: 'popular-bookstore' },
    { name: 'IKEA', keywords: ['ikea sg', 'ikea tampines', 'ikea alexandra'], categoryId: 'general', logo: 'ikea' },
    { name: 'Marks & Spencer', keywords: ['marks spencer', 'm&s', 'marks and spencer'], categoryId: 'general', logo: 'marks-spencer' },
    { name: 'Sephora', keywords: ['sephora sg', 'beauty'], categoryId: 'general', logo: 'sephora' },
    { name: 'Nike', keywords: ['nike sg', 'nike store'], categoryId: 'general', logo: 'nike' },
    { name: 'Adidas', keywords: ['adidas sg', 'adidas store'], categoryId: 'general', logo: 'adidas' },
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

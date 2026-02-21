// =============================================================================
// MaxiMile — Bank Notification Parsers (S17.2)
// =============================================================================
// Regex parsers to extract transaction data from Singapore bank notifications.
// Supports: DBS, OCBC, UOB, Citi, AMEX, Google Pay, Samsung Pay
// =============================================================================

export interface ParsedTransaction {
  /** Transaction amount in SGD */
  amount: number;

  /** Merchant name */
  merchant: string;

  /** Last 4 digits of card */
  cardLast4: string;

  /** Bank identifier */
  bank: string;

  /** Whether parsing was successful */
  success: boolean;
}

// =============================================================================
// DBS / POSB Parser
// =============================================================================

/**
 * Parse DBS/POSB notification format:
 * "Your DBS/POSB Card ending 1234 was used for SGD 42.50 at COLD STORAGE on 21 Feb"
 */
function parseDBS(text: string): ParsedTransaction | null {
  // Pattern: "Card ending XXXX was used for SGD/S$ AMOUNT at MERCHANT on DATE"
  const pattern = /(?:DBS|POSB)\s+Card\s+ending\s+(\d{4})\s+was\s+used\s+for\s+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+at\s+(.+?)\s+on/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, cardLast4, amountStr, merchant] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'DBS',
    success: true,
  };
}

// =============================================================================
// OCBC Parser
// =============================================================================

/**
 * Parse OCBC notification format:
 * "Card xxxx1234 txn SGD 42.50 at MERCHANT NAME on 21/02"
 */
function parseOCBC(text: string): ParsedTransaction | null {
  // Pattern: "Card xxxx1234 txn SGD AMOUNT at MERCHANT on DATE"
  const pattern = /Card\s+(?:xxxx)?(\d{4})\s+txn\s+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+at\s+(.+?)\s+on/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, cardLast4, amountStr, merchant] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'OCBC',
    success: true,
  };
}

// =============================================================================
// UOB Parser
// =============================================================================

/**
 * Parse UOB notification format:
 * "UOB Card ending 1234: SGD 42.50 at MERCHANT. Date: 21 Feb 2026"
 */
function parseUOB(text: string): ParsedTransaction | null {
  // Pattern: "UOB Card ending 1234: SGD AMOUNT at MERCHANT"
  const pattern = /UOB\s+Card\s+ending\s+(\d{4})[:\s]+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+at\s+(.+?)(?:\.|Date:)/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, cardLast4, amountStr, merchant] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'UOB',
    success: true,
  };
}

// =============================================================================
// Citi Parser
// =============================================================================

/**
 * Parse Citi notification format:
 * "Citi Card x1234 SGD 42.50 MERCHANT NAME 21FEB"
 */
function parseCiti(text: string): ParsedTransaction | null {
  // Pattern: "Citi Card x1234 SGD AMOUNT MERCHANT"
  const pattern = /Citi\s+Card\s+x?(\d{4})\s+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+(.+?)\s+\d{1,2}[A-Z]{3}/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, cardLast4, amountStr, merchant] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'Citi',
    success: true,
  };
}

// =============================================================================
// AMEX Parser
// =============================================================================

/**
 * Parse AMEX notification format:
 * "A charge of SGD 42.50 was made on your AMEX card ending 1234 at MERCHANT"
 */
function parseAMEX(text: string): ParsedTransaction | null {
  // Pattern: "charge of SGD AMOUNT was made on your AMEX card ending 1234 at MERCHANT"
  const pattern = /charge\s+of\s+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+was\s+made\s+on\s+your\s+(?:AMEX|American\s+Express)\s+card\s+ending\s+(\d{4})\s+at\s+(.+?)(?:\.|$)/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, amountStr, cardLast4, merchant] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'AMEX',
    success: true,
  };
}

// =============================================================================
// Google Pay Parser
// =============================================================================

/**
 * Parse Google Pay notification format:
 * "You paid SGD 42.50 at MERCHANT using •••• 1234"
 */
function parseGooglePay(text: string): ParsedTransaction | null {
  // Pattern: "You paid SGD AMOUNT at MERCHANT using •••• 1234"
  const pattern = /(?:You\s+)?paid\s+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+at\s+(.+?)\s+using\s+[•●]{4}\s*(\d{4})/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, amountStr, merchant, cardLast4] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'Google Pay',
    success: true,
  };
}

// =============================================================================
// Samsung Pay Parser
// =============================================================================

/**
 * Parse Samsung Pay notification format:
 * "Samsung Pay: SGD 42.50 at MERCHANT (****1234)"
 */
function parseSamsungPay(text: string): ParsedTransaction | null {
  // Pattern: "Samsung Pay: SGD AMOUNT at MERCHANT (****1234)"
  const pattern = /Samsung\s+Pay[:\s]+(?:SGD|S\$)\s*([\d,]+\.?\d*)\s+at\s+(.+?)\s+\([*•●]{4}(\d{4})\)/i;

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const [, amountStr, merchant, cardLast4] = match;

  const amount = parseFloat(amountStr.replace(/,/g, ''));
  if (isNaN(amount)) {
    return null;
  }

  return {
    amount,
    merchant: merchant.trim(),
    cardLast4: cardLast4,
    bank: 'Samsung Pay',
    success: true,
  };
}

// =============================================================================
// Parser Router
// =============================================================================

/**
 * Route notification to the appropriate parser based on package name.
 */
export function parseNotification(
  packageName: string,
  notificationText: string
): ParsedTransaction | null {
  // Try parsing with the appropriate bank parser
  let result: ParsedTransaction | null = null;

  if (packageName.includes('dbs') || packageName.includes('posb')) {
    result = parseDBS(notificationText);
  } else if (packageName.includes('ocbc')) {
    result = parseOCBC(notificationText);
  } else if (packageName.includes('uob')) {
    result = parseUOB(notificationText);
  } else if (packageName.includes('citi')) {
    result = parseCiti(notificationText);
  } else if (packageName.includes('americanexpress')) {
    result = parseAMEX(notificationText);
  } else if (packageName.includes('google') && packageName.includes('wallet')) {
    result = parseGooglePay(notificationText);
  } else if (packageName.includes('samsung') && packageName.includes('spay')) {
    result = parseSamsungPay(notificationText);
  }

  if (result) {
    return result;
  }

  // If no parser matched, try all parsers as fallback
  const parsers = [parseDBS, parseOCBC, parseUOB, parseCiti, parseAMEX, parseGooglePay, parseSamsungPay];

  for (const parser of parsers) {
    const parsed = parser(notificationText);
    if (parsed) {
      return parsed;
    }
  }

  // No parser could handle this notification
  console.log('[NotificationParser] Unknown format:', notificationText);
  return null;
}

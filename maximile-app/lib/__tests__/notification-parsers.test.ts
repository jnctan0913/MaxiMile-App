// =============================================================================
// MaxiMile — Notification Parser Tests (S17.5)
// =============================================================================
// Unit tests for all bank notification parsers.
// =============================================================================

import { parseNotification } from '../notification-parsers';

describe('Notification Parsers', () => {
  // =============================================================================
  // DBS / POSB Tests
  // =============================================================================

  describe('DBS Parser', () => {
    it('should parse standard DBS notification', () => {
      const text = 'Your DBS Card ending 1234 was used for SGD 42.50 at COLD STORAGE on 21 Feb';
      const result = parseNotification('com.dbs.sg.dbsmbanking', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('COLD STORAGE');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('DBS');
    });

    it('should parse POSB notification', () => {
      const text = 'Your POSB Card ending 5678 was used for S$ 123.45 at NTUC FAIRPRICE on 15 Mar';
      const result = parseNotification('com.dbs.sg.posb', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(123.45);
      expect(result?.merchant).toBe('NTUC FAIRPRICE');
      expect(result?.cardLast4).toBe('5678');
      expect(result?.bank).toBe('DBS');
    });

    it('should handle amounts with commas', () => {
      const text = 'Your DBS Card ending 9999 was used for SGD 1,234.56 at ELECTRONICS STORE on 10 Jan';
      const result = parseNotification('com.dbs.sg.dbsmbanking', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(1234.56);
    });
  });

  // =============================================================================
  // OCBC Tests
  // =============================================================================

  describe('OCBC Parser', () => {
    it('should parse standard OCBC notification', () => {
      const text = 'Card xxxx1234 txn SGD 42.50 at MERCHANT NAME on 21/02';
      const result = parseNotification('com.ocbc.mobile', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT NAME');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('OCBC');
    });

    it('should parse OCBC notification without xxxx prefix', () => {
      const text = 'Card 5678 txn S$ 99.99 at CAFE LATTE on 03/11';
      const result = parseNotification('com.ocbc.mobile', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(99.99);
      expect(result?.merchant).toBe('CAFE LATTE');
      expect(result?.cardLast4).toBe('5678');
    });
  });

  // =============================================================================
  // UOB Tests
  // =============================================================================

  describe('UOB Parser', () => {
    it('should parse standard UOB notification', () => {
      const text = 'UOB Card ending 1234: SGD 42.50 at MERCHANT. Date: 21 Feb 2026';
      const result = parseNotification('com.uob.mightymobile', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('UOB');
    });

    it('should parse UOB notification with colon format', () => {
      const text = 'UOB Card ending 8888 SGD 150.00 at RESTAURANT ABC. Date: 05 Jan 2026';
      const result = parseNotification('com.uob.mightymobile', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(150.00);
      expect(result?.merchant).toBe('RESTAURANT ABC');
    });
  });

  // =============================================================================
  // Citi Tests
  // =============================================================================

  describe('Citi Parser', () => {
    it('should parse standard Citi notification', () => {
      const text = 'Citi Card x1234 SGD 42.50 MERCHANT NAME 21FEB';
      const result = parseNotification('com.citi.citimobilesg', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT NAME');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('Citi');
    });

    it('should parse Citi notification without x prefix', () => {
      const text = 'Citi Card 9876 S$ 88.88 COFFEE SHOP 15MAR';
      const result = parseNotification('com.citi.citimobilesg', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(88.88);
      expect(result?.cardLast4).toBe('9876');
    });
  });

  // =============================================================================
  // AMEX Tests
  // =============================================================================

  describe('AMEX Parser', () => {
    it('should parse standard AMEX notification', () => {
      const text = 'A charge of SGD 42.50 was made on your AMEX card ending 1234 at MERCHANT';
      const result = parseNotification('com.americanexpress.android.acctsvcs.sg', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('AMEX');
    });

    it('should parse AMEX with American Express spelled out', () => {
      const text = 'A charge of S$ 250.00 was made on your American Express card ending 5555 at ELECTRONICS';
      const result = parseNotification('com.americanexpress.android.acctsvcs.sg', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(250.00);
      expect(result?.merchant).toBe('ELECTRONICS');
    });
  });

  // =============================================================================
  // Google Pay Tests
  // =============================================================================

  describe('Google Pay Parser', () => {
    it('should parse standard Google Pay notification', () => {
      const text = 'You paid SGD 42.50 at MERCHANT using •••• 1234';
      const result = parseNotification('com.google.android.apps.walletnfcrel', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('Google Pay');
    });

    it('should parse Google Pay with different bullet characters', () => {
      const text = 'You paid S$ 15.50 at CAFE using ●●●● 9999';
      const result = parseNotification('com.google.android.apps.walletnfcrel', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(15.50);
      expect(result?.cardLast4).toBe('9999');
    });
  });

  // =============================================================================
  // Samsung Pay Tests
  // =============================================================================

  describe('Samsung Pay Parser', () => {
    it('should parse standard Samsung Pay notification', () => {
      const text = 'Samsung Pay: SGD 42.50 at MERCHANT (****1234)';
      const result = parseNotification('com.samsung.android.spay', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(42.50);
      expect(result?.merchant).toBe('MERCHANT');
      expect(result?.cardLast4).toBe('1234');
      expect(result?.bank).toBe('Samsung Pay');
    });

    it('should parse Samsung Pay with different formats', () => {
      const text = 'Samsung Pay SGD 99.00 at GROCERY (••••5678)';
      const result = parseNotification('com.samsung.android.spay', text);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(99.00);
      expect(result?.cardLast4).toBe('5678');
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('Edge Cases', () => {
    it('should return null for unknown format', () => {
      const text = 'This is not a valid notification format';
      const result = parseNotification('com.unknown.app', text);

      expect(result).toBeNull();
    });

    it('should return null for malformed amount', () => {
      const text = 'Your DBS Card ending 1234 was used for SGD INVALID at MERCHANT on 21 Feb';
      const result = parseNotification('com.dbs.sg.dbsmbanking', text);

      expect(result).toBeNull();
    });

    it('should handle merchant names with special characters', () => {
      const text = 'Your DBS Card ending 1234 was used for SGD 42.50 at MERCHANT & CO. (SINGAPORE) on 21 Feb';
      const result = parseNotification('com.dbs.sg.dbsmbanking', text);

      expect(result).not.toBeNull();
      expect(result?.merchant).toContain('MERCHANT & CO.');
    });
  });
});

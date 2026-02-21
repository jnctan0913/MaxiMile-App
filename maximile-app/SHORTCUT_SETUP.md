# MaxiMile Apple Shortcuts Setup Guide

## Problem
The existing MaxiMile.shortcut file has an empty URL configuration, preventing it from opening the app correctly.

## Solution: Create the Shortcut Manually

### Method 1: Quick Expense Logger (Simple)

1. **Open Shortcuts app** on your iPhone
2. **Tap "+" to create a new shortcut**
3. **Add "Open URLs" action**
   - Search for "Open URLs" in the actions list
   - Add it to your shortcut
4. **Configure the URL**:
   ```
   maximile://log?source=shortcut
   ```
5. **Name the shortcut**: "Log to MaxiMile"
6. **Tap Done**

This creates a simple shortcut that opens MaxiMile directly to the log screen.

---

### Method 2: Transaction Logger with Details (Advanced)

This version asks for transaction details before opening MaxiMile.

1. **Open Shortcuts app** on your iPhone
2. **Tap "+" to create a new shortcut**

3. **Add actions in this order**:

   a. **Ask for Input** (Amount)
   - Action: "Ask for Input"
   - Prompt: "How much did you spend?"
   - Input Type: Number
   - Variable name: `amount`

   b. **Ask for Input** (Merchant)
   - Action: "Ask for Input"
   - Prompt: "Where did you spend?"
   - Input Type: Text
   - Variable name: `merchant`

   c. **Ask for Input** (Card)
   - Action: "Ask for Input"
   - Prompt: "Which card did you use?"
   - Input Type: Text
   - Variable name: `card`

   d. **Text** (Build URL)
   - Action: "Text"
   - Content:
     ```
     maximile://log?amount=[amount]&merchant=[merchant]&card=[card]&source=shortcut
     ```
   - Note: Use the variable picker to insert the variables instead of typing [amount], [merchant], [card]

   e. **URL Encode** (Optional but recommended)
   - Action: "URL Encode"
   - Input: The Text from step d

   f. **Open URLs**
   - Action: "Open URLs"
   - URL: The encoded text from step e

4. **Name the shortcut**: "Log Expense to MaxiMile"
5. **Tap Done**

---

### Method 3: Apple Wallet Automation (Auto-Capture)

This is the most advanced setup that automatically captures transactions when you use Apple Wallet.

⚠️ **Note**: This requires iOS 16.4+ and works best with Apple Card or cards added to Apple Wallet.

1. **Open Shortcuts app** → Go to **Automation** tab
2. **Tap "+" → Create Personal Automation**
3. **Choose trigger**: "App" → Select "Wallet"
4. **Configure**:
   - When: "Wallet is Opened"
   - Time: "Run Immediately"
   - Ask Before Running: Toggle OFF (for instant capture)

5. **Add these actions**:

   a. **Get Latest Wallet Transaction** (if available in your iOS version)
   - Or use "Get Clipboard" if you copy transaction details manually

   b. **Extract transaction details** using text parsing
   - This requires advanced scripting with variables

   c. **Text** (Build URL with extracted data)
   ```
   maximile://log?amount=[extracted_amount]&merchant=[extracted_merchant]&card=[card_name]&source=shortcut
   ```

   d. **Open URLs**
   - URL: The text from step c

6. **Tap Done**

---

## Testing Your Shortcut

### Test Method 1 or 2:
1. Open the Shortcuts app
2. Tap your newly created shortcut
3. You should see MaxiMile open to the auto-capture screen

### Test Method 3:
1. Open Apple Wallet
2. The automation should trigger and open MaxiMile automatically

---

## URL Scheme Reference

Your MaxiMile app supports this deep link format:

```
maximile://log?amount=<number>&merchant=<text>&card=<text>&source=<shortcut|notification|manual>
```

### Parameters:
- `amount`: Transaction amount (e.g., 15.50 or $15.50)
- `merchant`: Merchant name (e.g., Starbucks)
- `card`: Card name or last 4 digits (e.g., "OCBC 365" or "4012")
- `source`: Where the transaction came from
  - `shortcut` - from iOS Shortcut
  - `notification` - from push notification
  - `manual` - manually entered

### Examples:

Basic open:
```
maximile://log?source=shortcut
```

With transaction details:
```
maximile://log?amount=15.50&merchant=Starbucks&card=OCBC%20365&source=shortcut
```

---

## Troubleshooting

### "Safari cannot open the page"
- Make sure MaxiMile app is installed on your device
- The URL scheme `maximile://` is only registered when the app is installed

### Shortcut doesn't open app
- Check that the URL starts with `maximile://log`
- Make sure there are no spaces or typos in the URL
- Try the simple version (Method 1) first

### Variables not working
- Make sure you used the variable picker (magic wand icon) to insert variables
- Don't manually type `[amount]` - it won't work

### Automation not triggering
- Check that "Ask Before Running" is OFF in automation settings
- Some iOS versions have restrictions on Wallet automations
- Try triggering manually first to test

---

## Resources

Based on:
- [TechTiff's Apple Wallet Expense Tracker guide](https://techtiff.substack.com/p/apple-wallet-expense-tracker-shortcuts)
- MaxiMile deep link specification: `/maximile-app/lib/deep-link.ts`

---

## Next Steps

Once you've created the shortcut:
1. Test it by tapping it in the Shortcuts app
2. MaxiMile should open to the auto-capture screen
3. If you get transaction details passed, they should pre-fill the form
4. Confirm and save the transaction

**Questions?** Check the app logs or reach out for support.

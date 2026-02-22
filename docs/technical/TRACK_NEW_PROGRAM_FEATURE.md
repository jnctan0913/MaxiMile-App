# Track New Program Feature

## 🎯 Feature Overview

**User Story**: As a MaxiMile user, I want to manually add and track any loyalty program (airline or bank points) to my portfolio, even if I don't have a credit card that earns into that program.

**Use Case**: User has existing miles/points from programs they're not currently earning into with their cards, or they want to track a program before getting a card for it.

---

## ✨ What Was Implemented

### UI Components

**1. "+ Add Program" Button**
- Location: Bottom of program list in "My Miles" tab only
- Dashed border style to indicate add action
- Icon + text: "Track New Airline Program"
- Note: Not shown in "My Points" tab (bank programs are already shown with zero balance)

**2. Two-Step Bottom Sheet Flow**

**Step 1: Program Selection**
- Shows all available programs of the selected type (airline or bank)
- Filters out programs already in user's portfolio
- Scrollable list with search-friendly UI
- Empty state if all programs are already tracked

**Step 2: Balance Entry**
- Selected program name displayed
- "Back" button to change program selection
- Numeric input for current balance
- Helper text explaining the feature
- "Add Program" CTA button

---

## 🔄 User Flow

```
1. User goes to Miles Portfolio tab
2. Switches to "My Miles" or "My Points" segment
3. Taps "+ Track New Airline/Bank Program" button
4. Bottom sheet opens with program list
5. User selects a program (e.g., "Asia Miles")
6. Balance entry screen appears
7. User enters current balance (e.g., "25000")
8. Taps "Add Program"
9. Program is added to portfolio
10. Portfolio refreshes and shows new program
```

---

## 🛠️ Technical Implementation

### Files Modified

**`app/(tabs)/miles.tsx`**

### New State Variables

```typescript
const [addProgramSheetVisible, setAddProgramSheetVisible] = useState(false);
const [availablePrograms, setAvailablePrograms] = useState<AvailableProgram[]>([]);
const [selectedNewProgram, setSelectedNewProgram] = useState<AvailableProgram | null>(null);
const [newProgramBalance, setNewProgramBalance] = useState('');
const [savingNewProgram, setSavingNewProgram] = useState(false);
```

### Key Functions

**`handleOpenAddProgramSheet()`**
- Fetches all programs of the active tab's type (airline or bank_points)
- Filters out programs already in user's portfolio
- Opens bottom sheet with available programs
- Tracks analytics event

**`handleSelectProgram(program)`**
- Sets selected program
- Transitions to balance entry screen

**`handleSaveNewProgram()`**
- Validates balance (0 - 10,000,000)
- Calls `upsert_miles_balance` RPC to save
- Tracks analytics event
- Refreshes portfolio
- Closes bottom sheet

### Database Integration

**Uses existing RPC**: `upsert_miles_balance`
```sql
CALL upsert_miles_balance(
  p_user_id: UUID,
  p_program_id: UUID,
  p_amount: INTEGER
);
```

**Query for available programs**:
```sql
SELECT id, name, airline, program_type
FROM miles_programs
WHERE program_type = 'airline' OR program_type = 'bank_points'
ORDER BY name
```

---

## 📊 Before vs After

### Before ❌
```
User has Asia Miles account with 25,000 miles
User doesn't have any cards that earn Asia Miles
User can't track Asia Miles in MaxiMile portfolio
→ Missing visibility into complete loyalty portfolio
```

### After ✅
```
User has Asia Miles account with 25,000 miles
User taps "+ Track New Airline Program"
User selects "Asia Miles" → enters 25,000
Asia Miles now appears in "My Miles" tab
→ Complete visibility across all loyalty programs
```

---

## 🎨 UI/UX Details

### Button Design
- **Style**: Dashed border with light gold background
- **Icon**: `add-circle-outline` (20px)
- **Text**: Bold, gold color
- **Spacing**: Appears after all existing program cards

### Bottom Sheet Design
- **Title**: "Track Airline Program" / "Track Bank Program"
- **Program List**:
  - Each row: Icon + Program name + Chevron
  - Border between rows
  - Max height: 400px with scroll
- **Balance Entry**:
  - Large numeric input (right-aligned)
  - Helper text below
  - Full-width CTA button

### Validation
- Balance must be numeric
- Range: 0 to 10,000,000
- CTA disabled until valid balance entered
- Shows loading spinner while saving

---

## 🔍 Edge Cases Handled

1. **All programs tracked**: Shows "All programs are already tracked" message
2. **No balance entered**: Save button disabled
3. **Invalid balance**: Alert with error message
4. **Save failure**: Alert with retry option
5. **Network error**: Error handling with fallback
6. **User changes mind**: Back button to return to program list

---

## 📈 Analytics Events

**`add_program_sheet_opened`**
- Tracked when user opens the add program sheet
- Properties: `program_type` (airline or bank_points)

**`program_added_manually`**
- Tracked when user successfully adds a program
- Properties: `program_id`, `program_name`, `initial_balance`

---

## ✅ Testing Checklist

- [ ] Button appears in both My Miles and My Points tabs
- [ ] Tapping button opens bottom sheet with correct program type
- [ ] Available programs list excludes already-tracked programs
- [ ] Selecting a program transitions to balance entry
- [ ] Back button returns to program list
- [ ] Balance validation works (0 - 10,000,000)
- [ ] Save button disabled when no balance or invalid balance
- [ ] Saving creates new program in portfolio
- [ ] Portfolio refreshes automatically after save
- [ ] New program appears in correct tab (Miles vs Points)
- [ ] Can tap new program to view detail page
- [ ] Can update balance from detail page
- [ ] Empty state shows when all programs tracked

---

## 🚀 Future Enhancements

**Potential improvements**:
1. **Search/Filter**: Add search bar for long program lists
2. **Popular First**: Sort by popularity or user's location
3. **Bulk Import**: Import balances from multiple programs at once
4. **Balance History**: Track balance changes over time
5. **Airline Alliance Groups**: Group airlines by alliance (Star Alliance, etc.)
6. **Import from Image**: Scan statement/screenshot to extract balance

---

## 🎉 User Benefits

1. ✅ **Complete Portfolio View**: Track ALL loyalty programs in one place
2. ✅ **Flexibility**: Add programs before/after getting cards
3. ✅ **Manual Tracking**: Track programs from non-card sources (promotions, transfers, etc.)
4. ✅ **Future Planning**: See which programs you can reach via transfers
5. ✅ **Easy Updates**: Update balances anytime via program detail page

---

## 🔗 Related Features

- **Miles Portfolio** (`app/(tabs)/miles.tsx`): Main screen showing tracked programs
- **Program Detail** (`app/miles/[programId].tsx`): Edit balance, log redemptions, set goals
- **Onboarding** (`app/onboarding-miles.tsx`): Initial balance entry during signup
- **Card Mappings Fix** (`docs/MILES_PORTFOLIO_FIX.md`): Fixed card→program relationships

---

## 💡 Implementation Notes

- Uses existing `upsert_miles_balance` RPC (no new database functions needed)
- Filters available programs client-side (efficient for small program lists)
- Respects active segment (My Miles vs My Points) for context-aware experience
- Two-step flow reduces cognitive load (select → enter balance)
- Analytics tracking helps understand feature adoption

---

## 🎯 Success Metrics

Track these metrics to measure feature success:
1. **Adoption Rate**: % of users who manually add at least one program
2. **Programs Added**: Average number of manually-added programs per user
3. **Time to Add**: How long it takes from button tap to successful save
4. **Program Coverage**: % of users tracking 3+ different programs
5. **Return Rate**: How often users return to update manually-added programs

---

## ✨ Result

Users can now **manually track any loyalty program** they're enrolled in, giving them a complete view of their miles and points portfolio across all airlines and banks! 🎉

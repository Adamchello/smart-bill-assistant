# PRD: Bank Statement Import

**Status:** Draft
**Date:** 2026-05-20

---

## 1. Problem Statement

Smart Bill Assistant already supports importing bills from structured CSV and Excel files where users control the column layout. This works well for manually curated spreadsheets, but it breaks down when users try to import bank account statements — the most common source of transaction data people actually have access to.

Bank statement CSVs are fundamentally different from user-structured bill CSVs. Where a bill CSV has clean columns like "Provider Name" and "Amount", a bank statement has raw transaction descriptions like `POS PURCHASE - NETFLIX.COM 800-555-1234 CA` and amounts that may be negative (debits), positive (credits), or split across separate debit/credit columns depending on the bank. The current `parseProviderName` function does a simple trim — it has no concept of extracting a merchant name from a bank narrative string. The current `parseAmount` rejects negative numbers entirely (`num <= 0` returns an error), which means every expense in a typical bank statement would fail validation. These are not minor gaps; they are architectural mismatches between what the current import pipeline assumes and what bank data actually looks like.

Beyond parsing, bank statements introduce a volume and filtering problem that the current import flow was not designed for. A single month's bank statement can contain 50-200+ transactions including income deposits, internal transfers, ATM withdrawals, and fees — most of which a user does NOT want to import as "bills." The current review step shows every row as importable with no way to bulk-filter by transaction type or exclude non-expense rows. Without filtering, users would need to manually remove dozens of irrelevant rows, making the feature unusable at scale.

## 2. Goals

1. **Accept bank statement CSVs** from major consumer banks without requiring users to manually restructure columns or clean data beforehand.
2. **Extract clean provider names** from messy bank transaction descriptions using a multi-stage cleaning algorithm, feeding results into the existing `suggestCategory` engine.
3. **Handle all common amount formats** — negative-as-expense, separate debit/credit columns, and all-positive with type indicators — with user confirmation for ambiguous cases.
4. **Enable transaction filtering** so users can exclude non-expense rows (income, transfers, ATM withdrawals) before review, reducing manual effort on high-volume statements.
5. **Remember bank format preferences** via bank profiles, so repeat imports from the same bank skip the column mapping step.

## 3. Non-Goals

- **Bank API connections (Plaid, Yodlee, etc.)** — this feature is CSV-only; live bank feeds are a separate initiative.
- **PDF statement parsing** — bank PDFs require OCR/table extraction which is a different problem domain.
- **OFX/QIF/QFX format support** — these structured financial interchange formats may come later but are out of scope.
- **Transaction reconciliation** — matching imported transactions against each other to find transfers between accounts.
- **Recurring transaction detection** — identifying that "Netflix" appears monthly and suggesting it as a recurring bill.
- **Multi-currency support** — all amounts are treated as a single currency (the user's default).

## 4. User Stories

### 4.1 Upload & Format Detection

| ID     | Story                                                                                                                                               | Priority |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| US-1.1 | As a user, I can upload a bank statement CSV and have the system detect it as a bank statement (vs. a structured bill CSV) based on column headers. | Must     |
| US-1.2 | As a user, I can select my bank from a list of known profiles so columns are mapped automatically.                                                  | Should   |
| US-1.3 | As a user, I can manually map columns when auto-detection fails or my bank is not in the profile list.                                              | Must     |
| US-1.4 | As a user, I can save a new bank profile after manual mapping so future imports from the same bank are automatic.                                   | Should   |
| US-1.5 | As a user, I see a clear indication that I'm in "bank statement" import mode vs. regular bill import mode.                                          | Must     |

### 4.2 Transaction Parsing & Cleaning

| ID     | Story                                                                                                                                                   | Priority |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| US-2.1 | As a user, I see cleaned provider names extracted from raw bank descriptions (e.g., "NETFLIX" instead of "POS PURCHASE - NETFLIX.COM 800-555-1234 CA"). | Must     |
| US-2.2 | As a user, I see the original raw description preserved alongside the cleaned provider name so I can verify the extraction.                             | Must     |
| US-2.3 | As a user, I see categories auto-suggested based on the cleaned provider name using the existing suggestion engine.                                     | Must     |
| US-2.4 | As a user, negative amounts are automatically interpreted as expenses without me needing to flip signs.                                                 | Must     |
| US-2.5 | As a user, when the system detects separate debit/credit columns, I'm asked to confirm which column represents expenses.                                | Should   |

### 4.3 Review & Filtering

| ID     | Story                                                                                                       | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------- |
| US-3.1 | As a user, I can filter the transaction list to show only expenses (hiding income/credits).                 | Must     |
| US-3.2 | As a user, I can bulk-exclude transaction types (transfers, ATM withdrawals, fees) with one click.          | Should   |
| US-3.3 | As a user, I can edit the cleaned provider name for any row and see the category re-suggested in real time. | Must     |
| US-3.4 | As a user, I can select/deselect individual rows for import using checkboxes.                               | Must     |
| US-3.5 | As a user, I see duplicate detection against my existing bills, same as regular import.                     | Must     |
| US-3.6 | As a user, I can sort and search within the transaction list to find specific transactions.                 | Could    |
| US-3.7 | As a user, I see a summary bar showing total selected transactions, total amount, and category breakdown.   | Should   |

### 4.4 Finalization

| ID     | Story                                                                                                                                             | Priority |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| US-4.1 | As a user, only selected, non-excluded, error-free rows are imported as bills when I finalize.                                                    | Must     |
| US-4.2 | As a user, I see a confirmation summary before import showing count and total amount of bills to be created.                                      | Must     |
| US-4.3 | As a user, the finalized bills appear in my bill list with the cleaned provider name as `provider_name` and the raw description as `description`. | Must     |
| US-4.4 | As a user, I receive a post-import summary showing how many bills were created, skipped, and failed.                                              | Should   |

## 5. Domain Model Changes

### 5.1 New Entities

**BankProfile** — Remembers column mappings and format preferences for a specific bank.

```typescript
interface BankProfile {
  id: string;
  name: string; // e.g., "Chase", "Bank of America"
  columnMapping: BankColumnMapping;
  amountFormat: AmountFormat;
  dateFormat?: string; // e.g., "MM/DD/YYYY"
  created_at: string;
  updated_at: string;
}

interface BankColumnMapping {
  date: number;
  description: number; // The raw narrative/memo column
  amount?: number; // Single amount column (negative = expense)
  debit?: number; // Separate debit column
  credit?: number; // Separate credit column
  transactionType?: number; // Optional: "POS", "ACH", etc.
  balance?: number; // Identified so it can be IGNORED
  referenceNumber?: number; // Identified so it can be IGNORED
}

type AmountFormat =
  | "signed" // Negative = expense, positive = income
  | "debit-credit" // Separate columns
  | "all-positive"; // Needs transaction type to determine direction
```

**ParsedBankTransaction** — Extends the concept of `ParsedBillRow` with bank-specific fields.

```typescript
interface ParsedBankTransaction {
  id: string;
  rawDescription: string; // Original bank narrative
  cleanedProviderName: string; // Extracted merchant name
  amount: string; // Always positive (absolute value)
  date: string;
  category: Category;
  transactionType: TransactionKind;
  isExpense: boolean; // Derived from amount sign or debit/credit
  isSelected: boolean; // User can toggle for import
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: string;
}

type TransactionKind =
  | "purchase" // POS, card transactions
  | "ach" // ACH debits/credits
  | "transfer" // Internal/external transfers
  | "atm" // ATM withdrawals/deposits
  | "fee" // Bank fees
  | "check" // Check payments
  | "deposit" // Income/deposits
  | "other";
```

### 5.2 Modified Entities

**No changes to the existing `Bill` or `ParsedBillRow` types.** The bank import pipeline produces data that maps to the same `ParsedBillRow` shape at finalization time, allowing reuse of the existing `importBills` mutation and API route. The `rawDescription` maps to `description` and `cleanedProviderName` maps to `providerName`.

The existing `ColumnIndices` interface in `column-detection.ts` does NOT need modification — bank imports use their own `BankColumnMapping` type, and the two pipelines share the downstream processing (categorization, duplicate detection, finalization).

## 6. Architecture Impact

### 6.1 Database

**New table: `bank_profiles`**

| Column         | Type        | Notes               |
| -------------- | ----------- | ------------------- |
| id             | uuid        | PK                  |
| user_id        | uuid        | FK to auth.users    |
| name           | text        | Bank display name   |
| column_mapping | jsonb       | `BankColumnMapping` |
| amount_format  | text        | `AmountFormat` enum |
| date_format    | text        | Nullable            |
| created_at     | timestamptz |                     |
| updated_at     | timestamptz |                     |

No changes to the `bills` table. Bank-imported bills are stored identically to manually imported or created bills.

### 6.2 API Routes

| Route                     | Method | Purpose                         |
| ------------------------- | ------ | ------------------------------- |
| `/api/bank-profiles`      | GET    | List user's saved bank profiles |
| `/api/bank-profiles`      | POST   | Create a new bank profile       |
| `/api/bank-profiles/[id]` | PUT    | Update an existing profile      |
| `/api/bank-profiles/[id]` | DELETE | Delete a profile                |

The existing `/api/bills` POST endpoint is reused for final import — no changes needed since `ParsedBankTransaction` is mapped to `ParsedBillRow` before submission.

### 6.3 Frontend

The bank statement import is implemented as a **sub-mode of the existing bill-import module**, not a separate module. The entry point (`bill-import.tsx`) gains a mode selector ("Import Bills" vs. "Import Bank Statement") that routes to the appropriate step flow.

**New files within `modules/bill-import/`:**

```
modules/bill-import/
  core/
    bank-import/
      description-cleaner.ts       -- Multi-stage description cleaning algorithm
      amount-resolver.ts            -- Handles signed, debit/credit, all-positive formats
      transaction-classifier.ts     -- Classifies TransactionKind from raw description
      bank-column-detection.ts      -- Auto-detect bank CSV columns
      bank-row-parser.ts            -- Parses raw CSV row into ParsedBankTransaction
    parsers/
      amount.ts                     -- MODIFIED: accept negative values when called with bank mode flag
  domain/
    bank-import.ts                  -- ParsedBankTransaction, BankProfile, BankColumnMapping types
  configuration/
    bank-profiles.ts                -- Built-in bank profiles (Chase, BofA, Wells Fargo, etc.)
    cleaning-patterns.ts            -- Regex patterns and keyword lists for description cleaning
  integration/
    bank-profile-repository.ts      -- CRUD operations for bank_profiles table
  presentation/
    bank-import/
      bank-upload-step.tsx           -- File upload + bank selection/auto-detect
      bank-mapping-step.tsx          -- Manual column mapping UI
      bank-review-step.tsx           -- Filtering, selection, editing, review
      bank-finalize-step.tsx         -- Confirmation and import
      transaction-filter-bar.tsx     -- Filter controls (type, expense/income toggle)
      transaction-row.tsx            -- Single row with raw desc, cleaned name, edit controls
```

### 6.4 Existing Module Impact

**`core/parsers/amount.ts`** — The `parseAmount` function currently rejects `num <= 0`. For bank imports, a new `parseSignedAmount` function is added alongside it (or `parseAmount` gains an optional `allowNegative` parameter). The existing bill import path is NOT affected.

**`core/import-processor.ts`** — The `checkDuplicates`, `categorizeRows`, and `updateRowField` functions are reused. `categorizeRows` works directly on the cleaned provider name. A thin adapter maps `ParsedBankTransaction[]` to `ParsedBillRow[]` before calling these functions.

**`integration/repository.ts`** — The `importBills` function is reused as-is since it operates on `ParsedBillRow`.

**`configuration/constraints.ts`** — `COLUMN_MAPPINGS` is extended with bank-specific column header keywords (e.g., "narrative", "particulars", "transaction description", "debit", "credit", "balance").

## 7. Description Cleaning Algorithm

The description cleaner is a multi-stage pipeline that transforms raw bank narratives into clean provider names. Each stage is a pure function, making the pipeline testable and extensible.

### 7.1 Pipeline Stages

**Input:** `"POS PURCHASE - NETFLIX.COM 800-555-1234 CA 12/15"`
**Output:** `"Netflix"`

```
Raw Description
  → Stage 1: Transaction Prefix Removal
  → Stage 2: Noise Stripping
  → Stage 3: Merchant Extraction
  → Stage 4: Normalization
  → Stage 5: Known Merchant Lookup
  → Cleaned Provider Name
```

### 7.2 Stage 1 — Transaction Prefix Removal

Remove common bank-prepended transaction type prefixes. These identify the transaction method but are not part of the merchant name.

**Patterns removed (case-insensitive):**

| Pattern                              | Example                              |
| ------------------------------------ | ------------------------------------ |
| `POS PURCHASE -`                     | POS PURCHASE - NETFLIX.COM           |
| `POS DEBIT -`                        | POS DEBIT - WALMART                  |
| `POS REFUND -`                       | POS REFUND - AMAZON                  |
| `ACH DEBIT`                          | ACH DEBIT GEICO INSURANCE            |
| `ACH CREDIT`                         | ACH CREDIT EMPLOYER INC              |
| `DEBIT CARD PURCHASE -`              | DEBIT CARD PURCHASE - TARGET         |
| `RECURRING PAYMENT -`                | RECURRING PAYMENT - SPOTIFY          |
| `ONLINE PAYMENT -`                   | ONLINE PAYMENT - ELECTRIC CO         |
| `BILL PAYMENT -`                     | BILL PAYMENT - AT&T                  |
| `CHECK #\d+`                         | CHECK #1234                          |
| `WIRE TRANSFER -`                    | WIRE TRANSFER - LANDLORD             |
| `MOBILE PAYMENT -`                   | MOBILE PAYMENT - VENMO               |
| `PREAUTHORIZED DEBIT -`              | PREAUTHORIZED DEBIT - INSURANCE      |
| `PURCHASE AUTHORIZED ON \d{2}/\d{2}` | PURCHASE AUTHORIZED ON 12/15 NETFLIX |
| `CHECKCARD \d{4}`                    | CHECKCARD 1234 STARBUCKS             |

**Regex:** A single compiled regex with alternation handles all prefixes in one pass. The transaction prefix is also used as input for the `TransactionKind` classifier (Stage 0, run before cleaning).

### 7.3 Stage 2 — Noise Stripping

Remove data fragments that banks append for their internal tracking but carry no merchant-name value.

**Patterns stripped:**

| Type                            | Regex                                        | Example removed                      |
| ------------------------------- | -------------------------------------------- | ------------------------------------ | ----------------- | ----------------------- | ------------ |
| Phone numbers                   | `\b\d{3}[-.]?\d{3}[-.]?\d{4}\b`              | `800-555-1234`                       |
| Dates (MM/DD, MM/DD/YY)         | `\b\d{2}/\d{2}(/\d{2,4})?\b`                 | `12/15`, `12/15/2025`                |
| Reference/auth codes            | `\b(REF                                      | AUTH                                 | TRACE             | SEQ)[#: ]\*[A-Z0-9]+\b` | `REF#ABC123` |
| Card last-4                     | `\b(CARD                                     | CRD                                  | xxxx)\s\*\d{4}\b` | `CARD 1234`             |
| Terminal IDs                    | `\b(TERM                                     | TID)[#: ]\*[A-Z0-9]+\b`              | `TERM#0045`       |
| State codes (trailing 2-letter) | `\s[A-Z]{2}$` (after other cleaning)         | ` CA`                                |
| City/state combos               | `\b[A-Z][a-z]+,?\s[A-Z]{2}\b$`               | `San Jose, CA`                       |
| Zip codes                       | `\b\d{5}(-\d{4})?\b` (trailing)              | `90210`                              |
| Hash/numeric IDs (6+ digits)    | `\b\d{6,}\b`                                 | `123456789`                          |
| URL-like fragments              | `\.(com\|net\|org\|io)\b` → keep text before | `NETFLIX.COM` → `NETFLIX`            |
| Asterisk separators             | `\*`                                         | `SQ *COFFEE SHOP` → `SQ COFFEE SHOP` |

**Order matters:** Phone numbers and dates are stripped before trailing state codes to avoid partial matches.

### 7.4 Stage 3 — Merchant Extraction

After prefix removal and noise stripping, extract the most likely merchant name from what remains.

**Heuristics:**

1. **Delimiter splitting** — If the remaining text contains `-`, `*`, or multiple spaces (3+), split and take the first non-empty segment as the primary merchant candidate.
2. **Length guard** — If the candidate is fewer than 2 characters or more than 50 characters, fall back to the full remaining text (truncated to 50 chars).
3. **Square/payment processor prefixes** — Strip leading `SQ `, `TST `, `SP `, `PP *` (Square, Toast, Shopify, PayPal) — these are payment processors, not merchants.

### 7.5 Stage 4 — Normalization

1. **Collapse whitespace** — Replace multiple spaces/tabs with a single space.
2. **Title case** — Convert to title case (`NETFLIX` → `Netflix`, `WAL-MART` → `Wal-Mart`).
3. **Trim** — Remove leading/trailing whitespace.
4. **Common suffix removal** — Strip trailing `Inc`, `LLC`, `Corp`, `Ltd`, `Co`, `Company` and their punctuated variants.

### 7.6 Stage 5 — Known Merchant Lookup

A dictionary of ~100 common merchants maps normalized fragments to canonical names. This runs AFTER normalization as a final correction pass.

| Input contains           | Canonical name |
| ------------------------ | -------------- |
| `netflix`                | Netflix        |
| `spotify`                | Spotify        |
| `amazon` / `amzn`        | Amazon         |
| `wal-mart` / `walmart`   | Walmart        |
| `target`                 | Target         |
| `starbucks` / `sbux`     | Starbucks      |
| `uber` / `uber eats`     | Uber           |
| `lyft`                   | Lyft           |
| `doordash`               | DoorDash       |
| `grubhub`                | Grubhub        |
| `costco`                 | Costco         |
| `home depot`             | Home Depot     |
| `comcast` / `xfinity`    | Comcast        |
| `at&t` / `att`           | AT&T           |
| `verizon`                | Verizon        |
| `t-mobile` / `tmobile`   | T-Mobile       |
| `geico`                  | GEICO          |
| `state farm`             | State Farm     |
| `chase`                  | Chase          |
| `venmo`                  | Venmo          |
| `zelle`                  | Zelle          |
| `paypal`                 | PayPal         |
| `apple` / `apple.com`    | Apple          |
| `google` / `google play` | Google         |

This table is additive — it does not replace the existing `CATEGORY_KEYWORDS` in `bill-management/configuration/constraints.ts`. After the merchant lookup resolves a canonical name, that name is passed to `suggestCategory()` to get a category suggestion, exactly like the existing import flow.

### 7.7 Transaction Kind Classification

Run BEFORE the cleaning pipeline on the original raw description to classify `TransactionKind`. This drives the filtering UI.

| Pattern (case-insensitive)                     | TransactionKind |
| ---------------------------------------------- | --------------- |
| `POS`, `PURCHASE`, `DEBIT CARD`, `CHECKCARD`   | `purchase`      |
| `ACH DEBIT`, `ACH CREDIT`, `DIRECT DEPOSIT`    | `ach`           |
| `TRANSFER`, `XFER`, `TFR`                      | `transfer`      |
| `ATM`, `CASH WITHDRAWAL`                       | `atm`           |
| `FEE`, `SERVICE CHARGE`, `MONTHLY MAINTENANCE` | `fee`           |
| `CHECK #`, `CHECK PAID`                        | `check`         |
| `DEPOSIT`, `CREDIT`, `PAYROLL`                 | `deposit`       |
| (none matched)                                 | `other`         |

## 8. Amount Handling

### 8.1 Format Detection

When parsing a bank CSV, the system inspects the first 10-20 data rows (after headers) to determine the amount format:

1. **Single amount column with negatives** (`signed`) — If any values in the amount column are negative, assume `signed` format: negative = expense, positive = income.
2. **Separate debit/credit columns** (`debit-credit`) — If two columns are detected where one header matches debit keywords (`debit`, `withdrawal`, `out`) and the other matches credit keywords (`credit`, `deposit`, `in`), use `debit-credit` format.
3. **All positive with type column** (`all-positive`) — If all amount values are positive AND a transaction type column exists, prompt the user to confirm the convention or default to "all values are expenses."

### 8.2 Processing Rules

| Format         | Expense detection                     | Amount stored                  |
| -------------- | ------------------------------------- | ------------------------------ |
| `signed`       | `amount < 0`                          | `Math.abs(amount)`             |
| `debit-credit` | Debit column has a value              | Debit value (already positive) |
| `all-positive` | User-confirmed or default all-expense | Value as-is                    |

### 8.3 Ambiguity Resolution

When the system cannot confidently determine the format (e.g., all amounts are positive, no type column, no debit/credit split), it presents a confirmation step in the column mapping UI:

> "All amounts in your file are positive. How should we interpret them?"
>
> - **All are expenses** (most common for filtered bank exports)
> - **I'll review each one** (marks all as selected, user deselects income manually)

This avoids silent data misinterpretation while keeping the default path fast.

## 9. UX Flows

### 9.1 Upload Step

The existing upload step (`file-drop-zone.tsx`) is extended with a mode toggle:

1. User navigates to Import and sees two tabs or a toggle: **"Bills CSV"** (existing) | **"Bank Statement"** (new).
2. Selecting "Bank Statement" shows the bank statement upload zone.
3. User drops a CSV file.
4. System checks if the file matches any saved bank profile by analyzing column headers. If a match is found, it skips to 9.3 (Review). If no match, it proceeds to 9.2 (Column Mapping).
5. Optionally, user can select a bank from a dropdown BEFORE uploading, which pre-loads the profile's column mapping.

### 9.2 Column Mapping Step

Shown when auto-detection fails or no matching bank profile exists.

1. System displays the first 5 rows of the CSV as a preview table.
2. Each column has a dropdown selector with options: Date, Description, Amount, Debit, Credit, Transaction Type, Balance (ignore), Reference (ignore), Skip.
3. System pre-selects its best guess using keyword matching on headers (extended `COLUMN_MAPPINGS` with bank-specific terms).
4. User confirms or corrects mappings.
5. System asks the amount format question if ambiguous (see Section 8.3).
6. User can name and save this mapping as a bank profile for future use (checkbox + text input for bank name).
7. On confirm, system parses all rows and proceeds to Review.

### 9.3 Review Step

The core of the bank import experience. Extends the existing review step with filtering and selection.

1. **Filter bar** (top) — Toggle buttons for transaction types: Purchases, ACH, Transfers, ATM, Fees, Checks, Deposits, Other. All expense types are ON by default; Transfers, ATM, Deposits are OFF.
2. **Expense/Income toggle** — Quick filter to show only expenses (default), only income, or all.
3. **Summary bar** — Shows: `{selected} of {total} transactions selected | Total: ${amount} | {duplicates} duplicates found`.
4. **Transaction table** — Each row shows:
   - Checkbox (selected for import)
   - Date
   - Cleaned provider name (editable inline)
   - Raw description (read-only, collapsed by default, expandable)
   - Amount
   - Category dropdown (pre-filled by `suggestCategory`)
   - Transaction type badge (Purchase, ACH, etc.)
   - Duplicate warning icon (if matched)
   - Row-level error indicators
5. **Bulk actions** — "Select All Visible", "Deselect All", "Exclude Duplicates".
6. Editing a provider name triggers `suggestCategory` in real time (reuses existing `updateRowField` behavior through the adapter).

### 9.4 Import Step

1. User clicks "Import Selected" button.
2. Confirmation modal shows: `Import {n} transactions totaling ${amount}?` with category breakdown.
3. On confirm, selected `ParsedBankTransaction` rows are mapped to `ParsedBillRow` format and submitted through the existing `importBills` mutation.
4. Progress indicator shows during import.
5. Post-import summary: `{imported} bills created, {skipped} skipped, {failed} failed.`
6. User is returned to the bill list with new bills visible.

## 10. Rollout Strategy

### Phase 1 — Core Pipeline (MVP)

- Description cleaning algorithm (all 5 stages)
- Transaction kind classifier
- Signed amount format support (negative = expense)
- Bank statement upload mode toggle
- Manual column mapping step
- Review step with selection checkboxes and expense/income filter
- Finalization through existing import pipeline
- No bank profiles (manual mapping every time)

### Phase 2 — Smart Defaults

- Bank profile CRUD (save/load/edit/delete)
- Built-in profiles for top 10 US consumer banks
- Auto-detect bank from column headers
- Debit/credit column format support
- Transaction type filter bar in review step
- Bulk actions (select all, exclude duplicates)

### Phase 3 — Polish

- Known merchant dictionary (canonical name lookup)
- Summary bar with category breakdown
- Search within transaction list
- All-positive amount format with user confirmation
- Import history (track which bank statement was imported when)

## 11. Open Questions

| #   | Question                                                                                                                                                                                                      | Impact                                       | Owner                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------- |
| 1   | Should bank profiles be per-user or global (shared across all users with the same bank)? Per-user is simpler but means every user re-maps the same bank.                                                      | Database schema, UX for profile management   | Product              |
| 2   | How should the system handle international bank CSV formats (date formats like DD/MM/YYYY, comma as decimal separator, different currency symbols)? Phase 1 can assume US format.                             | Parsing logic, date/amount parsers           | Engineering          |
| 3   | Should the description cleaning algorithm be configurable per bank profile (custom regex patterns), or is a universal pipeline sufficient?                                                                    | Architecture complexity, bank profile schema | Engineering          |
| 4   | When multi-profile support lands, should bank profiles be scoped to a profile or shared across all profiles in a space?                                                                                       | Database schema, FK relationships            | Product              |
| 5   | What is the maximum number of transactions per import? The current 10MB file limit handles ~50K rows of CSV, but the review UI may struggle beyond 500 rows. Should we paginate or cap at a reasonable limit? | UX performance, review step design           | Engineering + Design |

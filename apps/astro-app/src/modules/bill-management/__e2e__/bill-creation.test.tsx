// CONTEXT: bill-management — full bill creation journey
// PRECONDITIONS:
// - User is authenticated
// - User is on the dashboard

// SCENARIO: User creates a bill with an auto-suggested category
// GIVEN: The user is on the dashboard with no bills recorded
// WHEN: The user opens the bill entry form, fills in the amount, date, and a recognised provider name, observes the suggested category, and submits
// THEN: A success confirmation appears and the new bill is visible in the history with the correct amount, provider, category, and date

// SCENARIO: User overrides the auto-suggested category before saving
// GIVEN: The user has opened the bill entry form and entered a provider name that triggers a category suggestion
// WHEN: The user selects a different category from the category picker and submits the form
// THEN: The bill is saved with the user's chosen category, not the suggested one

// SCENARIO: Form blocks submission when required fields are missing
// GIVEN: The bill entry form is open with amount and provider left blank
// WHEN: The user attempts to submit
// THEN: Inline validation errors appear on both empty fields and no bill is saved

// SCENARIO: Form blocks submission for a negative amount
// GIVEN: The bill entry form is open
// WHEN: The user enters a negative number as the amount and attempts to submit
// THEN: A validation error appears on the amount field and no bill is saved

// SCENARIO: Form blocks submission for a future date
// GIVEN: The bill entry form is open
// WHEN: The user selects tomorrow's date and attempts to submit
// THEN: A validation error appears on the date field and no bill is saved

// SCENARIO: Description input enforces the 100-character maximum
// GIVEN: The bill entry form is open
// WHEN: The user types more than 100 characters in the description field
// THEN: The input is capped at 100 characters or an error message is shown indicating the limit

// SCENARIO: New bill appears in the correct chronological position in history
// GIVEN: The user already has five bills with known dates spread across the calendar
// WHEN: The user creates a new bill with a date that falls between two existing bills
// THEN: The history shows six bills ordered correctly by date with the new bill in its expected position

// SCENARIO: Empty history shows a helpful prompt when the user has no bills
// GIVEN: The authenticated user has no bills recorded
// WHEN: The user views the dashboard
// THEN: The history section displays an empty state message guiding the user to add their first bill

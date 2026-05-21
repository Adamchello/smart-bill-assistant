// CONTEXT: bill-management — full bill creation journey
// PRECONDITIONS:
// - User is authenticated
// - User is on the dashboard

// SCENARIO: User creates a bill with an auto-suggested category
// GIVEN: The user is on the dashboard with no bills recorded
// WHEN: The user opens the bill entry form, fills in the amount, date, and a recognised provider name, observes the suggested category, and submits
// THEN: A success confirmation appears and the new bill is visible in the history

// SCENARIO: User overrides the auto-suggested category before saving
// GIVEN: The user has opened the bill entry form and entered a provider name that triggers a category suggestion
// WHEN: The user selects a different category from the category picker and submits the form
// THEN: The bill is saved with the user's chosen category, not the suggested one

// SCENARIO: Form blocks submission when required fields are missing
// GIVEN: The bill entry form is open with amount and provider left blank
// WHEN: The user attempts to submit
// THEN: Validation errors prevent submission and no bill is saved

// SCENARIO: Form blocks submission for a negative amount
// GIVEN: The bill entry form is open
// WHEN: The user enters a negative number as the amount and attempts to submit
// THEN: The amount field shows a validation error and no bill is saved

// SCENARIO: Form blocks submission for a future date
// GIVEN: The bill entry form is open
// WHEN: The user selects tomorrow's date and attempts to submit
// THEN: The date field shows a validation error and no bill is saved

// SCENARIO: Description input enforces its character limit
// GIVEN: The bill entry form is open
// WHEN: The user types beyond the allowed character limit in the description field
// THEN: The description field enforces its character limit

// SCENARIO: New bill appears in the correct chronological position in history
// GIVEN: The user already has bills with known dates spread across the calendar
// WHEN: The user creates a new bill with a date that falls between two existing bills
// THEN: The history reflects the correct chronological order including the new bill

// SCENARIO: Empty history shows a helpful prompt when the user has no bills
// GIVEN: The authenticated user has no bills recorded
// WHEN: The user views the dashboard
// THEN: The history section displays an empty state guiding the user to add their first bill

// SCENARIO: API failure during bill creation surfaces an error
// GIVEN: The user has filled in all required fields in the bill entry form
// WHEN: The user submits the form and the API returns an error
// THEN: An error message is displayed and the form remains open for retry

// SCENARIO: Loading state is shown while the bill is being saved
// GIVEN: The user has filled in all required fields in the bill entry form
// WHEN: The user submits the form
// THEN: A loading indicator appears until the operation completes

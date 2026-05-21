// CONTEXT: bill-management — bill creation flow
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - Backend is available to accept new bill submissions
// - No pre-existing bills unless stated per scenario

// SCENARIO: User submits a valid bill and sees confirmation
// GIVEN: The user is on the dashboard with an empty bill history
// WHEN: The user opens the bill entry form, fills in amount, date, and provider, then submits
// THEN: A success message appears confirming the bill was saved

// SCENARIO: New bill appears in history after successful creation
// GIVEN: The user already has one bill in their history
// WHEN: The user submits a new valid bill
// THEN: The history shows two bills, including the newly created one

// SCENARIO: Server-side error is surfaced to the user without closing the form
// GIVEN: The backend rejects the submission with a validation error
// WHEN: The user submits the form
// THEN: An error message appears inline and the form remains open so the user can correct it

// SCENARIO: Form returns to a blank state after a successful submission
// GIVEN: The user has just successfully submitted a bill
// WHEN: The user opens the bill entry form again
// THEN: All fields are empty or reset to their default values

// CONTEXT: bill-import — per-row validation and error display
// PRECONDITIONS:
// - User is authenticated
// - The import panel is open and ready to receive files
// - No existing bills in the system

// SCENARIO: a row with a negative amount is highlighted as invalid
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row where amount=-50 (with a valid date and provider)
// THEN: that row appears in the review table with a visible error indicator on the amount field

// SCENARIO: a row with a future date is highlighted as invalid
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row where the date is set to tomorrow (with a valid amount and provider)
// THEN: that row appears in the review table with a visible error indicator on the date field

// SCENARIO: a row with an empty provider is highlighted as invalid
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row where the provider field is blank (with a valid amount and date)
// THEN: that row appears in the review table with a visible error indicator on the provider field

// SCENARIO: a row with multiple validation failures shows all errors simultaneously
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row where amount=-50, date is in the future, and provider is blank
// THEN: that row displays three separate error indicators and the error summary lists all three messages

// SCENARIO: summary counts accurately reflect the number of invalid rows
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing 7 valid rows and 3 rows with validation errors
// THEN: the summary area shows total=10, valid=7, errors=3

// SCENARIO: the finalize action is unavailable when every row has errors
// GIVEN: the import panel is open
// WHEN: the user drops a CSV where every single row fails validation
// THEN: the finalize/confirm action is disabled or replaced with an explanatory message

// SCENARIO: a server-side rejection after finalize shows an error without marking bills as imported
// GIVEN: the review table shows valid rows and the user clicks finalize
// WHEN: the server rejects the submission with a validation error
// THEN: an error message is displayed explaining the failure and no bills appear in the bill history

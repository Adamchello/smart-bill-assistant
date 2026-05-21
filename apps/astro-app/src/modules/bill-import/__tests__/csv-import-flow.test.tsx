// CONTEXT: bill-import — CSV parsing and import flow
// PRECONDITIONS:
// - User is authenticated
// - No existing bills in the system (clean state for most scenarios)
// - The import panel/modal is open and ready to receive files

// SCENARIO: valid CSV file produces a reviewable row list
// GIVEN: the import panel is open with no file loaded
// WHEN: the user drops a valid CSV file containing 10 bill rows with standard headers
// THEN: 10 parsed rows appear in the review area, each showing amount, date, provider, and a suggested category

// SCENARIO: finalizing a valid import persists the bills
// GIVEN: the user has dropped a valid 10-row CSV and the review table is showing
// WHEN: the user clicks the finalize/confirm button
// THEN: a success message confirms the bills were saved and the import panel closes or resets

// SCENARIO: CSV with unrecognizable column headers shows an error
// GIVEN: the import panel is open
// WHEN: the user drops a CSV file whose headers do not match any known bill fields
// THEN: an error message explains the columns could not be recognized and no row list is shown

// SCENARIO: empty CSV file (headers only, no data rows) is handled gracefully
// GIVEN: the import panel is open
// WHEN: the user drops a CSV file that contains only a header row and no data
// THEN: an appropriate empty-state message is shown and no rows appear in the review area

// SCENARIO: stats reflect the breakdown of valid and invalid rows
// GIVEN: the import panel is open
// WHEN: the user drops a CSV file containing 8 valid rows and 2 rows with validation errors
// THEN: the summary area shows total=10, valid=8, errors=2

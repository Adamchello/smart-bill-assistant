// CONTEXT: bill-import — full CSV import journey (end-to-end)
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - The import panel can be opened from the dashboard

// SCENARIO: happy path — drop a clean CSV, review, and finalize
// GIVEN: the user is on the dashboard with no existing bills
// WHEN: the user opens the import panel and drops a valid CSV file with multiple bill rows
// THEN: parsed rows appear in the review table with suggested categories
//   AND a summary section is visible
//   AND finalizing shows a success confirmation
//   AND the dashboard reflects the imported bills

// SCENARIO: CSV with alternative/localized column headers is parsed correctly
// GIVEN: the import panel is open
// WHEN: the user drops a CSV whose headers are in an alternative format
// THEN: the rows are parsed correctly with fields auto-detected from the non-standard headers

// SCENARIO: user edits a parsed row before finalizing
// GIVEN: the review table is showing parsed rows
// WHEN: the user changes the provider on a row and the category auto-updates
//   AND the user clicks finalize
// THEN: the saved bill reflects the edited provider and the updated category

// SCENARIO: user removes error rows before finalizing
// GIVEN: the user drops a CSV with a mix of valid rows and rows highlighted as errors
// WHEN: the user removes the error rows
// THEN: the summary section updates to reflect only valid rows
//   AND finalizing completes successfully with the remaining rows

// SCENARIO: duplicate detection flags a matching row without blocking the import
// GIVEN: a bill with the same provider, amount, and date already exists in the system
// WHEN: the user drops a CSV containing a row matching that existing bill
// THEN: the duplicate indicator is visible for matching rows
//   AND the user can still finalize and complete the import

// SCENARIO: a row with multiple errors shows all error indicators at once
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row with multiple validation failures
// THEN: that row displays error indicators for each invalid field
//   AND the error summary lists all relevant messages

// SCENARIO: stats update in real time as the user edits rows
// GIVEN: the review table shows rows with some invalid entries
// WHEN: the user removes an invalid row
// THEN: the summary section updates to reflect the removal
//   AND when the user fixes the remaining invalid row by correcting its data
// THEN: the summary section shows all rows as valid

// SCENARIO: corrupt or unreadable CSV file shows an error
// GIVEN: the import panel is open
// WHEN: the user drops a file with a .csv extension that contains corrupt or unreadable data
// THEN: an error message is displayed explaining the file could not be processed
//   AND the application remains usable

// SCENARIO: loading state is visible while the CSV is being parsed
// GIVEN: the import panel is open
// WHEN: the user drops a valid CSV file
// THEN: a loading indicator is visible while the file is being parsed
//   AND the loading indicator disappears once the review table is populated

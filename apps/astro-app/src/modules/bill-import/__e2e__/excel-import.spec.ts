// CONTEXT: bill-import — full Excel (.xlsx) import journey (end-to-end)
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - The import panel can be opened from the dashboard
// - Same flows as the CSV journey — verified with .xlsx files specifically

// SCENARIO: happy path — drop a clean Excel file, review, and finalize
// GIVEN: the user is on the dashboard with no existing bills
// WHEN: the user opens the import panel and drops a valid .xlsx file with multiple bill rows
// THEN: parsed rows appear in the review area with suggested categories
//   AND a summary section is visible
//   AND finalizing shows a success confirmation
//   AND the dashboard reflects the imported bills

// SCENARIO: Excel file with mixed valid and invalid rows requires review before finalizing
// GIVEN: the import panel is open
// WHEN: the user drops a .xlsx file containing a mix of valid and invalid rows
// THEN: the invalid rows are highlighted in the review area
//   AND the user can remove or correct those rows before finalizing the remaining valid rows

// SCENARIO: only the first worksheet is imported from a multi-sheet Excel file
// GIVEN: the import panel is open
// WHEN: the user drops a .xlsx file that contains multiple worksheets
// THEN: only the data from the first worksheet appears in the review area
//   AND data from subsequent worksheets is not shown

// SCENARIO: corrupt or unreadable Excel file shows an error
// GIVEN: the import panel is open
// WHEN: the user drops a file with a .xlsx extension that contains corrupt or unreadable binary data
// THEN: an error message is displayed explaining the file could not be read
//   AND the application remains usable

// SCENARIO: loading state is visible while the Excel file is being parsed
// GIVEN: the import panel is open
// WHEN: the user drops a valid .xlsx file
// THEN: a loading indicator is visible while the file is being parsed
//   AND the loading indicator disappears once the review table is populated

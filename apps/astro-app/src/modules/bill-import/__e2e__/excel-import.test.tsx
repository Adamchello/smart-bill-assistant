// CONTEXT: bill-import — full Excel (.xlsx) import journey (end-to-end)
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - The import panel can be opened from the dashboard
// - Same flows as the CSV journey — verified with .xlsx files specifically

// SCENARIO: happy path — drop a clean Excel file, review, and finalize
// GIVEN: the user is on the dashboard with no existing bills
// WHEN: the user opens the import panel and drops a valid .xlsx file containing 5 bill rows
// THEN: 5 parsed rows appear in the review area with auto-suggested categories
//   AND the summary shows total=5, valid=5, errors=0
//   AND clicking finalize shows a success message "5 bills imported"
//   AND the bill history on the dashboard now includes the 5 new bills

// SCENARIO: Excel file with mixed valid and invalid rows requires review before finalizing
// GIVEN: the import panel is open
// WHEN: the user drops a .xlsx file containing 8 rows, 3 of which have validation errors
// THEN: the 3 invalid rows are highlighted in the review area
//   AND the user can remove or correct those rows before finalizing the remaining valid rows

// SCENARIO: only the first worksheet is imported from a multi-sheet Excel file
// GIVEN: the import panel is open
// WHEN: the user drops a .xlsx file that contains multiple worksheets
// THEN: only the data from the first worksheet appears in the review area
//   AND data from subsequent worksheets is not shown

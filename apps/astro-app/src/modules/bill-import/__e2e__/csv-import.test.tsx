// CONTEXT: bill-import — full CSV import journey (end-to-end)
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - The import panel can be opened from the dashboard

// SCENARIO: happy path — drop a clean CSV, review, and finalize
// GIVEN: the user is on the dashboard with no existing bills
// WHEN: the user opens the import panel and drops a valid CSV file containing 10 bill rows
// THEN: 10 parsed rows appear with auto-suggested categories
//   AND the summary shows total=10, valid=10, errors=0
//   AND clicking finalize shows a success message "10 bills imported"
//   AND the bill history on the dashboard now includes the 10 new bills

// SCENARIO: CSV with alternative/localized column headers is parsed correctly
// GIVEN: the import panel is open
// WHEN: the user drops a CSV whose headers are in an alternative format (e.g. "Monto,Fecha,Proveedor,Detalle")
// THEN: the rows are parsed correctly with fields auto-detected from the non-standard headers

// SCENARIO: user edits a parsed row before finalizing
// GIVEN: the review table is showing 10 parsed rows
// WHEN: the user changes the provider on row 3 to "Netflix" and the category auto-updates to "Subscriptions"
//   AND the user clicks finalize
// THEN: the saved bill reflects the edited provider "Netflix" and the category "Subscriptions"

// SCENARIO: user removes error rows before finalizing
// GIVEN: the user drops a CSV with 8 rows, 2 of which have future dates and are highlighted as errors
// WHEN: the user removes the 2 error rows
// THEN: the summary updates to total=6, valid=6, errors=0
//   AND clicking finalize results in exactly 6 bills imported

// SCENARIO: duplicate detection flags a matching row without blocking the import
// GIVEN: a bill for Netflix / $15.99 / 2026-01-15 already exists in the system
// WHEN: the user drops a CSV containing a row with that exact provider, amount, and date
// THEN: that row is marked as a potential duplicate in the review table
//   AND the user can still click finalize and complete the import

// SCENARIO: a row with multiple errors shows all error indicators at once
// GIVEN: the import panel is open
// WHEN: the user drops a CSV containing a row with both a negative amount and a future date
// THEN: that row displays error indicators for both the amount field and the date field
//   AND the error summary lists both error messages

// SCENARIO: stats update in real time as the user edits rows
// GIVEN: the review table shows 10 rows with 2 invalid (summary: total=10, valid=8, errors=2)
// WHEN: the user removes one invalid row
// THEN: the summary updates to total=9, valid=8, errors=1
//   AND when the user fixes the remaining invalid row by correcting its data
// THEN: the summary updates to total=9, valid=9, errors=0

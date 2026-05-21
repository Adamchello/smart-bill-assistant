// CONTEXT: bill-import — Excel (.xlsx) parsing and import flow
// PRECONDITIONS:
// - User is authenticated
// - No existing bills in the system
// - The import panel/modal is open and ready to receive files

// SCENARIO: valid Excel file produces a reviewable row list
// GIVEN: the import panel is open with no file loaded
// WHEN: the user drops a valid .xlsx file containing 5 bill rows
// THEN: 5 parsed rows appear in the review area with their data correctly displayed

// SCENARIO: finalizing after an Excel import persists the bills
// GIVEN: the user has dropped a valid 5-row .xlsx and the review table is showing
// WHEN: the user clicks the finalize/confirm button
// THEN: a success message confirms the bills were saved and the data matches what was in the spreadsheet

// SCENARIO: corrupt or unreadable Excel file shows an error without crashing
// GIVEN: the import panel is open
// WHEN: the user drops a file with a .xlsx extension that contains invalid/corrupt binary data
// THEN: an error message is displayed explaining the file could not be read, and the application remains usable

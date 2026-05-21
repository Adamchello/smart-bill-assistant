// CONTEXT: bill-management — bill history display
// PRECONDITIONS:
// - User is authenticated and on the dashboard
// - The history section is visible on the page

// SCENARIO: Bills are displayed in chronological order
// GIVEN: The user has multiple bills recorded on different dates
// WHEN: The user views the bill history
// THEN: Bills appear sorted by date, with the most recent or oldest first consistently

// SCENARIO: Bill details are displayed accurately
// GIVEN: The user has a bill with a known amount, provider, category, and date
// WHEN: The user views the bill history
// THEN: Each bill row shows the correctly formatted amount, provider name, category, and date

// SCENARIO: Empty state is shown when no bills exist
// GIVEN: The user has no bills recorded
// WHEN: The user views the bill history
// THEN: An empty state message is visible indicating there are no bills yet

// SCENARIO: Loading indicator appears while bills are being fetched
// GIVEN: The user navigates to the dashboard and bills have not yet loaded
// WHEN: The system is retrieving bill data
// THEN: A loading indicator is visible; once loading completes, the bills are shown and the indicator disappears

// CONTEXT: bill-import — duplicate detection during review
// PRECONDITIONS:
// - User is authenticated
// - The system already contains a bill: provider="Netflix", amount=15.99, date=2026-01-15
// - The import panel is open and ready to receive files

// SCENARIO: a row matching an existing bill on all three fields is flagged as a potential duplicate
// GIVEN: the system has an existing bill for Netflix / $15.99 / 2026-01-15
// WHEN: the user drops a CSV containing a row with the same provider, amount, and date
// THEN: that row is visually marked as a potential duplicate in the review table

// SCENARIO: a row with the same provider and date but different amount is NOT flagged
// GIVEN: the system has an existing bill for Netflix / $15.99 / 2026-01-15
// WHEN: the user drops a CSV containing a row for Netflix / $19.99 / 2026-01-15
// THEN: no duplicate indicator appears on that row

// SCENARIO: a row with the same provider and amount but different date is NOT flagged
// GIVEN: the system has an existing bill for Netflix / $15.99 / 2026-01-15
// WHEN: the user drops a CSV containing a row for Netflix / $15.99 / 2026-02-15
// THEN: no duplicate indicator appears on that row

// SCENARIO: a row with the same amount and date but different provider is NOT flagged
// GIVEN: the system has an existing bill for Netflix / $15.99 / 2026-01-15
// WHEN: the user drops a CSV containing a row for Spotify / $15.99 / 2026-01-15
// THEN: no duplicate indicator appears on that row

// SCENARIO: a duplicate flag is informational and does not block the user from finalizing
// GIVEN: the review table shows a row flagged as a potential duplicate
// WHEN: the user clicks the finalize/confirm button without removing the flagged row
// THEN: the import proceeds and the bills are saved successfully

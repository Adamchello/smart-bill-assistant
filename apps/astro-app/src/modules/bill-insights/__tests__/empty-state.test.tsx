// CONTEXT: bill-insights — Empty State
// PRECONDITIONS:
// - User is authenticated
// - The insights panel is the active view

// SCENARIO: no insights available shows an empty state message
// GIVEN: the system returns an empty list of insights (e.g. user has not added enough bills)
// WHEN: the user views the insights panel
// THEN: an empty state message is displayed (e.g. "Add more bills to unlock insights")
// THEN: no insight cards are rendered

// SCENARIO: a server error shows an error state without crashing
// GIVEN: the insights data cannot be retrieved due to a server error
// WHEN: the user views the insights panel
// THEN: an error message is displayed
// THEN: the panel remains usable and does not crash

// CONTEXT: bill-insights — Minimal History Scenarios
// PRECONDITIONS:
// - Certain insight types require multiple months of bill history to be meaningful
// - The system only surfaces insights that are supported by the available data depth

// SCENARIO: user with 1 month of data sees only basic insights
// GIVEN: the user has 1 month of bill history
// WHEN: the user views the insights panel
// THEN: only a single basic insight (e.g. top spending category) is shown
// THEN: insights that require multi-month history — such as seasonal patterns, budget trajectory, and subscription creep — are not shown

// SCENARIO: user with 3 months of data sees trend insights but not seasonal ones
// GIVEN: the user has 3 months of bill history
// WHEN: the user views the insights panel
// THEN: trend-based insights (spending spike, budget trajectory, top spending category) are shown
// THEN: insights requiring longer history (e.g. seasonal patterns) are not shown

// SCENARIO: no insights available produces an empty state
// GIVEN: the system returns no insights for the user
// WHEN: the user views the insights panel
// THEN: an empty state message is displayed and no insight cards are shown

// SCENARIO: a data-fetch error produces a visible error state
// GIVEN: the insights data cannot be retrieved due to a server error
// WHEN: the user views the insights panel
// THEN: an error message is displayed and the panel does not crash

// CONTEXT: bill-forecasts — end-to-end forecast viewing journey
// PRECONDITIONS:
// - User is authenticated
// - Bill history varies per scenario (rich, minimal, or empty)

// SCENARIO: user with rich bill history sees full-quality forecasts
// GIVEN: the user has 6+ months of bills across multiple categories
// WHEN: the user navigates to the Forecasts tab
// THEN: per-category forecast cards are shown with predicted amounts and confidence ranges
// AND: a monthly totals section shows projections for 3 future months
// AND: a yearly projection figure is displayed
// AND: the data quality indicator shows "full"

// SCENARIO: user with minimal bill history sees limited-quality forecasts
// GIVEN: the user has only 2 months of bill history
// WHEN: the user navigates to the Forecasts tab
// THEN: forecast cards are rendered with wider confidence ranges
// AND: the data quality indicator shows "limited"

// SCENARIO: user with no bills sees an empty state
// GIVEN: the authenticated user has no bills recorded
// WHEN: the user navigates to the Forecasts tab
// THEN: an empty state message is displayed (e.g., "Add bills to see forecasts")

// SCENARIO: forecast updates after new bill is added
// GIVEN: the user has 3 months of bills and has viewed the current forecast values
// WHEN: the user adds a large new bill and returns to the Forecasts tab
// THEN: the forecast values reflect the newly added data

// SCENARIO: trend indicators reflect actual spending direction
// GIVEN: the user has 4+ months of increasing spending in a category
// WHEN: the user navigates to the Forecasts tab
// THEN: the trend indicator for that category shows "increasing"

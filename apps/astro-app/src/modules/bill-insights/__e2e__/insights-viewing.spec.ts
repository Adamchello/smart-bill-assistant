// CONTEXT: bill-insights — Insights Viewing Journey (e2e)
// PRECONDITIONS:
// - User is authenticated
// - Database is seeded as described per scenario

// SCENARIO: user with rich bill history sees multiple prioritized insights
// GIVEN: the user has 8+ months of diverse bill history across multiple categories
// WHEN: the user navigates to the Insights tab on the dashboard
// THEN: multiple insight cards are displayed
// THEN: cards appear sorted by priority with the most urgent insights first
// THEN: each card contains recognizable structural elements (icon, title, description)

// SCENARIO: user with minimal bill history sees only data-appropriate insights
// GIVEN: the user has 1 month of bill history
// WHEN: the user navigates to the Insights tab
// THEN: only insights appropriate for the available data depth are shown

// SCENARIO: user with no bills sees an empty state
// GIVEN: the user has no bills recorded
// WHEN: the user navigates to the Insights tab
// THEN: an empty state message is displayed
// THEN: no insight cards are rendered

// SCENARIO: insights fail to load and user sees an error state
// GIVEN: the insights API returns an error
// WHEN: the user navigates to the Insights tab
// THEN: an error message is displayed
// THEN: the panel remains usable and does not crash

// SCENARIO: insights are loading and user sees a loading state
// GIVEN: the insights API response is delayed
// WHEN: the user navigates to the Insights tab before the response arrives
// THEN: a loading indicator is visible
// THEN: no insight cards are shown yet

// SCENARIO: anomalous bill triggers a spending spike insight
// GIVEN: the user has several months of stable bills in a category
// AND: a significantly higher bill is added for the current month in that category
// WHEN: the user navigates to the Insights tab
// THEN: a spending spike insight card is visible for the affected category
// THEN: the insight card shows comparison values

// SCENARIO: newly added spending category surfaces a new category insight
// GIVEN: the user has months of history in established categories only
// AND: bills in a previously unseen category are added in recent months
// WHEN: the user navigates to the Insights tab
// THEN: a new category insight is visible for the recently added category

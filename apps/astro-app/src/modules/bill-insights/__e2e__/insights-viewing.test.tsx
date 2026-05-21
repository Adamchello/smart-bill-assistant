// CONTEXT: bill-insights — Insights Viewing Journey (e2e)
// PRECONDITIONS:
// - User is authenticated
// - Database is seeded as described per scenario

// SCENARIO: user with rich bill history sees multiple prioritized insights
// GIVEN: the user has 8+ months of diverse bill history (spending spikes, new categories, recurring trends)
// WHEN: the user navigates to the Insights tab on the dashboard
// THEN: multiple insight cards are displayed
// THEN: cards appear sorted by priority (e.g. spending spike ranked above diversity insight)
// THEN: each card shows an icon, sentiment color, title, and description

// SCENARIO: user with minimal bill history sees only basic insights
// GIVEN: the user has 1 month of bill history
// WHEN: the user navigates to the Insights tab
// THEN: only insights that do not require multi-month history are shown
// THEN: seasonal pattern and subscription creep insights are absent

// SCENARIO: anomalous bill triggers a spending spike insight
// GIVEN: the user has 4 months of stable $50/month Utilities bills
// AND: a new $120 Utilities bill is added for the current month
// WHEN: the user navigates to the Insights tab
// THEN: a "Spending Spike" insight card for Utilities is visible with warning-level sentiment

// SCENARIO: spending spike insight displays previous and current values
// GIVEN: a spending spike exists for a category that jumped from $50 to $120
// WHEN: the user views that insight card
// THEN: both the previous value ($50) and current value ($120) are visually emphasized in the card

// SCENARIO: user with no bills sees an empty state
// GIVEN: the user has no bills recorded
// WHEN: the user navigates to the Insights tab
// THEN: an empty state message is displayed

// SCENARIO: newly added spending category surfaces a "new category" insight
// GIVEN: the user has 6 months of history in Utilities and Food categories only
// AND: 2 bills in a new "Pets" category are added in recent months
// WHEN: the user navigates to the Insights tab
// THEN: a "New Category" insight for Pets is visible

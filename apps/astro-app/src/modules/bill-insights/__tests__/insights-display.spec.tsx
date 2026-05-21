// CONTEXT: bill-insights — Insights Display & Priority
// PRECONDITIONS:
// - User has bills data that has generated insights
// - Insights API returns a list of insight objects with priority, sentiment, and optional comparison data

// SCENARIO: user sees all available insights rendered as cards
// GIVEN: the insights API returns 4 insights
// WHEN: the user views the insights panel
// THEN: 4 insight cards are visible on screen

// SCENARIO: insights are presented in priority order
// GIVEN: the insights API returns insights with priorities [5, 1, 9, 3] in arbitrary order
// WHEN: the user views the insights panel
// THEN: cards appear ordered from highest to lowest priority [1, 3, 5, 9]

// SCENARIO: each insight card shows its title, description, and icon
// GIVEN: an insight with title "Spending Spike" and description "Utilities up 30%"
// WHEN: the user views the insights panel
// THEN: the card displays the title text, the description text, and a visual icon

// SCENARIO: insight cards reflect their sentiment through visual styling
// GIVEN: insights with sentiments "warning", "positive", "negative", and "neutral"
// WHEN: the user views the insights panel
// THEN: each card has a distinct visual treatment corresponding to its sentiment (e.g. amber for warning, green for positive, red for negative, gray for neutral)

// SCENARIO: a comparison bar appears when an insight has before/after data
// GIVEN: an insight with comparison data showing a previous value of 50 and current value of 120 trending upward
// WHEN: the user views that insight card
// THEN: a visual comparison bar is shown displaying both values

// SCENARIO: no comparison bar when insight has no comparison data
// GIVEN: an insight with no comparison data attached
// WHEN: the user views that insight card
// THEN: no comparison bar is shown in that card

// SCENARIO: a loading indicator is visible while insights are being fetched
// GIVEN: the insights API response is delayed
// WHEN: the user views the insights panel before the response arrives
// THEN: a loading indicator is visible and no insight cards are shown yet

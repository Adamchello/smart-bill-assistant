// CONTEXT: bill-insights — Sentiment Styling & Content Formatting
// PRECONDITIONS:
// - User has insights available with varying sentiment values
// - Insights may belong to named groups and may contain numeric values in descriptions

// SCENARIO: a warning-sentiment insight is styled to signal caution
// GIVEN: an insight of type spending spike with warning sentiment and an upward-trend icon hint
// WHEN: the user views that insight card
// THEN: the card displays warning-level visual styling (e.g. amber/orange) and the appropriate directional icon

// SCENARIO: a positive-sentiment insight is styled to signal good news
// GIVEN: an insight with positive sentiment
// WHEN: the user views that insight card
// THEN: the card displays success-level visual styling (e.g. green)

// SCENARIO: a negative-sentiment insight is styled to signal a problem
// GIVEN: an insight with negative sentiment
// WHEN: the user views that insight card
// THEN: the card displays danger-level visual styling (e.g. red)

// SCENARIO: a neutral-sentiment insight is styled without strong signal
// GIVEN: an insight with neutral sentiment
// WHEN: the user views that insight card
// THEN: the card displays neutral visual styling (e.g. gray)

// SCENARIO: numeric values in descriptions are visually emphasized
// GIVEN: an insight whose description contains the values "$500" and "30%"
// WHEN: the user reads the insight description
// THEN: those numeric values are rendered with bold or emphasized styling, distinguishing them from surrounding text

// SCENARIO: insights sharing a group are presented under a single shared heading
// GIVEN: multiple insights that belong to the same named group
// WHEN: the user views the insights panel
// THEN: those insights are displayed together under one group heading rather than as separate standalone cards

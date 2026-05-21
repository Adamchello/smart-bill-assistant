// CONTEXT: bill-forecasts — forecast display with full data quality
// PRECONDITIONS:
// - User has sufficient bill history for high-confidence predictions (6+ months)
// - Forecast data is available across multiple categories

// SCENARIO: user views per-category forecast summaries
// GIVEN: the user has bills recorded across multiple spending categories
// WHEN: the user opens the forecasts view
// THEN: a forecast card is shown for each category with the category name visible

// SCENARIO: user sees predicted amounts with confidence ranges
// GIVEN: a category has enough history to generate a prediction
// WHEN: the user views a forecast card for that category
// THEN: the predicted amount is displayed alongside a low–high confidence range

// SCENARIO: user views monthly projected totals
// GIVEN: the forecast covers the next 3 months
// WHEN: the user views the monthly totals section
// THEN: three monthly entries are shown, each with a projected total amount

// SCENARIO: user sees a yearly spending projection
// GIVEN: the forecast includes an annualized estimate
// WHEN: the user views the forecasts page
// THEN: a formatted yearly projection amount is visible on screen

// SCENARIO: user sees trend direction per category
// GIVEN: a category has a detectable spending trend (increasing, decreasing, or stable)
// WHEN: the user views the forecast card for that category
// THEN: a trend indicator is shown reflecting the correct direction for each trend type

// SCENARIO: user sees a loading state while forecast data is being fetched
// GIVEN: the forecast data has not yet loaded
// WHEN: the forecasts view first renders
// THEN: a loading indicator is visible before any forecast content appears

// CONTEXT: bill-forecasts — forecast display with limited data quality
// PRECONDITIONS:
// - User has minimal bill history (too few months for high-confidence predictions)
// - Forecast data is available but confidence intervals are wide

// SCENARIO: user is informed that forecast confidence is limited
// GIVEN: the user has only a short bill history
// WHEN: the user views the forecasts page
// THEN: a visible indicator communicates that the forecast quality is limited

// SCENARIO: forecasts are still shown despite limited history
// GIVEN: the user has some bill history, but not enough for full-quality predictions
// WHEN: the user views the forecasts page
// THEN: forecast cards are rendered with predicted amounts and confidence ranges

// SCENARIO: confidence ranges reflect higher uncertainty with limited data
// GIVEN: a category has limited history resulting in a wide prediction spread
// WHEN: the user views the forecast card for that category
// THEN: the displayed confidence range spans a noticeably wider interval than a full-quality forecast would show

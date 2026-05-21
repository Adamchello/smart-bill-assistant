// CONTEXT: bill-forecasts — empty and error states
// PRECONDITIONS:
// - User either has no bills recorded, or the forecast service is unavailable

// SCENARIO: user with no bills sees a prompt to add data
// GIVEN: the user has no bills recorded in the system
// WHEN: the user opens the forecasts view
// THEN: an empty state message is shown encouraging the user to add bills
// AND: no forecast cards are rendered

// SCENARIO: user sees an error message when forecast data cannot be loaded
// GIVEN: the forecast service returns an error
// WHEN: the user opens the forecasts view
// THEN: an error message is displayed and the page does not crash

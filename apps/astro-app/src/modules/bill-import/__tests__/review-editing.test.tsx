// CONTEXT: bill-import — review table editing interactions
// PRECONDITIONS:
// - User is authenticated
// - A valid CSV has been dropped and the review table is populated with parsed rows
// - At least one row has provider "Unknown Store" and an indeterminate category

// SCENARIO: changing a row's provider triggers an updated category suggestion
// GIVEN: the review table is showing parsed rows
// WHEN: the user changes the provider field on a row from "Unknown Store" to "Netflix"
// THEN: the category for that row automatically updates to "Subscriptions"

// SCENARIO: editing a non-provider field does not change the category suggestion
// GIVEN: the review table is showing parsed rows with a known category on a row
// WHEN: the user edits the description field on that row
// THEN: the category for that row remains unchanged

// SCENARIO: user can manually override an auto-suggested category
// GIVEN: the user has changed a provider to "Netflix" and the category has auto-suggested "Subscriptions"
// WHEN: the user opens the category selector and chooses "Entertainment"
// THEN: "Entertainment" is shown as the category and persists without reverting

// SCENARIO: removing a row updates both the row list and the summary counts
// GIVEN: the review table shows 5 rows and the summary displays total=5
// WHEN: the user removes row 3
// THEN: the review table shows 4 rows and the summary updates to total=4

// SCENARIO: removing all invalid rows leaves only valid rows ready to finalize
// GIVEN: the review table shows 3 valid rows and 2 invalid rows (5 total)
// WHEN: the user removes both invalid rows
// THEN: the summary shows total=3, valid=3, errors=0 and the finalize action becomes available

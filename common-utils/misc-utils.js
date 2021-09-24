export class MiscUtils {
  constructor(inputTestRunner) {
    this.testRunner = inputTestRunner;
  }

  /**
   * Visit the webpage at a specified path
   * @param {String} path Path to a webpage
   */
  visitPage(path) {
    this.testRunner.visit(path)
  }
  
  /**
   * Go to the dashboard list page through the navigation side panel
   */
  goToDashboardPage() {
    this.testRunner.get('[data-test-subj="toggleNavButton"]').click()
    this.testRunner.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
  }

  /**
   * Create a new dashboard from the dashboard list page
   * @param {Number} timeout Optional timeout duration
   */
  createNewDashboard(timeout = 60000) {
    this.testRunner.get('[data-test-subj="newItemButton"]', { timeout: timeout }).should('be.visible').click()
    this.testRunner.get('[data-test-subj="emptyDashboardWidget"]').should('be.visible')
  }

  /**
   * Enter a specified query to a query input field
   * @param {String} query Query string to search on
   */
  setQuery(query) {
    this.testRunner.get('[data-test-subj="queryInput"]').type(`{selectall}${query}`)
    this.testRunner.get('[data-test-subj="querySubmitButton"]').click()
  }

  /**
   * Clear the query input field on the current page
   */
  removeQuery() {
    this.testRunner.get('[data-test-subj="queryInput"]').type('{selectall}{backspace}')
    this.testRunner.get('[data-test-subj="querySubmitButton"]').click()
  }
}
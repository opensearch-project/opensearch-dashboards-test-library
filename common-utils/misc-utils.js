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

  /**
   * Add sample data of Sample eCommerce orders, Sample flight data, Sample web logs to dashboard
   */
  addSampleData(timeout = 60000) {
    const timeOut = { timeout: timeout }
    this.testRunner.visit('app/home#/tutorial_directory')
    this.testRunner.get('button[data-test-subj="addSampleDataSetecommerce"]').should('be.visible').click()
    this.testRunner.get('div[data-test-subj="sampleDataSetCardecommerce"] > span > span[title="INSTALLED"]', timeOut).should('have.text', 'INSTALLED')
    this.testRunner.get('button[data-test-subj="addSampleDataSetflights"]').should('be.visible').click()
    this.testRunner.get('div[data-test-subj="sampleDataSetCardflights"] > span > span[title="INSTALLED"]', timeOut).should('have.text', 'INSTALLED')
    this.testRunner.get('button[data-test-subj="addSampleDataSetlogs"]').should('be.visible').click()
    this.testRunner.get('div[data-test-subj="sampleDataSetCardlogs"] > span > span[title="INSTALLED"]', timeOut).should('have.text', 'INSTALLED')
  }

  /**
   * Remove sample data of Sample eCommerce orders, Sample flight data, Sample web logs to dashboard
   * 
   * TODO: Cypress chrome driver can't display the uninstalled notification properly
   */
  removeSampleData() {
    this.testRunner.visit('app/home#/tutorial_directory')
    this.testRunner.get('button[data-test-subj="removeSampleDataSetecommerce"]').should('be.visible').click()
    //this.testRunner.get('div[aria-label="Notification"] > span').should('have.text', 'Sample eCommerce orders uninstalled')
    this.testRunner.get('button[data-test-subj="removeSampleDataSetflights"]').should('be.visible').click()
    //this.testRunner.get('div[aria-label="Notification"] > span').should('have.text', 'Sample flight data uninstalled')
    this.testRunner.get('button[data-test-subj="removeSampleDataSetlogs"]').should('be.visible').click()
    //this.testRunner.get('div[aria-label="Notification"] > span').should('have.text', 'Sample web logs uninstalled')
  }

  /**
   * View the sample data dashboard
   * @param {String} sampleData The sample data name
   */
  viewData(sampleData) {
    this.testRunner.location('pathname').then((loc) => {
      if (!loc.includes('/tutorial_directory')) {
        this.testRunner.visit('app/home#/tutorial_directory')
      }
      this.testRunner.get(`button[data-test-subj="launchSampleDataSet${sampleData}"]`).should('be.visible').click()
    })
  }

}
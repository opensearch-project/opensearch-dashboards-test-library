export class DashboardPage {
  constructor(inputTestRunner) {
    this.testRunner = inputTestRunner;
  }
  /**
   * Add saved Dashboard panels
   * @param {String} keyword Search term for panels of interest
   * @param {String} type Panel type to search for
   * @param {Boolean} multiplePages Whether there are multiple pages to iterate through
   */
  addDashboardPanels(keyword, type, multiplePages = true) {
    const replaceSpacesWithDashes = (keyword) => {
      return keyword.replace(/\s+/g, '-')
    }
  
    const iteratePages = () => {
      this.testRunner.get('[data-test-subj="pagination-button-next"]').then(($nextBtn) => {
        this.testRunner.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')
        if ($nextBtn.is(':enabled')) {
          this.testRunner.wrap($nextBtn).click()
          this.testRunner.get(`[data-test-subj^="savedObjectTitle${replaceSpacesWithDashes(keyword)}"]`).should('be.visible').each(($button) => {
            this.testRunner.wrap($button).click()
            this.testRunner.get('[data-test-subj="toastCloseButton"').click({ multiple: true, force: true })
          })
          iteratePages()
        }
      })
    }
    this.testRunner.get('[data-test-subj="dashboardAddPanelButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')
  
    this.testRunner.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()
    this.testRunner.get(`[data-test-subj="savedObjectFinderFilter-${type}"]`).should('be.visible').click()
    this.testRunner.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()
  
    this.testRunner.get('[data-test-subj="savedObjectFinderSearchInput"]').should('be.visible').type(keyword)
  
    this.testRunner.get(`[data-test-subj^="savedObjectTitle${replaceSpacesWithDashes(keyword)}"]`).should('be.visible').each(($button) => {
      this.testRunner.wrap($button).click()
      this.testRunner.get('[data-test-subj="toastCloseButton"').click({ multiple: true, force: true })
    }).then(() => {
      if (multiplePages) {
        this.testRunner.wrap(iteratePages())
      }
    })
    this.testRunner.get('[data-test-subj="euiFlyoutCloseButton"]').click()
  }
  
  /**
   * Save a dashboard visualization
   * @param {String} title Field value to select
   * @param {Boolean} saveAsNew Whether to save as new visualization
   * @param {Boolean} returnToDashboard Whether to return to the home dashboard
   */
  saveDashboardVisualization(title, saveAsNew = false, returnToDashboard = false) {
    this.testRunner.get('[data-test-subj="visualizeSaveButton"]').click()
    this.testRunner.get('[data-test-subj="savedObjectTitle"]').type(`{selectall}${title}`)
    this.testRunner.get('[data-test-subj="saveAsNewCheckbox"]').then(($checkbox) => {
      if (saveAsNew === false) {
        this.testRunner.get($checkbox).click()
      }
    })
    this.testRunner.get('[data-test-subj="returnToOriginModeSwitch"]').then(($checkbox) => {
      if (returnToDashboard === false) {
        this.testRunner.get($checkbox).click()
      }
    })
    this.testRunner.get('[data-test-subj="confirmSaveSavedObjectButton"]').click()
  }

  /**
   * Open the context/options menu for a dashboards visualization given its title name.
   * CAUTION: if multiple visualizations have the same name, this method will fail
   * @param {String} panelName Name of the dashboards visualization
   */
  openVisualizationContextMenu(panelName) {
    const removeSpaces = (keyword) => {
      return keyword.replace(/\s+/g, '')
    }
    this.testRunner.get(`[data-test-subj="embeddablePanelHeading-${removeSpaces(panelName)}"]`).find('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
  }

  /**
   * Click on the edit button in a dashboard visualization's context menu
   */
  clickEditVisualization() {
    this.testRunner.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()
  }
}
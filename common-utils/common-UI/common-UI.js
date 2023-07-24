export class CommonUI {
  constructor(inputTestRunner) {
    this.testRunner = inputTestRunner;
  }

  /**
   * Generate a selector string for a filter based on its field attribute.
   * CAUTION: retrieving the elements associated with the returned selector string 
   * may produce multiple filters if they all correspond to the same field attribute 
   * @param {String} field Field attribute value of the filter
   * @returns {String}
   */
  _generateFilterSearchString(field) {
    return `[data-test-subj~="filter"][data-test-subj~="filter-key-${field}"]`
  }

  /**
   * Sets the page date range
   * Sets start date first then end date
   * @param {String} start Start datetime to set
   * @param {String} end  End datetime to set
   */
  setDateRange(end, start) {
    /* Find any one of the two buttons that change/open the date picker:
     *   * if `superDatePickerShowDatesButton` is clicked, it will switch the mode to dates
     *      * in some versions of OUI, the switch will open the date selection dialog as well
     *   * if `superDatePickerstartDatePopoverButton` is clicked, it will open the date selection dialog
     */
    this.testRunner.get('[data-test-subj="superDatePickerstartDatePopoverButton"], [data-test-subj="superDatePickerShowDatesButton"]')
        .should('be.visible')
        .invoke('attr', 'data-test-subj')
        .then((testId) => {
          this.testRunner.get(`[data-test-subj="${testId}"]`)
              .should('be.visible')
              .click();
        });

    /* While we surely are in the date selection mode, we don't know if the date selection dialog
     * is open or not. Looking for a tab and if it is missing, click on the dialog opener.
     */
    this.testRunner.get('body').then($body => {
      if ($body.find('[data-test-subj="superDatePickerAbsoluteTab"]').length === 0) {
        this.testRunner.get('[data-test-subj="superDatePickerstartDatePopoverButton"]')
            .should('be.visible')
            .click();
      }
    });

    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type(`{selectall}${start}`)
    this.testRunner.get('[data-test-subj="superDatePickerstartDatePopoverButton"]').should('be.visible').click()

    this.testRunner.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type(`{selectall}${end}`)
    this.testRunner.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('not.exist')

    this.testRunner.get('[data-test-subj="querySubmitButton"]').should('be.visible').click()
  }

  /**
   * Attempts to add a specified filter to a dashboard, retrying by reopening the filter window
   * @param {String} field Field value to select
   * @param {String} operator Operator value to select
   * @param {String} value Value field input
   */
  addFilterRetryFull(field, operator, value = null, maxRetries = 3) {
    // Try and select the desire combo box option
    const selectComboBoxInput = (selector, keyword) => {
      this.testRunner.get(`[data-test-subj="${selector}"]`).find('[data-test-subj="comboBoxInput"]').trigger('focus').type(`{selectall}{backspace}${keyword}`)
      this.testRunner.get(`[data-test-subj="comboBoxOptionsList ${selector}-optionsList"]`).find(`[title="${keyword}"]`).trigger('click', { force: true })
    }

    // Attempt up to three times to select the desired field and operator options and input the value (if applicable)
    const tryToAddFilter = (field, operator, value = null, retry = 0) => {
      this.testRunner.get('[data-test-subj="addFilter"]').click({ scrollBehavior: 'center' }).then(() => {
        selectComboBoxInput('filterFieldSuggestionList', field)
        this.testRunner.get('[data-test-subj="filterFieldSuggestionList"]').then(($field) => {
          const cls = $field.attr('class')
          if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
            this.testRunner.get('[data-test-subj="cancelSaveFilter"]').click()
            tryToAddFilter(field, operator, value, retry + 1)
          } else {
            selectComboBoxInput('filterOperatorList', operator)
            this.testRunner.get('[data-test-subj="filterOperatorList"]').then(($operator) => {
              const cls = $operator.attr('class')
              if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
                this.testRunner.get('[data-test-subj="cancelSaveFilter"]').click()
                tryToAddFilter(field, operator, value, retry + 1)
              } else {
                if (value !== null) {
                  this.testRunner.get('[data-test-subj="filterParams"]').find('input').type(value)
                }
                this.testRunner.get('[data-test-subj="saveFilter"]').click()
                this.testRunner.get(this._generateFilterSearchString(field)).last().should('be.visible')
              }
            })
          }
        })
      })
    }
    tryToAddFilter(field, operator, value)
  }

  /**
   * Attempts to add a specified filter, retrying by reselecting the failed option
   * @param {String} field Field value to select
   * @param {String} operator Operator value to select
   * @param {String} value Value field input
   */
  addFilterRetrySelection(field, operator, value = null, maxRetries = 3) {
    const selectComboBoxInput = (selector, keyword, retry = 0) => {
      this.testRunner.get(`[data-test-subj="${selector}"]`).find('[data-test-subj="comboBoxInput"]').trigger('focus').type(`{selectall}{backspace}${keyword}`)
      this.testRunner.get(`[data-test-subj="comboBoxOptionsList ${selector}-optionsList"]`).find(`[title="${keyword}"]`).trigger('click', { force: true })
      this.testRunner.get(`[data-test-subj="${selector}"]`).then(($box) => {
        const cls = $box.attr('class')
        if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
          this.testRunner.wrap($box).find('[data-test-subj="comboBoxInput"]').type('{selectall}{backspace}')
          this.testRunner.wrap($box).find('[data-test-subj="comboBoxToggleListButton"]').click()
          selectComboBoxInput(selector, keyword, retry + 1)
        }
      })
    }

    this.testRunner.get('[data-test-subj="addFilter"]').click().then(() => {
      selectComboBoxInput('filterFieldSuggestionList', field)
      selectComboBoxInput('filterOperatorList', operator)
    })

    if (value != null) {
      this.testRunner.get('[data-test-subj="filterParams"]').find('input').type(value)
    }

    this.testRunner.get('[data-test-subj="saveFilter"]').click()
    this.testRunner.get(this._generateFilterSearchString(field)).last().should('be.visible')
  }

  /**
   * Pins a filter with a specified field attribute and an optional
   * index number representing which position the desired filter is located at
   * out of multiple filters with the same field attribute value
   * @param {String} field Field attribute value to search for
   * @param {Number} index Optional index position from an array of filter elements
   */
  pinFilter(field, index=0) {
    this.testRunner.get(this._generateFilterSearchString(field)).eq(index).click()
    this.testRunner.get('[data-test-subj="pinFilter"]').click()
  }

  /**
   * Removes a filter with a specified field attribute and an optional
   * index number representing which position the desired filter is located at
   * out of multiple filters with the same field attribute value
   * @param {String} field Field attribute value to search for
   * @param {Number} index Optional index position from an array of filter elements
   */
  removeFilter(field, index=0) {
    this.testRunner.get(this._generateFilterSearchString(field)).then(($filters) => {
      const numFilters = $filters.length
      cy.wrap($filters).eq(index).click()
      this.testRunner.get('[data-test-subj="deleteFilter"]').click()
      if(numFilters - 1 == 0){
        this.testRunner.get(this._generateFilterSearchString(field)).should('not.exist')
      }
      else {
        this.testRunner.get(this._generateFilterSearchString(field)).should('be.length', numFilter - 1)
      }
    })
  }

  /**
   * Removes all filters from the page
   */
  removeAllFilters() {
    this.testRunner.get('[data-test-subj="showFilterActions"]').click()
    this.testRunner.get('[data-test-subj="removeAllFilters"]').click()
  }

  /**
   * Filters a pie chart visualization by a specified slice
   * @param {String} name Name of the pie chart slice to filter on
   */
  pieChartFilterOnSlice(name) {
    this.testRunner.get(`[data-test-subj="pieSlice-${name}"]`).click()
  }

  /**
   * Removes a filters placed on a pie chart visualization with a specific keyword
   * @param {String} keyword Keyword for the pie chart filter
   */
  pieChartRemoveFilter(keyword) {
    this.testRunner.get(this._generateFilterSearchString(keyword)).click()
    this.testRunner.get('[data-test-subj="deleteFilter"]').click()
  }

  /**
   * Asserts that there exists a certain number of instances of an element
   * @param {String} selector Selector for element of interest
   * @param {Number} numElements Number of expected elements
   */
  checkElementExists(selector, numElements) {
    this.testRunner.get(selector).should('be.length', numElements)
  }

  /**
   * Asserts that a certain element does not exist
   * @param {String} selector Selector for element of interest
   */
  checkElementDoesNotExist(selector) {
    this.testRunner.get(selector).should('not.exist')
  }

  /**
   * Asserts that the components of a certain element does not exist
   * @param {String} mainSelector Selector for element of interest
   * @param {String} componentSelector Selector for subcomponent of interest
   */
  checkElementComponentDoesNotExist(mainSelector, componentSelector) {
    this.testRunner.get(mainSelector).find(componentSelector).should('not.exist')
  }

  /**
   * Asserts that each element of a given selector contains a certain value
   * @param {String} selector Selector for element of interest
   * @param {Number} numElements Number of expected elements to be returned
   * @param {String} value Regex value
   */
  checkElementContainsValue(selector, numElements, value) {
    this.testRunner.get(selector).should('be.length', numElements).each(($el) => {
      this.testRunner.get($el).contains(new RegExp(`^${value}$`))
    })
  }

  /**
   * Asserts that each element of a given selector has components that contain a certain value
   * @param {String} mainSelector Selector for element of interest
   * @param {String} componentSelector Selector for subcomponent of interest
   * @param {Number} numElements Number of expected elements to be returned
   * @param {String} value Regex value
   */
  checkElementComponentContainsValue(mainSelector, componentSelector, numElements, value) {
    this.testRunner.get(mainSelector).should('be.length', numElements).each(($el) => {
      this.testRunner.get($el).find(componentSelector).contains(new RegExp(`^${value}$`))
    })
  }

  /**
   * Asserts each value in an array of strings is contained within an element
   * @param {String} selector Selector for element of interest
   * @param {Array} value Array of string values
   */
  checkValuesExistInComponent(selector, value) {
    this.testRunner.wrap(value).each((str) => {
      this.testRunner.get(selector).contains(new RegExp(`^${str}$`))
    })
  }

  /**
   * Asserts each value in an array of strings is not contained within an element
   * @param {String} selector Selector for element of interest
   * @param {Array} value Array of string values
   */
  checkValuesDoNotExistInComponent(selector, value) {
    this.testRunner.wrap(value).each((str) => {
      this.testRunner.get(selector).should('not.contain', new RegExp(`^${str}$`))
    })
  }
}
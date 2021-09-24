import { HOME_PAGE_ELEMENTS } from './page-elements'

export class HomePage {

    constructor(inputTestRunner) {
        this.testRunner = inputTestRunner;
    }

    open(url) {
        this.testRunner.visit(url)
    }

    clickSearchBox() {
        this.testRunner.get(HOME_PAGE_ELEMENTS.SEARCH_BOX)
            .click()
    }

    typeInSearchBox() {
        this.testRunner.get(HOME_PAGE_ELEMENTS.SEARCH_BOX)
            .type('amazon')
    }

    submitSearchQuery() {
        this.testRunner.get(HOME_PAGE_ELEMENTS.SEARCH_BOX)
            .type(`{enter}`)

    }
}
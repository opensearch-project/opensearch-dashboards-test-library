import { LOGIN_PAGE_ELEMENTS } from './login-page-elements.js'

export class LoginPage {
    constructor(inputTestRunner) {
        this.testRunner = inputTestRunner;
    }

    enterUserName(userName) {
        this.testRunner.get(LOGIN_PAGE_ELEMENTS.USER_NAME_INPUT, { timeout: 60000 }).should('be.visible').type(userName)
    }

    enterPassword(password) {
        this.testRunner.get(LOGIN_PAGE_ELEMENTS.PASSWORD_INPUT).should('be.visible').type(password)
    }

    submit() {
        this.testRunner.get(LOGIN_PAGE_ELEMENTS.SUBMIT_BUTTON).should('be.visible').click()
    }
}

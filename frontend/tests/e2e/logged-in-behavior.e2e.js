const baseUrl = 'http://localhost:8080';

module.exports = {
  'Logged in behavior': function (browser) {
    var randomStr = Math.random().toString(36).substring(7);
    var randomStr2 = Math.random().toString(36).substring(7);
    var email = `random-${randomStr}@email.fi`;
    var email2 = `random-${randomStr2}@email.fi`;
    this.teamSlug = '';
    browser
      .url(baseUrl)
      // Register
      .waitForElementVisible('.bottom-part a', 1000)
      .click('.bottom-part a')
      .waitForElementVisible('.register-form', 1000)
      .assert.urlEquals(`${baseUrl}/#/register`)
      .setValue('#email', email)
      .setValue('#password', 'secret')
      .setValue('#first-name', 'Tom')
      .setValue('#last-name', 'Tester')
      .click('.bottom-part button')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Registered succesfully')
      .click('.popup')
      // Login
      .assert.urlEquals(`${baseUrl}/#/login`)
      .setValue('#email', email)
      .setValue('#password', 'secret')
      .click('.bottom-part button')
      .waitForElementVisible('.choose-team', 1000)
      // Go to login page
      .url(`${baseUrl}/#/login`)
      .waitForElementVisible('.choose-team', 1000)
      .assert.urlEquals(`${baseUrl}/#/choose`)
    // Go to root page
      .url(baseUrl)
      .waitForElementVisible('.choose-team', 1000)
      .assert.urlEquals(`${baseUrl}/#/choose`)
    // Go to register page
      .url(`${baseUrl}/#/register`)
      .waitForElementVisible('.choose-team', 1000)
      .assert.urlEquals(`${baseUrl}/#/choose`)
    // Logout
      .click('.main-menu ul li:nth-child(1) a')
      .waitForElementVisible('.dropdown-menu', 1000)
      .click('.logout-link')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Logged out')
      .click('.popup')
      .assert.urlEquals(`${baseUrl}/#/login`)
    // Go to teams page
      .url(`${baseUrl}/#/choose`)
      .waitForElementVisible('.login-container', 1000)
      .assert.urlEquals(`${baseUrl}/#/login`)
  }
}

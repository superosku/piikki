const baseUrl = 'http://localhost:8080';

module.exports = {
  'Onboarding' : function (browser) {
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
    // Team listing
      .waitForElementVisible('.choose-team', 1000)
      .assert.urlEquals(`${baseUrl}/#/choose`)
      .assert.containsText('.choose-team', 'You are not part of any team')
    // Create team
      .click('a.new-team')
      .waitForElementVisible('.create-team', 1000)
      .assert.urlEquals(`${baseUrl}/#/create-team`)
      .setValue('#team-name', 'Toms club')
    // Team listing
      .click('.basic-form button[type=submit]')
      .waitForElementVisible('.choose-team', 1000)
      .assert.containsText('.popup', 'Team created')
      .click('.popup')
    // Under team
      .click('.team-item a')
      .waitForElementVisible('.tab-container', 1000)
      .url(url => {this.teamSlug = url.value.split('/')[4]})
      //.assert.urlEquals(`${baseUrl}/#/${this.teamSlug}/tab`)
    // Settings
      .click('.main-menu ul li:nth-child(3) a')
      .waitForElementVisible('.settings-menu', 1000)
      //.assert.urlEquals(`${baseUrl}/#/${this.teamSlug}/settings`)
    // Tab type settings
      .click('ul.settings-menu li:nth-child(1) a')
      .waitForElementVisible('.tab-type-settings', 1000)
      .click('tr.tab-type-item:nth-child(2) a')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Tab type deleted')
      .click('.popup')
      .setValue('#name', 'Premium cider')
      .setValue('#price', '3.5')
      .click('.basic-form button[type=submit]')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Tab type added')
      .click('.popup')
    // Person settings
      .click('ul.settings-menu li:nth-child(2) a')
      .waitForElementVisible('.person-settings', 1000)
      .setValue('#name', 'Pam Breaker')
      .click('.basic-form button[type=submit]')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Person added')
      .click('.popup')
      .click('.disable-person')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Person settings changed')
      .click('.popup')
      .clearValue('#name')
      .setValue('#name', 'Dug Destroyer')
      .click('.basic-form button[type=submit]')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Person added')
      .click('.popup')
    // User settings
      .click('ul.settings-menu li:nth-child(3) a')
      .waitForElementVisible('.user-settings', 1000)
      .setValue('#email', email2)
      .click('.basic-form button[type=submit]')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'User invited')
      .click('.popup')
    // Logout
      .click('.main-menu ul li:nth-child(4) a')
      .waitForElementVisible('.dropdown-menu', 1000)
      .click('.logout-link')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Logged out')
      .click('.popup')
      .assert.urlEquals(`${baseUrl}/#/login`)
    // Register with new user
      .waitForElementVisible('.bottom-part a', 1000)
      .click('.bottom-part a')
      .waitForElementVisible('.register-form', 1000)
      .assert.urlEquals(`${baseUrl}/#/register`)
      .setValue('#email', email2)
      .setValue('#password', 'secret')
      .setValue('#first-name', 'Pam')
      .setValue('#last-name', 'Breaker')
      .click('.bottom-part button')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Registered succesfully')
      .click('.popup')
    // Login
      .assert.urlEquals(`${baseUrl}/#/login`)
      .setValue('#email', email)
      .setValue('#password', 'secret')
      .click('.bottom-part button')
    // Tabs
      .waitForElementVisible('.person-listing', 1000)
      .assert.containsText('.person-listing', 'Tom Tester')
      .assert.containsText('.person-listing', 'Dug Destroyer')
      // TODO: Test does not contain Pam Breaker
      //.expect.element('.person-listing').not.contain('Pam Breaker')
    // Tabs selected
      .click('.person-listing a')
      // TODO: Check correct items in here
    // Logout
      .click('.main-menu ul li:nth-child(4) a')
      .waitForElementVisible('.dropdown-menu', 1000)
      .click('.logout-link')
      .waitForElementVisible('.popup', 1000)
      .assert.containsText('.popup', 'Logged out')
      .click('.popup')
      .assert.urlEquals(`${baseUrl}/#/login`)
    ;
  }
};

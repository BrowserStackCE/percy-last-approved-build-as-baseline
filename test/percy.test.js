require('dotenv').config()
require('chromedriver')
const { it } = require("mocha");
const { Builder } = require("selenium-webdriver");
const percySnapshot = require('@percy/selenium-webdriver');
var chrome = require("selenium-webdriver/chrome");
const baseUrl = "https://www.browserstack.com"
const endPoints = {
    "Home Page": "/",
    "Pricing": "/pricing",
    "Automate Integration": "/integrations/automate",
    "Documentation": "/docs"
}
describe("Percy", async function () {
    it("Percy " + baseUrl, async function () {
        this.timeout(100000);
        var options = new chrome.Options();
        options.addArguments('--headless')
        let driver = new Builder().forBrowser('chrome').setChromeOptions(options).build()
        for (let ep in endPoints) {
            await driver.get(baseUrl + endPoints[ep]);
            await driver.sleep(1000);
            await percySnapshot(driver, ep)
        }
        await driver.quit()
    })
})

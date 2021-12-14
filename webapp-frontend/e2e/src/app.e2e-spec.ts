import { tick } from '@angular/core/testing';
/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */
import { browser, by, element, logging } from "protractor";

describe("Home page", () => {

  beforeEach(() => {
    browser.get("http://localhost:4200/");
  });

  it("should display title", () => {
    expect(browser.getTitle()).toEqual("Non-RT RIC Control Panel");
  });

  it("should reach policy types page when clicking on the policy types card", async () => {
    await element(by.id('policyControlCard')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/policy");
  });

  it("should reach information coordinator page when clicking on the information coordinator card", async () => {
    await element(by.id('eicCard')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/ei-coordinator");
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      })
    );
  });
});

describe("Sidebar navigation", () => {

  beforeEach(() => {
    browser.get("http://localhost:4200/");
    element(by.id('Menu_Burger_Icon')).click();
  });

  it("should reach policy types page when clicking in the side bar", async () => {
    await element(by.id('policyToggle')).click();
    await element(by.id('policyLink')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/policy");
  });

  it("should reach ric configuration page when clicking in the side bar", async () => {
    await element(by.id('policyToggle')).click();
    await element(by.id('ricConfigLink')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/ric-config");
  });

  it("should reach information coordinator page when clicking in the side bar", async () => {
    await element(by.id('eicLink')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/ei-coordinator");
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      })
    );
  });
});

describe("Policy types page", () => {

  beforeEach(() => {
    browser.get("http://localhost:4200/policy");
  });

  it("should reach back to home from policy types page when clicking in the side bar", async () => {
    await element(by.id('Menu_Burger_Icon')).click();
    await element(by.id('homeLink')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/");
  });

  it("should show types when clicking on expand button in policy types page", async () => {
    await element(by.id('visible')).click();
    expect(element(by.id('createButton'))).toBeTruthy();
  });

  it("should display a pop-up window when clicking on the create button for a policy instance", async () => {
    await element(by.id('visible')).click();
    await element(by.id('createButton')).click();
    expect(element(by.id('closeButton'))).toBeTruthy();
  });

  it("should open a pop-up window when clicking on the data of a policy instance", async () => {
    await element(by.id('visible')).click();
    let instanceTable = element(by.id('policiesTable'));
    await element(by.css('mat-cell')).click();
    expect(element(by.id('closeButton'))).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      })
    );
  });
});

describe("Information coordinator page", () => {

  beforeEach(() => {
    browser.get("http://localhost:4200/ei-coordinator");
  });

  it("should reach back to home from information coordinator page when clicking in the side bar", async () => {
    await element(by.id('Menu_Burger_Icon')).click();
    await element(by.id('homeLink')).click();
    expect(browser.getCurrentUrl()).toEqual("http://localhost:4200/");
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      })
    );
  });
});

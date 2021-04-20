// -
//   ========================LICENSE_START=================================
//   O-RAN-SC
//   %%
//   Copyright (C) 2021: Nordix Foundation
//   %%
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//   ========================LICENSE_END===================================
//

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatIconModule } from "@angular/material/icon";
import { BrowserModule, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { TypedPolicyEditorComponent } from "./typed-policy-editor.component";

describe("TypedPolicyEditorComponent", () => {
  let hostComponent: TestTypedPolicyEditorComponentHostComponent;
  let componentUnderTest: TypedPolicyEditorComponent;
  let hostFixture: ComponentFixture<TestTypedPolicyEditorComponentHostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, BrowserAnimationsModule, MatIconModule],
      declarations: [
        TypedPolicyEditorComponent,
        TestTypedPolicyEditorComponentHostComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(
      TestTypedPolicyEditorComponentHostComponent
    );
    hostComponent = hostFixture.componentInstance;
    componentUnderTest = hostFixture.debugElement.query(
      By.directive(TypedPolicyEditorComponent)
    ).componentInstance;
    hostFixture.detectChanges();
  });

  it("should create", () => {
    expect(hostComponent).toBeTruthy();
  });

  it("should have JSON form visible and JSON and JSON Schema not visible", () => {
    let propertiesHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#propertiesHeading"
    );
    expect(propertiesHeading).toBeTruthy();
    expect(propertiesHeading.innerText).toContain("Properties");

    let propertiesIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#propertiesIcon"
    );
    expect(propertiesIcon).toBeTruthy();
    expect(propertiesIcon.innerText).toEqual("expand_less");

    let jsonForm = hostFixture.debugElement.nativeElement.querySelector(
      "json-schema-form"
    );
    expect(jsonForm).toBeTruthy();

    let jsonHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonHeading"
    );
    expect(jsonHeading).toBeTruthy();
    expect(jsonHeading.innerText).toContain("JSON");

    let jsonIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonIcon"
    );
    expect(jsonIcon).toBeTruthy();
    expect(jsonIcon.innerText).toEqual("expand_more");

    let jsonDiv = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonDiv"
    );
    expect(jsonDiv).toBeFalsy();

    let schemaHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaHeading"
    );
    expect(schemaHeading).toBeTruthy();
    expect(schemaHeading.innerText).toContain("JSON Schema");

    let schemaIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaIcon"
    );
    expect(schemaIcon).toBeTruthy();
    expect(schemaIcon.innerText).toEqual("expand_more");

    let schemaDiv = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaDiv"
    );
    expect(schemaDiv).toBeFalsy();
  });

  it("should hide JSON form", () => {
    let propertiesHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#propertiesHeading"
    );
    expect(propertiesHeading).toBeTruthy();
    propertiesHeading.click();
    hostFixture.detectChanges();

    let propertiesIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#propertiesIcon"
    );
    expect(propertiesIcon).toBeTruthy();
    expect(propertiesIcon.innerText).toEqual("expand_more");

    let propertiesDiv = hostFixture.debugElement.nativeElement.querySelector(
      "propertiesDiv"
    );
    expect(propertiesDiv).toBeFalsy();
  });

  it("should show JSON with text for dark mode and correct content", () => {
    let jsonHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonHeading"
    );
    expect(jsonHeading).toBeTruthy();
    jsonHeading.click();
    hostFixture.detectChanges();

    let jsonIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonIcon"
    );
    expect(jsonIcon).toBeTruthy();
    expect(jsonIcon.innerText).toEqual("expand_less");

    componentUnderTest.onChanges('{ "qosObjectives": "test" }');
    hostFixture.detectChanges();

    let jsonDiv = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonDiv"
    );
    expect(jsonDiv).toBeTruthy();
    let jsonText = jsonDiv.querySelector("pre");
    expect(jsonText.classList).toContain("text__dark");
    expect(jsonText.innerText).toEqual('"{ \\"qosObjectives\\": \\"test\\" }"');
  });

  it("should present error info in JSON div", () => {
    const errors = [
      {
        keyword: "required",
        dataPath: "/scope/qosObjectives",
        schemaPath: "#/properties/scope/qosObjectives/required",
        params: { missingProperty: "priorityLevel" },
        message: "should have required property 'priorityLevel'",
      },
    ];
    componentUnderTest.validationErrors(errors);
    hostFixture.detectChanges();
    componentUnderTest.prettyValidationErrors;
    hostFixture.detectChanges();

    // Show the JSON
    let jsonHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonHeading"
    );
    expect(jsonHeading).toBeTruthy();
    jsonHeading.click();
    hostFixture.detectChanges();

    let jsonDiv = hostFixture.debugElement.nativeElement.querySelector(
      "#jsonDiv"
    );
    expect(jsonDiv.innerText).toContain("Not valid — errors:");
    expect(jsonDiv.innerText).toContain(
      "scope.qosObjectives: should have required property 'priorityLevel'"
    );
  });

  it("should show JSON Schema with text for dark mode and correct content", () => {
    let schemaHeading = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaHeading"
    );
    expect(schemaHeading).toBeTruthy();
    schemaHeading.click();
    hostFixture.detectChanges();

    let schemaIcon = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaIcon"
    );
    expect(schemaIcon).toBeTruthy();
    expect(schemaIcon.innerText).toEqual("expand_less");

    componentUnderTest.schemaAsString;
    hostFixture.detectChanges();
    let schemaDiv = hostFixture.debugElement.nativeElement.querySelector(
      "#schemaDiv"
    );
    expect(schemaDiv).toBeTruthy();

    let jsonSchemaText = schemaDiv.querySelector("pre");
    expect(jsonSchemaText.classList).toContain("text__dark");
    expect(jsonSchemaText.innerText).toContain('qosObjectives: {');
  });

  it("should send a valid json", () => {
    let emittedValidJson: string;
    componentUnderTest.validJson.subscribe((json: string) => {
      emittedValidJson = json;
    });

    componentUnderTest.onChanges('{ "qosObjectives": "test" }');
    hostFixture.detectChanges();
    componentUnderTest.isValid(true);

    expect(emittedValidJson).toEqual('"{ \\"qosObjectives\\": \\"test\\" }"');
  });

  it("should send null when invalid json", () => {
    let emittedValidJson: string;
    componentUnderTest.validJson.subscribe((json: string) => {
      emittedValidJson = json;
    });

    componentUnderTest.isValid(false);

    expect(emittedValidJson).toBeFalsy();
  });

  @Component({
    selector: `typed-policy-editor-host-component`,
    template: `<nrcp-typed-policy-editor
      [jsonObject]="policyJson"
      [jsonSchemaObject]="jsonSchemaObject"
      [darkMode]="true"
    ></nrcp-typed-policy-editor>`,
  })
  class TestTypedPolicyEditorComponentHostComponent {
    policyJson: string = "{ jsonSchemaObject: 'test' }";
    jsonSchemaObject: string =
      "{type: 'object',properties: {qosObjectives: {additionalProperties: false,type: 'object',properties: {priorityLevel: {type: 'number'}},required: ['priorityLevel']}},required: ['qosObjectives']}";
  }
});

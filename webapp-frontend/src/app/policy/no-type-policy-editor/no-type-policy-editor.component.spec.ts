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

import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NoTypePolicyEditorComponent } from "./no-type-policy-editor.component";

describe("NoTypePolicyEditorComponent", () => {
  let component: TestNoTypePolicyEditorComponentHostComponent;
  let fixture: ComponentFixture<TestNoTypePolicyEditorComponentHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        NoTypePolicyEditorComponent,
        TestNoTypePolicyEditorComponentHostComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      TestNoTypePolicyEditorComponentHostComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should contain provided policy json and enabled Format button", async () => {
    const textArea: MatInputHarness = await loader.getHarness(
      MatInputHarness.with({ selector: "#policyJsonTextArea" })
    );
    expect(await textArea.getValue()).toEqual('{"A":"A"}');

    const formatButton: MatButtonHarness = await loader.getHarness(
      MatButtonHarness.with({ selector: "#formatButton" })
    );
    expect(await formatButton.isDisabled()).toBeFalsy();
  });

  it("Format button should be disabled when json not valid", async () => {
    const ele = component.noTypePolicyEditorComponent.instanceForm.get(
      "policyJsonTextArea"
    );
    ele.setValue("{");

    const formatButton: MatButtonHarness = await loader.getHarness(
      MatButtonHarness.with({ selector: "#formatButton" })
    );
    expect(await formatButton.isDisabled()).toBeTruthy();
  });

  it("should send valid json", async () => {
    const textAreaHarness: MatInputHarness = await loader.getHarness(
      MatInputHarness.with({ selector: "#policyJsonTextArea" })
    );
    expect(await textAreaHarness.getValue()).toEqual('{"A":"A"}');

    let validJson: string;
    component.noTypePolicyEditorComponent.validJson.subscribe(
      (json: string) => {
        validJson = json;
      }
    );

    const textArea = component.noTypePolicyEditorComponent.instanceForm.get(
      "policyJsonTextArea"
    );
    textArea.setValue('{"B":"B"}');
    expect(validJson).toEqual('{"B":"B"}');
  });

  it("should send null when invalid json", async () => {
    const textArea: MatInputHarness = await loader.getHarness(
      MatInputHarness.with({ selector: "#policyJsonTextArea" })
    );
    expect(await textArea.getValue()).toEqual('{"A":"A"}');

    let invalidJson: string;
    component.noTypePolicyEditorComponent.validJson.subscribe(
      (json: string) => {
        invalidJson = json;
      }
    );

    textArea.setValue("{");
    expect(invalidJson).toBeFalsy();
  });

  @Component({
    selector: `no-type-policy-editor-host-component`,
    template: `<nrcp-no-type-policy-editor
      [policyJson]="this.policyJson"
    ></nrcp-no-type-policy-editor>`,
  })
  class TestNoTypePolicyEditorComponentHostComponent {
    @ViewChild(NoTypePolicyEditorComponent)
    noTypePolicyEditorComponent: NoTypePolicyEditorComponent;
    policyJson: string = '{"A":"A"}';
  }
});

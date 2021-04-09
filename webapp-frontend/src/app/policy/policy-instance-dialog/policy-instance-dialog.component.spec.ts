/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
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

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ToastrModule } from "ngx-toastr";
import { MockComponent } from "ng-mocks";

import { PolicyService } from "@services/policy/policy.service";
import { UiService } from "@services/ui/ui.service";
import { PolicyInstanceDialogComponent } from "./policy-instance-dialog.component";
import { TypedPolicyEditorComponent } from "@policy/typed-policy-editor/typed-policy-editor.component";
import { RicSelectorComponent } from "@policy/ric-selector/ric-selector.component";
import { NoTypePolicyEditorComponent } from "@policy/no-type-policy-editor/no-type-policy-editor.component";
import { CreatePolicyInstance } from "@interfaces/policy.types";
import { NotificationService } from "@services/ui/notification.service";
import * as uuid from "uuid";
import { HttpErrorResponse } from "@angular/common/http";

describe("PolicyInstanceDialogComponent", () => {
  const untypedSchema = JSON.parse("{}");
  const typedSchema = JSON.parse(
    '{ "description": "Type 1 policy type", "title": "1", "type": "object", "properties": { "priorityLevel": "number" }}'
  );

  let component: PolicyInstanceDialogComponent;
  let fixture: ComponentFixture<PolicyInstanceDialogComponent>;
  let loader: HarnessLoader;
  let dialogRefSpy: MatDialogRef<PolicyInstanceDialogComponent>;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let notificationServiceSpy: NotificationService;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);
    policyServiceSpy = jasmine.createSpyObj("PolicyService", ["putPolicy"]);
    notificationServiceSpy = jasmine.createSpyObj("NotificationService", [
      "success",
    ]);

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        PolicyInstanceDialogComponent,
        MockComponent(RicSelectorComponent),
        MockComponent(NoTypePolicyEditorComponent),
        MockComponent(TypedPolicyEditorComponent),
      ],
      providers: [
        ChangeDetectorRef,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: true },
        UiService,
      ],
    });
  });

  it("should set correct dark mode from UIService", () => {
    const policyData = {
      createSchema: untypedSchema,
    };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
    ({ fixture, component, loader } = compileAndGetComponents(
      fixture,
      component,
      loader
    ));
    const uiService: UiService = TestBed.inject(UiService);
    expect(component.darkMode).toBeTruthy();

    uiService.darkModeState.next(false);
    fixture.detectChanges();
    expect(component.darkMode).toBeFalsy();
  });

  describe("creating policy without type", () => {
    beforeEach(async () => {
      const policyData = {
        createSchema: untypedSchema,
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(
        fixture,
        component,
        loader
      ));
      jasmine.addCustomEqualityTester(policyTester);
    });

    it("should contain oran logo and create title and no instance info", async () => {
      let ele = fixture.debugElement.nativeElement.querySelector("img");
      expect(ele.src).toContain("assets/oran-logo.png");

      ele = fixture.debugElement.nativeElement.querySelector("text");
      expect(ele.textContent).toEqual(
        "Create new policy instance of type < No Type >"
      );

      ele = fixture.debugElement.nativeElement.querySelector("#instanceInfo");
      expect(ele).toBeFalsy();
    });

    it("should contain ric select with no policy type and no ric selected", async () => {
      const ricSelector: RicSelectorComponent = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      ).componentInstance;
      expect(ricSelector).toBeTruthy();
      expect(ricSelector.policyTypeName).toBeFalsy();
      expect(component.policyInstance.ric_id).toBeFalsy();
    });

    it("should contain json editor with no JSON", async () => {
      const noTypePolicyEditor: NoTypePolicyEditorComponent = fixture.debugElement.query(
        By.directive(NoTypePolicyEditorComponent)
      ).componentInstance;
      expect(noTypePolicyEditor).toBeTruthy();
      expect(noTypePolicyEditor.policyJson).toBeFalsy();
    });

    it("should contain enabled Close button and Submit button", async () => {
      component.ngOnInit();

      let closeButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#closeButton" })
      );
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual("Close");

      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );
      expect(await submitButton.getText()).toEqual("Submit");
    });

    it("should enable Submit button when ric is selected and json is valid", async () => {
      const ricSelector: RicSelectorComponent = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      ).componentInstance;
      const noTypePolicyEditor: NoTypePolicyEditorComponent = fixture.debugElement.query(
        By.directive(NoTypePolicyEditorComponent)
      ).componentInstance;
      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );

      noTypePolicyEditor.validJson.emit(null);
      expect(await submitButton.isDisabled()).toBeTruthy();

      ricSelector.selectedRic.emit("ric1");
      expect(await submitButton.isDisabled()).toBeTruthy();

      noTypePolicyEditor.validJson.emit("{}");
      expect(await submitButton.isDisabled()).toBeFalsy();
    });

    it("should generate policy ID when submitting new policy and close dialog", async () => {
      const ricSelector: RicSelectorComponent = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      ).componentInstance;
      const noTypePolicyEditor: NoTypePolicyEditorComponent = fixture.debugElement.query(
        By.directive(NoTypePolicyEditorComponent)
      ).componentInstance;
      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );

      spyOn(uuid, "v4").and.returnValue("1234567890");
      ricSelector.selectedRic.emit("ric1");
      noTypePolicyEditor.validJson.emit("{}");

      policyServiceSpy.putPolicy.and.returnValue(of("Success"));

      await submitButton.click();

      const policyInstance = {} as CreatePolicyInstance;
      policyInstance.policy_data = JSON.parse("{}");
      policyInstance.policy_id = "1234567890";
      policyInstance.policytype_id = "";
      policyInstance.ric_id = "ric1";
      policyInstance.service_id = "controlpanel";
      expect(policyServiceSpy.putPolicy).toHaveBeenCalledWith(policyInstance);

      expect(dialogRefSpy.close).toHaveBeenCalledWith("ok");
    });

    it("should not close dialog when error from server", async () => {
      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );

      const errorResponse = {
        status: 400,
        statusText: "Bad Request",
      } as HttpErrorResponse;
      policyServiceSpy.putPolicy.and.returnValue(errorResponse);

      await submitButton.click();

      expect(policyServiceSpy.putPolicy).toHaveBeenCalled();

      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });

  describe("content when creating policy with type", () => {
    beforeEach(async () => {
      const policyData = {
        name: "Type 1",
        createSchema: typedSchema,
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(
        fixture,
        component,
        loader
      ));
    });

    it("should contain oran logo and create title and no instance info", async () => {
      let ele = fixture.debugElement.nativeElement.querySelector("img");
      expect(ele.src).toContain("assets/oran-logo.png");

      ele = fixture.debugElement.nativeElement.querySelector("text");
      expect(ele.textContent).toEqual(
        "Create new policy instance of type Type 1"
      );

      ele = fixture.debugElement.nativeElement.querySelector("#instanceInfo");
      expect(ele).toBeFalsy();
    });

    it("should contain ric select with provided policy type", async () => {
      const ricSelector: RicSelectorComponent = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      ).componentInstance;
      expect(ricSelector).toBeTruthy();
      expect(ricSelector.policyTypeName).toEqual("Type 1");
    });

    it("should contain typed json editor with empty JSON, schema and dark mode true", async () => {
      const typedPolicyEditor: TypedPolicyEditorComponent = fixture.debugElement.query(
        By.directive(TypedPolicyEditorComponent)
      ).componentInstance;
      expect(typedPolicyEditor).toBeTruthy();
      expect(typedPolicyEditor.jsonObject).toBeFalsy();
      expect(typedPolicyEditor.jsonSchemaObject).toEqual(typedSchema);
      expect(typedPolicyEditor.darkMode).toBeTruthy();
    });

    it("should contain enabled Close button and Submit button", async () => {
      component.ngOnInit();

      let closeButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#closeButton" })
      );
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual("Close");

      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );
      expect(await submitButton.getText()).toEqual("Submit");
    });

    it("should enable Submit button when ric is selected and json is valid", async () => {
      const ricSelector: RicSelectorComponent = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      ).componentInstance;
      const typedPolicyEditor: TypedPolicyEditorComponent = fixture.debugElement.query(
        By.directive(TypedPolicyEditorComponent)
      ).componentInstance;
      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );

      typedPolicyEditor.validJson.emit(null);
      expect(await submitButton.isDisabled()).toBeTruthy();

      ricSelector.selectedRic.emit("ric1");
      expect(await submitButton.isDisabled()).toBeTruthy();

      typedPolicyEditor.validJson.emit("{}");
      expect(await submitButton.isDisabled()).toBeFalsy();
    });
  });

  describe("content when editing policy without type", () => {
    const instanceJson = JSON.parse(
      '{"qosObjectives": {"priorityLevel": 3100}}'
    );
    beforeEach(async () => {
      const policyData = {
        createSchema: untypedSchema,
        instanceId: "instanceId",
        instanceJson: instanceJson,
        ric: "ric1",
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(
        fixture,
        component,
        loader
      ));
      jasmine.addCustomEqualityTester(policyTester);
    });

    it("should contain oran logo and instance info", async () => {
      let ele = fixture.debugElement.nativeElement.querySelector("img");
      expect(ele.src).toContain("assets/oran-logo.png");

      ele = fixture.debugElement.nativeElement.querySelector("text");
      expect(ele.childNodes[0].childNodes[0]).toBeFalsy(); // No create title

      ele = fixture.debugElement.nativeElement.querySelector("#instanceInfo");
      expect(ele).toBeTruthy();
      expect(ele.innerText).toEqual("[ric1] Instance ID: instanceId");
    });

    it("should not contain ric select", async () => {
      const ricSelector = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      );
      expect(ricSelector).toBeFalsy();
    });

    it("should contain json editor with json data", async () => {
      const noTypePolicyEditor: NoTypePolicyEditorComponent = fixture.debugElement.query(
        By.directive(NoTypePolicyEditorComponent)
      ).componentInstance;
      expect(noTypePolicyEditor).toBeTruthy();
      expect(noTypePolicyEditor.policyJson).toEqual(instanceJson);
    });

    it("should contain enabled Close and Submit buttons when all inputs are valid", async () => {
      let closeButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#closeButton" })
      );
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual("Close");

      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );
      expect(await submitButton.isDisabled()).toBeFalsy();
      expect(await submitButton.getText()).toEqual("Submit");
    });

    it("should submit policy with correct data, close dialog and notify user about success", async () => {
      policyServiceSpy.putPolicy.and.returnValue(of("ok"));
      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );

      await submitButton.click();

      const policyInstance = {} as CreatePolicyInstance;
      policyInstance.policy_data = instanceJson;
      policyInstance.policy_id = "instanceId";
      policyInstance.policytype_id = "";
      policyInstance.ric_id = "ric1";
      policyInstance.service_id = "controlpanel";
      expect(policyServiceSpy.putPolicy).toHaveBeenCalledWith(policyInstance);

      expect(dialogRefSpy.close).toHaveBeenCalled();
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(
        "Policy instanceId submitted"
      );
    });
  });

  describe("content when editing policy with type", () => {
    const instanceJson = '{"qosObjectives": {"priorityLevel": 3100}}';
    beforeEach(async () => {
      const policyData = {
        createSchema: typedSchema,
        instanceId: "instanceId",
        instanceJson: instanceJson,
        name: "name",
        ric: "ric1",
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(
        fixture,
        component,
        loader
      ));
    });

    it("should contain oran logo and instance info", async () => {
      let ele = fixture.debugElement.nativeElement.querySelector("img");
      expect(ele.src).toContain("assets/oran-logo.png");

      ele = fixture.debugElement.nativeElement.querySelector("text");
      expect(ele.childNodes[0].childNodes[0]).toBeFalsy(); // No create title

      ele = fixture.debugElement.nativeElement.querySelector("#instanceInfo");
      expect(ele).toBeTruthy();
      expect(ele.innerText).toEqual("[ric1] Instance ID: instanceId");
    });

    it("should not contain ric select", async () => {
      const ricSelector = fixture.debugElement.query(
        By.directive(RicSelectorComponent)
      );
      expect(ricSelector).toBeFalsy();
    });

    it("should contain typed json editor with instance JSON, schema and dark mode true", async () => {
      const typedPolicyEditor: TypedPolicyEditorComponent = fixture.debugElement.query(
        By.directive(TypedPolicyEditorComponent)
      ).componentInstance;
      expect(typedPolicyEditor).toBeTruthy();
      expect(unescapeQuotes(typedPolicyEditor.jsonObject)).toEqual(
        instanceJson
      );
      expect(typedPolicyEditor.jsonSchemaObject).toEqual(typedSchema);
      expect(typedPolicyEditor.darkMode).toBeTruthy();
    });

    it("should contain enabled Close and Submit buttons when all inputs are valid", async () => {
      let closeButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#closeButton" })
      );
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual("Close");

      let submitButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#submitButton" })
      );
      expect(await submitButton.isDisabled()).toBeFalsy();
      expect(await submitButton.getText()).toEqual("Submit");
    });
  });
});

function compileAndGetComponents(
  fixture: ComponentFixture<PolicyInstanceDialogComponent>,
  component: PolicyInstanceDialogComponent,
  loader: HarnessLoader
) {
  TestBed.compileComponents();

  fixture = TestBed.createComponent(PolicyInstanceDialogComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
  loader = TestbedHarnessEnvironment.loader(fixture);
  return { fixture, component, loader };
}

function unescapeQuotes(string: string): string {
  return string.replace(/\\"/g, '"');
}

function policyTester(first, second) {
  if (typeof first[0] === "object" && typeof second[0] === "object") {
    const policy1 = first[0] as CreatePolicyInstance;
    const policy2 = second[0] as CreatePolicyInstance;
    return (
      typeof policy1.policy_data === "object" &&
      typeof policy2.policy_data === "object" &&
      JSON.stringify(policy1.policy_data) ===
        JSON.stringify(policy2.policy_data) &&
      policy1.policy_id === policy2.policy_id &&
      policy1.policytype_id === policy2.policytype_id &&
      policy1.ric_id === policy2.ric_id &&
      policy1.service_id === policy2.service_id
    );
  }
}

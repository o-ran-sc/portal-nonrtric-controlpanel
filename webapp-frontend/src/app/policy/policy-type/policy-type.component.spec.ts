/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
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

import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PolicyTypeComponent } from "./policy-type.component";
import { PolicyType, PolicyTypeSchema } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import { of } from "rxjs";
import { MockComponent } from "ng-mocks";
import { PolicyInstanceComponent } from "../policy-instance/policy-instance.component";
import { By } from "@angular/platform-browser";

describe("PolicyTypeComponent", () => {
  let component: PolicyTypeComponent;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let fixture: ComponentFixture<PolicyTypeComponent>;

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", ["getPolicyType"]);
    const policyTypeSchema = JSON.parse(
      '{"title": "1", "description": "Type 1 policy type"}'
    );
    const policyType = { policy_schema: policyTypeSchema } as PolicyType;
    policyServiceSpy.getPolicyType.and.returnValue(of(policyType));

    TestBed.configureTestingModule({
      declarations: [
        PolicyTypeComponent,
        MockComponent(PolicyInstanceComponent),
      ],
      providers: [{ provide: PolicyService, useValue: policyServiceSpy }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should not call service when no type, display correct type info and no PolicyInstanceComponent added", () => {
    expect(policyServiceSpy.getPolicyType).not.toHaveBeenCalled();

    expect(component.policyType).toEqual("< No Type >");
    expect(component.policyDescription).toEqual("Type with no schema");

    const ele = fixture.debugElement.nativeElement.querySelector("nrcp-policy-instance");
    expect(ele).toBeFalsy();
});

  it("should call service when type, display correct type info and no PolicyInstanceComponent added", () => {
    component.policyTypeId = "type1";
    component.loadTypeInfo();

    expect(policyServiceSpy.getPolicyType).toHaveBeenCalledWith("type1");

    expect(component.policyType).toEqual("type1");
    expect(component.policyDescription).toEqual("Type 1 policy type");

    const ele = fixture.debugElement.nativeElement.querySelector("nrcp-policy-instance");
    expect(ele).toBeFalsy();
  });

  it("should add PolicyInstanceComponent with correct data when toggle visible to visible", async () => {
    const ele = fixture.debugElement.nativeElement.querySelector("#visible");
    expect(ele.innerText).toEqual("expand_more");

    ele.click();
    fixture.detectChanges();

    expect(ele.innerText).toEqual("expand_less");

    const policyInstanceComp: PolicyInstanceComponent = fixture.debugElement.query(
      By.directive(PolicyInstanceComponent)
    ).componentInstance;
    expect(policyInstanceComp).toBeTruthy();
    const expectedPolicyType = {
      id: undefined,
      name: undefined,
      schemaObject: JSON.parse("{}")
    } as PolicyTypeSchema;
    expect(policyInstanceComp.policyTypeSchema).toEqual(expectedPolicyType);
    expect(policyInstanceComp.expanded).toBeTruthy();
  });
});

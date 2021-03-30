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
import { PolicyType } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import { of } from "rxjs";

describe("PolicyTypeComponent", () => {
  let component: PolicyTypeComponent;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let fixture: ComponentFixture<PolicyTypeComponent>;

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", ["getPolicyType"]);
    const policyTypeSchema = JSON.parse('{"schemaObject": {"description": "Type 1 policy type"}}');
    const policyType = { policy_schema: policyTypeSchema} as PolicyType;
    policyServiceSpy.getPolicyType.and.returnValue(of(policyType));

    TestBed.configureTestingModule({
      declarations: [PolicyTypeComponent],
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
});

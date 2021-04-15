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
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { of } from "rxjs";

import { PolicyControlComponent } from "./policy-control.component";
import { PolicyTypes } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import { MockComponent } from "ng-mocks";
import { PolicyTypeComponent } from "./policy-type/policy-type.component";
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe("PolicyControlComponent", () => {
  let component: PolicyControlComponent;
  let fixture: ComponentFixture<PolicyControlComponent>;
  let loader: HarnessLoader;

  beforeEach(async(() => {
    const policyServiceSpy = jasmine.createSpyObj("PolicyService", [
      "getPolicyTypes",
    ]);
    const policyTypes = { policytype_ids: ["type1", "type2"] } as PolicyTypes;
    policyServiceSpy.getPolicyTypes.and.returnValue(of(policyTypes));

    TestBed.configureTestingModule({
      imports: [MatIconModule, MatTableModule, BrowserAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        PolicyControlComponent,
        MockComponent(PolicyTypeComponent),
      ],
      providers: [{ provide: PolicyService, useValue: policyServiceSpy }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should contain two PolicyType components instantiated with the correct type", () => {
    const typeComponents: PolicyTypeComponent[] = fixture.debugElement
      .queryAll(By.directive(PolicyTypeComponent))
      .map((component) => component.componentInstance);

    expect(typeComponents.length).toEqual(2);
    expect(typeComponents[0].policyTypeId).toEqual("type1");
    expect(typeComponents[1].policyTypeId).toEqual("type2");
  });

  /*it("should reload when clicking on refresh button", async () => {
    let refreshButton: MatButtonHarness = await loader.getHarness(
      MatButtonHarness.with({ selector: "#refreshButton" })
    );

  })*/
});

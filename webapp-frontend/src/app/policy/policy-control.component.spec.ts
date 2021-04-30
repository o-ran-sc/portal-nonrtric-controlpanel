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
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from "@angular/core";
import { of } from "rxjs";

import { PolicyControlComponent } from "./policy-control.component";
import { PolicyTypes } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import { MockComponent } from "ng-mocks";
import { PolicyTypeComponent } from "./policy-type/policy-type.component";
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonModule } from '@angular/material/button';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe("PolicyControlComponent", () => {
  let hostComponent: PolicyControlComponent;
  let hostFixture: ComponentFixture<PolicyControlComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let el: DebugElement;

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", [
      "getPolicyTypes",
    ]);

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTableModule,
        BrowserAnimationsModule,
        MatButtonModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        PolicyControlComponent,
        MockComponent(PolicyTypeComponent),
      ],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy }
      ],
    });
  }));

  describe("normally functioning", () => {
    beforeEach(() => {
      const policyTypes = { policytype_ids: ["type1", "type2"] } as PolicyTypes;
      policyServiceSpy.getPolicyTypes.and.returnValue(of(policyTypes));

      compileAndGetComponents();
    });

    it("should create", () => {
      expect(hostComponent).toBeTruthy();
    });

    it("should contain two PolicyType components instantiated with the correct type", () => {
      const typeComponents: PolicyTypeComponent[] = hostFixture.debugElement
        .queryAll(By.directive(PolicyTypeComponent))
        .map((component) => component.componentInstance);

      expect(typeComponents.length).toEqual(2);
      expect(typeComponents[0].policyTypeId).toEqual("type1");
      expect(typeComponents[1].policyTypeId).toEqual("type2");
    });

    it("should call the refresh button when clicking on it", async () => {
      let refreshButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#refreshButton" })
      );
      spyOn(hostComponent, "refreshTables");
      await refreshButton.click();
      expect(hostComponent.refreshTables).toHaveBeenCalled();
    })

    it("should close instance tables when clicking on refresh button", async () => {
      let refreshButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#refreshButton" })
      );
      const policyTypeComponent: PolicyTypeComponent = hostFixture.debugElement.query(
        By.directive(PolicyTypeComponent)
      ).componentInstance;
      let booleanTrigger = policyTypeComponent.minimiseTrigger
      await refreshButton.click();
      expect(policyTypeComponent.minimiseTrigger).not.toEqual(booleanTrigger);
    })

    it("should render the types sorted when clicking on refresh button", async () => {
      const typeComponents: PolicyTypeComponent[] = hostFixture.debugElement
        .queryAll(By.directive(PolicyTypeComponent))
        .map((component) => component.componentInstance);

      for(var i= 0; i < typeComponents.length-1; i++){
        expect(typeComponents[i].policyTypeId<typeComponents[i+1].policyTypeId).toBeTruthy();
      }
    })
  })

  describe("no types", () => {
    beforeEach(() => {
      policyServiceSpy.getPolicyTypes.and.returnValue(
        of({
          policytype_ids: [],
        } as PolicyTypes)
      );

      compileAndGetComponents();
    });

    it("should display message of no types", async () => {
      expect(policyServiceSpy.getPolicyTypes.length).toEqual(0);
      const content = el.query(By.css('#noInstance')).nativeElement;
      expect(content.innerText).toBe("There are no policy types to display.");
    });
  });

  function compileAndGetComponents() {
    TestBed.compileComponents();
    console.log(TestBed);

    hostFixture = TestBed.createComponent(PolicyControlComponent);
    hostComponent = hostFixture.componentInstance;
    el = hostFixture.debugElement;
    hostFixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(hostFixture);
    return { hostFixture, hostComponent, loader };
  }
});

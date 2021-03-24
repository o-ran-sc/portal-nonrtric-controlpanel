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
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { OptionHarnessFilters } from "@angular/material/core/testing";
import { MatSelectModule } from "@angular/material/select";
import { MatSelectHarness } from "@angular/material/select/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs/observable/of";
import { Ric } from "@interfaces/ric";
import { PolicyService } from "@services/policy/policy.service";

import { RicSelectorComponent } from "./ric-selector.component";

describe("RicSelectorComponent", () => {
  let component: TestRicSelectorHostComponent;
  let fixture: ComponentFixture<TestRicSelectorHostComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  const ric1: Ric = {
    ric_id: "ric1",
    managed_element_ids: ["me1"],
    policytype_ids: ["type1"],
    state: "",
  };
  const ric2: Ric = {
    ric_id: "ric2",
    managed_element_ids: ["me1"],
    policytype_ids: ["type1"],
    state: "",
  };

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", ["getRics"]);
    const policyData = {
      createSchema: "{}",
      instanceId: null,
      instanceJson: '{"qosObjectives": {"priorityLevel": 3100}}',
      name: "name",
      ric: null,
    };

    policyServiceSpy.getRics.and.returnValue(of({ rics: [ric1, ric2] }));
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatSelectModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [RicSelectorComponent, TestRicSelectorHostComponent],
      providers: [{ provide: PolicyService, useValue: policyServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestRicSelectorHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("no ric selected", async () => {
    let ricSelector: MatSelectHarness = await loader.getHarness(
      MatSelectHarness.with({ selector: "#ricSelector" })
    );

    expect(await ricSelector.isEmpty()).toBeTruthy();
  });

  it("options should contain rics for policy type", async () => {
    let ricSelector: MatSelectHarness = await loader.getHarness(
      MatSelectHarness.with({ selector: "#ricSelector" })
    );

    expect(policyServiceSpy.getRics).toHaveBeenCalledWith("policyTypeName");
    await ricSelector.open();
    const count = (await ricSelector.getOptions()).length;
    expect(count).toEqual(2);
  });

  it("should send selected ric", async () => {
    let selectedRic: string;
    component.ricSelectorComponent.selectedRic.subscribe((ric: string) => {
      selectedRic = ric;
    });

    let ricSelector: MatSelectHarness = await loader.getHarness(
      MatSelectHarness.with({ selector: "#ricSelector" })
    );
    await ricSelector.clickOptions({ text: "ric1" });

    expect(selectedRic).toEqual("ric1");
  });

  @Component({
    selector: `ric-selector-host-component`,
    template: `<nrcp-ric-selector
      [policyTypeName]="policyTypeName"
    ></nrcp-ric-selector>`,
  })
  class TestRicSelectorHostComponent {
    @ViewChild(RicSelectorComponent)
    ricSelectorComponent: RicSelectorComponent;
    policyTypeName: string = "policyTypeName";
  }
});

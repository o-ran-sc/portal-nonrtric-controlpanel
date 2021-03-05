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
//  /
//

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from "rxjs/observable/of";
import { Ric } from 'src/app/interfaces/ric';
import { PolicyService } from 'src/app/services/policy/policy.service';

import { RicSelectorComponent } from './ric-selector.component';


describe('RicSelectorComponent', () => {
  let formGroup: FormGroup = new FormGroup({});
  let component: TestRicSelectorHostComponent;
  let fixture: ComponentFixture<TestRicSelectorHostComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  const ric1: Ric = { ric_id: 'ric1', managed_element_ids: ['me1'], policytype_ids: ['type1'], state: '' };
  const ric2: Ric = { ric_id: 'ric2', managed_element_ids: ['me1'], policytype_ids: ['type1'], state: '' };

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getRics']);
    const policyData = {
      createSchema: "{}",
      instanceId: null,
      instanceJson: '{"qosObjectives": {"priorityLevel": 3100}}',
      name: "name",
      ric: null
    };

    policyServiceSpy.getRics.and.returnValue(of({ rics: [ric1, ric2] }));
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatSelectModule,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        RicSelectorComponent,
        TestRicSelectorHostComponent
      ],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        FormBuilder
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestRicSelectorHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be added to form group with required validator', async () => {
    let ricSelector: MatSelectHarness = await loader.getHarness(MatSelectHarness.with({ selector: '#ricSelector' }));

    expect(formGroup.get('ricSelector')).toBeTruthy();
    expect(await ricSelector.isRequired()).toBeTruthy();
  });

  it('no ric selected', async () => {
    let ricSelector: MatSelectHarness = await loader.getHarness(MatSelectHarness.with({ selector: '#ricSelector' }));

    expect(await ricSelector.isEmpty()).toBeTruthy();
  });

  it('options should contain rics for policy type', async () => {
    let ricSelector: MatSelectHarness = await loader.getHarness(MatSelectHarness.with({ selector: '#ricSelector' }));

    expect(policyServiceSpy.getRics).toHaveBeenCalledWith('policyTypeName');
    await ricSelector.open();
    const count = (await ricSelector.getOptions()).length;
    expect(count).toEqual(2);
  });

  @Component({
    selector: `ric-selector-host-component`,
    template: `<nrcp-ric-selector [instanceForm]="instanceForm" [policyTypeName]="policyTypeName"></nrcp-ric-selector>`
  })
  class TestRicSelectorHostComponent {
    @ViewChild(RicSelectorComponent)
    private ricSelectorComponent: RicSelectorComponent;
    instanceForm: FormGroup = formGroup;
    policyTypeName: string = 'policyTypeName';
  }
});

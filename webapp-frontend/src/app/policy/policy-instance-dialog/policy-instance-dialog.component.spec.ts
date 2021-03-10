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
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from "@angular/forms";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ToastrModule } from "ngx-toastr";

import { PolicyService } from "../../services/policy/policy.service";
import { ErrorDialogService } from "../../services/ui/error-dialog.service";
import { UiService } from "../../services/ui/ui.service";
import { PolicyInstanceDialogComponent } from "./policy-instance-dialog.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe('PolicyInstanceDialogComponent', () => {
  let component: PolicyInstanceDialogComponent;
  let fixture: ComponentFixture<PolicyInstanceDialogComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let errDialogServiceSpy: jasmine.SpyObj<ErrorDialogService>;

  beforeEach(async () => {
    policyServiceSpy = jasmine.createSpyObj('PolicyService', ['putPolicy']);
    errDialogServiceSpy = jasmine.createSpyObj('ErrorDialogService', ['displayError']);

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        PolicyInstanceDialogComponent
      ],
      providers: [
        { provide: MatDialogRef, useValue: component },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ErrorDialogService, useValue: errDialogServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: true },
        UiService
      ]
    });
  });

  describe('content when creating policy without type', () => {
    beforeEach(async () => {
      const policyData = {
        createSchema: '{}'
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(fixture, component, loader));
    });

    it('should contain oran logo and create title and no instance info', async () => {
      let ele = fixture.debugElement.nativeElement.querySelector('img');
      expect(ele.src).toContain('assets/oran-logo.png');

      ele = fixture.debugElement.nativeElement.querySelector('text');
      expect(ele.textContent).toEqual('Create new policy instance of type < No Type >');

      ele = fixture.debugElement.nativeElement.querySelector('#instanceInfo');
      expect(ele).toBeFalsy();
    });

    it('should contain ric select', async () => {
      const ele = fixture.debugElement.nativeElement.querySelector('nrcp-ric-selector');
      expect(ele).toBeTruthy();
    });

    it('should contain json editor', async () => {
      const ele = fixture.debugElement.nativeElement.querySelector('nrcp-no-type-policy-editor');
      expect(ele).toBeTruthy();
    });

    it('should contain enabled Close button and disabled Submit button', async () => {
      component.ngOnInit();

      let closeButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#closeButton' }));
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual('Close');

      let submitButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#submitButton' }));
      // expect(await submitButton.isDisabled()).toBeTruthy();
      expect(await submitButton.getText()).toEqual('Submit');
    });
  });

  describe('content when editing policy without type', () => {
    beforeEach(async () => {
      const policyData = {
        createSchema: '{}',
        instanceId: 'instanceId',
        instanceJson: '{"qosObjectives": {"priorityLevel": 3100}}',
        name: 'name',
        ric: 'ric1'
      };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: policyData }); // Should be provided with a policy
      ({ fixture, component, loader } = compileAndGetComponents(fixture, component, loader));
    });

    it('should contain oran logo and instance info', async () => {
      let ele = fixture.debugElement.nativeElement.querySelector('img');
      expect(ele.src).toContain('assets/oran-logo.png');

      ele = fixture.debugElement.nativeElement.querySelector('text');
      expect(ele.childNodes[0].childNodes[0]).toBeFalsy(); // No create title

      ele = fixture.debugElement.nativeElement.querySelector('#instanceInfo');
      expect(ele).toBeTruthy();
      expect(ele.innerText).toEqual('[ric1] Instance ID: instanceId');
    });

    it('should not contain ric select', async () => {
      const ele = fixture.debugElement.nativeElement.querySelector('nrcp-ric-selector');
      expect(ele).toBeFalsy();
    });

    it('should contain json editor', async () => {
      const ele = fixture.debugElement.nativeElement.querySelector('nrcp-no-type-policy-editor');
      expect(ele).toBeTruthy();
    });

    it('should contain enabled Close and Submit buttons', async () => {
      let closeButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#closeButton' }));
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual('Close');

      let submitButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#submitButton' }));
      expect(await submitButton.isDisabled()).toBeFalsy();
      expect(await submitButton.getText()).toEqual('Submit');
    });

  });
});

function compileAndGetComponents(fixture: ComponentFixture<PolicyInstanceDialogComponent>, component: PolicyInstanceDialogComponent, loader: HarnessLoader) {
  TestBed.compileComponents();

  fixture = TestBed.createComponent(PolicyInstanceDialogComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
  loader = TestbedHarnessEnvironment.loader(fixture);
  return { fixture, component, loader };
}

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
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { of } from "rxjs/observable/of";
import { ReactiveFormsModule } from "@angular/forms";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ToastrModule } from "ngx-toastr";

import { PolicyService } from "../../services/policy/policy.service";
import { ErrorDialogService } from "../../services/ui/error-dialog.service";
import { UiService } from "../../services/ui/ui.service";
import { NoTypePolicyInstanceDialogComponent } from "./no-type-policy-instance-dialog.component";
import { Ric } from "../../interfaces/ric";

describe('NoTypePolicyInstanceDialogComponent', () => {
  let component: NoTypePolicyInstanceDialogComponent;
  let fixture: ComponentFixture<NoTypePolicyInstanceDialogComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let errDialogServiceSpy: jasmine.SpyObj<ErrorDialogService>;
  const ric1: Ric = { ric_id: 'ric1', managed_element_ids: [ 'me1' ], policytype_ids: [ 'type1' ], state: ''};
  const ric2: Ric = { ric_id: 'ric2', managed_element_ids: [ 'me1' ], policytype_ids: [ 'type1' ], state: ''};

  beforeEach(async () => {
    policyServiceSpy = jasmine.createSpyObj('PolicyService', [ 'putPolicy', 'getRics' ]);
    errDialogServiceSpy = jasmine.createSpyObj('ErrorDialogService', [ 'displayError' ]);

    policyServiceSpy.getRics.and.returnValue(of({ rics: [ ric1, ric2 ] }));

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
      declarations: [
        NoTypePolicyInstanceDialogComponent
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

  describe('content when creating policy', () => {
    beforeEach(async () => {
      ({ fixture, component, loader } = compileAndGetComponents(fixture, component, loader));
    });

    it('should contain oran logo and create title and no instance info', async () => {
      let ele = fixture.debugElement.nativeElement.querySelector('img');
      expect(ele.src).toContain('assets/oran-logo.png');

      ele = fixture.debugElement.nativeElement.querySelector('text');
      expect(ele.childNodes[0].childNodes[0].textContent).toEqual('Create new policy instance of < No type >');

      ele = fixture.debugElement.nativeElement.querySelector('#instanceInfo');
      expect(ele).toBeFalsy();
    });

    it('should contain enabled Target selection with no ric selected and json should be empty', async () => {
      let ricSelector: MatSelectHarness = await loader.getHarness(MatSelectHarness.with({selector: '#ricSelector'}));

      expect(await ricSelector.isEmpty()).toBeTruthy();
      expect(await ricSelector.isDisabled()).toBeFalsy();
      await ricSelector.open();
      const count = (await ricSelector.getOptions()).length;
      expect(count).toEqual(2);

      let jsonTextArea: MatInputHarness = await loader.getHarness(MatInputHarness.with({selector: '#policyJsonTextArea'}));
      expect(await jsonTextArea.isDisabled()).toBeFalsy();
      const actualJson: string = await jsonTextArea.getValue();
      expect(actualJson).toEqual('');
    });

    it('should contain disabled Format and Submit buttons and enabled Close button', async () => {
      component.ngOnInit();

      let formatButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#formatButton'}));
      expect(await formatButton.isDisabled()).toBeTruthy();
      expect(await formatButton.getText()).toEqual('Format JSON');

      let closeButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#closeButton'}));
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual('Close');

      let submitButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#submitButton'}));
      expect(await submitButton.isDisabled()).toBeTruthy();
      expect(await submitButton.getText()).toEqual('Submit');
    });
  });

  describe('content when editing policy', () => {
    beforeEach(async () => {
      const policyData = {
        createSchema: "{}",
        instanceId: "instanceId",
        instanceJson: '{"qosObjectives": {"priorityLevel": 3100}}',
        name: "name",
        ric: "ric1"
    };
      TestBed.overrideProvider(MAT_DIALOG_DATA, {useValue: policyData }); // Should be provided with a policy
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

    it('should contain json and no Target selection', async () => {
        let ele = fixture.debugElement.nativeElement.querySelector('#ricSelector');
        expect(ele).toBeFalsy();

        let jsonTextArea: MatInputHarness = await loader.getHarness(MatInputHarness.with({selector: '#policyJsonTextArea'}));
        expect(await jsonTextArea.isDisabled()).toBeFalsy();
        const actualJson: string = await jsonTextArea.getValue();
        expect(actualJson).toContain('qosObjectives');
    });

    it('should contain enabled Format, Submit and Close buttons', async () => {
      let formatButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#formatButton'}));
      expect(await formatButton.isDisabled()).toBeFalsy();
      expect(await formatButton.getText()).toEqual('Format JSON');

      let closeButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#closeButton'}));
      expect(await closeButton.isDisabled()).toBeFalsy();
      expect(await closeButton.getText()).toEqual('Close');

      let submitButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({selector: '#submitButton'}));
      expect(await submitButton.isDisabled()).toBeFalsy();
      expect(await submitButton.getText()).toEqual('Submit');
    });

  });
});

function compileAndGetComponents(fixture: ComponentFixture<NoTypePolicyInstanceDialogComponent>, component: NoTypePolicyInstanceDialogComponent, loader: HarnessLoader) {
  TestBed.compileComponents();

  fixture = TestBed.createComponent(NoTypePolicyInstanceDialogComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
  loader = TestbedHarnessEnvironment.loader(fixture);
  return { fixture, component, loader };
}

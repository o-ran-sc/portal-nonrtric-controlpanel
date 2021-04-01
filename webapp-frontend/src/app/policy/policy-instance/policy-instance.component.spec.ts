/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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

import { Component, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import {
  PolicyInstance,
  PolicyInstances,
  PolicyStatus,
  PolicyTypeSchema,
} from "@app/interfaces/policy.types";
import { PolicyService } from "@app/services/policy/policy.service";
import { ConfirmDialogService } from "@app/services/ui/confirm-dialog.service";
import { ErrorDialogService } from "@app/services/ui/error-dialog.service";
import { NotificationService } from "@app/services/ui/notification.service";
import { UiService } from "@app/services/ui/ui.service";
import { ToastrModule } from "ngx-toastr";
import { of } from "rxjs";
import { PolicyInstanceComponent } from "./policy-instance.component";

describe("PolicyInstanceComponent", () => {
  let hostComponent: PolicyInstanceComponentHostComponent;
  let hostFixture: ComponentFixture<PolicyInstanceComponentHostComponent>;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  @Component({
    selector: "policy-instance-compnent-host-component",
    template:
      "<nrcp-policy-instance [policyTypeSchema]=policyType></nrcp-policy-instance>",
  })
  class PolicyInstanceComponentHostComponent {
    @ViewChild(PolicyInstanceComponent)
    componentUnderTest: PolicyInstanceComponent;
    policyTypeSchema = JSON.parse(
      '{"title": "1", "description": "Type 1 policy type"}'
    );
    policyType = {
      id: "type1",
      name: "1",
      schemaObject: this.policyTypeSchema,
    } as PolicyTypeSchema;
  }

  beforeEach(async(() => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", [
      "getPolicyInstancesByType",
      "getPolicyInstance",
      "getPolicyStatus",
    ]);
    let policyInstances = { policy_ids: ["policy1", "policy2"] } as PolicyInstances;
    policyServiceSpy.getPolicyInstancesByType.and.returnValue(
      of(policyInstances)
    );
    let policy1 = {
      policy_id: "policy1",
      policy_data: "{}",
      ric_id: "1",
      service_id: "service",
      lastModified: "Now",
    } as PolicyInstance;
    let policy2 = {
      policy_id: "policy2",
      policy_data: "{}",
      ric_id: "2",
      service_id: "service",
      lastModified: "Now",
    } as PolicyInstance;
    policyServiceSpy.getPolicyInstance.and.returnValues(
      of(policy1),
      of(policy2)
    );
    let policy1Status = { last_modified: "Just now" } as PolicyStatus;
    let policy2Status = { last_modified: "Before" } as PolicyStatus;
    policyServiceSpy.getPolicyStatus.and.returnValues(
      of(policy1Status),
      of(policy2Status)
    );

    dialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);

    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      declarations: [
        PolicyInstanceComponent,
        PolicyInstanceComponentHostComponent,
      ],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        ErrorDialogService,
        NotificationService,
        ConfirmDialogService,
        UiService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    hostFixture = TestBed.createComponent(PolicyInstanceComponentHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it("should create", () => {
    expect(hostComponent).toBeTruthy();
  });
});

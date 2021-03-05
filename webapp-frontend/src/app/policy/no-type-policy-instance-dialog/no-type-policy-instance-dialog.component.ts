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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PolicyService } from '../../services/policy/policy.service';
import { NotificationService } from '../../services/ui/notification.service';
import { UiService } from '../../services/ui/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDialogService } from '../../services/ui/error-dialog.service';
import * as uuid from 'uuid';
import { CreatePolicyInstance } from '../../interfaces/policy.types';
import { RicSelectorComponent } from '../ric-selector/ric-selector.component';
import { formatJsonString, NoTypePolicyEditorComponent } from '../no-type-policy-editor/no-type-policy-editor.component';

@Component({
  selector: 'nrcp-no-type-policy-instance-dialog',
  templateUrl: './no-type-policy-instance-dialog.component.html',
  styleUrls: ['./no-type-policy-instance-dialog.component.scss']
})
export class NoTypePolicyInstanceDialogComponent implements OnInit {
  instanceForm: FormGroup;
  @ViewChild(RicSelectorComponent)
  private ricSelectorComponent: RicSelectorComponent;
  @ViewChild(NoTypePolicyEditorComponent)
  private policyEditorComponent: NoTypePolicyEditorComponent;
  policyInstanceId: string; // null if not yet created
  policyJson: string;
  darkMode: boolean;
  ric: string;
  allRicIds: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<NoTypePolicyInstanceDialogComponent>,
    private policySvc: PolicyService,
    private errorService: ErrorDialogService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data,
    private ui: UiService) {
    this.policyInstanceId = data.instanceId;
    this.policyJson = data.instanceJson ? formatJsonString(data.instanceJson) : '{}';
    this.ric = data.ric;
  }

  ngOnInit() {
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
    this.instanceForm = new FormGroup({});
  }

  onSubmit() {
    if (this.policyInstanceId == null) {
      this.policyInstanceId = uuid.v4();
    }
    const self: NoTypePolicyInstanceDialogComponent = this;
    let createPolicyInstance: CreatePolicyInstance = this.createPolicyInstance(this.policyEditorComponent.policyJsonTextArea.value);
    this.policySvc.putPolicy(createPolicyInstance).subscribe(
      {
        next(_) {
          self.notificationService.success('Policy without type:' + self.policyInstanceId + ' submitted');
          self.dialogRef.close();
        },
        error(error: HttpErrorResponse) {
          self.errorService.displayError('Submit failed: ' + error.error);
        },
        complete() { }
      });
  }

  private createPolicyInstance(policyJson: string): CreatePolicyInstance {
    let createPolicyInstance = {} as CreatePolicyInstance;
    createPolicyInstance.policy_data = JSON.parse(policyJson);
    createPolicyInstance.policy_id = this.policyInstanceId;
    createPolicyInstance.policytype_id = '';
    createPolicyInstance.ric_id = this.ricSelectorComponent ? this.ricSelectorComponent.selectedRic : this.ric;
    createPolicyInstance.service_id = 'controlpanel';
    return createPolicyInstance;
  }
}

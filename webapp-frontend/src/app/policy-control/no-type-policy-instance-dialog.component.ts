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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PolicyService } from '../services/policy/policy.service';
import { NotificationService } from '../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDialogService } from '../services/ui/error-dialog.service';
import * as uuid from 'uuid';
import { Rics } from '../interfaces/ric';
import { CreatePolicyInstance } from '../interfaces/policy.types';

@Component({
  selector: 'nrcp-no-type-policy-instance-dialog',
  templateUrl: './no-type-policy-instance-dialog.component.html',
  styleUrls: ['./no-type-policy-instance-dialog.component.scss']
})
export class NoTypePolicyInstanceDialogComponent implements OnInit {
  instanceForm: FormGroup;

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
    this.policyJson = data.instanceJson ? this.formatJsonString(data.instanceJson) : '';
    this.ric = data.ric;
  }

  ngOnInit() {
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
    this.instanceForm = new FormGroup({
      'ricSelector': new FormControl(this.ric, [
        Validators.required
      ]),
      'policyJsonTextArea': new FormControl(this.policyJson, [
        Validators.required,
        jsonValidator()
      ])
    });
    if (!this.policyInstanceId) {
      this.getRicIds();
    }
  }

  get policyJsonTextArea() { return this.instanceForm.get('policyJsonTextArea'); }

  get ricSelector() { return this.instanceForm.get('ricSelector'); }

  onSubmit() {
    if (this.policyInstanceId == null) {
      this.policyInstanceId = uuid.v4();
    }
    const self: NoTypePolicyInstanceDialogComponent = this;
    let createPolicyInstance: CreatePolicyInstance = this.createPolicyInstance(this.policyJsonTextArea.value);
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
    createPolicyInstance.ric_id = (!this.ricSelector.value.ric_id) ? this.ric : this.ricSelector.value.ric_id;
    createPolicyInstance.service_id = 'controlpanel';
    return createPolicyInstance;
  }

  getRicIds() {
    const self: NoTypePolicyInstanceDialogComponent = this;
    this.policySvc.getRics('').subscribe(
      {
        next(value: Rics) {
          value.rics.forEach(ric => {
            self.allRicIds.push(ric.ric_id);
          });
        }
      });
  }

  private formatJsonString(jsonToFormat: any): string {
    return JSON.stringify(jsonToFormat, null, 2);
  }

  formatJsonInput() {
    this.policyJson = this.formatJsonString(JSON.parse(this.policyJsonTextArea.value));
  }
}

export function jsonValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const notValid = !isJsonValid(control.value);
    return notValid ? { 'invalidJson': { value: control.value } } : null;
  };
}

export function isJsonValid(json: string): boolean {
  try {
    if (json != null) {
      JSON.parse(json);
      return true;
    } else {
      return false;
    }
  } catch (jsonError) {
    return false;
  }
}

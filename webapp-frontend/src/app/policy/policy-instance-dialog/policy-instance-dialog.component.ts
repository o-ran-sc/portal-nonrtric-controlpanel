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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { PolicyService } from "../../services/policy/policy.service";
import { NotificationService } from "../../services/ui/notification.service";
import { UiService } from "../../services/ui/ui.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorDialogService } from "../../services/ui/error-dialog.service";
import * as uuid from "uuid";
import {
  CreatePolicyInstance,
  PolicyInstance,
  PolicyTypeSchema,
} from "../../interfaces/policy.types";

@Component({
  selector: "nrcp-policy-instance-dialog",
  templateUrl: "./policy-instance-dialog.component.html",
  styleUrls: ["./policy-instance-dialog.component.scss"],
})
export class PolicyInstanceDialogComponent implements OnInit, AfterViewInit {
  policyInstance = {} as CreatePolicyInstance;
  policyJson: string;
  jsonSchemaObject: any;
  darkMode: boolean;
  allRicIds: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PolicyInstanceDialogComponent>,
    private policySvc: PolicyService,
    private errorService: ErrorDialogService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data,
    private ui: UiService
  ) {
    this.policyInstance.policy_id = data.instanceId;
    this.policyInstance.policytype_id = data.name;
    this.policyInstance.policy_data = data.instanceJson;
    this.policyJson = data.instanceJson;
    this.jsonSchemaObject = data.createSchema;
    this.policyInstance.ric_id = data.ric;
    this.policyInstance.service_id = "controlpanel";
  }

  ngOnInit() {
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  // Do not remove! Needed to avoid "Expression has changed after it was checked" warning
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onSelectedRicChanged(newRic: string): void {
    this.policyInstance.ric_id = newRic;
  }

  onJsonChanged(newJson: string): void {
    this.policyInstance.policy_data = newJson;
  }

  onSubmit() {
    if (this.policyInstance.policy_id == null) {
      this.policyInstance.policy_id = uuid.v4();
    }
    const self: PolicyInstanceDialogComponent = this;
    this.policySvc.putPolicy(this.policyInstance).subscribe({
      next(_) {
        self.notificationService.success(
          "Policy " + self.policyInstance.policy_id + " submitted"
        );
        self.dialogRef.close();
      },
      error(error: HttpErrorResponse) {
        self.errorService.displayError("Submit failed: " + error.error);
      },
      complete() {},
    });
  }

  typeHasSchema(): boolean {
    return this.jsonSchemaObject !== "{}";
  }

  isFormValid(): boolean {
    return (
      this.policyInstance.ric_id !== null &&
      this.policyInstance.policy_data !== null
    );
  }
}

export function getPolicyDialogProperties(
  policyTypeSchema: PolicyTypeSchema,
  instance: PolicyInstance,
  darkMode: boolean
): MatDialogConfig {
  const createSchema = policyTypeSchema.schemaObject;
  const instanceId = instance ? instance.policy_id : null;
  const instanceJson = instance ? instance.policy_data : null;
  const name = policyTypeSchema.name;
  const ric = instance ? instance.ric_id : null;
  return {
    maxWidth: "1200px",
    maxHeight: "900px",
    width: "900px",
    role: "dialog",
    disableClose: false,
    panelClass: darkMode ? "dark-theme" : "",
    data: {
      createSchema,
      instanceId,
      instanceJson,
      name,
      ric,
    },
  };
}

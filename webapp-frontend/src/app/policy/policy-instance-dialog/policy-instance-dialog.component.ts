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
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
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
import { RicSelectorComponent } from "../ric-selector/ric-selector.component";
import {
  formatJsonString,
  NoTypePolicyEditorComponent,
} from "../no-type-policy-editor/no-type-policy-editor.component";
import { TypedPolicyEditorComponent } from "../typed-policy-editor/typed-policy-editor.component";

@Component({
  selector: "nrcp-policy-instance-dialog",
  templateUrl: "./policy-instance-dialog.component.html",
  styleUrls: ["./policy-instance-dialog.component.scss"],
})
export class PolicyInstanceDialogComponent implements OnInit, AfterViewInit {
  instanceForm: FormGroup;
  @ViewChild(RicSelectorComponent)
  ricSelector: RicSelectorComponent;
  @ViewChild(NoTypePolicyEditorComponent)
  noTypePolicyEditor: NoTypePolicyEditorComponent;
  @ViewChild(TypedPolicyEditorComponent)
  typedPolicyEditor: TypedPolicyEditorComponent;
  policyInstanceId: string; // null if not yet created
  policyJson: string;
  policyTypeName: string;
  jsonSchemaObject: any;
  darkMode: boolean;
  ric: string;
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
    this.policyInstanceId = data.instanceId;
    this.policyTypeName = data.name ? data.name : "< No Type >";
    this.policyJson = data.instanceJson;
    this.jsonSchemaObject = data.createSchema;
    this.ric = data.ric;
  }

  ngOnInit() {
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
    this.instanceForm = new FormGroup({});
    this.formatNoTypePolicyJson();
  }

  // Do not remove! Needed to avoid "Expression has changed after it was checked" warning
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  private formatNoTypePolicyJson() {
    if (!this.typeHasSchema()) {
      if (this.policyJson) {
        this.policyJson = formatJsonString(this.policyJson);
      } else {
        this.policyJson = "{}";
      }
    }
  }

  onSubmit() {
    if (this.policyInstanceId == null) {
      this.policyInstanceId = uuid.v4();
    }
    const self: PolicyInstanceDialogComponent = this;
    let policyData: string;
    if (this.typeHasSchema()) {
      policyData = this.typedPolicyEditor.prettyLiveFormData;
    } else {
      policyData = this.noTypePolicyEditor.policyJsonTextArea.value;
    }
    let createPolicyInstance: CreatePolicyInstance = this.createPolicyInstance(
      policyData
    );
    this.policySvc.putPolicy(createPolicyInstance).subscribe({
      next(_) {
        self.notificationService.success(
          "Policy without type:" + self.policyInstanceId + " submitted"
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
    return this.jsonSchemaObject.schemaObject !== "{}";
  }

  isFormValid(): boolean {
    let isValid: boolean = this.instanceForm.valid;
    if (this.typeHasSchema()) {
      isValid =
        isValid && this.typedPolicyEditor
          ? this.typedPolicyEditor.formIsValid
          : false;
    }
    return isValid;
  }

  private createPolicyInstance(policyJson: string): CreatePolicyInstance {
    let createPolicyInstance = {} as CreatePolicyInstance;
    createPolicyInstance.policy_data = JSON.parse(policyJson);
    createPolicyInstance.policy_id = this.policyInstanceId;
    createPolicyInstance.policytype_id = "";
    createPolicyInstance.ric_id = this.ricSelector
      ? this.ricSelector.selectedRic
      : this.ric;
    createPolicyInstance.service_id = "controlpanel";
    return createPolicyInstance;
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

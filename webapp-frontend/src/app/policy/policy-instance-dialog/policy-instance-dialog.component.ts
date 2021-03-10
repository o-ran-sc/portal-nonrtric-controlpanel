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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as uuid from 'uuid';
import { CreatePolicyInstance, PolicyInstance, PolicyTypeSchema } from '../../interfaces/policy.types';
import { PolicyService } from '../../services/policy/policy.service';
import { ErrorDialogService } from '../../services/ui/error-dialog.service';
import { NotificationService } from './../../services/ui/notification.service';
import { UiService } from '../../services/ui/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Ric, Rics } from '../../interfaces/ric';
import { TypedPolicyEditorComponent } from '../typed-policy-editor/typed-policy-editor.component';


@Component({
    selector: 'nrcp-policy-instance-dialog',
    templateUrl: './policy-instance-dialog.component.html',
    styleUrls: ['./policy-instance-dialog.component.scss']
})
export class PolicyInstanceDialogComponent implements OnInit {
    @ViewChild(TypedPolicyEditorComponent)
    policyEditor: TypedPolicyEditorComponent;
    instanceForm: FormGroup;


    ric: string;
    allRics: Ric[];
    policyInstanceId: string; // null if not yet created
    policyTypeName: string;
    jsonSchemaObject: any = {};
    darkMode: boolean;

    private fetchRics() {
        console.log('fetchRics ' + this.policyTypeName);
        const self: PolicyInstanceDialogComponent = this;
        this.dataService.getRics(this.policyTypeName).subscribe(
            {
                next(value: Rics) {
                    self.allRics = value.rics;
                    console.log(value);
                }
            });
    }

    constructor(
        private dataService: PolicyService,
        private errorService: ErrorDialogService,
        private notificationService: NotificationService,
        @Inject(MAT_DIALOG_DATA) public data,
        private dialogRef: MatDialogRef<PolicyInstanceDialogComponent>,
        private ui: UiService) {
        this.policyInstanceId = data.instanceId;
        this.policyTypeName = data.name;
        this.jsonSchemaObject = data.createSchema;
        this.ric = data.ric;
    }

    ngOnInit() {
        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
        this.instanceForm = new FormGroup({
            'ricSelector': new FormControl(this.ric, [
                Validators.required
            ])
        });
        if (!this.policyInstanceId) {
            this.fetchRics();
        }
    }

    get ricSelector() { return this.instanceForm.get('ricSelector'); }

    onSubmit() {
        if (this.policyInstanceId == null) {
            this.policyInstanceId = uuid.v4();
        }
        const policyJson: string = this.policyEditor.prettyLiveFormData;
        const self: PolicyInstanceDialogComponent = this;
        let createPolicyInstance: CreatePolicyInstance = this.createPolicyInstance(policyJson);
        this.dataService.putPolicy(createPolicyInstance).subscribe(
            {
                next(_) {
                    self.notificationService.success('Policy ' + self.policyTypeName + ':' + self.policyInstanceId +
                        ' submitted');
                    self.dialogRef.close();
                },
                error(error: HttpErrorResponse) {
                    self.errorService.displayError('Submit failed: ' + error.error);
                },
                complete() { }
            });
    }

    private createPolicyInstance(policyJson: string) {
        let createPolicyInstance = {} as CreatePolicyInstance;
        createPolicyInstance.policy_data = JSON.parse(policyJson);
        createPolicyInstance.policy_id = this.policyInstanceId;
        createPolicyInstance.policytype_id = this.policyTypeName;
        createPolicyInstance.ric_id = (!this.ricSelector.value.ric_id) ? this.ric : this.ricSelector.value.ric_id;
        createPolicyInstance.service_id = 'controlpanel';
        return createPolicyInstance;
    }

    onClose() {
        this.dialogRef.close();
    }

    get isJsonFormValid(): boolean {
        return this.policyEditor ? this.policyEditor.formIsValid : false;
    }
}

export function getPolicyDialogProperties(policyTypeSchema: PolicyTypeSchema, instance: PolicyInstance, darkMode: boolean): MatDialogConfig {
    const createSchema = policyTypeSchema.schemaObject;
    const instanceId = instance ? instance.policy_id : null;
    const instanceJson = instance ? instance.policy_data : null;
    const name = policyTypeSchema.name;
    const ric = instance ? instance.ric_id : null;
    return {
        maxWidth: '1200px',
        maxHeight: '900px',
        width: '900px',
        role: 'dialog',
        disableClose: false,
        panelClass: darkMode ? 'dark-theme' : '',
        data: {
            createSchema,
            instanceId,
            instanceJson,
            name,
            ric
        }
    };
}


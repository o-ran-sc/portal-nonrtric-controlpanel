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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { JsonPointer } from 'angular6-json-schema-form';
import * as uuid from 'uuid';
import { CreatePolicyInstance, PolicyInstance, PolicyTypeSchema } from '../interfaces/policy.types';
import { PolicyService } from '../services/policy/policy.service';
import { ErrorDialogService } from '../services/ui/error-dialog.service';
import { NotificationService } from './../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Ric } from '../interfaces/ric';


@Component({
    selector: 'rd-policy-instance-dialog',
    templateUrl: './policy-instance-dialog.component.html',
    styleUrls: ['./policy-instance-dialog.component.scss'],
    animations: [
        trigger('expandSection', [
            state('in', style({ height: '*' })),
            transition(':enter', [
                style({ height: 0 }), animate(100),
            ]),
            transition(':leave', [
                style({ height: '*' }),
                animate(100, style({ height: 0 })),
            ]),
        ]),
    ],
})
export class PolicyInstanceDialogComponent implements OnInit, AfterViewInit {
    instanceForm: FormGroup;


    formActive = false;
    isVisible = {
        form: true,
        json: false,
        schema: false
    };

    jsonFormStatusMessage = 'Loading form...';
    jsonSchemaObject: any = {};
    jsonObject: any = {};


    jsonFormOptions: any = {
        addSubmit: false, // Add a submit button if layout does not have one
        debug: false, // Don't show inline debugging information
        loadExternalAssets: true, // Load external css and JavaScript for frameworks
        returnEmptyFields: false, // Don't return values for empty input fields
        setSchemaDefaults: true, // Always use schema defaults for empty fields
        defautWidgetOptions: { feedback: true }, // Show inline feedback icons
    };

    liveFormData: any = {};
    formValidationErrors: any;
    formIsValid = false;

    @ViewChild(MatMenuTrigger, { static: true }) menuTrigger: MatMenuTrigger;

    policyInstanceId: string; // null if not yet created
    policyTypeName: string;
    darkMode: boolean;
    ric: string;
    allRics: Ric[];

    private fetchRics() {
        console.log('fetchRics ' + this.policyTypeName);
        const self: PolicyInstanceDialogComponent = this;
        this.dataService.getRics(this.policyTypeName).subscribe(
            {
                next(value: Ric[]) {
                    self.allRics = value;
                    console.log(value);
                },
                error(error: HttpErrorResponse) {
                    self.errorService.displayError('Fetching of rics failed: ' + error.message);
                },
                complete() { }
            });
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: PolicyService,
        private errorService: ErrorDialogService,
        private notificationService: NotificationService,
        @Inject(MAT_DIALOG_DATA) private data,
        private dialogRef: MatDialogRef<PolicyInstanceDialogComponent>,
        private ui: UiService) {
        this.formActive = false;
        this.policyInstanceId = data.instanceId;
        this.policyTypeName = data.name;
        this.jsonSchemaObject = data.createSchema;
        this.jsonObject = data.instanceJson;
        this.ric = data.ric;
    }

    ngOnInit() {
        this.jsonFormStatusMessage = 'Init';
        this.formActive = true;
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

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    get ricSelector() { return this.instanceForm.get('ricSelector'); }

    onSubmit() {
        if (this.policyInstanceId == null) {
            this.policyInstanceId = uuid.v4();
        }
        const policyJson: string = this.prettyLiveFormData;
        const self: PolicyInstanceDialogComponent = this;
        let createPolicyInstance = this.createPolicyInstance(policyJson);
        this.dataService.putPolicy(createPolicyInstance).subscribe(
            {
                next(_) {
                    self.notificationService.success('Policy ' + self.policyTypeName + ':' + self.policyInstanceId +
                        ' submitted');
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

    public onChanges(formData: any) {
        this.liveFormData = formData;
    }

    get prettyLiveFormData(): string {
        return JSON.stringify(this.liveFormData, null, 2);
    }

    get schemaAsString(): string {
        return JSON.stringify(this.jsonSchemaObject, null, 2);
    }

    get jsonAsString(): string {
        return JSON.stringify(this.jsonObject, null, 2);
    }

    isValid(isValid: boolean): void {
        this.formIsValid = isValid;
    }

    validationErrors(validationErrors: any): void {
        this.formValidationErrors = validationErrors;
    }

    get prettyValidationErrors() {
        if (!this.formValidationErrors) { return null; }
        const errorArray = [];
        for (const error of this.formValidationErrors) {
            const message = error.message;
            const dataPathArray = JsonPointer.parse(error.dataPath);
            if (dataPathArray.length) {
                let field = dataPathArray[0];
                for (let i = 1; i < dataPathArray.length; i++) {
                    const key = dataPathArray[i];
                    field += /^\d+$/.test(key) ? `[${key}]` : `.${key}`;
                }
                errorArray.push(`${field}: ${message}`);
            } else {
                errorArray.push(message);
            }
        }
        return errorArray.join('<br>');
    }

    private parseJson(str: string): string {
        try {
            if (str != null) {
                return JSON.parse(str);
            }
        } catch (jsonError) {
            this.jsonFormStatusMessage =
                'Invalid JSON\n' +
                'parser returned:\n\n' + jsonError;
        }
        return null;
    }

    public toggleVisible(item: string) {
        this.isVisible[item] = !this.isVisible[item];
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


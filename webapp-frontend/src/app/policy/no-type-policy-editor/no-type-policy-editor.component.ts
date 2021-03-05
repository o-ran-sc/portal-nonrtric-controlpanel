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

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'nrcp-no-type-policy-editor',
  templateUrl: './no-type-policy-editor.component.html',
  styleUrls: ['./no-type-policy-editor.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class NoTypePolicyEditorComponent implements OnInit {

  @Input() instanceForm: FormGroup;
  @Input() policyJson: string;

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.instanceForm.addControl(
      'policyJsonTextArea', new FormControl(this.policyJson, [
        Validators.required,
        jsonValidator()
      ])
    )
  }

  get policyJsonTextArea(): AbstractControl {
    return this.instanceForm ? this.instanceForm.get('policyJsonTextArea') : null;
  }

  formatJsonInput(): void {
    this.policyJson = formatJsonString(JSON.parse(this.policyJsonTextArea.value));
  }
}

export function formatJsonString(jsonToFormat: any): string {
  return JSON.stringify(jsonToFormat, null, 2);
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

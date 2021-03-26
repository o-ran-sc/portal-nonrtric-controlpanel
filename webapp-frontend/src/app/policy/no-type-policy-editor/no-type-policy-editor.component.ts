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

import { Component, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { EventEmitter } from "@angular/core";

@Component({
  selector: "nrcp-no-type-policy-editor",
  templateUrl: "./no-type-policy-editor.component.html",
  styleUrls: ["./no-type-policy-editor.component.scss"],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class NoTypePolicyEditorComponent implements OnInit {
  @Input() policyJson: string = null;
  @Output() validJson: EventEmitter<string> = new EventEmitter<string>();

  instanceForm: FormGroup = new FormGroup({});

  constructor() {}

  ngOnInit(): void {
    let initialJson: string;
    if (this.policyJson) {
      initialJson = formatJsonString(this.policyJson);
    } else {
      initialJson = "{}";
    }
    this.instanceForm.addControl(
      "policyJsonTextArea",
      new FormControl(initialJson, [
        Validators.required,
        this.jsonValidator(),
      ])
    );
  }

  get policyJsonTextArea(): AbstractControl {
    return this.instanceForm
      ? this.instanceForm.get("policyJsonTextArea")
      : null;
  }

  formatJsonInput(): void {
    let jsonBefore: string = this.policyJsonTextArea.value;
    let jsonAfter = formatJsonString(JSON.parse(jsonBefore));
    this.policyJsonTextArea.setValue(jsonAfter);
  }

  jsonValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const notValid = !this.isJsonValid(control.value);
      this.handleJsonChangeEvent(notValid, control.value);
      return notValid ? { invalidJson: { value: control.value } } : null;
    };
  }

  handleJsonChangeEvent(notValid: boolean, newValue: string): void {
    let json = newValue;
    if (notValid) {
      json = null;
    }
    this.validJson.emit(json);
  }

  isJsonValid(json: string): boolean {
    let valid = false as boolean;
    try {
      if (json != null) {
        JSON.parse(json);
        valid = true;
      }
    } catch (jsonError) {}
    return valid;
  }
}

export function formatJsonString(jsonToFormat: any): string {
  return JSON.stringify(jsonToFormat, null, 2);
}

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
//

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { JsonPointer } from "angular6-json-schema-form";

@Component({
  selector: "nrcp-typed-policy-editor",
  templateUrl: "./typed-policy-editor.component.html",
  styleUrls: ["./typed-policy-editor.component.scss"],
  animations: [
    trigger("expandSection", [
      state("in", style({ height: "*" })),
      transition(":enter", [style({ height: 0 }), animate(100)]),
      transition(":leave", [
        style({ height: "*" }),
        animate(100, style({ height: 0 })),
      ]),
    ]),
  ],
})
export class TypedPolicyEditorComponent implements OnInit {
  jsonFormOptions: any = {
    addSubmit: false, // Add a submit button if layout does not have one
    debug: false, // Don't show inline debugging information
    loadExternalAssets: false, // Load external css and JavaScript for frameworks
    returnEmptyFields: false, // Don't return values for empty input fields
    setSchemaDefaults: true, // Always use schema defaults for empty fields
    defautWidgetOptions: { feedback: true }, // Show inline feedback icons
  };

  @Input() jsonSchemaObject: any = {};
  @Input() jsonObject: any = {};
  @Input() darkMode: boolean;
  @Output() validJson: EventEmitter<string> = new EventEmitter<string>();

  isVisible = {
    form: true,
    json: false,
    schema: false,
  };
  liveFormData: any = {};
  formIsValid: boolean = false;
  formValidationErrors: any;

  constructor() {}

  ngOnInit(): void {}

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
    let json = this.prettyLiveFormData;
    if (!this.formIsValid) {
      json = null;
    }
    this.validJson.emit(json);
  }

  validationErrors(validationErrors: any): void {
    this.formValidationErrors = validationErrors;
  }

  get prettyValidationErrors() {
    if (!this.formValidationErrors) {
      return null;
    }
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
    return errorArray.join("<br>");
  }

  public toggleVisible(item: string) {
    this.isVisible[item] = !this.isVisible[item];
  }
}

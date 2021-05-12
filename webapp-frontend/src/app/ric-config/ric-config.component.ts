/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
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
import { Component, OnInit, Output } from "@angular/core";
import { RicConfig } from "@interfaces/ric.config";
import {
  AbstractControl,
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { PolicyService } from "@services/policy/policy.service";
import { EventEmitter } from "@angular/core";
import { NotificationService } from "@services/ui/notification.service";
import { HttpResponse } from "@angular/common/http";

@Component({
  selector: "nrcp-ric-config",
  templateUrl: "./ric-config.component.html",
  styleUrls: ["./ric-config.component.scss"],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})

export class RicConfigComponent implements OnInit {
  @Output() validJson: EventEmitter<string> = new EventEmitter<string>();
  ricConfig: string;
  ricConfigForm: FormGroup = new FormGroup({});

  constructor(private policyService: PolicyService,
    private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    let initialJson: RicConfig = "{}";
    this.getConfig();
    this.ricConfigForm.addControl(
      "ricConfigInfo",
      new FormControl(initialJson, [
        Validators.required,
        this.jsonValidator(),
      ])
    );
  }

  jsonValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const notValid = !this.isJsonValid(control.value);
      this.handleJsonChangeEvent(notValid, control.value);
      return notValid ? { invalidJson: { value: control.value } } : null;
    };
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

  handleJsonChangeEvent(notValid: boolean, newValue: string): void {
    let json = newValue;
    if (notValid) {
      json = null;
    }
    this.validJson.emit(json);
  }
  get ricConfigInfo(): AbstractControl {
    return this.ricConfigForm
      ? this.ricConfigForm.get("ricConfigInfo")
      : null;
  }

  formatJsonInput(): void {
    let jsonBefore: string = this.ricConfigInfo.value;
    let jsonAfter = formatJsonString(JSON.parse(jsonBefore));
    this.ricConfigInfo.setValue(jsonAfter);
  }

  getConfig() {
    this.policyService.getConfiguration().subscribe((ricConfig: RicConfig) => {
      this.ricConfig = formatJsonString(ricConfig);
      let initialJson: RicConfig;
    if (this.ricConfig) {
      initialJson = this.ricConfig;
    } else {
      initialJson = "{}";
    }
    this.ricConfigInfo.setValue(initialJson);
    });
  }

  updateRicConfig() {
    let updateRic = this.ricConfigInfo.value.replace(/\n/g, '');
    this.policyService.updateConfiguration(updateRic).subscribe((response: HttpResponse<Object>) => {
      if (response.status === 200) {
        this.notificationService.success("RIC Configuration Updated!");
      }
    });
  }
}

export function formatJsonString(jsonToFormat: any): string {
  return JSON.stringify(jsonToFormat, null, 2);
}

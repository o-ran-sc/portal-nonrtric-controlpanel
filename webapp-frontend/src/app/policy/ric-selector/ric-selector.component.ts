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
  Validators,
} from "@angular/forms";
import { EventEmitter } from "@angular/core";
import { Rics } from "@interfaces/ric";
import { PolicyService } from "@services/policy/policy.service";
import { MatSelectChange } from "@angular/material/select";

@Component({
  selector: "nrcp-ric-selector",
  templateUrl: "./ric-selector.component.html",
  styleUrls: ["./ric-selector.component.scss"],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class RicSelectorComponent implements OnInit {
  @Input() policyTypeName: string = "";
  @Output() selectedRic: EventEmitter<string> = new EventEmitter<string>();

  ric: string = null;
  instanceForm: FormGroup = new FormGroup({
    ricSelector: new FormControl(this.ric, [Validators.required]),
  });
  allRics: string[] = [];

  constructor(private dataService: PolicyService) {}

  ngOnInit(): void {
    this.fetchRics();
  }

  onRicChanged(newvalue: MatSelectChange): void {
    this.selectedRic.emit(newvalue.value);
  }

  get ricSelector(): AbstractControl {
    return this.instanceForm.get("ricSelector");
  }

  private fetchRics() {
    if (!this.policyTypeName) this.policyTypeName = "";
    const self: RicSelectorComponent = this;
    this.dataService.getRics(this.policyTypeName).subscribe({
      next(value: Rics) {
        value.rics.forEach((ric) => {
          self.allRics.push(ric.ric_id);
        });
      },
    });
  }
}

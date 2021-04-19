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
import { Component, OnInit } from "@angular/core";

import { PolicyTypes } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";

@Component({
  selector: "nrcp-policy-control",
  templateUrl: "./policy-control.component.html",
  styleUrls: ["./policy-control.component.scss"]
})

export class PolicyControlComponent implements OnInit {
  policyTypeIds = [];
  minimiseTrigger: boolean = false;

  constructor(private policyService: PolicyService) {
  }

  ngOnInit() {
    this.refreshTables();
  }

  refreshTables() {
    this.policyService.getPolicyTypes().subscribe((policyType: PolicyTypes) => {
      this.policyTypeIds = policyType.policytype_ids.sort();
      this.minimiseTrigger = !this.minimiseTrigger;
    });
  }
}

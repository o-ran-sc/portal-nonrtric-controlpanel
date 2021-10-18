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

import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PolicyType, PolicyTypeSchema } from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import "@policy/policy-control.component";

class PolicyTypeInfo {
  constructor(public type: PolicyTypeSchema) {}

  isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
  selector: "nrcp-policy-type",
  templateUrl: "./policy-type.component.html",
  styleUrls: ["./policy-type.component.scss"],
})
export class PolicyTypeComponent implements OnInit, OnChanges {
  @Input() policyTypeId: string;
  @Input() minimiseTrigger: boolean;

  isVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  policyTypeInfo: PolicyTypeInfo;
  policyType: string;
  policyDescription: string;

  constructor(private policyService: PolicyService) {}

  ngOnInit(): void {
    this.loadTypeInfo();
    this.isVisible.next(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['minimiseTrigger']){
      this.isVisible.next(false);
    }
  }

  public loadTypeInfo() {
    if (this.policyTypeId && this.policyTypeId !== "") {
      this.policyService
        .getPolicyType(this.policyTypeId)
        .subscribe((policyType: PolicyType) => {
          const policyTypeSchema = this.getSchemaObject(policyType);
          this.policyTypeInfo = new PolicyTypeInfo(policyTypeSchema);
          this.policyType = this.policyTypeId;
          this.policyDescription = policyTypeSchema.schemaObject.description;
        });
    } else {
      const noType = {
        policy_schema: JSON.parse('{}'),
      } as PolicyType;
      const noTypeSchema = this.getSchemaObject(noType);
      this.policyTypeInfo = new PolicyTypeInfo(noTypeSchema);
      this.policyType = "< No Type >";
      this.policyDescription = "Type with no schema";
    }
}

  private getSchemaObject(policyType: PolicyType) {
    const policyTypeSchema = {} as PolicyTypeSchema;
    policyTypeSchema.id = this.policyTypeId;
    policyTypeSchema.schemaObject = policyType.policy_schema;
    policyTypeSchema.name = policyType.policy_schema.title;
    return policyTypeSchema;
  }

  public toggleVisible() {
    this.isVisible.next(!this.isVisible.value);
  }
}

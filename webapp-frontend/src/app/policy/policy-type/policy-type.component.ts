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

import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PolicyTypeSchema } from '@interfaces/policy.types';
import { PolicyService } from '@services/policy/policy.service';
import { PolicyTypeDataSource } from './policy-type.datasource';

class PolicyTypeInfo {
  constructor(public type: PolicyTypeSchema) { }

  isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
  selector: 'nrcp-policy-type',
  templateUrl: './policy-type.component.html',
  styleUrls: ['./policy-type.component.scss']
})
export class PolicyTypeComponent implements OnInit {

  @Input() policyTypeId: string;

  isVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  policyTypeInfo: PolicyTypeInfo;
  policyType: string;
  policyDescription: string;

  constructor(private policyTypeDataSource: PolicyTypeDataSource) {
  }

  ngOnInit(): void {
    if (this.policyTypeId !== "") {
      const policyTypeSchema = this.policyTypeDataSource.getPolicyType(this.policyTypeId);
      console.log("policyTypeSchema:", policyTypeSchema);
      this.policyTypeInfo = new PolicyTypeInfo(policyTypeSchema);
      console.log("this.policyType: ", this.policyTypeInfo);
      this.policyType = this.policyTypeId;
      this.policyDescription = policyTypeSchema.schemaObject.description;
    } else {
      this.policyType = "< No Type >";
      this.policyDescription = "Type with no schema";
      const noTypeSchema = {
        id: "",
        name: "",
        schemaObject: JSON.parse("{}")
      }  as PolicyTypeSchema;
      this.policyTypeInfo = new PolicyTypeInfo(noTypeSchema);
      console.log("this.policyType: ", this.policyTypeInfo);
    }
    this.isVisible.next(false);
  }

  public setIsVisible(status: boolean){
    this.isVisible.next(status);
  }

  public toggleVisible() {
    this.isVisible.next(!this.isVisible.value);
  }
}
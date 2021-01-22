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

import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';

import { PolicyType } from '../interfaces/policy.types';
import { PolicyService } from '../services/policy/policy.service';
import { NotificationService } from '../services/ui/notification.service';

@Injectable({
    providedIn: 'root'
})

export class PolicyTypeDataSource extends DataSource<PolicyType> {

    policyTypes: PolicyType[] = [];

    private policyTypeSubject = new BehaviorSubject<PolicyType[]>([]);

    public rowCount = 1; // hide footer during intial load

    constructor(private policySvc: PolicyService,
        private notificationService: NotificationService) {
        super();
    }

    public getPolicyTypes(){
        //this.loadingSubject.next(true);
        this.policyTypes = [] as PolicyType[];
        this.policySvc.getPolicyTypes().subscribe(data => {
          if(data.policytype_ids.length !=0){
            data.policytype_ids.forEach(policyId => {
                if(policyId === ""){
                    var policyType = {} as PolicyType
                    policyType.name = '';
                    policyType.schema = '{}';
                    policyType.schemaObject = '';
                    this.policyTypes.push(policyType);
                }
                else{
                    this.policySvc.getPolicyType(policyId).subscribe(policyTypeService =>{
                        var policyType = {} as PolicyType
                        policyType.schemaObject = policyTypeService.policy_schema;
                        policyType.name = policyTypeService.policy_schema.title;
                        this.policyTypes.push(policyType);
                    })
                }
                this.policyTypeSubject.next(this.policyTypes);
            })
          }
        })
      }

    connect(collectionViewer: CollectionViewer): Observable<PolicyType[]> {
        return of(this.policyTypeSubject.getValue());
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.policyTypeSubject.complete();
    }
}

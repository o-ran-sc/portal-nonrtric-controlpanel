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

import { PolicyType, PolicyTypes, PolicyTypeSchema } from '@interfaces/policy.types';
import { PolicyService } from '@services/policy/policy.service';

@Injectable({
    providedIn: 'root'
})

export class PolicyTypeDataSource extends DataSource<PolicyTypeSchema> {

    policyTypes: PolicyTypeSchema[] = [];

    policyTypeSubject = new BehaviorSubject<PolicyTypeSchema[]>([]);

    public rowCount = 1; // hide footer during intial load

    constructor(public policySvc: PolicyService) {
        super();
    }

    public getPolicyType(policyTypeId: string): PolicyTypeSchema {
        var policyTypeSchema = {} as PolicyTypeSchema;
        this.policySvc.getPolicyType(policyTypeId)
            .subscribe((policyType: PolicyType) => {
                policyTypeSchema.id = policyTypeId;
                policyTypeSchema.schemaObject = policyType.policy_schema;
                policyTypeSchema.name = policyType.policy_schema.title;
            })
            if (policyTypeId === "") {
                policyTypeSchema.id = '<No Type>';
            }
        return policyTypeSchema;
    }

    connect(collectionViewer: CollectionViewer): Observable<PolicyTypeSchema[]> {
        return of(this.policyTypeSubject.getValue());
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.policyTypeSubject.complete();
    }
}

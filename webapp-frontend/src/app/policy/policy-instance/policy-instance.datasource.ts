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

import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { PolicyInstance, PolicyTypeSchema } from '@interfaces/policy.types';
import { PolicyService } from '@services/policy/policy.service';

export class PolicyInstanceDataSource extends DataSource<PolicyInstance> {

    policyInstances: PolicyInstance[] = [];

    private policyInstanceSubject = new BehaviorSubject<PolicyInstance[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private policySvc: PolicyService,
        public sort: MatSort,
        private policyTypeSchema: PolicyTypeSchema) {
        super();
    }

    public getPolicyInstances() {
        this.policyInstances = [] as PolicyInstance[];
        this.policySvc.getPolicyInstancesByType(this.policyTypeSchema.id).subscribe(policies => {
            if (policies.policy_ids.length != 0) {
                policies.policy_ids.forEach(policyId => {
                    var policyInstance = {} as PolicyInstance
                    this.policySvc.getPolicyInstance(policyId).subscribe(policyInstance => {
                        this.policySvc.getPolicyStatus(policyId).subscribe(policyStatus => {
                            policyInstance.lastModified = policyStatus.last_modified;
                        })
                        this.policyInstances.push(policyInstance);
                    })
                    this.policyInstanceSubject.next(this.policyInstances);
                })
            }
        })
    }

    connect(): Observable<PolicyInstance[]> {
        const dataMutations = [
            this.policyInstanceSubject.asObservable(),
            this.sort.sortChange
        ];
        return merge(...dataMutations).pipe(map(() => {
            return this.getSortedData([...this.policyInstanceSubject.getValue()]);
        }));
    }

    disconnect(): void {
        this.policyInstanceSubject.complete();
        this.loadingSubject.complete();
    }

    private getSortedData(data: PolicyInstance[]) {
        if (!this.sort || !this.sort.active || this.sort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            const isAsc = this.sort.direction === 'asc';
            switch (this.sort.active) {
                case 'instanceId': return compare(a.policy_id, b.policy_id, isAsc);
                case 'ric': return compare(a.ric_id, b.ric_id, isAsc);
                case 'service': return compare(a.service_id, b.service_id, isAsc);
                case 'lastModified': return compare(a.lastModified, b.lastModified, isAsc);
                default: return 0;
            }
        });
    }
}

function compare(a: string, b: string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

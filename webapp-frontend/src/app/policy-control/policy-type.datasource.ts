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
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { catchError, finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { PolicyType } from '../interfaces/policy.types';
import { PolicyService } from '../services/policy/policy.service';
import { NotificationService } from '../services/ui/notification.service';

@Injectable({
    providedIn: 'root'
})

export class PolicyTypeDataSource extends DataSource<PolicyType> {

    private policyTypeSubject = new BehaviorSubject<PolicyType[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(private policySvc: PolicyService,
        private notificationService: NotificationService) {
        super();
    }

    loadTable() {
        this.loadingSubject.next(true);
        this.policySvc.getPolicyTypes()
            .pipe(
                catchError((her: HttpErrorResponse) => {
                    this.notificationService.error('Failed to get policy types: ' + her.statusText + ', ' + her.error);
                    return of([]);
                }),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((types: PolicyType[]) => {
                this.rowCount = types.length;
                for (let i = 0; i < types.length; i++) {
                    const policyType = types[i];
                    try {
                        policyType.schemaObject = JSON.parse(policyType.schema);
                    } catch (jsonError) {
                        console.error('Could not parse schema: ' + policyType.schema);
                        policyType.schemaObject = { description: 'Incorrect schema: ' + jsonError };
                    }
                }
                this.policyTypeSubject.next(types);
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<PolicyType[]> {
        return of(this.policyTypeSubject.getValue());
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.policyTypeSubject.complete();
        this.loadingSubject.complete();
    }
}

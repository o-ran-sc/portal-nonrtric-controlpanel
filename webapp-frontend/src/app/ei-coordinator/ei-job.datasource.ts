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
import { HttpErrorResponse } from '@angular/common/http';
import { MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { merge } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, finalize, map } from 'rxjs/operators';
import { EIJob } from '../interfaces/ei.jobs';
import { EIService } from '../services/ei/ei.service';
import { NotificationService } from '../services/ui/notification.service';

export class EIJobDataSource extends DataSource<EIJob> {

    private eiJobSubject = new BehaviorSubject<EIJob[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private eiSvc: EIService,
        public sort: MatSort,
        private notificationService: NotificationService) {
        super();
    }

    loadTable() {
        this.loadingSubject.next(true);
        this.eiSvc.getEIJobs()
            .pipe(
                catchError((her: HttpErrorResponse) => {
                    this.notificationService.error('Failed to get EI jobs: ' + her.error);
                    return of([]);
                }),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((instances: EIJob[]) => {
                this.rowCount = instances.length;
                this.eiJobSubject.next(instances);
            });
    }

    connect(): Observable<EIJob[]> {
        const dataMutations = [
            this.eiJobSubject.asObservable(),
            this.sort.sortChange
        ];
        return merge(...dataMutations).pipe(map(() => {
            return this.getSortedData([...this.eiJobSubject.getValue()]);
        }));
    }

    disconnect(): void {
        this.eiJobSubject.complete();
        this.loadingSubject.complete();
    }

    private getSortedData(data: EIJob[]) {
        if (!this.sort || !this.sort.active || this.sort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            const isAsc = this.sort.direction === 'asc';
            switch (this.sort.active) {
                case 'ei_job_identity': return compare(a.ei_job_identity, b.ei_job_identity, isAsc);
                case 'owner': return compare(a.owner, b.owner, isAsc);
                case 'ei_type_identity': return compare(a.ei_type_identity, b.ei_type_identity, isAsc);
                default: return 0;
            }
        });
    }
}

function compare(a: string, b: string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

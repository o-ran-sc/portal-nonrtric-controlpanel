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
import { MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { merge } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, finalize, map } from 'rxjs/operators';
import { EIService } from '../services/ei/ei.service';
import { EIType } from '../interfaces/ei.jobs';
import { NotificationService } from '../services/ui/notification.service';

export class EITypeDataSource extends DataSource<EIType> {

    private eiTypeSubject = new BehaviorSubject<EIType[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(private eiSvc: EIService,
        private sort: MatSort,
        private notificationService: NotificationService) {
        super();
    }

    loadTable() {
        this.loadingSubject.next(true);
        this.eiSvc.getEITypes()
            .pipe(
                catchError((her: HttpErrorResponse) => {
                    this.notificationService.error('Failed to get EI types: ' + her.statusText + ', ' + her.error);
                    return of([]);
                }),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((types: EIType[]) => {
                console.log("Types: " + types);
                this.rowCount = types.length;
                this.eiTypeSubject.next(types);
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<EIType[]> {
        const dataMutations = [
            this.eiTypeSubject.asObservable(),
            this.sort.sortChange
        ];
        return merge(...dataMutations).pipe(map(() => {
            return this.getSortedData([...this.eiTypeSubject.getValue()]);
        }));
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.eiTypeSubject.complete();
        this.loadingSubject.complete();
    }

    private getSortedData(data: EIType[]) {
        if (!this.sort.active || this.sort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            const isAsc = this.sort.direction === 'asc';
            switch (this.sort.active) {
                case 'eiTypeId': return compare(a.description, b.description, isAsc);
                default: return 0;
            }
        });
    }
}

function compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

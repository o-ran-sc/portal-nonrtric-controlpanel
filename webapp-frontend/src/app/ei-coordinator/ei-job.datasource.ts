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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { catchError, finalize, map } from 'rxjs/operators';

import { EIJob } from '../interfaces/ei.jobs';
import { EIService } from '../services/ei/ei.service';
import { NotificationService } from '../services/ui/notification.service';

@Injectable({
    providedIn: 'root'
})

export class EIJobDataSource extends MatTableDataSource<EIJob> {

    private eiJobSubject = new BehaviorSubject<EIJob[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private eiSvc: EIService,
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

    connect(): BehaviorSubject<EIJob[]> {
        return this.eiJobSubject;
    }

    disconnect(): void {
        this.eiJobSubject.complete();
        this.loadingSubject.complete();
    }
}

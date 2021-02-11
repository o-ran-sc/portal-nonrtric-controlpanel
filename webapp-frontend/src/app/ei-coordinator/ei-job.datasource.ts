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

import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EIJob } from '../interfaces/ei.types';
import { EIService } from '../services/ei/ei.service';

@Injectable({
    providedIn: 'root'
})

export class EIJobDataSource {

    private jobs: Array<EIJob> = [];

    public eiJobs(): EIJob[] {
        return this.jobs;
    }

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private eiSvc: EIService) {
    }

    loadJobs() {
        this.loadingSubject.next(true);
        this.jobs = [];
        this.eiSvc.getProducerIds()
            .subscribe((producerIds: string[]) => {
                producerIds.forEach(id => {
                    this.getJobsForProducer(id);
                });
            });
        this.rowCount = this.jobs.length;
    }

    private getJobsForProducer(id: string) {
        console.log('Getting jobs for producer ID: ', id);
        this.eiSvc.getJobsForProducer(id).subscribe(producerJobs => {
            this.jobs = this.jobs.concat(producerJobs);
        });
    }
}

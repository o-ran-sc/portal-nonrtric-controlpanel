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
import { mergeMap, finalize } from 'rxjs/operators';
import { Observable, forkJoin, of } from 'rxjs';

import { EIProducer } from '../interfaces/ei.types';
import { EIService } from '../services/ei/ei.service';

@Injectable({
    providedIn: 'root'
})

export class EIProducerDataSource {

    private producers: Array<EIProducer> = [];

    public eiProducers(): EIProducer[] {
        return this.producers;
    }

    public eiProducersSubject(): Observable<EIProducer[]> {
        return this.producersSubject.asObservable() as Observable<EIProducer[]>;
    }

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private producersSubject = new BehaviorSubject<EIProducer[]>([]);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private eiSvc: EIService) {
    }

    loadProducers() {
        this.loadingSubject.next(true);
        this.producers = [];

        this.eiSvc.getProducerIds().pipe(
            mergeMap(prodIds => 
                forkJoin(prodIds.map(id => {
                    return forkJoin([
                        of(id),
                        this.eiSvc.getProducer(id),
                        this.eiSvc.getProducerStatus(id)
                    ])
                })
            )),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.producers = result.map(producer => {
                let eiProducer = <EIProducer>{};
                eiProducer.ei_producer_id = producer[0];
                eiProducer.ei_producer_types = producer[1].supported_ei_types;
                eiProducer.status = producer[2].operational_state.toString();
                return eiProducer;
            });
            this.producersSubject.next(this.producers);
        });
        this.rowCount = this.producers.length;
    }
}
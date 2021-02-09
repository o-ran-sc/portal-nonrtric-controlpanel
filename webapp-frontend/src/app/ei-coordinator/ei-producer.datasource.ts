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
import { MatTableDataSource } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';

import { EIProducer } from '../interfaces/ei.types';
import { EIService } from '../services/ei/ei.service';

@Injectable({
    providedIn: 'root'
})

export class EIProducerDataSource extends MatTableDataSource<EIProducer> {

    producerSubject = new BehaviorSubject<EIProducer[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public rowCount = 1; // hide footer during intial load

    constructor(
        private eiSvc: EIService) {
        super();
    }

    loadProducers(): Observable<EIProducer[]> {
        this.loadingSubject.next(true);
        let producers: Array<EIProducer> = [];
        this.eiSvc.getProducerIds()
            .subscribe((prodIds: string[]) => {
                console.log("ProducerIds: " + prodIds);
                prodIds.forEach(id => {
                    let eiProducer = <EIProducer>{};
                    eiProducer.ei_producer_id = id;
                    this.eiSvc.getProducer(id).subscribe(producer => {
                        eiProducer.ei_producer_types = producer.supported_ei_types;
                    });
                    this.eiSvc.getProducerStatus(id).subscribe(prodStatus => {
                        eiProducer.status = prodStatus.opState.toString();
                    });
                    this.addProducerToSubject(eiProducer);
                    producers.push(eiProducer);
                });
                this.rowCount = this.producerSubject.value.length;
            });
        return of(producers);
    }

    private addProducerToSubject(producer: EIProducer) {
        const currentValue = this.producerSubject.value;
        const updatedValue = [...currentValue, producer];
        this.producerSubject.next(updatedValue);
    }

    connect(): BehaviorSubject<EIProducer[]> {
        return this.producerSubject;
    }

    disconnect(): void {
        this.producerSubject.complete();
        this.loadingSubject.complete();
    }
}

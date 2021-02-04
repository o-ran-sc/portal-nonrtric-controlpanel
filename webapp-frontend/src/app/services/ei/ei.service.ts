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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EIJob, EIProducer, ProducerStatus, ProducerRegistrationInfo } from '../../interfaces/ei.types';

/**
 * Services for calling the EI endpoints.
 */
@Injectable({
    providedIn: 'root'
})
export class EIService {

    private basePath = '/ei-producer/v1';
    readonly eiJobsPath = 'eijobs';
    readonly eiProducersPath = 'eiproducers';
    readonly eiProducerStatusPath = 'status';

    private buildPath(...args: any[]) {
        let result = this.basePath;
        args.forEach(part => {
            result = result + '/' + part;
        });
        return result;
    }

    constructor(private httpClient: HttpClient) {
        // injects to variable httpClient
    }

    getProducerIds(): Observable<string[]> {
        const url = this.buildPath(this.eiProducersPath);
        return this.httpClient.get<string[]>(url);
    }

    getJobsForProducer(producerId: string): Observable<EIJob[]> {
        const url = this.buildPath(this.eiProducersPath, producerId, this.eiJobsPath);
        return this.httpClient.get<EIJob[]>(url);
    }

    getProducer(producerId: string): Observable<ProducerRegistrationInfo> {
        const url = this.buildPath(this.eiProducersPath, producerId);
        return this.httpClient.get<ProducerRegistrationInfo>(url);
    }

    getProducerStatus(producerId: string): Observable<ProducerStatus> {
        const url = this.buildPath(this.eiProducersPath, producerId, this.eiProducerStatusPath);
        return this.httpClient.get<ProducerStatus>(url);
    }

    getEIProducers(): Observable<EIProducer[]> {
        const url = this.buildPath(this.eiProducersPath);
        return this.httpClient.get<EIProducer[]>(url);
    }
}

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
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsumerStatus, JobInfo } from '@interfaces/consumer.types';

/**
 * Services for calling the EI endpoints.
 */
@Injectable({
    providedIn: 'root'
})
export class ConsumerService {

    private basePath = '/data-consumer/v1';
    readonly jobsPath = 'info-jobs';
    readonly consumerStatusPath = 'status';
    private customHttpClient: HttpClient;

    private buildPath(...args: any[]) {
        let result = this.basePath;
        args.forEach(part => {
            result = result + '/' + part;
        });
        return result;
    }

    constructor(private httpClient: HttpClient, backend: HttpBackend) {
        // injects to variable httpClient
        this.customHttpClient = new HttpClient(backend);
    }

    getJobIds(): Observable<string[]> {
        const url = this.buildPath(this.jobsPath);
        return this.httpClient.get<string[]>(url);
    }

    getJobInfo(infoJobId: string): Observable<JobInfo> {
        const url = this.buildPath(this.jobsPath, infoJobId);
        return this.httpClient.get<JobInfo>(url);
    }

    getConsumerStatus(infoJobId: string): Observable<ConsumerStatus> {
        const url = this.buildPath(this.jobsPath, infoJobId, this.consumerStatusPath);
        return this.httpClient.get<ConsumerStatus>(url);
    }
}

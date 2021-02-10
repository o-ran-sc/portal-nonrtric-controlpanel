/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
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
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EIJobDataSource } from './ei-job.datasource';
import { EIService } from '../services/ei/ei.service';
import { ToastrModule } from 'ngx-toastr';
import { EIJob } from '../interfaces/ei.types';

describe('EIJobDataSource', () => {
    let dataSource: EIJobDataSource;
    let eiServiceSpy: any;

    const job = { ei_job_identity: '1', ei_job_data: 'data', ei_type_identity: 'Type ID 1',  target_uri: 'hhtp://url', owner: 'owner'};

    beforeEach(() => {
        eiServiceSpy = jasmine.createSpyObj('EIService', ['getProducerIds', 'getJobsForProducer']);

        eiServiceSpy.getProducerIds.and.returnValue(of([ 'producer1', 'producer2']));
        eiServiceSpy.getJobsForProducer.and.returnValue(of([job]));
        TestBed.configureTestingModule({
            imports: [ToastrModule.forRoot()],
            providers: [
                { provide: EIService, useValue: eiServiceSpy }
            ]
        });
    });

    it('should create', () => {
        dataSource = TestBed.get(EIJobDataSource);
        expect(dataSource).toBeTruthy();
    });

    it('#getJobs', () => {
        dataSource.loadJobs();
        const actualJobs: EIJob[] = dataSource.eiJobs();
        expect(actualJobs).toEqual([ job, job ]);
        expect(dataSource.rowCount).toEqual(2);
    });
});

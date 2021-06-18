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
import { ConsumerService } from "./consumer.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JobInfo, ConsumerStatus, OperationalState } from '@app/interfaces/consumer.types';

describe('ConsumerService', () => {
    let basePath = '/data-consumer/v1';
    let service: ConsumerService;
    let httpTestingController: HttpTestingController;
    let expectedEIJobs: string[];
    let expectedConsumerStatus: ConsumerStatus;
    let expectedJobInfo: JobInfo;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule
        ],
        providers: [
            ConsumerService
        ]
    }));

    beforeEach(() => {
        service = TestBed.inject(ConsumerService);
        httpTestingController = TestBed.inject(HttpTestingController);
        expectedEIJobs = ['job1', 'job2'];
        expectedConsumerStatus = {
            info_job_status: OperationalState.ENABLED,
            producers: [
                'producer1'
            ]
        }
        expectedJobInfo = {
          job_definition: 'data',
          info_type_id: 'type1',
          job_result_uri: 'uri',
          job_owner: 'owner1',
          status_notification_uri: 'status_uri'
        }
    })

    it('should be created', () => {
        service = TestBed.inject(ConsumerService);
        expect(service).toBeTruthy();
    });

    it('should get all the jobs ids', () => {
        service.getJobIds().subscribe(
            jobs => expect(jobs).toEqual(expectedEIJobs, 'should return expected Jobs'),
            fail
        );

        const req = httpTestingController.expectOne(basePath + '/' + service.jobsPath);
        expect(req.request.method).toEqual('GET');

        req.flush(expectedEIJobs); //Return expected jobs ids

        httpTestingController.verify();
    });


    it('should return consumer status', () => {
        service.getConsumerStatus('job1').subscribe(
            consumerStatus => expect(consumerStatus).toEqual(expectedConsumerStatus, 'should return expected status'),
            fail
        );

        const req = httpTestingController.expectOne(basePath + '/' + service.jobsPath + '/job1/' + service.consumerStatusPath);
        expect(req.request.method).toEqual('GET');

        req.flush(expectedConsumerStatus); //Return expected status

        httpTestingController.verify();
    });

    it('should return the job info', () => {
        service.getJobInfo('job1').subscribe(
            jobInfo => expect(jobInfo).toEqual(expectedJobInfo, 'should return expected job info'),
            fail
        );

        const req = httpTestingController.expectOne(basePath + '/' + service.jobsPath + '/job1');
        expect(req.request.method).toEqual('GET');

        req.flush(expectedJobInfo); //Return expected job info

        httpTestingController.verify();
    });
});
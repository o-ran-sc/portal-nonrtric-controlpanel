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
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing';

import { EIJob, EIProducer } from '../../interfaces/ei.types';
import { EIService } from './ei.service';

describe('EIService', () => {
  let basePath = 'api/enrichment';
  let service: EIService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      EIService
    ]
  }));

  it('should be created', () => {
    service = TestBed.get(EIService);
    expect(service).toBeTruthy();
  });

  describe('#getEIProducers', () => {
    let expectedEIProducers: EIProducer[];

    beforeEach(() => {
      service = TestBed.get(EIService);
      httpTestingController = TestBed.get(HttpTestingController);
      expectedEIProducers = [
        { ei_producer_id: '1', ei_producer_types: ['EI Type 1'], status: 'ENABLED' },
        { ei_producer_id: '1', ei_producer_types: ['EI Type 1'], status: 'ENABLED' }
      ] as EIProducer[];
    });

    it('should return all producers', () => {
      service.getEIProducers().subscribe(
        producers => expect(producers).toEqual(expectedEIProducers, 'should return expected EIProducers'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.eiProducerPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEIProducers); //Return expectedEITypes

      httpTestingController.verify();
    });
  });

  describe('#EIJobs', () => {
    let expectedEIJobs: EIJob[];

    beforeEach(() => {
      service = TestBed.get(EIService);
      httpTestingController = TestBed.get(HttpTestingController);
      expectedEIJobs = [
        { ei_job_identity: '1', ei_job_data: 'data', ei_type_identity: 'Type ID 1',  target_uri: 'hhtp://url', owner: 'owner'},
        { ei_job_identity: '2', ei_job_data: 'EI Job 2', ei_type_identity: 'Type ID 2',  target_uri: 'hhtp://url', owner: 'owner'}
      ] as EIJob[];
    });

    it('should return all jobs', () => {
      service.getEIJobs().subscribe(
        jobs => expect(jobs).toEqual(expectedEIJobs, 'should return expected Jobs'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.eiJobPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEIJobs); //Return expectedEIJobs

      httpTestingController.verify();
     });
  });
});
